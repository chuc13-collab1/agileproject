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
    }
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
          selectedIndex: selectedIndex,
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
    }
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
          selectedIndex: selectedIndex,
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
          ],
        ),
      ),
    );
  }
}
