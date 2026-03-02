/// Project model mapped from API response
class ProjectModel {
  final String id;
  final String title;
  final String description;
  final String? studentId;
  final String? studentName;
  final String? studentEmail;
  final String? supervisorId;
  final String? supervisorName;
  final String? reviewerId;
  final String? reviewerName;
  final String status;
  final String? semester;
  final String? academicYear;
  final String? field;
  final double? score;
  final double? supervisorScore;
  final double? reviewerScore;
  final double? councilScore;
  final double? finalScore;
  final String? grade;
  final DateTime? registrationDate;
  final DateTime? reportDeadline;
  final DateTime? defenseDate;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  const ProjectModel({
    required this.id,
    required this.title,
    required this.description,
    this.studentId,
    this.studentName,
    this.studentEmail,
    this.supervisorId,
    this.supervisorName,
    this.reviewerId,
    this.reviewerName,
    this.status = 'registered',
    this.semester,
    this.academicYear,
    this.field,
    this.score,
    this.supervisorScore,
    this.reviewerScore,
    this.councilScore,
    this.finalScore,
    this.grade,
    this.registrationDate,
    this.reportDeadline,
    this.defenseDate,
    this.createdAt,
    this.updatedAt,
  });

  factory ProjectModel.fromJson(Map<String, dynamic> json) {
    // Handle supervisor as object {id, name} or as flat fields
    String? supervisorName;
    String? supervisorId;
    if (json['supervisor'] is Map) {
      supervisorName = json['supervisor']['name'];
      supervisorId = json['supervisor']['id']?.toString();
    } else {
      supervisorName = json['supervisor_name'] ?? json['supervisorName'];
      supervisorId =
          json['supervisor_id']?.toString() ?? json['supervisorId']?.toString();
    }

    // Handle reviewer as object {id, name} or as flat fields
    String? reviewerName;
    String? reviewerId;
    if (json['reviewer'] is Map) {
      reviewerName = json['reviewer']['name'];
      reviewerId = json['reviewer']['id']?.toString();
    } else {
      reviewerName = json['reviewer_name'] ?? json['reviewerName'];
      reviewerId =
          json['reviewer_id']?.toString() ?? json['reviewerId']?.toString();
    }

    return ProjectModel(
      id: (json['id'] ?? json['project_id'] ?? '').toString(),
      title: json['title'] ?? json['topic_title'] ?? '',
      description: json['description'] ?? json['topic_description'] ?? '',
      studentId:
          json['studentId']?.toString() ?? json['student_id']?.toString(),
      studentName: json['studentName'] ?? json['student_name'],
      studentEmail: json['studentEmail'] ?? json['student_email'],
      supervisorId: supervisorId,
      supervisorName: supervisorName,
      reviewerId: reviewerId,
      reviewerName: reviewerName,
      status: json['status'] ?? 'registered',
      semester: json['semester'],
      academicYear: json['academicYear'] ?? json['academic_year'],
      field: json['field'],
      score: _parseDouble(json['score']),
      supervisorScore: _parseDouble(
        json['supervisorScore'] ?? json['supervisor_score'],
      ),
      reviewerScore: _parseDouble(
        json['reviewerScore'] ?? json['reviewer_score'],
      ),
      councilScore: _parseDouble(json['councilScore'] ?? json['council_score']),
      finalScore: _parseDouble(json['finalScore'] ?? json['final_score']),
      grade: json['grade'],
      registrationDate: _parseDate(
        json['registrationDate'] ?? json['registration_date'],
      ),
      reportDeadline: _parseDate(
        json['reportDeadline'] ?? json['report_deadline'],
      ),
      defenseDate: _parseDate(json['defenseDate'] ?? json['defense_date']),
      createdAt: _parseDate(json['createdAt'] ?? json['created_at']),
      updatedAt: _parseDate(json['updatedAt'] ?? json['updated_at']),
    );
  }

  static double? _parseDouble(dynamic value) {
    if (value == null) return null;
    if (value is double) return value;
    if (value is int) return value.toDouble();
    return double.tryParse(value.toString());
  }

  static DateTime? _parseDate(dynamic value) {
    if (value == null) return null;
    if (value is DateTime) return value;
    return DateTime.tryParse(value.toString());
  }

  /// Get status display text (Vietnamese)
  String get statusText {
    switch (status) {
      case 'registered':
        return 'Đã đăng ký';
      case 'in_progress':
        return 'Đang thực hiện';
      case 'submitted':
        return 'Đã nộp';
      case 'graded':
        return 'Đã chấm điểm';
      case 'completed':
        return 'Hoàn thành';
      case 'failed':
        return 'Không đạt';
      default:
        return status;
    }
  }
}
