import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../shared/widgets/common_widgets.dart';
import '../providers/admin_provider.dart';

/// Project Management screen for admin
class AdminProjectManagementScreen extends ConsumerWidget {
  const AdminProjectManagementScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(adminProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Quản lý đồ án')),
      body: state.isLoading
          ? const LoadingList()
          : state.projects.isEmpty
          ? const Center(
              child: Text(
                'Chưa có đồ án',
                style: TextStyle(color: AppColors.textHint),
              ),
            )
          : RefreshIndicator(
              onRefresh: () => ref.read(adminProvider.notifier).loadAll(),
              child: ListView.separated(
                padding: const EdgeInsets.all(16),
                itemCount: state.projects.length,
                separatorBuilder: (_, i) => const SizedBox(height: 10),
                itemBuilder: (_, index) {
                  final p = state.projects[index];
                  return Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: AppColors.card,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppColors.surfaceLight),
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
                                  fontSize: 15,
                                  fontWeight: FontWeight.w600,
                                  color: AppColors.textPrimary,
                                ),
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                            StatusChip(
                              label: p.statusText,
                              color: _statusColor(p.status),
                            ),
                          ],
                        ),
                        const SizedBox(height: 10),
                        Row(
                          children: [
                            const Icon(
                              Icons.person_outline,
                              size: 14,
                              color: AppColors.textHint,
                            ),
                            const SizedBox(width: 4),
                            Expanded(
                              child: Text(
                                'SV: ${p.studentName ?? '—'}',
                                style: const TextStyle(
                                  fontSize: 12,
                                  color: AppColors.textSecondary,
                                ),
                              ),
                            ),
                            const Icon(
                              Icons.school_outlined,
                              size: 14,
                              color: AppColors.textHint,
                            ),
                            const SizedBox(width: 4),
                            Expanded(
                              child: Text(
                                'GV: ${p.supervisorName ?? '—'}',
                                style: const TextStyle(
                                  fontSize: 12,
                                  color: AppColors.textSecondary,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  );
                },
              ),
            ),
    );
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
