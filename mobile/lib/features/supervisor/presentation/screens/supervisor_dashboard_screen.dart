import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../shared/widgets/common_widgets.dart';
import '../../../auth/presentation/providers/auth_provider.dart';
import '../providers/supervisor_provider.dart';

/// Supervisor Dashboard
class SupervisorDashboardScreen extends ConsumerStatefulWidget {
  const SupervisorDashboardScreen({super.key});

  @override
  ConsumerState<SupervisorDashboardScreen> createState() =>
      _SupervisorDashboardScreenState();
}

class _SupervisorDashboardScreenState
    extends ConsumerState<SupervisorDashboardScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(supervisorProvider.notifier).loadAll();
    });
  }

  void _showLogoutDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.card,
        title: const Text(
          'Đăng xuất',
          style: TextStyle(color: AppColors.textPrimary),
        ),
        content: const Text(
          'Bạn muốn đăng xuất khỏi ứng dụng?',
          style: TextStyle(color: AppColors.textSecondary),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Hủy'),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(ctx);
              ref.read(authProvider.notifier).logout();
            },
            child: const Text(
              'Đăng xuất',
              style: TextStyle(color: AppColors.error),
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(supervisorProvider);

    return Scaffold(
      body: RefreshIndicator(
        onRefresh: () => ref.read(supervisorProvider.notifier).loadAll(),
        child: CustomScrollView(
          slivers: [
            // Header
            SliverAppBar(
              expandedHeight: 140,
              floating: false,
              pinned: true,
              backgroundColor: AppColors.surface,
              actions: [
                IconButton(
                  icon: const Icon(Icons.logout, color: Colors.white),
                  tooltip: 'Đăng xuất',
                  onPressed: () => _showLogoutDialog(context),
                ),
              ],
              flexibleSpace: FlexibleSpaceBar(
                background: Container(
                  decoration: const BoxDecoration(
                    gradient: LinearGradient(
                      colors: [Color(0xFF00B4D8), Color(0xFF0077B6)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                  ),
                  child: SafeArea(
                    child: Padding(
                      padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              const Icon(
                                Icons.school_rounded,
                                color: Colors.white,
                                size: 28,
                              ),
                              const SizedBox(width: 12),
                              const Text(
                                'Giảng viên Hướng dẫn',
                                style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 20,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ),

            // Stats
            SliverPadding(
              padding: const EdgeInsets.all(16),
              sliver: SliverList(
                delegate: SliverChildListDelegate([
                  if (state.isLoading) const LoadingShimmer(height: 80),
                  if (!state.isLoading)
                    Row(
                      children: [
                        Expanded(
                          child: _StatCard(
                            icon: Icons.assignment,
                            label: 'Đồ án',
                            value: '${state.projects.length}',
                            color: AppColors.primary,
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: _StatCard(
                            icon: Icons.people,
                            label: 'Sinh viên',
                            value: '${state.students.length}',
                            color: AppColors.accent,
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: _StatCard(
                            icon: Icons.topic,
                            label: 'Đề tài',
                            value: '${state.topics.length}',
                            color: AppColors.success,
                          ),
                        ),
                      ],
                    ),

                  const SizedBox(height: 24),

                  // Recent projects
                  const Text(
                    'Đồ án đang hướng dẫn',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 12),

                  if (state.isLoading)
                    ...List.generate(
                      3,
                      (_) => const Padding(
                        padding: EdgeInsets.only(bottom: 12),
                        child: LoadingShimmer(height: 100),
                      ),
                    ),

                  if (!state.isLoading && state.projects.isEmpty)
                    _EmptyCard(icon: Icons.folder_open, text: 'Chưa có đồ án'),

                  if (!state.isLoading)
                    ...state.projects
                        .take(5)
                        .map(
                          (p) => Padding(
                            padding: const EdgeInsets.only(bottom: 10),
                            child: _ProjectListItem(project: p),
                          ),
                        ),

                  const SizedBox(height: 24),

                  // Recent students
                  const Text(
                    'Sinh viên gần đây',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 12),

                  if (!state.isLoading && state.students.isEmpty)
                    _EmptyCard(
                      icon: Icons.person_off,
                      text: 'Chưa có sinh viên',
                    ),

                  if (!state.isLoading)
                    ...state.students
                        .take(5)
                        .map(
                          (s) => Padding(
                            padding: const EdgeInsets.only(bottom: 8),
                            child: _StudentListItem(student: s),
                          ),
                        ),
                ]),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final Color color;

  const _StatCard({
    required this.icon,
    required this.label,
    required this.value,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.surfaceLight),
      ),
      child: Column(
        children: [
          Icon(icon, color: color, size: 24),
          const SizedBox(height: 8),
          Text(
            value,
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: color,
            ),
          ),
          Text(
            label,
            style: const TextStyle(fontSize: 11, color: AppColors.textHint),
          ),
        ],
      ),
    );
  }
}

class _ProjectListItem extends StatelessWidget {
  final dynamic project;
  const _ProjectListItem({required this.project});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.surfaceLight),
      ),
      child: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: AppColors.primary.withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(10),
            ),
            child: const Icon(
              Icons.description,
              color: AppColors.primary,
              size: 20,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  project.title,
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textPrimary,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 2),
                Text(
                  'SV: ${project.studentName ?? 'Chưa có'}',
                  style: const TextStyle(
                    fontSize: 12,
                    color: AppColors.textHint,
                  ),
                ),
              ],
            ),
          ),
          StatusChip(
            label: project.statusText,
            color: _statusColor(project.status),
          ),
        ],
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
      default:
        return AppColors.textHint;
    }
  }
}

class _StudentListItem extends StatelessWidget {
  final dynamic student;
  const _StudentListItem({required this.student});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppColors.surfaceLight),
      ),
      child: Row(
        children: [
          CircleAvatar(
            radius: 18,
            backgroundColor: AppColors.accent.withValues(alpha: 0.15),
            child: Text(
              (student.displayName as String)[0].toUpperCase(),
              style: const TextStyle(
                color: AppColors.accent,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  student.displayName,
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                    color: AppColors.textPrimary,
                  ),
                ),
                Text(
                  student.studentId ?? student.email,
                  style: const TextStyle(
                    fontSize: 11,
                    color: AppColors.textHint,
                  ),
                ),
              ],
            ),
          ),
          if (student.className != null)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
              decoration: BoxDecoration(
                color: AppColors.surfaceLight,
                borderRadius: BorderRadius.circular(6),
              ),
              child: Text(
                student.className!,
                style: const TextStyle(
                  fontSize: 10,
                  color: AppColors.textSecondary,
                ),
              ),
            ),
        ],
      ),
    );
  }
}

class _EmptyCard extends StatelessWidget {
  final IconData icon;
  final String text;
  const _EmptyCard({required this.icon, required this.text});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.surfaceLight),
      ),
      child: Center(
        child: Column(
          children: [
            Icon(icon, color: AppColors.textHint, size: 36),
            const SizedBox(height: 8),
            Text(
              text,
              style: const TextStyle(color: AppColors.textHint, fontSize: 13),
            ),
          ],
        ),
      ),
    );
  }
}
