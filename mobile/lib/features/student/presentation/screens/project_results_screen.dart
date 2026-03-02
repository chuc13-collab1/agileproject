import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/api_endpoints.dart';
import '../../../../shared/widgets/common_widgets.dart';
import '../../../auth/presentation/providers/auth_provider.dart';
import '../../../project/domain/project_model.dart';

/// Project Results screen — show scores and evaluation
class ProjectResultsScreen extends ConsumerStatefulWidget {
  const ProjectResultsScreen({super.key});

  @override
  ConsumerState<ProjectResultsScreen> createState() =>
      _ProjectResultsScreenState();
}

class _ProjectResultsScreenState extends ConsumerState<ProjectResultsScreen> {
  ProjectModel? _project;
  List<Map<String, dynamic>> _evaluations = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    try {
      final dio = ref.read(dioClientProvider);

      // Load projects
      final projectRes = await dio.get(ApiEndpoints.projects);
      final projectData = projectRes.data;
      List<ProjectModel> projects = [];
      if (projectData is List) {
        projects = projectData
            .map((p) => ProjectModel.fromJson(p as Map<String, dynamic>))
            .toList();
      } else if (projectData is Map && projectData['data'] != null) {
        projects = (projectData['data'] as List)
            .map((p) => ProjectModel.fromJson(p as Map<String, dynamic>))
            .toList();
      }

      final uid = ref.read(authProvider).user?.uid;
      ProjectModel? myProject;
      if (uid != null) {
        final match = projects.where((p) => p.studentId == uid);
        if (match.isNotEmpty) myProject = match.first;
      }

      // Load evaluations
      try {
        final evalRes = await dio.get(ApiEndpoints.evaluations);
        final evalData = evalRes.data;
        if (evalData is List) {
          _evaluations = evalData.cast<Map<String, dynamic>>();
        } else if (evalData is Map && evalData['data'] != null) {
          _evaluations = (evalData['data'] as List)
              .cast<Map<String, dynamic>>();
        }
      } catch (_) {}

      setState(() {
        _project = myProject;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Kết quả đồ án')),
      body: _isLoading
          ? const LoadingList()
          : _project == null
          ? const Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.assignment_outlined,
                    size: 56,
                    color: AppColors.textHint,
                  ),
                  SizedBox(height: 12),
                  Text(
                    'Chưa có đồ án',
                    style: TextStyle(color: AppColors.textSecondary),
                  ),
                ],
              ),
            )
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Project info
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: AppColors.card,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: AppColors.surfaceLight),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.04),
                          blurRadius: 8,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          _project!.title,
                          style: const TextStyle(
                            fontSize: 17,
                            fontWeight: FontWeight.bold,
                            color: AppColors.textPrimary,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Row(
                          children: [
                            StatusChip(
                              label: _project!.statusText,
                              color: AppColors.primary,
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 20),

                  // Scores section
                  const Text(
                    'Điểm số',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 12),

                  Row(
                    children: [
                      _ScoreCard(
                        'Điểm GVHD',
                        _project!.supervisorScore,
                        AppColors.primary,
                      ),
                      const SizedBox(width: 12),
                      _ScoreCard(
                        'Điểm GVPB',
                        _project!.reviewerScore,
                        AppColors.accent,
                      ),
                      const SizedBox(width: 12),
                      _ScoreCard(
                        'Điểm HĐ',
                        _project!.councilScore,
                        AppColors.success,
                      ),
                    ],
                  ),

                  if (_project!.finalScore != null) ...[
                    const SizedBox(height: 16),
                    Container(
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        gradient: AppColors.primaryGradient,
                        borderRadius: BorderRadius.circular(14),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(
                            Icons.emoji_events,
                            color: Colors.white,
                            size: 28,
                          ),
                          const SizedBox(width: 12),
                          Text(
                            'Điểm tổng kết: ${_project!.finalScore}',
                            style: const TextStyle(
                              fontSize: 20,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],

                  if (_evaluations.isNotEmpty) ...[
                    const SizedBox(height: 24),
                    const Text(
                      'Nhận xét',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 12),
                    ..._evaluations.map(
                      (e) => Padding(
                        padding: const EdgeInsets.only(bottom: 10),
                        child: Container(
                          padding: const EdgeInsets.all(14),
                          decoration: BoxDecoration(
                            color: AppColors.card,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: AppColors.surfaceLight),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                e['evaluator_name'] ?? 'Giảng viên',
                                style: const TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w600,
                                  color: AppColors.textPrimary,
                                ),
                              ),
                              if (e['comment'] != null) ...[
                                const SizedBox(height: 6),
                                Text(
                                  e['comment'],
                                  style: const TextStyle(
                                    fontSize: 13,
                                    color: AppColors.textSecondary,
                                  ),
                                ),
                              ],
                            ],
                          ),
                        ),
                      ),
                    ),
                  ],
                ],
              ),
            ),
    );
  }
}

class _ScoreCard extends StatelessWidget {
  final String label;
  final double? score;
  final Color color;

  const _ScoreCard(this.label, this.score, this.color);

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: AppColors.card,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: color.withValues(alpha: 0.2)),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.03),
              blurRadius: 6,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          children: [
            Text(
              score != null ? score!.toStringAsFixed(1) : '—',
              style: TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.bold,
                color: color,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              label,
              style: const TextStyle(fontSize: 10, color: AppColors.textHint),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}
