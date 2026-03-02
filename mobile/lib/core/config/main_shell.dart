import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/constants/app_colors.dart';

/// Student Main Shell with bottom navigation (5 tabs + drawer for more)
class MainShell extends ConsumerWidget {
  final Widget child;
  const MainShell({super.key, required this.child});

  int _getSelectedIndex(BuildContext context) {
    final location = GoRouterState.of(context).matchedLocation;
    if (location.startsWith('/dashboard')) return 0;
    if (location.startsWith('/project')) return 1;
    if (location.startsWith('/sprints')) return 2;
    if (location.startsWith('/topics')) return 3;
    if (location.startsWith('/more')) return 4;
    return 0;
  }

  void _onTap(BuildContext context, int index) {
    switch (index) {
      case 0:
        context.go('/dashboard');
        break;
      case 1:
        context.go('/project');
        break;
      case 2:
        context.go('/sprints');
        break;
      case 3:
        context.go('/topics');
        break;
      case 4:
        _showMoreMenu(context);
        break;
    }
  }

  void _showMoreMenu(BuildContext context) {
    showModalBottomSheet(
      context: context,
      backgroundColor: AppColors.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const SizedBox(height: 8),
            Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: AppColors.surfaceLight,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            const SizedBox(height: 16),
            const Text(
              'Thêm',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 12),
            _MoreMenuItem(
              icon: Icons.description,
              label: 'Báo cáo tiến độ',
              onTap: () {
                Navigator.pop(ctx);
                context.go('/reports');
              },
            ),
            _MoreMenuItem(
              icon: Icons.folder_open,
              label: 'Tài liệu',
              onTap: () {
                Navigator.pop(ctx);
                context.go('/documents');
              },
            ),
            _MoreMenuItem(
              icon: Icons.emoji_events,
              label: 'Kết quả đồ án',
              onTap: () {
                Navigator.pop(ctx);
                context.go('/results');
              },
            ),
            _MoreMenuItem(
              icon: Icons.notifications_outlined,
              label: 'Thông báo',
              onTap: () {
                Navigator.pop(ctx);
                context.go('/notifications');
              },
            ),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final selectedIndex = _getSelectedIndex(context);
    return Scaffold(
      body: child,
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: AppColors.surface,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.06),
              blurRadius: 10,
              offset: const Offset(0, -2),
            ),
          ],
        ),
        child: NavigationBar(
          selectedIndex: selectedIndex > 4 ? 0 : selectedIndex,
          onDestinationSelected: (i) => _onTap(context, i),
          backgroundColor: AppColors.surface,
          indicatorColor: AppColors.primary.withValues(alpha: 0.12),
          height: 65,
          labelBehavior: NavigationDestinationLabelBehavior.alwaysShow,
          destinations: const [
            NavigationDestination(
              icon: Icon(Icons.dashboard_outlined),
              selectedIcon: Icon(Icons.dashboard, color: AppColors.primary),
              label: 'Trang chủ',
            ),
            NavigationDestination(
              icon: Icon(Icons.assignment_outlined),
              selectedIcon: Icon(Icons.assignment, color: AppColors.primary),
              label: 'Đồ án',
            ),
            NavigationDestination(
              icon: Icon(Icons.view_kanban_outlined),
              selectedIcon: Icon(Icons.view_kanban, color: AppColors.primary),
              label: 'Sprint',
            ),
            NavigationDestination(
              icon: Icon(Icons.topic_outlined),
              selectedIcon: Icon(Icons.topic, color: AppColors.primary),
              label: 'Đề tài',
            ),
            NavigationDestination(
              icon: Icon(Icons.more_horiz),
              selectedIcon: Icon(Icons.more_horiz, color: AppColors.primary),
              label: 'Thêm',
            ),
          ],
        ),
      ),
    );
  }
}

class _MoreMenuItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;

  const _MoreMenuItem({
    required this.icon,
    required this.label,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: AppColors.primary.withValues(alpha: 0.08),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Icon(icon, color: AppColors.primary, size: 20),
      ),
      title: Text(
        label,
        style: const TextStyle(color: AppColors.textPrimary, fontSize: 15),
      ),
      trailing: const Icon(Icons.chevron_right, color: AppColors.textHint),
      onTap: onTap,
    );
  }
}
