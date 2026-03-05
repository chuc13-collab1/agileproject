import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../core/constants/app_colors.dart';

/// Supervisor Shell with bottom navigation
class SupervisorShell extends StatelessWidget {
  final Widget child;
  const SupervisorShell({super.key, required this.child});

  int _getSelectedIndex(BuildContext context) {
    final location = GoRouterState.of(context).matchedLocation;
    if (location.startsWith('/supervisor/dashboard')) return 0;
    if (location.startsWith('/supervisor/students')) return 1;
    if (location.startsWith('/supervisor/topics')) return 2;
    if (location.startsWith('/supervisor/statistics')) return 3;
    if (location.startsWith('/supervisor/calendar')) return 4;
    if (location.startsWith('/supervisor/proposals') ||
        location.startsWith('/supervisor/topic-proposal'))
      return 4;
    return 0;
  }

  void _onTap(BuildContext context, int index) {
    switch (index) {
      case 0:
        context.go('/supervisor/dashboard');
        break;
      case 1:
        context.go('/supervisor/students');
        break;
      case 2:
        context.go('/supervisor/topics');
        break;
      case 3:
        context.go('/supervisor/statistics');
        break;
      case 4:
        _showMore(context);
        break;
    }
  }

  void _showMore(BuildContext context) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.white,
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
            ListTile(
              leading: const Icon(
                Icons.calendar_today_outlined,
                color: AppColors.primary,
              ),
              title: const Text('Lịch hẹn sinh viên'),
              onTap: () {
                Navigator.pop(ctx);
                context.go('/supervisor/calendar');
              },
            ),
            ListTile(
              leading: const Icon(
                Icons.inbox_outlined,
                color: AppColors.primary,
              ),
              title: const Text('Đề xuất đề tài'),
              onTap: () {
                Navigator.pop(ctx);
                context.go('/supervisor/proposals');
              },
            ),
            ListTile(
              leading: const Icon(
                Icons.add_box_outlined,
                color: AppColors.primary,
              ),
              title: const Text('Tạo đề tài mới'),
              onTap: () {
                Navigator.pop(ctx);
                context.go('/supervisor/topic-proposal');
              },
            ),
            ListTile(
              leading: const Icon(
                Icons.rate_review_outlined,
                color: AppColors.warning,
              ),
              title: const Text('Đồ án phản biện'),
              onTap: () {
                Navigator.pop(ctx);
                context.go('/supervisor/review-list');
              },
            ),
            const SizedBox(height: 8),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final selectedIndex = _getSelectedIndex(context);
    return Scaffold(
      body: child,
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          border: Border(
            top: BorderSide(color: AppColors.surfaceLight, width: 1),
          ),
        ),
        child: NavigationBar(
          selectedIndex: selectedIndex > 4 ? 0 : selectedIndex,
          onDestinationSelected: (i) => _onTap(context, i),
          backgroundColor: AppColors.surface,
          indicatorColor: AppColors.primary.withValues(alpha: 0.15),
          height: 65,
          labelBehavior: NavigationDestinationLabelBehavior.alwaysShow,
          destinations: const [
            NavigationDestination(
              icon: Icon(Icons.dashboard_outlined),
              selectedIcon: Icon(Icons.dashboard, color: AppColors.primary),
              label: 'Trang chủ',
            ),
            NavigationDestination(
              icon: Icon(Icons.people_outlined),
              selectedIcon: Icon(Icons.people, color: AppColors.primary),
              label: 'Sinh viên',
            ),
            NavigationDestination(
              icon: Icon(Icons.topic_outlined),
              selectedIcon: Icon(Icons.topic, color: AppColors.primary),
              label: 'Đề tài',
            ),
            NavigationDestination(
              icon: Icon(Icons.bar_chart_outlined),
              selectedIcon: Icon(Icons.bar_chart, color: AppColors.primary),
              label: 'Thống kê',
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

/// Admin Shell with bottom navigation
class AdminShell extends StatelessWidget {
  final Widget child;
  const AdminShell({super.key, required this.child});

  int _getSelectedIndex(BuildContext context) {
    final location = GoRouterState.of(context).matchedLocation;
    if (location.startsWith('/admin/dashboard')) return 0;
    if (location.startsWith('/admin/users')) return 1;
    if (location.startsWith('/admin/projects')) return 2;
    if (location.startsWith('/admin/statistics')) return 3;
    if (location.startsWith('/admin/class-assignment') ||
        location.startsWith('/admin/reviewer-assignment') ||
        location.startsWith('/admin/announcements') ||
        location.startsWith('/admin/topics'))
      return 4;
    return 0;
  }

  void _onTap(BuildContext context, int index) {
    switch (index) {
      case 0:
        context.go('/admin/dashboard');
        break;
      case 1:
        context.go('/admin/users');
        break;
      case 2:
        context.go('/admin/projects');
        break;
      case 3:
        context.go('/admin/statistics');
        break;
      case 4:
        _showMore(context);
        break;
    }
  }

  void _showMore(BuildContext context) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.white,
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
            ListTile(
              leading: const Icon(
                Icons.class_outlined,
                color: AppColors.accent,
              ),
              title: const Text('Phân lớp sinh viên'),
              onTap: () {
                Navigator.pop(ctx);
                context.go('/admin/class-assignment');
              },
            ),
            ListTile(
              leading: const Icon(
                Icons.rate_review_outlined,
                color: AppColors.accent,
              ),
              title: const Text('Phân công phản biện'),
              onTap: () {
                Navigator.pop(ctx);
                context.go('/admin/reviewer-assignment');
              },
            ),
            ListTile(
              leading: const Icon(
                Icons.campaign_outlined,
                color: AppColors.accent,
              ),
              title: const Text('Thông báo'),
              onTap: () {
                Navigator.pop(ctx);
                context.go('/admin/announcements');
              },
            ),
            ListTile(
              leading: const Icon(
                Icons.topic_outlined,
                color: AppColors.accent,
              ),
              title: const Text('Quản lý đề tài'),
              onTap: () {
                Navigator.pop(ctx);
                context.go('/admin/topics');
              },
            ),
            const SizedBox(height: 8),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final selectedIndex = _getSelectedIndex(context);
    return Scaffold(
      body: child,
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          border: Border(
            top: BorderSide(color: AppColors.surfaceLight, width: 1),
          ),
        ),
        child: NavigationBar(
          selectedIndex: selectedIndex > 4 ? 0 : selectedIndex,
          onDestinationSelected: (i) => _onTap(context, i),
          backgroundColor: AppColors.surface,
          indicatorColor: AppColors.accent.withValues(alpha: 0.15),
          height: 65,
          labelBehavior: NavigationDestinationLabelBehavior.alwaysShow,
          destinations: const [
            NavigationDestination(
              icon: Icon(Icons.dashboard_outlined),
              selectedIcon: Icon(Icons.dashboard, color: AppColors.accent),
              label: 'Trang chủ',
            ),
            NavigationDestination(
              icon: Icon(Icons.manage_accounts_outlined),
              selectedIcon: Icon(
                Icons.manage_accounts,
                color: AppColors.accent,
              ),
              label: 'Người dùng',
            ),
            NavigationDestination(
              icon: Icon(Icons.assignment_outlined),
              selectedIcon: Icon(Icons.assignment, color: AppColors.accent),
              label: 'Đồ án',
            ),
            NavigationDestination(
              icon: Icon(Icons.analytics_outlined),
              selectedIcon: Icon(Icons.analytics, color: AppColors.accent),
              label: 'Thống kê',
            ),
            NavigationDestination(
              icon: Icon(Icons.more_horiz),
              selectedIcon: Icon(Icons.more_horiz, color: AppColors.accent),
              label: 'Thêm',
            ),
          ],
        ),
      ),
    );
  }
}
