import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/constants/app_colors.dart';
import '../providers/supervisor_provider.dart';

/// Teacher Statistics screen
class TeacherStatisticsScreen extends ConsumerWidget {
  const TeacherStatisticsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(supervisorProvider);

    final totalProjects = state.projects.length;
    final inProgress = state.projects
        .where((p) => p.status == 'in_progress')
        .length;
    final completed = state.projects
        .where((p) => p.status == 'completed')
        .length;
    final totalStudents = state.students.length;
    final totalTopics = state.topics.length;
    final availableTopics = state.topics.where((t) => t.isAvailable).length;

    return Scaffold(
      appBar: AppBar(title: const Text('Thống kê')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Overview
            const Text(
              'Tổng quan',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 12),
            GridView.count(
              crossAxisCount: 2,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
              childAspectRatio: 1.4,
              children: [
                _BigStatCard(
                  'Tổng đồ án',
                  '$totalProjects',
                  Icons.assignment,
                  AppColors.primary,
                ),
                _BigStatCard(
                  'Đang thực hiện',
                  '$inProgress',
                  Icons.pending_actions,
                  AppColors.warning,
                ),
                _BigStatCard(
                  'Hoàn thành',
                  '$completed',
                  Icons.check_circle_outline,
                  AppColors.success,
                ),
                _BigStatCard(
                  'Sinh viên',
                  '$totalStudents',
                  Icons.people,
                  AppColors.accent,
                ),
                _BigStatCard(
                  'Tổng đề tài',
                  '$totalTopics',
                  Icons.topic,
                  AppColors.info,
                ),
                _BigStatCard(
                  'Đề tài trống',
                  '$availableTopics',
                  Icons.add_circle_outline,
                  AppColors.success,
                ),
              ],
            ),

            const SizedBox(height: 24),

            // Project status breakdown
            const Text(
              'Trạng thái đồ án',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 12),
            if (totalProjects > 0) ...[
              _ProgressBar(
                'Đã đăng ký',
                state.projects.where((p) => p.status == 'registered').length,
                totalProjects,
                AppColors.info,
              ),
              const SizedBox(height: 8),
              _ProgressBar(
                'Đang thực hiện',
                inProgress,
                totalProjects,
                AppColors.warning,
              ),
              const SizedBox(height: 8),
              _ProgressBar(
                'Hoàn thành',
                completed,
                totalProjects,
                AppColors.success,
              ),
            ] else
              const Text(
                'Chưa có dữ liệu',
                style: TextStyle(color: AppColors.textHint),
              ),
          ],
        ),
      ),
    );
  }
}

class _BigStatCard extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;
  final Color color;

  const _BigStatCard(this.label, this.value, this.icon, this.color);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: color.withValues(alpha: 0.2)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, color: color, size: 24),
          const Spacer(),
          Text(
            value,
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: color,
            ),
          ),
          Text(
            label,
            style: const TextStyle(fontSize: 12, color: AppColors.textHint),
          ),
        ],
      ),
    );
  }
}

class _ProgressBar extends StatelessWidget {
  final String label;
  final int count;
  final int total;
  final Color color;

  const _ProgressBar(this.label, this.count, this.total, this.color);

  @override
  Widget build(BuildContext context) {
    final pct = total > 0 ? count / total : 0.0;
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppColors.surfaceLight),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text(
                label,
                style: const TextStyle(
                  fontSize: 13,
                  color: AppColors.textPrimary,
                ),
              ),
              const Spacer(),
              Text(
                '$count',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                  color: color,
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: LinearProgressIndicator(
              value: pct,
              backgroundColor: AppColors.surfaceLight,
              color: color,
              minHeight: 6,
            ),
          ),
        ],
      ),
    );
  }
}
