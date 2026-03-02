import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../shared/widgets/common_widgets.dart';
import '../providers/admin_provider.dart';

/// User Management screen — SV + GV tabs
class UserManagementScreen extends ConsumerWidget {
  const UserManagementScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(adminProvider);

    return DefaultTabController(
      length: 2,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Quản lý người dùng'),
          bottom: const TabBar(
            indicatorColor: AppColors.primary,
            labelColor: AppColors.primary,
            unselectedLabelColor: AppColors.textHint,
            tabs: [
              Tab(text: 'Sinh viên', icon: Icon(Icons.person, size: 18)),
              Tab(text: 'Giảng viên', icon: Icon(Icons.school, size: 18)),
            ],
          ),
        ),
        body: state.isLoading
            ? const LoadingList()
            : TabBarView(
                children: [
                  // Students tab
                  _UserList(
                    items: state.students,
                    emptyText: 'Chưa có sinh viên',
                    builder: (s) => _UserTile(
                      name: s.displayName,
                      subtitle: '${s.studentId ?? ''} • ${s.className ?? ''}',
                      email: s.email,
                      isActive: s.isActive,
                      onToggle: () {
                        ref
                            .read(adminProvider.notifier)
                            .toggleStudentActive(s.id);
                      },
                    ),
                  ),
                  // Teachers tab
                  _UserList(
                    items: state.teachers,
                    emptyText: 'Chưa có giảng viên',
                    builder: (t) => _UserTile(
                      name: t.displayName,
                      subtitle: t.department ?? '',
                      email: t.email,
                      isActive: t.isActive,
                      onToggle: () {
                        ref
                            .read(adminProvider.notifier)
                            .toggleTeacherActive(t.id);
                      },
                    ),
                  ),
                ],
              ),
      ),
    );
  }
}

class _UserList<T> extends StatelessWidget {
  final List<T> items;
  final String emptyText;
  final Widget Function(T) builder;

  const _UserList({
    required this.items,
    required this.emptyText,
    required this.builder,
  });

  @override
  Widget build(BuildContext context) {
    if (items.isEmpty) {
      return Center(
        child: Text(
          emptyText,
          style: const TextStyle(color: AppColors.textHint),
        ),
      );
    }
    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: items.length,
      separatorBuilder: (_, i) => const SizedBox(height: 8),
      itemBuilder: (_, index) => builder(items[index]),
    );
  }
}

class _UserTile extends StatelessWidget {
  final String name;
  final String subtitle;
  final String email;
  final bool isActive;
  final VoidCallback onToggle;

  const _UserTile({
    required this.name,
    required this.subtitle,
    required this.email,
    required this.isActive,
    required this.onToggle,
  });

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
          CircleAvatar(
            radius: 22,
            backgroundColor: isActive
                ? AppColors.primary.withValues(alpha: 0.15)
                : AppColors.error.withValues(alpha: 0.15),
            child: Text(
              name.isNotEmpty ? name[0].toUpperCase() : '?',
              style: TextStyle(
                color: isActive ? AppColors.primary : AppColors.error,
                fontWeight: FontWeight.bold,
                fontSize: 16,
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  name,
                  style: const TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textPrimary,
                  ),
                ),
                Text(
                  subtitle,
                  style: const TextStyle(
                    fontSize: 12,
                    color: AppColors.textHint,
                  ),
                ),
                Text(
                  email,
                  style: const TextStyle(
                    fontSize: 11,
                    color: AppColors.textHint,
                  ),
                ),
              ],
            ),
          ),
          Switch(
            value: isActive,
            onChanged: (_) => onToggle(),
            activeTrackColor: AppColors.success,
          ),
        ],
      ),
    );
  }
}
