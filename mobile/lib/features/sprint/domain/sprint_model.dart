/// Sprint model mapped from API response
/// Server sprint fields: id, project_id, sprint_number, name, goals,
/// start_week, end_week, weight_percent, status, actual_progress, created_at
class SprintModel {
  final String id;
  final String projectId;
  final String name;
  final String? goal;
  final String status;
  final int sprintNumber;
  final int? startWeek;
  final int? endWeek;
  final double? weightPercent;
  final double? actualProgress;
  final DateTime? startDate;
  final DateTime? endDate;
  final List<TaskModel> tasks;
  final DateTime? createdAt;

  const SprintModel({
    required this.id,
    required this.projectId,
    required this.name,
    this.goal,
    this.status = 'not_started',
    this.sprintNumber = 1,
    this.startWeek,
    this.endWeek,
    this.weightPercent,
    this.actualProgress,
    this.startDate,
    this.endDate,
    this.tasks = const [],
    this.createdAt,
  });

  factory SprintModel.fromJson(Map<String, dynamic> json) {
    final taskList = json['tasks'] as List?;
    return SprintModel(
      id: (json['id'] ?? json['sprint_id'] ?? '').toString(),
      projectId: (json['project_id'] ?? json['projectId'] ?? '').toString(),
      name:
          json['name'] ??
          json['sprint_name'] ??
          'Sprint ${json['sprint_number'] ?? 1}',
      goal: json['goals'] ?? json['goal'],
      status: json['status'] ?? 'not_started',
      sprintNumber: json['sprint_number'] ?? json['sprintNumber'] ?? 1,
      startWeek: json['start_week'] ?? json['startWeek'],
      endWeek: json['end_week'] ?? json['endWeek'],
      weightPercent: _parseDouble(
        json['weight_percent'] ?? json['weightPercent'],
      ),
      actualProgress: _parseDouble(
        json['actual_progress'] ?? json['actualProgress'],
      ),
      startDate: json['start_date'] != null
          ? DateTime.tryParse(json['start_date'].toString())
          : null,
      endDate: json['end_date'] != null
          ? DateTime.tryParse(json['end_date'].toString())
          : null,
      tasks: taskList?.map((t) => TaskModel.fromJson(t)).toList() ?? [],
      createdAt: json['created_at'] != null
          ? DateTime.tryParse(json['created_at'].toString())
          : null,
    );
  }

  static double? _parseDouble(dynamic value) {
    if (value == null) return null;
    if (value is double) return value;
    if (value is int) return value.toDouble();
    return double.tryParse(value.toString());
  }

  /// Get tasks by status
  List<TaskModel> getTasksByStatus(String targetStatus) {
    return tasks.where((t) => t.status == targetStatus).toList();
  }

  /// Status display text
  String get statusText {
    switch (status) {
      case 'not_started':
        return 'Chưa bắt đầu';
      case 'in_progress':
        return 'Đang thực hiện';
      case 'completed':
        return 'Hoàn thành';
      default:
        return status;
    }
  }
}

/// Task model within a sprint
class TaskModel {
  final String id;
  final String sprintId;
  final String title;
  final String? description;
  final String status;
  final String priority;
  final String? assigneeId;
  final String? assigneeName;
  final DateTime? dueDate;
  final DateTime? createdAt;

  const TaskModel({
    required this.id,
    required this.sprintId,
    required this.title,
    this.description,
    this.status = 'todo',
    this.priority = 'medium',
    this.assigneeId,
    this.assigneeName,
    this.dueDate,
    this.createdAt,
  });

  factory TaskModel.fromJson(Map<String, dynamic> json) {
    return TaskModel(
      id: (json['id'] ?? json['task_id'] ?? '').toString(),
      sprintId: (json['sprint_id'] ?? json['sprintId'] ?? '').toString(),
      title: json['title'] ?? json['task_title'] ?? '',
      description: json['description'],
      status: json['status'] ?? 'todo',
      priority: json['priority'] ?? 'medium',
      assigneeId: json['assignee_id']?.toString(),
      assigneeName: json['assignee_name'] ?? json['assigneeName'],
      dueDate: json['due_date'] != null
          ? DateTime.tryParse(json['due_date'].toString())
          : null,
      createdAt: json['created_at'] != null
          ? DateTime.tryParse(json['created_at'].toString())
          : null,
    );
  }

  /// Get status display text
  String get statusText {
    switch (status) {
      case 'todo':
        return 'Cần làm';
      case 'in_progress':
        return 'Đang làm';
      case 'done':
        return 'Hoàn thành';
      default:
        return status;
    }
  }

  /// Get priority display text
  String get priorityText {
    switch (priority) {
      case 'high':
        return 'Cao';
      case 'medium':
        return 'Trung bình';
      case 'low':
        return 'Thấp';
      default:
        return priority;
    }
  }
}
