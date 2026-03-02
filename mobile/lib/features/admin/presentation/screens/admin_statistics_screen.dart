import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/constants/app_colors.dart';
import '../providers/admin_provider.dart';

/// Admin statistics screen
class AdminStatisticsScreen extends ConsumerWidget {
  const AdminStatisticsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(adminProvider);

    final activeStudents = state.students.where((s) => s.isActive).length;
    final inactiveStudents = state.students.where((s) => !s.isActive).length;
    final activeTeachers = state.teachers.where((t) => t.isActive).length;
    final projectsByStatus = <String, int>{};
    for (final p in state.projects) {
      projectsByStatus[p.status] = (projectsByStatus[p.status] ?? 0) + 1;
    }

    return Scaffold(
      appBar: AppBar(title: const Text('Thống kê hệ thống')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // User stats
            const Text(
              'Người dùng',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                _MiniStat('SV Active', '$activeStudents', AppColors.success),
                const SizedBox(width: 12),
                _MiniStat('SV Inactive', '$inactiveStudents', AppColors.error),
                const SizedBox(width: 12),
                _MiniStat('GV Active', '$activeTeachers', AppColors.primary),
              ],
            ),

            const SizedBox(height: 24),

            // Project stats
            const Text(
              'Đồ án theo trạng thái',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 12),

            ...projectsByStatus.entries.map((e) {
              final label = _statusLabel(e.key);
              final color = _statusColor(e.key);
              return Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppColors.card,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: AppColors.surfaceLight),
                  ),
                  child: Row(
                    children: [
                      Container(
                        width: 10,
                        height: 10,
                        decoration: BoxDecoration(
                          color: color,
                          shape: BoxShape.circle,
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Text(
                          label,
                          style: const TextStyle(color: AppColors.textPrimary),
                        ),
                      ),
                      Text(
                        '${e.value}',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          color: color,
                          fontSize: 16,
                        ),
                      ),
                    ],
                  ),
                ),
              );
            }),

            const SizedBox(height: 24),

            // Class & Topic stats
            const Text(
              'Khác',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                _MiniStat('Lớp', '${state.classes.length}', AppColors.warning),
                const SizedBox(width: 12),
                _MiniStat('Đề tài', '${state.topics.length}', AppColors.info),
                const SizedBox(width: 12),
                _MiniStat(
                  'Đề tài trống',
                  '${state.topics.where((t) => t.isAvailable).length}',
                  AppColors.success,
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  String _statusLabel(String s) {
    switch (s) {
      case 'registered':
        return 'Đã đăng ký';
      case 'in_progress':
        return 'Đang thực hiện';
      case 'completed':
        return 'Hoàn thành';
      case 'submitted':
        return 'Đã nộp';
      case 'graded':
        return 'Đã chấm';
      case 'failed':
        return 'Không đạt';
      default:
        return s;
    }
  }

  Color _statusColor(String s) {
    switch (s) {
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

class _MiniStat extends StatelessWidget {
  final String label;
  final String value;
  final Color color;

  const _MiniStat(this.label, this.value, this.color);

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: AppColors.card,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: color.withValues(alpha: 0.2)),
        ),
        child: Column(
          children: [
            Text(
              value,
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: color,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              label,
              style: const TextStyle(fontSize: 11, color: AppColors.textHint),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}
