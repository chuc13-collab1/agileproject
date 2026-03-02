import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../shared/widgets/common_widgets.dart';
import '../providers/project_provider.dart';

/// My Project detail screen
class MyProjectScreen extends ConsumerWidget {
  const MyProjectScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final projectState = ref.watch(projectProvider);
    final project = projectState.currentProject;

    return Scaffold(
      appBar: AppBar(title: const Text('Đồ án của tôi')),
      body: projectState.isLoading
          ? const Center(child: CircularProgressIndicator())
          : project == null
          ? _buildEmpty()
          : _buildContent(project),
    );
  }

  Widget _buildEmpty() {
    return const Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.folder_open_outlined, size: 64, color: AppColors.textHint),
          SizedBox(height: 16),
          Text(
            'Chưa có đồ án',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w600,
              color: AppColors.textSecondary,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildContent(dynamic project) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Title
          Text(
            project.title,
            style: const TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.bold,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 8),
          StatusChip(
            label: project.statusText,
            color: _getStatusColor(project.status),
          ),
          const SizedBox(height: 20),

          // Description
          _SectionTitle('Mô tả'),
          const SizedBox(height: 8),
          Text(
            project.description.isNotEmpty
                ? project.description
                : 'Không có mô tả',
            style: const TextStyle(
              fontSize: 14,
              color: AppColors.textSecondary,
              height: 1.5,
            ),
          ),
          const SizedBox(height: 24),

          // Info cards
          _InfoRow(
            icon: Icons.person_outline,
            label: 'GVHD',
            value: project.supervisorName ?? 'Chưa có',
          ),
          _InfoRow(
            icon: Icons.rate_review_outlined,
            label: 'GV Phản biện',
            value: project.reviewerName ?? 'Chưa có',
          ),
          _InfoRow(
            icon: Icons.category_outlined,
            label: 'Lĩnh vực',
            value: project.field ?? 'Chưa phân loại',
          ),
          _InfoRow(
            icon: Icons.school_outlined,
            label: 'HK / Năm',
            value: '${project.semester ?? ''} - ${project.academicYear ?? ''}',
          ),

          const SizedBox(height: 24),

          // Scores
          if (project.score != null ||
              project.supervisorScore != null ||
              project.reviewerScore != null) ...[
            _SectionTitle('Điểm'),
            const SizedBox(height: 12),
            Row(
              children: [
                if (project.supervisorScore != null)
                  Expanded(
                    child: _ScoreCard(
                      'GVHD',
                      project.supervisorScore!,
                      AppColors.primary,
                    ),
                  ),
                if (project.reviewerScore != null) ...[
                  const SizedBox(width: 12),
                  Expanded(
                    child: _ScoreCard(
                      'Phản biện',
                      project.reviewerScore!,
                      AppColors.accent,
                    ),
                  ),
                ],
                if (project.score != null) ...[
                  const SizedBox(width: 12),
                  Expanded(
                    child: _ScoreCard(
                      'Tổng',
                      project.score!,
                      AppColors.success,
                    ),
                  ),
                ],
              ],
            ),
          ],
        ],
      ),
    );
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case 'registered':
        return AppColors.info;
      case 'in_progress':
        return AppColors.warning;
      case 'completed':
        return AppColors.success;
      case 'failed':
        return AppColors.error;
      default:
        return AppColors.textHint;
    }
  }
}

class _SectionTitle extends StatelessWidget {
  final String title;
  const _SectionTitle(this.title);

  @override
  Widget build(BuildContext context) {
    return Text(
      title,
      style: const TextStyle(
        fontSize: 16,
        fontWeight: FontWeight.bold,
        color: AppColors.textPrimary,
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;

  const _InfoRow({
    required this.icon,
    required this.label,
    required this.value,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: Row(
        children: [
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: AppColors.surfaceLight,
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, color: AppColors.primary, size: 18),
          ),
          const SizedBox(width: 12),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: const TextStyle(fontSize: 11, color: AppColors.textHint),
              ),
              Text(
                value,
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                  color: AppColors.textPrimary,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _ScoreCard extends StatelessWidget {
  final String label;
  final double score;
  final Color color;

  const _ScoreCard(this.label, this.score, this.color);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withValues(alpha: 0.3)),
      ),
      child: Column(
        children: [
          Text(
            score.toStringAsFixed(1),
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: color,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            label,
            style: const TextStyle(fontSize: 11, color: AppColors.textHint),
          ),
        ],
      ),
    );
  }
}
