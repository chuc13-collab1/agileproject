import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/constants/api_endpoints.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../shared/widgets/common_widgets.dart';
import '../../../auth/presentation/providers/auth_provider.dart';

// ─── Models ───────────────────────────────────────────────────────────
class AdminTopic {
  final String id, title, description, field, supervisorName, status;
  final int currentStudents, maxStudents;
  const AdminTopic({
    required this.id,
    required this.title,
    required this.description,
    required this.field,
    required this.supervisorName,
    required this.status,
    required this.currentStudents,
    required this.maxStudents,
  });
  factory AdminTopic.fromJson(Map<String, dynamic> j) => AdminTopic(
    id: j['id'] ?? '',
    title: j['title'] ?? '',
    description: j['description'] ?? '',
    field: j['field'] ?? '',
    supervisorName: j['supervisor_name'] ?? j['supervisorName'] ?? 'Chưa có',
    status: j['status'] ?? 'active',
    currentStudents: j['current_students'] ?? j['currentStudents'] ?? 0,
    maxStudents: j['max_students'] ?? j['maxStudents'] ?? 1,
  );
}

// ─── Provider ─────────────────────────────────────────────────────────
final adminTopicProvider =
    StateNotifierProvider<AdminTopicNotifier, AdminTopicState>(
      (ref) => AdminTopicNotifier(ref.watch(dioClientProvider)),
    );

class AdminTopicState {
  final List<AdminTopic> topics;
  final bool isLoading;
  final String searchQuery;
  const AdminTopicState({
    this.topics = const [],
    this.isLoading = false,
    this.searchQuery = '',
  });
  AdminTopicState copyWith({
    List<AdminTopic>? topics,
    bool? isLoading,
    String? searchQuery,
  }) => AdminTopicState(
    topics: topics ?? this.topics,
    isLoading: isLoading ?? this.isLoading,
    searchQuery: searchQuery ?? this.searchQuery,
  );

  List<AdminTopic> get filtered => searchQuery.isEmpty
      ? topics
      : topics
            .where(
              (t) =>
                  t.title.toLowerCase().contains(searchQuery.toLowerCase()) ||
                  t.supervisorName.toLowerCase().contains(
                    searchQuery.toLowerCase(),
                  ),
            )
            .toList();
}

class AdminTopicNotifier extends StateNotifier<AdminTopicState> {
  final dynamic _dio;
  AdminTopicNotifier(this._dio) : super(const AdminTopicState()) {
    load();
  }

  Future<void> load() async {
    state = state.copyWith(isLoading: true);
    try {
      final res = await _dio.get(ApiEndpoints.topics);
      final list = (res.data['data'] as List? ?? res.data as List? ?? [])
          .map((e) => AdminTopic.fromJson(e as Map<String, dynamic>))
          .toList();
      state = state.copyWith(topics: list, isLoading: false);
    } catch (_) {
      state = state.copyWith(isLoading: false);
    }
  }

  void search(String q) => state = state.copyWith(searchQuery: q);

  Future<void> toggleStatus(String id, String currentStatus) async {
    final newStatus = currentStatus == 'active' ? 'inactive' : 'active';
    try {
      await _dio.patch(
        '${ApiEndpoints.topics}/$id',
        data: {'status': newStatus},
      );
      await load();
    } catch (_) {}
  }

  Future<void> delete(String id) async {
    try {
      await _dio.delete('${ApiEndpoints.topics}/$id');
      await load();
    } catch (_) {}
  }
}

// ─── Screen ───────────────────────────────────────────────────────────
class AdminTopicsScreen extends ConsumerWidget {
  const AdminTopicsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(adminTopicProvider);
    final topics = state.filtered;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Quản lý đề tài'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_outlined),
            onPressed: () => ref.read(adminTopicProvider.notifier).load(),
          ),
        ],
      ),
      body: Column(
        children: [
          // Search
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
            child: TextField(
              onChanged: (v) => ref.read(adminTopicProvider.notifier).search(v),
              decoration: InputDecoration(
                hintText: 'Tìm theo tiêu đề, giảng viên...',
                prefixIcon: const Icon(
                  Icons.search_outlined,
                  color: AppColors.textHint,
                ),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                contentPadding: const EdgeInsets.symmetric(
                  horizontal: 16,
                  vertical: 12,
                ),
              ),
            ),
          ),
          // Summary
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            child: Row(
              children: [
                _SummaryChip(
                  'Tất cả: ${state.topics.length}',
                  AppColors.primary,
                ),
                const SizedBox(width: 8),
                _SummaryChip(
                  'Hoạt động: ${state.topics.where((t) => t.status == "active").length}',
                  AppColors.success,
                ),
                const SizedBox(width: 8),
                _SummaryChip(
                  'Tắt: ${state.topics.where((t) => t.status != "active").length}',
                  AppColors.error,
                ),
              ],
            ),
          ),
          // List
          Expanded(
            child: state.isLoading
                ? const LoadingList()
                : topics.isEmpty
                ? const Center(
                    child: Text(
                      'Không tìm thấy đề tài',
                      style: TextStyle(color: AppColors.textSecondary),
                    ),
                  )
                : ListView.separated(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    itemCount: topics.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 10),
                    itemBuilder: (_, i) => _TopicCard(
                      topic: topics[i],
                      onToggle: () => ref
                          .read(adminTopicProvider.notifier)
                          .toggleStatus(topics[i].id, topics[i].status),
                      onDelete: () => showDialog(
                        context: context,
                        builder: (_) => AlertDialog(
                          title: const Text('Xoá đề tài'),
                          content: Text('Xoá "${topics[i].title}"?'),
                          actions: [
                            TextButton(
                              onPressed: () => Navigator.pop(context),
                              child: const Text('Huỷ'),
                            ),
                            ElevatedButton(
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppColors.error,
                              ),
                              onPressed: () {
                                Navigator.pop(context);
                                ref
                                    .read(adminTopicProvider.notifier)
                                    .delete(topics[i].id);
                              },
                              child: const Text(
                                'Xoá',
                                style: TextStyle(color: Colors.white),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
          ),
        ],
      ),
    );
  }
}

class _TopicCard extends StatelessWidget {
  final AdminTopic topic;
  final VoidCallback onToggle;
  final VoidCallback onDelete;
  const _TopicCard({
    required this.topic,
    required this.onToggle,
    required this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    final isActive = topic.status == 'active';
    final full = topic.currentStudents >= topic.maxStudents;
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: isActive
              ? AppColors.surfaceLight
              : AppColors.error.withValues(alpha: 0.2),
        ),
        boxShadow: [
          BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 6),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  topic.title,
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 14,
                    color: isActive
                        ? AppColors.textPrimary
                        : AppColors.textHint,
                  ),
                ),
              ),
              PopupMenuButton(
                itemBuilder: (_) => [
                  const PopupMenuItem(
                    value: 'toggle',
                    child: Text('Bật/Tắt đề tài'),
                  ),
                  const PopupMenuItem(
                    value: 'delete',
                    child: Text(
                      'Xoá',
                      style: TextStyle(color: AppColors.error),
                    ),
                  ),
                ],
                onSelected: (v) {
                  if (v == 'toggle')
                    onToggle();
                  else if (v == 'delete')
                    onDelete();
                },
              ),
            ],
          ),
          const SizedBox(height: 6),
          Row(
            children: [
              const Icon(
                Icons.person_outline,
                size: 13,
                color: AppColors.textHint,
              ),
              const SizedBox(width: 4),
              Text(
                topic.supervisorName,
                style: const TextStyle(fontSize: 12, color: AppColors.textHint),
              ),
              const SizedBox(width: 10),
              const Icon(
                Icons.category_outlined,
                size: 13,
                color: AppColors.textHint,
              ),
              const SizedBox(width: 4),
              Expanded(
                child: Text(
                  topic.field,
                  style: const TextStyle(
                    fontSize: 12,
                    color: AppColors.textHint,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      '${topic.currentStudents}/${topic.maxStudents} sinh viên',
                      style: TextStyle(
                        fontSize: 11,
                        color: full ? AppColors.error : AppColors.textHint,
                      ),
                    ),
                    const SizedBox(height: 4),
                    LinearProgressIndicator(
                      value: topic.maxStudents > 0
                          ? topic.currentStudents / topic.maxStudents
                          : 0,
                      borderRadius: BorderRadius.circular(4),
                      color: full ? AppColors.error : AppColors.success,
                      backgroundColor: AppColors.surfaceLight,
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 12),
              StatusChip(
                label: isActive ? 'Hoạt động' : 'Tắt',
                color: isActive ? AppColors.success : AppColors.error,
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _SummaryChip extends StatelessWidget {
  final String text;
  final Color color;
  const _SummaryChip(this.text, this.color);
  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
    decoration: BoxDecoration(
      color: color.withValues(alpha: 0.1),
      borderRadius: BorderRadius.circular(8),
      border: Border.all(color: color.withValues(alpha: 0.3)),
    ),
    child: Text(
      text,
      style: TextStyle(fontSize: 11, color: color, fontWeight: FontWeight.bold),
    ),
  );
}
