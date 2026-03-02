/// Topic model mapped from API
class TopicModel {
  final String id;
  final String title;
  final String? description;
  final String? teacherId;
  final String? teacherName;
  final String? field;
  final String? semester;
  final String? academicYear;
  final int maxStudents;
  final int currentStudents;
  final String status;
  final DateTime? createdAt;

  const TopicModel({
    required this.id,
    required this.title,
    this.description,
    this.teacherId,
    this.teacherName,
    this.field,
    this.semester,
    this.academicYear,
    this.maxStudents = 1,
    this.currentStudents = 0,
    this.status = 'available',
    this.createdAt,
  });

  factory TopicModel.fromJson(Map<String, dynamic> json) {
    return TopicModel(
      id: (json['id'] ?? json['topic_id'] ?? '').toString(),
      title: json['title'] ?? json['topic_title'] ?? '',
      description: json['description'] ?? json['topic_description'],
      teacherId:
          (json['supervisorId'] ?? json['supervisor_id'] ?? json['teacher_id'])
              ?.toString(),
      teacherName:
          json['supervisorName'] ??
          json['supervisor_name'] ??
          json['teacher_name'] ??
          json['teacherName'],
      field: json['field'],
      semester: json['semester'],
      academicYear: json['academicYear'] ?? json['academic_year'],
      maxStudents: json['maxStudents'] ?? json['max_students'] ?? 1,
      currentStudents: json['currentStudents'] ?? json['current_students'] ?? 0,
      status: json['status'] ?? 'available',
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt'].toString())
          : json['created_at'] != null
          ? DateTime.tryParse(json['created_at'].toString())
          : null,
    );
  }

  bool get isAvailable =>
      (status == 'available' || status == 'approved') &&
      currentStudents < maxStudents;

  String get statusText {
    switch (status) {
      case 'available':
        return 'Có sẵn';
      case 'approved':
        return 'Đã duyệt';
      case 'pending':
        return 'Chờ duyệt';
      case 'assigned':
        return 'Đã gán';
      case 'rejected':
        return 'Từ chối';
      case 'completed':
        return 'Hoàn thành';
      default:
        return status;
    }
  }
}
