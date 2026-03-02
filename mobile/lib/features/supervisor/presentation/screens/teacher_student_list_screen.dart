import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../shared/widgets/common_widgets.dart';
import '../providers/supervisor_provider.dart';

/// Teacher Student List screen
class TeacherStudentListScreen extends ConsumerWidget {
  const TeacherStudentListScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(supervisorProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Sinh viên')),
      body: state.isLoading
          ? const LoadingList()
          : state.students.isEmpty
          ? const Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.people_outline,
                    size: 56,
                    color: AppColors.textHint,
                  ),
                  SizedBox(height: 12),
                  Text(
                    'Chưa có sinh viên',
                    style: TextStyle(color: AppColors.textSecondary),
                  ),
                ],
              ),
            )
          : RefreshIndicator(
              onRefresh: () => ref.read(supervisorProvider.notifier).loadAll(),
              child: ListView.separated(
                padding: const EdgeInsets.all(16),
                itemCount: state.students.length,
                separatorBuilder: (_, i) => const SizedBox(height: 10),
                itemBuilder: (_, index) {
                  final s = state.students[index];
                  return Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: AppColors.card,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppColors.surfaceLight),
                    ),
                    child: Row(
                      children: [
                        CircleAvatar(
                          radius: 22,
                          backgroundColor: AppColors.primary.withValues(
                            alpha: 0.15,
                          ),
                          child: Text(
                            s.displayName[0].toUpperCase(),
                            style: const TextStyle(
                              color: AppColors.primary,
                              fontWeight: FontWeight.bold,
                              fontSize: 16,
                            ),
                          ),
                        ),
                        const SizedBox(width: 14),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                s.displayName,
                                style: const TextStyle(
                                  fontSize: 15,
                                  fontWeight: FontWeight.w600,
                                  color: AppColors.textPrimary,
                                ),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                '${s.studentId ?? ''} • ${s.className ?? ''}',
                                style: const TextStyle(
                                  fontSize: 12,
                                  color: AppColors.textHint,
                                ),
                              ),
                              if (s.projectTitle != null) ...[
                                const SizedBox(height: 4),
                                Text(
                                  '📋 ${s.projectTitle}',
                                  style: const TextStyle(
                                    fontSize: 12,
                                    color: AppColors.textSecondary,
                                  ),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ],
                            ],
                          ),
                        ),
                        StatusChip(
                          label: s.isActive ? 'Active' : 'Inactive',
                          color: s.isActive
                              ? AppColors.success
                              : AppColors.error,
                        ),
                      ],
                    ),
                  );
                },
              ),
            ),
    );
  }
}
