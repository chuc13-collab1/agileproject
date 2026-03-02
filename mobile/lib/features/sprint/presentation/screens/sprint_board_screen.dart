import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../shared/widgets/common_widgets.dart';
import '../../../project/presentation/providers/project_provider.dart';
import '../../domain/sprint_model.dart';
import '../providers/sprint_provider.dart';

/// Sprint Board screen — Kanban style
class SprintBoardScreen extends ConsumerStatefulWidget {
  const SprintBoardScreen({super.key});

  @override
  ConsumerState<SprintBoardScreen> createState() => _SprintBoardScreenState();
}

class _SprintBoardScreenState extends ConsumerState<SprintBoardScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final project = ref.read(projectProvider).currentProject;
      if (project != null) {
        ref.read(sprintProvider.notifier).loadSprints(project.id);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final sprintState = ref.watch(sprintProvider);
    final sprint = sprintState.currentSprint;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Sprint Board'),
        actions: [
          if (sprintState.sprints.length > 1)
            PopupMenuButton<SprintModel>(
              icon: const Icon(Icons.filter_list),
              onSelected: (s) {
                ref.read(sprintProvider.notifier).selectSprint(s);
              },
              itemBuilder: (_) => sprintState.sprints
                  .map<PopupMenuEntry<SprintModel>>(
                    (s) => PopupMenuItem<SprintModel>(
                      value: s,
                      child: Text(s.name),
                    ),
                  )
                  .toList(),
            ),
        ],
      ),
      body: sprintState.isLoading
          ? const Center(child: CircularProgressIndicator())
          : sprint == null
          ? _buildEmptyState()
          : _buildBoard(sprint),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.view_kanban_outlined, size: 64, color: AppColors.textHint),
          const SizedBox(height: 16),
          const Text(
            'Chưa có Sprint',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w600,
              color: AppColors.textSecondary,
            ),
          ),
          const SizedBox(height: 6),
          const Text(
            'Sprint sẽ hiển thị ở đây khi được tạo',
            style: TextStyle(color: AppColors.textHint),
          ),
        ],
      ),
    );
  }

  Widget _buildBoard(SprintModel sprint) {
    final todoTasks = sprint.getTasksByStatus('todo');
    final inProgressTasks = sprint.getTasksByStatus('in_progress');
    final doneTasks = sprint.getTasksByStatus('done');

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Sprint info header
        Container(
          margin: const EdgeInsets.all(16),
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            gradient: AppColors.cardGradient,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: AppColors.surfaceLight),
          ),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: AppColors.primary.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Icon(
                  Icons.flash_on,
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
                      sprint.name,
                      style: const TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.bold,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    if (sprint.goal != null)
                      Text(
                        sprint.goal!,
                        style: const TextStyle(
                          fontSize: 12,
                          color: AppColors.textSecondary,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                  ],
                ),
              ),
              StatusChip(
                label: sprint.status == 'active' ? 'Đang chạy' : sprint.status,
                color: sprint.status == 'active'
                    ? AppColors.success
                    : AppColors.textHint,
              ),
            ],
          ),
        ),

        // Kanban columns
        Expanded(
          child: SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _KanbanColumn(
                  title: 'Cần làm',
                  tasks: todoTasks,
                  color: AppColors.todo,
                  icon: Icons.radio_button_unchecked,
                ),
                const SizedBox(width: 12),
                _KanbanColumn(
                  title: 'Đang làm',
                  tasks: inProgressTasks,
                  color: AppColors.inProgress,
                  icon: Icons.autorenew,
                ),
                const SizedBox(width: 12),
                _KanbanColumn(
                  title: 'Hoàn thành',
                  tasks: doneTasks,
                  color: AppColors.done,
                  icon: Icons.check_circle_outline,
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

/// Kanban column widget
class _KanbanColumn extends StatelessWidget {
  final String title;
  final List<TaskModel> tasks;
  final Color color;
  final IconData icon;

  const _KanbanColumn({
    required this.title,
    required this.tasks,
    required this.color,
    required this.icon,
  });

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    final columnWidth = (screenWidth - 56) / 2; // 2 columns visible

    return SizedBox(
      width: columnWidth < 200 ? 200 : columnWidth,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Column header
          Row(
            children: [
              Icon(icon, color: color, size: 18),
              const SizedBox(width: 8),
              Text(
                title,
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                  color: color,
                ),
              ),
              const SizedBox(width: 6),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: color.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text(
                  '${tasks.length}',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    color: color,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),

          // Task cards
          Expanded(
            child: tasks.isEmpty
                ? Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: AppColors.card.withValues(alpha: 0.5),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: AppColors.surfaceLight,
                        style: BorderStyle.solid,
                      ),
                    ),
                    child: Center(
                      child: Text(
                        'Không có task',
                        style: TextStyle(
                          fontSize: 12,
                          color: AppColors.textHint,
                        ),
                      ),
                    ),
                  )
                : ListView.separated(
                    itemCount: tasks.length,
                    separatorBuilder: (_, i) => const SizedBox(height: 8),
                    itemBuilder: (_, index) =>
                        _TaskCard(task: tasks[index], color: color),
                  ),
          ),
        ],
      ),
    );
  }
}

/// Individual task card
class _TaskCard extends StatelessWidget {
  final TaskModel task;
  final Color color;

  const _TaskCard({required this.task, required this.color});

  @override
  Widget build(BuildContext context) {
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
          Text(
            task.title,
            style: const TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w600,
              color: AppColors.textPrimary,
            ),
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
          if (task.description != null) ...[
            const SizedBox(height: 4),
            Text(
              task.description!,
              style: const TextStyle(fontSize: 11, color: AppColors.textHint),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
          ],
          const SizedBox(height: 8),
          Row(
            children: [
              _PriorityIndicator(priority: task.priority),
              const Spacer(),
              if (task.assigneeName != null)
                Text(
                  task.assigneeName!,
                  style: const TextStyle(
                    fontSize: 10,
                    color: AppColors.textHint,
                  ),
                ),
            ],
          ),
        ],
      ),
    );
  }
}

class _PriorityIndicator extends StatelessWidget {
  final String priority;

  const _PriorityIndicator({required this.priority});

  @override
  Widget build(BuildContext context) {
    Color color;
    switch (priority) {
      case 'high':
        color = AppColors.error;
        break;
      case 'medium':
        color = AppColors.warning;
        break;
      default:
        color = AppColors.success;
    }

    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 8,
          height: 8,
          decoration: BoxDecoration(color: color, shape: BoxShape.circle),
        ),
        const SizedBox(width: 4),
        Text(
          priority == 'high'
              ? 'Cao'
              : priority == 'medium'
              ? 'TB'
              : 'Thấp',
          style: TextStyle(fontSize: 10, color: color),
        ),
      ],
    );
  }
}
