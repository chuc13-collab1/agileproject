import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/constants/api_endpoints.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../shared/widgets/common_widgets.dart';
import '../../../auth/presentation/providers/auth_provider.dart';

// ─── Models ───────────────────────────────────────────────────────────
class ReviewProject {
  final String id,
      title,
      studentName,
      studentCode,
      className,
      field,
      status,
      supervisorName;
  final double? reviewerScore, finalScore;
  final String? grade;

  const ReviewProject({
    required this.id,
    required this.title,
    required this.studentName,
    required this.studentCode,
    required this.className,
    required this.field,
    required this.status,
    required this.supervisorName,
    this.reviewerScore,
    this.finalScore,
    this.grade,
  });

  factory ReviewProject.fromJson(Map<String, dynamic> j) => ReviewProject(
    id: j['id'] ?? '',
    title: j['title'] ?? '',
    studentName: j['studentName'] ?? j['student_name'] ?? '',
    studentCode: j['studentCode'] ?? j['student_code'] ?? '',
    className: j['className'] ?? j['class_name'] ?? '',
    field: j['field'] ?? '',
    status: j['status'] ?? '',
    supervisorName: j['supervisorName'] ?? j['supervisor_name'] ?? 'Chưa có',
    reviewerScore: (j['reviewerScore'] ?? j['reviewer_score'])?.toDouble(),
    finalScore: (j['finalScore'] ?? j['final_score'])?.toDouble(),
    grade: j['grade'],
  );

  bool get isGraded => reviewerScore != null;
}

// ─── Provider ─────────────────────────────────────────────────────────
final reviewerListProvider =
    StateNotifierProvider<ReviewerListNotifier, ReviewerListState>(
      (ref) => ReviewerListNotifier(
        ref.watch(dioClientProvider),
        ref.watch(authProvider).user?.uid ?? '',
      ),
    );

class ReviewerListState {
  final List<ReviewProject> projects;
  final bool isLoading;
  final String filter; // 'all' | 'pending' | 'graded'
  const ReviewerListState({
    this.projects = const [],
    this.isLoading = false,
    this.filter = 'all',
  });
  ReviewerListState copyWith({
    List<ReviewProject>? projects,
    bool? isLoading,
    String? filter,
  }) => ReviewerListState(
    projects: projects ?? this.projects,
    isLoading: isLoading ?? this.isLoading,
    filter: filter ?? this.filter,
  );

  List<ReviewProject> get filtered {
    if (filter == 'pending') return projects.where((p) => !p.isGraded).toList();
    if (filter == 'graded') return projects.where((p) => p.isGraded).toList();
    return projects;
  }
}

class ReviewerListNotifier extends StateNotifier<ReviewerListState> {
  final dynamic _dio;
  final String _uid;
  ReviewerListNotifier(this._dio, this._uid)
    : super(const ReviewerListState()) {
    load();
  }

  Future<void> load() async {
    if (_uid.isEmpty) return;
    state = state.copyWith(isLoading: true);
    try {
      final res = await _dio.get(
        '${ApiEndpoints.projects}/reviewer-projects?teacherUid=$_uid',
      );
      final list = (res.data['data'] as List? ?? [])
          .map((e) => ReviewProject.fromJson(e as Map<String, dynamic>))
          .toList();
      state = state.copyWith(projects: list, isLoading: false);
    } catch (_) {
      state = state.copyWith(isLoading: false);
    }
  }

  void setFilter(String f) => state = state.copyWith(filter: f);
}

// ─── Screen ───────────────────────────────────────────────────────────
class TeacherReviewListScreen extends ConsumerWidget {
  const TeacherReviewListScreen({super.key});

  Color _statusColor(String status) {
    switch (status) {
      case 'in_progress':
        return AppColors.primary;
      case 'submitted':
        return AppColors.warning;
      case 'graded':
        return AppColors.success;
      case 'completed':
        return AppColors.success;
      default:
        return AppColors.textHint;
    }
  }

  String _statusText(String status) {
    switch (status) {
      case 'registered':
        return 'Đã đăng ký';
      case 'in_progress':
        return 'Đang thực hiện';
      case 'submitted':
        return 'Đã nộp';
      case 'graded':
        return 'Đã chấm';
      case 'completed':
        return 'Hoàn thành';
      default:
        return status;
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(reviewerListProvider);
    final projects = state.filtered;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Đồ án phản biện'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_outlined),
            onPressed: () => ref.read(reviewerListProvider.notifier).load(),
          ),
        ],
      ),
      body: Column(
        children: [
          // Stats summary
          Container(
            margin: const EdgeInsets.all(16),
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFFF59E0B), Color(0xFFD97706)],
              ),
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(
                  color: const Color(0xFFF59E0B).withValues(alpha: 0.3),
                  blurRadius: 12,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Row(
              children: [
                _StatChip(
                  'Tổng',
                  state.projects.length,
                  Colors.white.withValues(alpha: 0.2),
                ),
                const SizedBox(width: 12),
                _StatChip(
                  'Chưa chấm',
                  state.projects.where((p) => !p.isGraded).length,
                  Colors.white.withValues(alpha: 0.2),
                ),
                const SizedBox(width: 12),
                _StatChip(
                  'Đã chấm',
                  state.projects.where((p) => p.isGraded).length,
                  Colors.white.withValues(alpha: 0.2),
                ),
              ],
            ),
          ),

          // Filter tabs
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(
              children: [
                for (final f in [
                  ('all', 'Tất cả'),
                  ('pending', 'Chưa chấm'),
                  ('graded', 'Đã chấm'),
                ])
                  Expanded(
                    child: GestureDetector(
                      onTap: () => ref
                          .read(reviewerListProvider.notifier)
                          .setFilter(f.$1),
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 200),
                        margin: const EdgeInsets.only(right: 8),
                        padding: const EdgeInsets.symmetric(vertical: 8),
                        decoration: BoxDecoration(
                          color: state.filter == f.$1
                              ? AppColors.warning
                              : AppColors.surfaceLight,
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Text(
                          f.$2,
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            color: state.filter == f.$1
                                ? Colors.white
                                : AppColors.textSecondary,
                          ),
                        ),
                      ),
                    ),
                  ),
              ],
            ),
          ),
          const SizedBox(height: 12),

          // List
          Expanded(
            child: state.isLoading
                ? const LoadingList()
                : projects.isEmpty
                ? const Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.rate_review_outlined,
                          size: 64,
                          color: AppColors.textHint,
                        ),
                        SizedBox(height: 16),
                        Text(
                          'Không có đồ án phản biện nào',
                          style: TextStyle(
                            color: AppColors.textSecondary,
                            fontSize: 16,
                          ),
                        ),
                      ],
                    ),
                  )
                : ListView.separated(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    itemCount: projects.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 12),
                    itemBuilder: (ctx, i) {
                      final p = projects[i];
                      return GestureDetector(
                        onTap: () => Navigator.push(
                          ctx,
                          MaterialPageRoute(
                            builder: (_) => TeacherProjectDetailScreen(
                              projectId: p.id,
                              role: 'reviewer',
                            ),
                          ),
                        ),
                        child: Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: AppColors.card,
                            borderRadius: BorderRadius.circular(14),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withValues(alpha: 0.05),
                                blurRadius: 6,
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
                                      p.title,
                                      style: const TextStyle(
                                        fontWeight: FontWeight.bold,
                                        fontSize: 14,
                                        color: AppColors.textPrimary,
                                      ),
                                      maxLines: 2,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ),
                                  StatusChip(
                                    label: _statusText(p.status),
                                    color: _statusColor(p.status),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 8),
                              Row(
                                children: [
                                  const Icon(
                                    Icons.person_outline,
                                    size: 13,
                                    color: AppColors.textHint,
                                  ),
                                  const SizedBox(width: 4),
                                  Text(
                                    '${p.studentName} · ${p.className}',
                                    style: const TextStyle(
                                      fontSize: 12,
                                      color: AppColors.textHint,
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 4),
                              Row(
                                children: [
                                  const Icon(
                                    Icons.school_outlined,
                                    size: 13,
                                    color: AppColors.textHint,
                                  ),
                                  const SizedBox(width: 4),
                                  Text(
                                    'GVHD: ${p.supervisorName}',
                                    style: const TextStyle(
                                      fontSize: 12,
                                      color: AppColors.textHint,
                                    ),
                                  ),
                                ],
                              ),
                              if (p.isGraded) ...[
                                const SizedBox(height: 8),
                                Container(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 10,
                                    vertical: 6,
                                  ),
                                  decoration: BoxDecoration(
                                    color: AppColors.success.withValues(
                                      alpha: 0.1,
                                    ),
                                    borderRadius: BorderRadius.circular(8),
                                    border: Border.all(
                                      color: AppColors.success.withValues(
                                        alpha: 0.3,
                                      ),
                                    ),
                                  ),
                                  child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      const Icon(
                                        Icons.star_rounded,
                                        size: 14,
                                        color: AppColors.success,
                                      ),
                                      const SizedBox(width: 4),
                                      Text(
                                        'Điểm phản biện: ${p.reviewerScore!.toStringAsFixed(1)}',
                                        style: const TextStyle(
                                          fontSize: 12,
                                          color: AppColors.success,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ],
                          ),
                        ),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }
}

class _StatChip extends StatelessWidget {
  final String label;
  final int value;
  final Color bg;
  const _StatChip(this.label, this.value, this.bg);
  @override
  Widget build(BuildContext context) => Expanded(
    child: Container(
      padding: const EdgeInsets.symmetric(vertical: 10),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(10),
      ),
      child: Column(
        children: [
          Text(
            '$value',
            style: const TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.w900,
              color: Colors.white,
            ),
          ),
          Text(
            label,
            style: const TextStyle(
              fontSize: 11,
              color: Colors.white,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    ),
  );
}

// ─── Teacher Project Detail Screen ────────────────────────────────────
class TeacherProjectDetailProvider
    extends StateNotifier<TeacherProjectDetailState> {
  final dynamic _dio;
  final String _projectId;
  TeacherProjectDetailProvider(this._dio, this._projectId)
    : super(const TeacherProjectDetailState()) {
    load();
  }

  Future<void> load() async {
    state = state.copyWith(isLoading: true);
    try {
      final res = await _dio.get('${ApiEndpoints.projects}/$_projectId');
      final data = res.data['data'] ?? res.data;
      state = state.copyWith(
        project: ProjectDetail.fromJson(data as Map<String, dynamic>),
        isLoading: false,
      );
    } catch (_) {
      state = state.copyWith(isLoading: false);
    }
  }

  Future<bool> saveFeedback(String comment) async {
    try {
      await _dio.put(
        '${ApiEndpoints.projects}/$_projectId',
        data: {'supervisorComment': comment},
      );
      return true;
    } catch (_) {
      return false;
    }
  }

  Future<bool> submitScore({
    required String evaluatorType,
    required double score,
    String? comments,
  }) async {
    state = state.copyWith(isSubmittingScore: true);
    try {
      await _dio.post(
        '${ApiEndpoints.projects}/$_projectId/evaluate',
        data: {
          'evaluatorType': evaluatorType,
          'totalScore': score,
          'comments': comments ?? '',
        },
      );
      await load();
      state = state.copyWith(isSubmittingScore: false);
      return true;
    } catch (_) {
      state = state.copyWith(isSubmittingScore: false);
      return false;
    }
  }
}

class TeacherProjectDetailState {
  final ProjectDetail? project;
  final bool isLoading;
  final bool isSubmittingScore;
  const TeacherProjectDetailState({
    this.project,
    this.isLoading = false,
    this.isSubmittingScore = false,
  });
  TeacherProjectDetailState copyWith({
    ProjectDetail? project,
    bool? isLoading,
    bool? isSubmittingScore,
  }) => TeacherProjectDetailState(
    project: project ?? this.project,
    isLoading: isLoading ?? this.isLoading,
    isSubmittingScore: isSubmittingScore ?? this.isSubmittingScore,
  );
}

// ignore: must_be_immutable
class ProjectDetail {
  final String id,
      title,
      field,
      status,
      studentName,
      studentEmail,
      studentCode,
      className;
  final String? supervisorName, reviewerName, supervisorId, reviewerId;
  final String? description, supervisorComment;
  final double? supervisorScore, reviewerScore, finalScore;
  final String? grade;
  final List<Map<String, dynamic>> progressReports;
  final List<Map<String, dynamic>> documents;
  final List<Map<String, dynamic>> evaluations;

  const ProjectDetail({
    required this.id,
    required this.title,
    required this.field,
    required this.status,
    required this.studentName,
    required this.studentEmail,
    required this.studentCode,
    required this.className,
    this.supervisorName,
    this.reviewerName,
    this.supervisorId,
    this.reviewerId,
    this.description,
    this.supervisorComment,
    this.supervisorScore,
    this.reviewerScore,
    this.finalScore,
    this.grade,
    this.progressReports = const [],
    this.documents = const [],
    this.evaluations = const [],
  });

  factory ProjectDetail.fromJson(Map<String, dynamic> j) => ProjectDetail(
    id: j['id'] ?? '',
    title: j['title'] ?? '',
    field: j['field'] ?? '',
    status: j['status'] ?? '',
    studentName: j['studentName'] ?? j['student_name'] ?? '',
    studentEmail: j['studentEmail'] ?? j['student_email'] ?? '',
    studentCode: j['studentCode'] ?? j['student_code'] ?? '',
    className: j['className'] ?? j['class_name'] ?? '',
    supervisorName: j['supervisor']?['name'] ?? j['supervisor_name'],
    supervisorId: j['supervisor']?['id'] ?? j['supervisor_uid'],
    reviewerName: j['reviewer']?['name'] ?? j['reviewer_name'],
    reviewerId: j['reviewer']?['id'] ?? j['reviewer_uid'],
    description: j['description'],
    supervisorComment: j['supervisorComment'] ?? j['supervisor_comment'],
    supervisorScore: (j['supervisorScore'] ?? j['supervisor_score'])
        ?.toDouble(),
    reviewerScore: (j['reviewerScore'] ?? j['reviewer_score'])?.toDouble(),
    finalScore: (j['finalScore'] ?? j['final_score'])?.toDouble(),
    grade: j['grade'],
    progressReports: (j['progressReports'] as List? ?? [])
        .cast<Map<String, dynamic>>(),
    documents: (j['documents'] as List? ?? []).cast<Map<String, dynamic>>(),
    evaluations: (j['evaluations'] as List? ?? []).cast<Map<String, dynamic>>(),
  );
}

final teacherProjectDetailProvider = StateNotifierProvider.autoDispose
    .family<TeacherProjectDetailProvider, TeacherProjectDetailState, String>(
      (ref, projectId) =>
          TeacherProjectDetailProvider(ref.watch(dioClientProvider), projectId),
    );

class TeacherProjectDetailScreen extends ConsumerStatefulWidget {
  final String projectId;
  final String role; // 'supervisor' | 'reviewer'
  const TeacherProjectDetailScreen({
    super.key,
    required this.projectId,
    this.role = 'supervisor',
  });

  @override
  ConsumerState<TeacherProjectDetailScreen> createState() =>
      _TeacherProjectDetailScreenState();
}

class _TeacherProjectDetailScreenState
    extends ConsumerState<TeacherProjectDetailScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tab;
  final _feedbackCtrl = TextEditingController();
  final _scoreCtrl = TextEditingController();
  final _commentCtrl = TextEditingController();

  @override
  void initState() {
    super.initState();
    _tab = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    _tab.dispose();
    _feedbackCtrl.dispose();
    _scoreCtrl.dispose();
    _commentCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(teacherProjectDetailProvider(widget.projectId));
    final project = state.project;

    if (state.isLoading)
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    if (project == null)
      return const Scaffold(body: Center(child: Text('Không tìm thấy đồ án')));

    // Init feedback text
    if (_feedbackCtrl.text.isEmpty &&
        (project.supervisorComment?.isNotEmpty ?? false)) {
      _feedbackCtrl.text = project.supervisorComment!;
    }

    return Scaffold(
      appBar: AppBar(
        title: Text(
          project.title,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
        ),
        bottom: TabBar(
          controller: _tab,
          tabs: const [
            Tab(text: 'Tổng quan'),
            Tab(text: 'Báo cáo'),
            Tab(text: 'Chấm điểm'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tab,
        children: [
          _OverviewTab(project: project),
          _ReportsTab(project: project),
          _GradingTab(
            project: project,
            role: widget.role,
            scoreCtrl: _scoreCtrl,
            commentCtrl: _commentCtrl,
            feedbackCtrl: _feedbackCtrl,
            isSubmitting: state.isSubmittingScore,
            onSaveFeedback: () async {
              final ok = await ref
                  .read(teacherProjectDetailProvider(widget.projectId).notifier)
                  .saveFeedback(_feedbackCtrl.text.trim());
              if (!mounted) return;
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text(ok ? 'Đã lưu nhận xét!' : 'Lỗi'),
                  backgroundColor: ok ? AppColors.success : AppColors.error,
                ),
              );
            },
            onSubmitScore: () async {
              final score = double.tryParse(_scoreCtrl.text);
              if (score == null || score < 0 || score > 10) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Điểm phải từ 0–10'),
                    backgroundColor: AppColors.error,
                  ),
                );
                return;
              }
              final ok = await ref
                  .read(teacherProjectDetailProvider(widget.projectId).notifier)
                  .submitScore(
                    evaluatorType: widget.role,
                    score: score,
                    comments: _commentCtrl.text.trim(),
                  );
              if (!mounted) return;
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text(ok ? 'Đã chấm điểm!' : 'Lỗi'),
                  backgroundColor: ok ? AppColors.success : AppColors.error,
                ),
              );
            },
          ),
        ],
      ),
    );
  }
}

// ─── Tab: Tổng Quan ───────────────────────────────────────────────────
class _OverviewTab extends StatelessWidget {
  final ProjectDetail project;
  const _OverviewTab({required this.project});

  @override
  Widget build(BuildContext context) => SingleChildScrollView(
    padding: const EdgeInsets.all(16),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Status banner
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [Color(0xFF667EEA), Color(0xFF764BA2)],
            ),
            borderRadius: BorderRadius.circular(14),
          ),
          child: Row(
            children: [
              const Icon(
                Icons.assignment_rounded,
                color: Colors.white,
                size: 28,
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      project.title,
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                        fontSize: 15,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      project.field,
                      style: const TextStyle(
                        color: Colors.white70,
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
              ),
              StatusChip(label: project.status, color: Colors.white),
            ],
          ),
        ),
        const SizedBox(height: 16),

        // Student info
        _InfoCard(
          title: 'Thông tin sinh viên',
          icon: Icons.person_outline,
          children: [
            _InfoRow('Họ tên', project.studentName),
            _InfoRow('Email', project.studentEmail),
            _InfoRow('Mã SV', project.studentCode),
            _InfoRow('Lớp', project.className),
          ],
        ),
        const SizedBox(height: 12),

        // Role info
        _InfoCard(
          title: 'Giảng viên',
          icon: Icons.school_outlined,
          children: [
            _InfoRow('GVHD', project.supervisorName ?? 'Chưa phân công'),
            _InfoRow('GV PB', project.reviewerName ?? 'Chưa phân công'),
          ],
        ),
        const SizedBox(height: 12),

        // Scores
        if (project.supervisorScore != null ||
            project.reviewerScore != null ||
            project.finalScore != null)
          _InfoCard(
            title: 'Điểm số',
            icon: Icons.star_outline,
            children: [
              if (project.supervisorScore != null)
                _InfoRow(
                  'Điểm GVHD',
                  project.supervisorScore!.toStringAsFixed(1),
                ),
              if (project.reviewerScore != null)
                _InfoRow('Điểm PB', project.reviewerScore!.toStringAsFixed(1)),
              if (project.finalScore != null)
                _InfoRow(
                  'Điểm tổng',
                  '${project.finalScore!.toStringAsFixed(1)} (${project.grade ?? ''})',
                ),
            ],
          ),

        if (project.description?.isNotEmpty ?? false) ...[
          const SizedBox(height: 12),
          _InfoCard(
            title: 'Mô tả đồ án',
            icon: Icons.description_outlined,
            children: [
              Text(
                project.description!,
                style: const TextStyle(
                  fontSize: 13,
                  color: AppColors.textSecondary,
                  height: 1.5,
                ),
              ),
            ],
          ),
        ],
      ],
    ),
  );
}

// ─── Tab: Báo Cáo ─────────────────────────────────────────────────────
class _ReportsTab extends StatelessWidget {
  final ProjectDetail project;
  const _ReportsTab({required this.project});

  @override
  Widget build(BuildContext context) {
    if (project.progressReports.isEmpty) {
      return const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.assignment_late_outlined,
              size: 64,
              color: AppColors.textHint,
            ),
            SizedBox(height: 16),
            Text(
              'Chưa có báo cáo tiến độ',
              style: TextStyle(color: AppColors.textSecondary, fontSize: 15),
            ),
          ],
        ),
      );
    }
    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: project.progressReports.length,
      separatorBuilder: (_, __) => const SizedBox(height: 10),
      itemBuilder: (_, i) {
        final r = project.progressReports[i];
        final isApproved = r['status'] == 'approved';
        return Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: AppColors.card,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: isApproved
                  ? AppColors.success.withValues(alpha: 0.3)
                  : AppColors.surfaceLight,
            ),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Text(
                    'Tuần ${r['week_number']}',
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 14,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  const Spacer(),
                  StatusChip(
                    label: isApproved ? 'Đã duyệt' : 'Chờ duyệt',
                    color: isApproved ? AppColors.success : AppColors.warning,
                  ),
                ],
              ),
              const SizedBox(height: 4),
              if (r['report_title'] != null)
                Text(
                  r['report_title'],
                  style: const TextStyle(
                    fontWeight: FontWeight.w600,
                    fontSize: 13,
                    color: AppColors.textSecondary,
                  ),
                ),
              if (r['content'] != null) ...[
                const SizedBox(height: 8),
                Text(
                  r['content'],
                  style: const TextStyle(
                    fontSize: 12,
                    color: AppColors.textHint,
                    height: 1.4,
                  ),
                  maxLines: 3,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
              if (r['teacher_comment'] != null) ...[
                const SizedBox(height: 8),
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: AppColors.warning.withValues(alpha: 0.08),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    children: [
                      const Icon(
                        Icons.chat_bubble_outline,
                        size: 13,
                        color: AppColors.warning,
                      ),
                      const SizedBox(width: 6),
                      Expanded(
                        child: Text(
                          r['teacher_comment'],
                          style: const TextStyle(
                            fontSize: 12,
                            color: AppColors.warning,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ],
          ),
        );
      },
    );
  }
}

// ─── Tab: Chấm Điểm ──────────────────────────────────────────────────
class _GradingTab extends StatelessWidget {
  final ProjectDetail project;
  final String role;
  final TextEditingController scoreCtrl, commentCtrl, feedbackCtrl;
  final bool isSubmitting;
  final VoidCallback onSaveFeedback, onSubmitScore;

  const _GradingTab({
    required this.project,
    required this.role,
    required this.scoreCtrl,
    required this.commentCtrl,
    required this.feedbackCtrl,
    required this.isSubmitting,
    required this.onSaveFeedback,
    required this.onSubmitScore,
  });

  @override
  Widget build(BuildContext context) => SingleChildScrollView(
    padding: const EdgeInsets.all(16),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Feedback (supervisor only)
        if (role == 'supervisor') ...[
          _SectionTitle('Nhận xét tổng quan'),
          TextField(
            controller: feedbackCtrl,
            minLines: 3,
            maxLines: 6,
            decoration: InputDecoration(
              hintText: 'Nhập nhận xét, góp ý cho sinh viên...',
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
              ),
              contentPadding: const EdgeInsets.all(14),
            ),
          ),
          const SizedBox(height: 12),
          GradientButton(text: 'Lưu nhận xét', onPressed: onSaveFeedback),
          const Divider(height: 32),
        ],

        // Scoring
        _SectionTitle(
          role == 'reviewer'
              ? 'Chấm điểm (Vai trò: GV Phản Biện)'
              : 'Chấm điểm (Vai trò: GV Hướng Dẫn)',
        ),
        const SizedBox(height: 4),
        Text(
          role == 'reviewer'
              ? 'Điểm phản biện hiện tại: ${project.reviewerScore?.toStringAsFixed(1) ?? "Chưa có"}'
              : 'Điểm GVHD hiện tại: ${project.supervisorScore?.toStringAsFixed(1) ?? "Chưa có"}',
          style: const TextStyle(fontSize: 13, color: AppColors.textHint),
        ),
        const SizedBox(height: 16),
        TextField(
          controller: scoreCtrl,
          keyboardType: const TextInputType.numberWithOptions(decimal: true),
          decoration: InputDecoration(
            labelText: 'Nhập điểm (0–10)',
            prefixIcon: const Icon(Icons.star_outline),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
          ),
        ),
        const SizedBox(height: 12),
        TextField(
          controller: commentCtrl,
          minLines: 2,
          maxLines: 4,
          decoration: InputDecoration(
            labelText: 'Nhận xét chấm điểm (tuỳ chọn)',
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
            contentPadding: const EdgeInsets.all(14),
          ),
        ),
        const SizedBox(height: 16),
        GradientButton(
          text: role == 'reviewer'
              ? 'Xác nhận điểm phản biện'
              : 'Xác nhận điểm GVHD',
          isLoading: isSubmitting,
          onPressed: isSubmitting ? null : onSubmitScore,
        ),

        if (project.finalScore != null) ...[
          const SizedBox(height: 24),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.success.withValues(alpha: 0.08),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(
                color: AppColors.success.withValues(alpha: 0.3),
              ),
            ),
            child: Row(
              children: [
                const Icon(
                  Icons.emoji_events_rounded,
                  color: AppColors.success,
                  size: 32,
                ),
                const SizedBox(width: 12),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Điểm tổng kết',
                      style: TextStyle(fontSize: 12, color: AppColors.textHint),
                    ),
                    Text(
                      '${project.finalScore!.toStringAsFixed(1)} — ${project.grade ?? ""}',
                      style: const TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.w900,
                        color: AppColors.success,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ],
    ),
  );
}

// ─── Shared Widgets ───────────────────────────────────────────────────
class _InfoCard extends StatelessWidget {
  final String title;
  final IconData icon;
  final List<Widget> children;
  const _InfoCard({
    required this.title,
    required this.icon,
    required this.children,
  });

  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.all(16),
    decoration: BoxDecoration(
      color: AppColors.card,
      borderRadius: BorderRadius.circular(14),
      boxShadow: [
        BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 6),
      ],
    ),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Icon(icon, size: 16, color: AppColors.primary),
            const SizedBox(width: 8),
            Text(
              title,
              style: const TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 14,
                color: AppColors.textPrimary,
              ),
            ),
          ],
        ),
        const Divider(height: 16),
        ...children,
      ],
    ),
  );
}

class _InfoRow extends StatelessWidget {
  final String label, value;
  const _InfoRow(this.label, this.value);
  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.only(bottom: 6),
    child: Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(
          width: 90,
          child: Text(
            label,
            style: const TextStyle(fontSize: 12, color: AppColors.textHint),
          ),
        ),
        Expanded(
          child: Text(
            value,
            style: const TextStyle(
              fontSize: 13,
              color: AppColors.textPrimary,
              fontWeight: FontWeight.w500,
            ),
          ),
        ),
      ],
    ),
  );
}

class _SectionTitle extends StatelessWidget {
  final String text;
  const _SectionTitle(this.text);
  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.only(bottom: 12),
    child: Text(
      text,
      style: const TextStyle(
        fontWeight: FontWeight.bold,
        fontSize: 15,
        color: AppColors.textPrimary,
      ),
    ),
  );
}
