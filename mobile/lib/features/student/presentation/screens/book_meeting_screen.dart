import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/constants/api_endpoints.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../shared/widgets/common_widgets.dart';
import '../../../auth/presentation/providers/auth_provider.dart';

// ─── Model ───────────────────────────────────────────────────────────

class BookingSlot {
  final String id;
  final DateTime date;
  final String timeSlot;
  final String teacherName;
  final String location;
  final String status; // pending | confirmed | cancelled
  final String? note;

  const BookingSlot({
    required this.id,
    required this.date,
    required this.timeSlot,
    required this.teacherName,
    required this.location,
    required this.status,
    this.note,
  });

  factory BookingSlot.fromJson(Map<String, dynamic> json) => BookingSlot(
    id: json['id'] ?? '',
    date: DateTime.tryParse(json['date'] ?? '') ?? DateTime.now(),
    timeSlot: json['time_slot'] ?? '',
    teacherName: json['teacher_name'] ?? '',
    location: json['location'] ?? '',
    status: json['status'] ?? 'pending',
    note: json['note'],
  );
}

// ─── Provider ────────────────────────────────────────────────────────

final bookingProvider = StateNotifierProvider<BookingNotifier, BookingState>(
  (ref) => BookingNotifier(ref.watch(dioClientProvider)),
);

class BookingState {
  final List<BookingSlot> myBookings;
  final bool isLoading;
  final bool isSubmitting;
  final String? error;

  const BookingState({
    this.myBookings = const [],
    this.isLoading = false,
    this.isSubmitting = false,
    this.error,
  });

  BookingState copyWith({
    List<BookingSlot>? myBookings,
    bool? isLoading,
    bool? isSubmitting,
    String? error,
  }) => BookingState(
    myBookings: myBookings ?? this.myBookings,
    isLoading: isLoading ?? this.isLoading,
    isSubmitting: isSubmitting ?? this.isSubmitting,
    error: error,
  );
}

class BookingNotifier extends StateNotifier<BookingState> {
  final dynamic _dioClient;

  BookingNotifier(this._dioClient) : super(const BookingState()) {
    loadMyBookings();
  }

  Future<void> loadMyBookings() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final res = await _dioClient.get(
        '${ApiEndpoints.scheduling}/my-bookings',
      );
      final list = (res.data['data'] as List? ?? [])
          .map((e) => BookingSlot.fromJson(e as Map<String, dynamic>))
          .toList();
      state = state.copyWith(myBookings: list, isLoading: false);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<bool> createBooking({
    required DateTime date,
    required String timeSlot,
    required String location,
    String? note,
  }) async {
    state = state.copyWith(isSubmitting: true, error: null);
    try {
      await _dioClient.post(
        ApiEndpoints.scheduling,
        data: {
          'date': date.toIso8601String(),
          'time_slot': timeSlot,
          'location': location,
          'note': note,
        },
      );
      await loadMyBookings();
      state = state.copyWith(isSubmitting: false);
      return true;
    } catch (e) {
      state = state.copyWith(isSubmitting: false, error: 'Đặt lịch thất bại');
      return false;
    }
  }

  Future<void> cancelBooking(String id) async {
    try {
      await _dioClient.patch('${ApiEndpoints.scheduling}/$id/cancel');
      await loadMyBookings();
    } catch (_) {}
  }
}

// ─── Screen ──────────────────────────────────────────────────────────

class BookMeetingScreen extends ConsumerStatefulWidget {
  const BookMeetingScreen({super.key});

  @override
  ConsumerState<BookMeetingScreen> createState() => _BookMeetingScreenState();
}

class _BookMeetingScreenState extends ConsumerState<BookMeetingScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(bookingProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Đặt lịch hẹn'),
        bottom: TabBar(
          controller: _tabController,
          tabs: const [
            Tab(text: 'Đặt mới'),
            Tab(text: 'Lịch của tôi'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _BookingForm(onSuccess: () => _tabController.animateTo(1)),
          _MyBookingList(state: state),
        ],
      ),
    );
  }
}

// ─── Booking Form ─────────────────────────────────────────────────────

class _BookingForm extends ConsumerStatefulWidget {
  final VoidCallback onSuccess;
  const _BookingForm({required this.onSuccess});

  @override
  ConsumerState<_BookingForm> createState() => _BookingFormState();
}

class _BookingFormState extends ConsumerState<_BookingForm> {
  final _formKey = GlobalKey<FormState>();
  DateTime _selectedDate = DateTime.now().add(const Duration(days: 1));
  String? _selectedTimeSlot;
  final _locationCtrl = TextEditingController();
  final _noteCtrl = TextEditingController();

  static const _timeSlots = [
    '07:30 - 09:00',
    '09:15 - 10:45',
    '13:00 - 14:30',
    '14:45 - 16:15',
    '16:30 - 18:00',
  ];

  @override
  void dispose() {
    _locationCtrl.dispose();
    _noteCtrl.dispose();
    super.dispose();
  }

  Future<void> _pickDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _selectedDate,
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 60)),
    );
    if (picked != null) setState(() => _selectedDate = picked);
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate() || _selectedTimeSlot == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Vui lòng chọn khung giờ'),
          backgroundColor: AppColors.error,
        ),
      );
      return;
    }

    final ok = await ref
        .read(bookingProvider.notifier)
        .createBooking(
          date: _selectedDate,
          timeSlot: _selectedTimeSlot!,
          location: _locationCtrl.text.trim(),
          note: _noteCtrl.text.trim().isEmpty ? null : _noteCtrl.text.trim(),
        );

    if (!mounted) return;
    if (ok) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Đặt lịch thành công! 🎉'),
          backgroundColor: AppColors.success,
        ),
      );
      widget.onSuccess();
    }
  }

  @override
  Widget build(BuildContext context) {
    final isSubmitting = ref.watch(bookingProvider).isSubmitting;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Date picker
            _FormLabel('Ngày hẹn'),
            InkWell(
              onTap: _pickDate,
              borderRadius: BorderRadius.circular(12),
              child: Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 16,
                  vertical: 14,
                ),
                decoration: BoxDecoration(
                  border: Border.all(color: AppColors.surfaceLight),
                  borderRadius: BorderRadius.circular(12),
                  color: AppColors.surface,
                ),
                child: Row(
                  children: [
                    const Icon(
                      Icons.calendar_today_outlined,
                      color: AppColors.primary,
                      size: 20,
                    ),
                    const SizedBox(width: 12),
                    Text(
                      '${_selectedDate.day}/${_selectedDate.month}/${_selectedDate.year}',
                      style: const TextStyle(
                        fontSize: 15,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    const Spacer(),
                    const Icon(Icons.chevron_right, color: AppColors.textHint),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 20),

            // Time slot
            _FormLabel('Khung giờ'),
            Wrap(
              spacing: 10,
              runSpacing: 10,
              children: _timeSlots.map((slot) {
                final selected = _selectedTimeSlot == slot;
                return GestureDetector(
                  onTap: () => setState(() => _selectedTimeSlot = slot),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    padding: const EdgeInsets.symmetric(
                      horizontal: 14,
                      vertical: 10,
                    ),
                    decoration: BoxDecoration(
                      color: selected ? AppColors.primary : AppColors.surface,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(
                        color: selected
                            ? AppColors.primary
                            : AppColors.surfaceLight,
                      ),
                      boxShadow: selected
                          ? [
                              BoxShadow(
                                color: AppColors.primary.withValues(
                                  alpha: 0.25,
                                ),
                                blurRadius: 8,
                              ),
                            ]
                          : null,
                    ),
                    child: Text(
                      slot,
                      style: TextStyle(
                        color: selected ? Colors.white : AppColors.textPrimary,
                        fontSize: 13,
                        fontWeight: selected
                            ? FontWeight.w600
                            : FontWeight.normal,
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),
            const SizedBox(height: 20),

            // Location
            _FormLabel('Địa điểm'),
            AppTextField(
              controller: _locationCtrl,
              label: 'Phòng / địa điểm gặp',
              prefixIcon: Icons.location_on_outlined,
              validator: (v) =>
                  (v == null || v.trim().isEmpty) ? 'Nhập địa điểm' : null,
            ),
            const SizedBox(height: 16),

            // Note
            _FormLabel('Ghi chú (tuỳ chọn)'),
            TextFormField(
              controller: _noteCtrl,
              maxLines: 3,
              decoration: InputDecoration(
                hintText: 'Nội dung muốn trao đổi...',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
            ),
            const SizedBox(height: 32),

            GradientButton(
              text: 'Đặt lịch hẹn',
              isLoading: isSubmitting,
              onPressed: isSubmitting ? null : _submit,
            ),
          ],
        ),
      ),
    );
  }
}

// ─── My Bookings List ────────────────────────────────────────────────

class _MyBookingList extends ConsumerWidget {
  final BookingState state;
  const _MyBookingList({required this.state});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    if (state.isLoading)
      return const Center(child: CircularProgressIndicator());

    if (state.myBookings.isEmpty) {
      return const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.event_busy_outlined,
              size: 64,
              color: AppColors.textHint,
            ),
            SizedBox(height: 16),
            Text(
              'Chưa có lịch hẹn nào',
              style: TextStyle(color: AppColors.textSecondary, fontSize: 16),
            ),
          ],
        ),
      );
    }

    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: state.myBookings.length,
      separatorBuilder: (_, __) => const SizedBox(height: 12),
      itemBuilder: (_, i) => _BookingCard(
        slot: state.myBookings[i],
        onCancel: () => ref
            .read(bookingProvider.notifier)
            .cancelBooking(state.myBookings[i].id),
      ),
    );
  }
}

class _BookingCard extends StatelessWidget {
  final BookingSlot slot;
  final VoidCallback onCancel;

  const _BookingCard({required this.slot, required this.onCancel});

  Color get _statusColor {
    switch (slot.status) {
      case 'confirmed':
        return AppColors.success;
      case 'cancelled':
        return AppColors.error;
      default:
        return AppColors.warning;
    }
  }

  String get _statusLabel {
    switch (slot.status) {
      case 'confirmed':
        return 'Đã xác nhận';
      case 'cancelled':
        return 'Đã huỷ';
      default:
        return 'Chờ xác nhận';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(14),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  '${slot.date.day}/${slot.date.month}/${slot.date.year} · ${slot.timeSlot}',
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 15,
                    color: AppColors.textPrimary,
                  ),
                ),
              ),
              StatusChip(label: _statusLabel, color: _statusColor),
            ],
          ),
          const SizedBox(height: 10),
          _Row(Icons.person_outline, slot.teacherName),
          _Row(Icons.location_on_outlined, slot.location),
          if (slot.note != null) _Row(Icons.notes_outlined, slot.note!),
          if (slot.status == 'pending') ...[
            const SizedBox(height: 12),
            TextButton.icon(
              onPressed: onCancel,
              icon: const Icon(
                Icons.cancel_outlined,
                size: 16,
                color: AppColors.error,
              ),
              label: const Text(
                'Huỷ lịch',
                style: TextStyle(color: AppColors.error),
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class _Row extends StatelessWidget {
  final IconData icon;
  final String text;
  const _Row(this.icon, this.text);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(top: 6),
      child: Row(
        children: [
          Icon(icon, size: 15, color: AppColors.textHint),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              text,
              style: const TextStyle(
                fontSize: 13,
                color: AppColors.textSecondary,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _FormLabel extends StatelessWidget {
  final String text;
  const _FormLabel(this.text);

  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.only(bottom: 8),
    child: Text(
      text,
      style: const TextStyle(
        fontSize: 13,
        fontWeight: FontWeight.w600,
        color: AppColors.textSecondary,
      ),
    ),
  );
}
