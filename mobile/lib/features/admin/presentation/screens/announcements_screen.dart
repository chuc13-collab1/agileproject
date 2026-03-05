import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/constants/api_endpoints.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../shared/widgets/common_widgets.dart';
import '../../../auth/presentation/providers/auth_provider.dart';

// ─── Models ───────────────────────────────────────────────────────────
class Announcement {
  final String id, title, content, type;
  final bool isPublished;
  final String createdAt;

  const Announcement({
    required this.id,
    required this.title,
    required this.content,
    required this.type,
    required this.isPublished,
    required this.createdAt,
  });

  factory Announcement.fromJson(Map<String, dynamic> j) => Announcement(
    id: j['id'] ?? '',
    title: j['title'] ?? '',
    content: j['content'] ?? '',
    type: j['type'] ?? 'general',
    isPublished: j['is_published'] ?? true,
    createdAt: j['created_at'] ?? '',
  );
}

// ─── Provider ─────────────────────────────────────────────────────────
final announcementProvider =
    StateNotifierProvider<AnnouncementNotifier, AnnouncementState>(
      (ref) => AnnouncementNotifier(ref.watch(dioClientProvider)),
    );

class AnnouncementState {
  final List<Announcement> announcements;
  final bool isLoading;
  final bool isSubmitting;
  const AnnouncementState({
    this.announcements = const [],
    this.isLoading = false,
    this.isSubmitting = false,
  });
  AnnouncementState copyWith({
    List<Announcement>? announcements,
    bool? isLoading,
    bool? isSubmitting,
  }) => AnnouncementState(
    announcements: announcements ?? this.announcements,
    isLoading: isLoading ?? this.isLoading,
    isSubmitting: isSubmitting ?? this.isSubmitting,
  );
}

class AnnouncementNotifier extends StateNotifier<AnnouncementState> {
  final dynamic _dio;
  AnnouncementNotifier(this._dio) : super(const AnnouncementState()) {
    load();
  }

  Future<void> load() async {
    state = state.copyWith(isLoading: true);
    try {
      final res = await _dio.get(ApiEndpoints.announcements);
      final list = (res.data['data'] as List? ?? [])
          .map((e) => Announcement.fromJson(e as Map<String, dynamic>))
          .toList();
      state = state.copyWith(announcements: list, isLoading: false);
    } catch (_) {
      state = state.copyWith(isLoading: false);
    }
  }

  Future<bool> create(String title, String content, String type) async {
    state = state.copyWith(isSubmitting: true);
    try {
      await _dio.post(
        ApiEndpoints.announcements,
        data: {'title': title, 'content': content, 'type': type},
      );
      await load();
      state = state.copyWith(isSubmitting: false);
      return true;
    } catch (_) {
      state = state.copyWith(isSubmitting: false);
      return false;
    }
  }

  Future<void> delete(String id) async {
    try {
      await _dio.delete('${ApiEndpoints.announcements}/$id');
      await load();
    } catch (_) {}
  }
}

// ─── Screen ───────────────────────────────────────────────────────────
const _annTypes = {
  'general': 'Chung',
  'urgent': 'Khẩn cấp',
  'event': 'Sự kiện',
  'reminder': 'Nhắc nhở',
};

class AnnouncementsScreen extends ConsumerStatefulWidget {
  const AnnouncementsScreen({super.key});
  @override
  ConsumerState<AnnouncementsScreen> createState() =>
      _AnnouncementsScreenState();
}

class _AnnouncementsScreenState extends ConsumerState<AnnouncementsScreen> {
  void _showCreateSheet() {
    final titleCtrl = TextEditingController();
    final contentCtrl = TextEditingController();
    String type = 'general';

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setModalState) => Padding(
          padding: EdgeInsets.fromLTRB(
            20,
            20,
            20,
            MediaQuery.of(ctx).viewInsets.bottom + 20,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  const Text(
                    'Tạo thông báo',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  const Spacer(),
                  IconButton(
                    icon: const Icon(Icons.close),
                    onPressed: () => Navigator.pop(ctx),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              AppTextField(
                controller: titleCtrl,
                label: 'Tiêu đề',
                prefixIcon: Icons.title,
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: contentCtrl,
                minLines: 3,
                maxLines: 5,
                decoration: InputDecoration(
                  labelText: 'Nội dung',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
              ),
              const SizedBox(height: 12),
              DropdownButtonFormField<String>(
                value: type,
                decoration: InputDecoration(
                  labelText: 'Loại thông báo',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                items: _annTypes.entries
                    .map(
                      (e) =>
                          DropdownMenuItem(value: e.key, child: Text(e.value)),
                    )
                    .toList(),
                onChanged: (v) => setModalState(() => type = v ?? 'general'),
              ),
              const SizedBox(height: 20),
              GradientButton(
                text: 'Đăng thông báo',
                onPressed: () async {
                  if (titleCtrl.text.trim().isEmpty ||
                      contentCtrl.text.trim().isEmpty)
                    return;
                  final ok = await ref
                      .read(announcementProvider.notifier)
                      .create(
                        titleCtrl.text.trim(),
                        contentCtrl.text.trim(),
                        type,
                      );
                  if (!mounted) return;
                  Navigator.pop(ctx);
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text(ok ? 'Đã đăng thông báo!' : 'Thất bại'),
                      backgroundColor: ok ? AppColors.success : AppColors.error,
                    ),
                  );
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(announcementProvider);
    return Scaffold(
      appBar: AppBar(title: const Text('Thông báo')),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _showCreateSheet,
        icon: const Icon(Icons.add),
        label: const Text('Tạo thông báo'),
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
      ),
      body: state.isLoading
          ? const LoadingList()
          : state.announcements.isEmpty
          ? const Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.campaign_outlined,
                    size: 64,
                    color: AppColors.textHint,
                  ),
                  SizedBox(height: 16),
                  Text(
                    'Chưa có thông báo nào',
                    style: TextStyle(
                      color: AppColors.textSecondary,
                      fontSize: 16,
                    ),
                  ),
                ],
              ),
            )
          : ListView.separated(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 80),
              itemCount: state.announcements.length,
              separatorBuilder: (_, __) => const SizedBox(height: 12),
              itemBuilder: (_, i) {
                final a = state.announcements[i];
                final typeColors = {
                  'urgent': AppColors.error,
                  'event': AppColors.accent,
                  'reminder': AppColors.warning,
                  'general': AppColors.primary,
                };
                final col = typeColors[a.type] ?? AppColors.primary;
                return Dismissible(
                  key: Key(a.id),
                  direction: DismissDirection.endToStart,
                  background: Container(
                    alignment: Alignment.centerRight,
                    padding: const EdgeInsets.only(right: 20),
                    decoration: BoxDecoration(
                      color: AppColors.error,
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: const Icon(
                      Icons.delete_outline,
                      color: Colors.white,
                    ),
                  ),
                  onDismissed: (_) =>
                      ref.read(announcementProvider.notifier).delete(a.id),
                  child: Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: AppColors.card,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: col.withValues(alpha: 0.2)),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.04),
                          blurRadius: 6,
                        ),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 8,
                                vertical: 3,
                              ),
                              decoration: BoxDecoration(
                                color: col.withValues(alpha: 0.12),
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Text(
                                _annTypes[a.type] ?? 'Chung',
                                style: TextStyle(
                                  fontSize: 11,
                                  color: col,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                            const Spacer(),
                            Text(
                              a.createdAt.length > 10
                                  ? a.createdAt.substring(0, 10)
                                  : a.createdAt,
                              style: const TextStyle(
                                fontSize: 11,
                                color: AppColors.textHint,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Text(
                          a.title,
                          style: const TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 15,
                            color: AppColors.textPrimary,
                          ),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          a.content,
                          style: const TextStyle(
                            fontSize: 13,
                            color: AppColors.textSecondary,
                            height: 1.4,
                          ),
                          maxLines: 3,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
    );
  }
}
