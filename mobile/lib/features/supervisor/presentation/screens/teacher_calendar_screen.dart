import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../../../../core/constants/api_endpoints.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../shared/widgets/common_widgets.dart';
import '../../../auth/presentation/providers/auth_provider.dart';

// ─── Model ───────────────────────────────────────────────────────────
class TeacherBooking {
  final String id;
  final String studentName;
  final String studentCode;
  final DateTime date;
  final String timeSlot;
  final String location;
  final String status;
  final String? note;

  const TeacherBooking({
    required this.id,
    required this.studentName,
    required this.studentCode,
    required this.date,
    required this.timeSlot,
    required this.location,
    required this.status,
    this.note,
  });

  factory TeacherBooking.fromJson(Map<String, dynamic> j) => TeacherBooking(
    id: j['id'] ?? '',
    studentName: j['student_name'] ?? '',
    studentCode: j['student_code'] ?? '',
    date: DateTime.tryParse(j['date'] ?? '') ?? DateTime.now(),
    timeSlot: j['time_slot'] ?? '',
    location: j['location'] ?? '',
    status: j['status'] ?? 'pending',
    note: j['note'],
  );
}

// ─── Provider ─────────────────────────────────────────────────────────
final teacherCalendarProvider =
    StateNotifierProvider<TeacherCalendarNotifier, TeacherCalendarState>(
      (ref) => TeacherCalendarNotifier(ref.watch(dioClientProvider)),
    );

class TeacherCalendarState {
  final List<TeacherBooking> bookings;
  final bool isLoading;
  TeacherCalendarState({this.bookings = const [], this.isLoading = false});
  TeacherCalendarState copyWith({
    List<TeacherBooking>? bookings,
    bool? isLoading,
  }) => TeacherCalendarState(
    bookings: bookings ?? this.bookings,
    isLoading: isLoading ?? this.isLoading,
  );
}

class TeacherCalendarNotifier extends StateNotifier<TeacherCalendarState> {
  final dynamic _dio;
  TeacherCalendarNotifier(this._dio) : super(TeacherCalendarState()) {
    load();
  }

  Future<void> load() async {
    state = state.copyWith(isLoading: true);
    try {
      final res = await _dio.get('${ApiEndpoints.scheduling}/teacher-bookings');
      final list = (res.data['data'] as List? ?? [])
          .map((e) => TeacherBooking.fromJson(e as Map<String, dynamic>))
          .toList();
      state = state.copyWith(bookings: list, isLoading: false);
    } catch (_) {
      state = state.copyWith(isLoading: false);
    }
  }

  Future<void> confirm(String id) => _updateStatus(id, 'confirmed');
  Future<void> cancel(String id) => _updateStatus(id, 'cancelled');

  Future<void> _updateStatus(String id, String status) async {
    try {
      await _dio.patch('${ApiEndpoints.scheduling}/$id/$status');
      await load();
    } catch (_) {}
  }
}

// ─── Screen ──────────────────────────────────────────────────────────
class TeacherCalendarScreen extends ConsumerWidget {
  const TeacherCalendarScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(teacherCalendarProvider);

    // Group bookings by date
    final Map<String, List<TeacherBooking>> grouped = {};
    for (final b in state.bookings) {
      final key = DateFormat('yyyy-MM-dd').format(b.date);
      grouped.putIfAbsent(key, () => []).add(b);
    }
    final sortedKeys = grouped.keys.toList()..sort();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Lịch hẹn'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_outlined),
            onPressed: () => ref.read(teacherCalendarProvider.notifier).load(),
          ),
        ],
      ),
      body: state.isLoading
          ? const LoadingList()
          : state.bookings.isEmpty
          ? const Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.event_available_outlined,
                    size: 64,
                    color: AppColors.textHint,
                  ),
                  SizedBox(height: 16),
                  Text(
                    'Chưa có lịch hẹn nào',
                    style: TextStyle(
                      color: AppColors.textSecondary,
                      fontSize: 16,
                    ),
                  ),
                ],
              ),
            )
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: sortedKeys.length,
              itemBuilder: (_, i) {
                final key = sortedKeys[i];
                final dayBookings = grouped[key]!;
                final date = DateTime.parse(key);
                return Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _DateHeader(date: date),
                    ...dayBookings.map(
                      (b) => _BookingCard(
                        booking: b,
                        onConfirm: () => ref
                            .read(teacherCalendarProvider.notifier)
                            .confirm(b.id),
                        onCancel: () => ref
                            .read(teacherCalendarProvider.notifier)
                            .cancel(b.id),
                      ),
                    ),
                    const SizedBox(height: 8),
                  ],
                );
              },
            ),
    );
  }
}

class _DateHeader extends StatelessWidget {
  final DateTime date;
  const _DateHeader({required this.date});

  @override
  Widget build(BuildContext context) {
    final isToday =
        DateFormat('yyyy-MM-dd').format(date) ==
        DateFormat('yyyy-MM-dd').format(DateTime.now());
    return Padding(
      padding: const EdgeInsets.only(bottom: 8, top: 4),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
            decoration: BoxDecoration(
              color: isToday ? AppColors.primary : AppColors.surfaceLight,
              borderRadius: BorderRadius.circular(20),
            ),
            child: Text(
              isToday
                  ? 'Hôm nay · ${DateFormat('dd/MM').format(date)}'
                  : DateFormat('EEEE, dd/MM/yyyy', 'vi').format(date),
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.bold,
                color: isToday ? Colors.white : AppColors.textSecondary,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _BookingCard extends StatelessWidget {
  final TeacherBooking booking;
  final VoidCallback onConfirm;
  final VoidCallback onCancel;
  const _BookingCard({
    required this.booking,
    required this.onConfirm,
    required this.onCancel,
  });

  Color get _col {
    switch (booking.status) {
      case 'confirmed':
        return AppColors.success;
      case 'cancelled':
        return AppColors.error;
      default:
        return AppColors.warning;
    }
  }

  String get _label {
    switch (booking.status) {
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
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: _col.withValues(alpha: 0.3)),
        boxShadow: [
          BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 6),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              CircleAvatar(
                radius: 16,
                backgroundColor: AppColors.primary.withValues(alpha: 0.12),
                child: Text(
                  booking.studentName.isNotEmpty ? booking.studentName[0] : '?',
                  style: const TextStyle(
                    color: AppColors.primary,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      booking.studentName,
                      style: const TextStyle(
                        fontWeight: FontWeight.w600,
                        fontSize: 14,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    Text(
                      booking.studentCode,
                      style: const TextStyle(
                        fontSize: 11,
                        color: AppColors.textHint,
                      ),
                    ),
                  ],
                ),
              ),
              StatusChip(label: _label, color: _col),
            ],
          ),
          const Divider(height: 16),
          Row(
            children: [
              const Icon(
                Icons.access_time,
                size: 14,
                color: AppColors.textHint,
              ),
              const SizedBox(width: 6),
              Text(
                booking.timeSlot,
                style: const TextStyle(
                  fontSize: 13,
                  color: AppColors.textSecondary,
                ),
              ),
              const SizedBox(width: 16),
              const Icon(
                Icons.location_on_outlined,
                size: 14,
                color: AppColors.textHint,
              ),
              const SizedBox(width: 6),
              Expanded(
                child: Text(
                  booking.location,
                  style: const TextStyle(
                    fontSize: 13,
                    color: AppColors.textSecondary,
                  ),
                ),
              ),
            ],
          ),
          if (booking.note != null) ...[
            const SizedBox(height: 6),
            Text(
              'Ghi chú: ${booking.note}',
              style: const TextStyle(
                fontSize: 12,
                color: AppColors.textHint,
                fontStyle: FontStyle.italic,
              ),
            ),
          ],
          if (booking.status == 'pending') ...[
            const SizedBox(height: 10),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: onCancel,
                    icon: const Icon(Icons.close, size: 16),
                    label: const Text('Huỷ'),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AppColors.error,
                      side: const BorderSide(color: AppColors.error),
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: onConfirm,
                    icon: const Icon(Icons.check, size: 16),
                    label: const Text('Xác nhận'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.success,
                      foregroundColor: Colors.white,
                    ),
                  ),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }
}
