import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/constants/api_endpoints.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../shared/widgets/common_widgets.dart';
import '../../../auth/presentation/providers/auth_provider.dart';

// ─── Models ───────────────────────────────────────────────────────────
class ReviewerProject {
  final String id, title, studentName, studentCode, className;
  String? reviewerName, reviewerId;
  ReviewerProject({
    required this.id,
    required this.title,
    required this.studentName,
    required this.studentCode,
    required this.className,
    this.reviewerName,
    this.reviewerId,
  });
  factory ReviewerProject.fromJson(Map<String, dynamic> j) => ReviewerProject(
    id: j['id'] ?? '',
    title: j['title'] ?? j['topic_title'] ?? '',
    studentName: j['student_name'] ?? '',
    studentCode: j['student_code'] ?? '',
    className: j['class_name'] ?? '',
    reviewerName: j['reviewer_name'],
    reviewerId: j['reviewer_id'],
  );
}

class ReviewerTeacher {
  final String id, name, email;
  const ReviewerTeacher({
    required this.id,
    required this.name,
    required this.email,
  });
  factory ReviewerTeacher.fromJson(Map<String, dynamic> j) => ReviewerTeacher(
    id: j['uid'] ?? j['id'] ?? '',
    name: j['display_name'] ?? '',
    email: j['email'] ?? '',
  );
}

// ─── Provider ─────────────────────────────────────────────────────────
final reviewerAssignmentProvider =
    StateNotifierProvider<ReviewerAssignmentNotifier, ReviewerAssignmentState>(
      (ref) => ReviewerAssignmentNotifier(ref.watch(dioClientProvider)),
    );

class ReviewerAssignmentState {
  final List<ReviewerProject> projects;
  final List<ReviewerTeacher> teachers;
  final bool isLoading;
  const ReviewerAssignmentState({
    this.projects = const [],
    this.teachers = const [],
    this.isLoading = false,
  });
  ReviewerAssignmentState copyWith({
    List<ReviewerProject>? projects,
    List<ReviewerTeacher>? teachers,
    bool? isLoading,
  }) => ReviewerAssignmentState(
    projects: projects ?? this.projects,
    teachers: teachers ?? this.teachers,
    isLoading: isLoading ?? this.isLoading,
  );
}

class ReviewerAssignmentNotifier
    extends StateNotifier<ReviewerAssignmentState> {
  final dynamic _dio;
  ReviewerAssignmentNotifier(this._dio)
    : super(const ReviewerAssignmentState()) {
    load();
  }

  Future<void> load() async {
    state = state.copyWith(isLoading: true);
    try {
      final r1 = await _dio.get('${ApiEndpoints.projects}?status=in_progress');
      final r2 = await _dio.get(ApiEndpoints.teachers);
      state = state.copyWith(
        projects: (r1.data as List? ?? r1.data['data'] as List? ?? [])
            .map((e) => ReviewerProject.fromJson(e as Map<String, dynamic>))
            .toList(),
        teachers: (r2.data['data'] as List? ?? [])
            .map((e) => ReviewerTeacher.fromJson(e as Map<String, dynamic>))
            .toList(),
        isLoading: false,
      );
    } catch (_) {
      state = state.copyWith(isLoading: false);
    }
  }

  Future<bool> assign(String projectId, String teacherUid) async {
    try {
      await _dio.put(
        '${ApiEndpoints.projects}/$projectId',
        data: {'reviewerId': teacherUid},
      );
      await load();
      return true;
    } catch (_) {
      return false;
    }
  }
}

// ─── Screen ───────────────────────────────────────────────────────────
class ReviewerAssignmentScreen extends ConsumerWidget {
  const ReviewerAssignmentScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(reviewerAssignmentProvider);
    return Scaffold(
      appBar: AppBar(
        title: const Text('Phân công phản biện'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_outlined),
            onPressed: () =>
                ref.read(reviewerAssignmentProvider.notifier).load(),
          ),
        ],
      ),
      body: state.isLoading
          ? const LoadingList()
          : state.projects.isEmpty
          ? const Center(
              child: Text(
                'Không có đồ án cần phân công',
                style: TextStyle(color: AppColors.textSecondary),
              ),
            )
          : ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: state.projects.length,
              separatorBuilder: (_, __) => const SizedBox(height: 12),
              itemBuilder: (_, i) => _ProjectReviewerCard(
                project: state.projects[i],
                teachers: state.teachers,
                onAssign: (teacherUid) async {
                  final ok = await ref
                      .read(reviewerAssignmentProvider.notifier)
                      .assign(state.projects[i].id, teacherUid);
                  if (!context.mounted) return;
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text(ok ? 'Phân công thành công!' : 'Thất bại'),
                      backgroundColor: ok ? AppColors.success : AppColors.error,
                    ),
                  );
                },
              ),
            ),
    );
  }
}

class _ProjectReviewerCard extends StatefulWidget {
  final ReviewerProject project;
  final List<ReviewerTeacher> teachers;
  final void Function(String) onAssign;
  const _ProjectReviewerCard({
    required this.project,
    required this.teachers,
    required this.onAssign,
  });
  @override
  State<_ProjectReviewerCard> createState() => _ProjectReviewerCardState();
}

class _ProjectReviewerCardState extends State<_ProjectReviewerCard> {
  String? _selected;

  @override
  void initState() {
    super.initState();
    _selected = widget.project.reviewerId;
  }

  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.all(16),
    decoration: BoxDecoration(
      color: AppColors.card,
      borderRadius: BorderRadius.circular(14),
      boxShadow: [
        BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 6),
      ],
    ),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          widget.project.title,
          style: const TextStyle(
            fontWeight: FontWeight.bold,
            fontSize: 14,
            color: AppColors.textPrimary,
          ),
          maxLines: 2,
          overflow: TextOverflow.ellipsis,
        ),
        const SizedBox(height: 6),
        Row(
          children: [
            const Icon(
              Icons.person_outline,
              size: 13,
              color: AppColors.textHint,
            ),
            const SizedBox(width: 6),
            Text(
              '${widget.project.studentName} · ${widget.project.studentCode}',
              style: const TextStyle(fontSize: 12, color: AppColors.textHint),
            ),
            const SizedBox(width: 10),
            const Icon(
              Icons.class_outlined,
              size: 13,
              color: AppColors.textHint,
            ),
            const SizedBox(width: 4),
            Text(
              widget.project.className,
              style: const TextStyle(fontSize: 12, color: AppColors.textHint),
            ),
          ],
        ),
        const SizedBox(height: 12),
        Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Expanded(
              child: DropdownButtonFormField<String>(
                value: _selected,
                hint: const Text(
                  'Chọn GV phản biện',
                  style: TextStyle(fontSize: 13),
                ),
                isExpanded: true,
                decoration: InputDecoration(
                  prefixIcon: const Icon(Icons.rate_review_outlined, size: 18),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                  ),
                  contentPadding: const EdgeInsets.symmetric(
                    horizontal: 10,
                    vertical: 10,
                  ),
                ),
                items: widget.teachers
                    .map(
                      (t) => DropdownMenuItem(
                        value: t.id,
                        child: Text(
                          t.name,
                          style: const TextStyle(fontSize: 13),
                        ),
                      ),
                    )
                    .toList(),
                onChanged: (v) => setState(() => _selected = v),
              ),
            ),
            const SizedBox(width: 10),
            ElevatedButton(
              onPressed: _selected == null
                  ? null
                  : () => widget.onAssign(_selected!),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(
                  horizontal: 16,
                  vertical: 12,
                ),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10),
                ),
              ),
              child: const Text('Gán'),
            ),
          ],
        ),
      ],
    ),
  );
}
