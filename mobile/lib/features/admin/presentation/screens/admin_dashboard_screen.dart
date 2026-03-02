import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../shared/widgets/common_widgets.dart';
import '../../../auth/presentation/providers/auth_provider.dart';
import '../providers/admin_provider.dart';

/// Admin Dashboard screen
class AdminDashboardScreen extends ConsumerStatefulWidget {
  const AdminDashboardScreen({super.key});

  @override
  ConsumerState<AdminDashboardScreen> createState() =>
      _AdminDashboardScreenState();
}

class _AdminDashboardScreenState extends ConsumerState<AdminDashboardScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(adminProvider.notifier).loadAll();
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
    final state = ref.watch(adminProvider);

    return Scaffold(
      body: RefreshIndicator(
        onRefresh: () => ref.read(adminProvider.notifier).loadAll(),
        child: CustomScrollView(
          slivers: [
            SliverAppBar(
              expandedHeight: 130,
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
                      colors: [Color(0xFFE040FB), Color(0xFF7C4DFF)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                  ),
                  child: const SafeArea(
                    child: Padding(
                      padding: EdgeInsets.fromLTRB(20, 16, 20, 0),
                      child: Row(
                        children: [
                          Icon(
                            Icons.admin_panel_settings,
                            color: Colors.white,
                            size: 28,
                          ),
                          SizedBox(width: 12),
                          Text(
                            'Quản trị hệ thống',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 20,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ),
            SliverPadding(
              padding: const EdgeInsets.all(16),
              sliver: SliverList(
                delegate: SliverChildListDelegate([
                  if (state.isLoading)
                    const LoadingShimmer(height: 100)
                  else
                    GridView.count(
                      crossAxisCount: 2,
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      crossAxisSpacing: 12,
                      mainAxisSpacing: 12,
                      childAspectRatio: 1.3,
                      children: [
                        _DashCard(
                          icon: Icons.people,
                          label: 'Sinh viên',
                          value: '${state.students.length}',
                          color: AppColors.primary,
                        ),
                        _DashCard(
                          icon: Icons.school,
                          label: 'Giảng viên',
                          value: '${state.teachers.length}',
                          color: AppColors.accent,
                        ),
                        _DashCard(
                          icon: Icons.assignment,
                          label: 'Đồ án',
                          value: '${state.projects.length}',
                          color: AppColors.success,
                        ),
                        _DashCard(
                          icon: Icons.class_,
                          label: 'Lớp',
                          value: '${state.classes.length}',
                          color: AppColors.warning,
                        ),
                        _DashCard(
                          icon: Icons.topic,
                          label: 'Đề tài',
                          value: '${state.topics.length}',
                          color: AppColors.info,
                        ),
                        _DashCard(
                          icon: Icons.people_alt,
                          label: 'SV hoạt động',
                          value:
                              '${state.students.where((s) => s.isActive).length}',
                          color: AppColors.success,
                        ),
                      ],
                    ),

                  const SizedBox(height: 24),

                  // Recent activity
                  const Text(
                    'Đồ án gần đây',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 12),

                  if (!state.isLoading)
                    ...state.projects
                        .take(5)
                        .map(
                          (p) => Padding(
                            padding: const EdgeInsets.only(bottom: 8),
                            child: Container(
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: AppColors.card,
                                borderRadius: BorderRadius.circular(10),
                                border: Border.all(
                                  color: AppColors.surfaceLight,
                                ),
                              ),
                              child: Row(
                                children: [
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          p.title,
                                          style: const TextStyle(
                                            fontSize: 14,
                                            fontWeight: FontWeight.w500,
                                            color: AppColors.textPrimary,
                                          ),
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                        Text(
                                          'SV: ${p.studentName ?? '—'} • GV: ${p.supervisorName ?? '—'}',
                                          style: const TextStyle(
                                            fontSize: 11,
                                            color: AppColors.textHint,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                  StatusChip(
                                    label: p.statusText,
                                    color: p.status == 'completed'
                                        ? AppColors.success
                                        : AppColors.warning,
                                  ),
                                ],
                              ),
                            ),
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

class _DashCard extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final Color color;

  const _DashCard({
    required this.icon,
    required this.label,
    required this.value,
    required this.color,
  });

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
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Icon(icon, color: color, size: 24),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                value,
                style: TextStyle(
                  fontSize: 22,
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
        ],
      ),
    );
  }
}
