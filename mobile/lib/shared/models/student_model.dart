/// Student model for lists (different from UserModel — used in admin/supervisor)
class StudentModel {
  final String id;
  final String uid;
  final String email;
  final String displayName;
  final String? studentId;
  final String? className;
  final String? major;
  final String? phone;
  final bool isActive;
  final String? projectTitle;
  final DateTime? createdAt;

  const StudentModel({
    required this.id,
    required this.uid,
    required this.email,
    required this.displayName,
    this.studentId,
    this.className,
    this.major,
    this.phone,
    this.isActive = true,
    this.projectTitle,
    this.createdAt,
  });

  factory StudentModel.fromJson(Map<String, dynamic> json) {
    return StudentModel(
      id: (json['id'] ?? '').toString(),
      uid: json['uid'] ?? '',
      email: json['email'] ?? '',
      displayName: json['display_name'] ?? json['displayName'] ?? '',
      studentId: json['student_id'],
      className: json['class_name'] ?? json['className'],
      major: json['major'],
      phone: json['phone'],
      isActive: json['is_active'] == 1 || json['is_active'] == true,
      projectTitle: json['project_title'] ?? json['projectTitle'],
      createdAt: json['created_at'] != null
          ? DateTime.tryParse(json['created_at'].toString())
          : null,
    );
  }
}

/// Class model
class ClassModel {
  final String id;
  final String name;
  final String classCode;
  final String? department;
  final String? academicYear;
  final int studentCount;

  const ClassModel({
    required this.id,
    required this.name,
    required this.classCode,
    this.department,
    this.academicYear,
    this.studentCount = 0,
  });

  factory ClassModel.fromJson(Map<String, dynamic> json) {
    return ClassModel(
      id: (json['id'] ?? '').toString(),
      name: json['name'] ?? json['class_name'] ?? '',
      classCode: json['class_code'] ?? json['classCode'] ?? '',
      department: json['department'],
      academicYear: json['academic_year'] ?? json['academicYear'],
      studentCount: json['student_count'] ?? json['studentCount'] ?? 0,
    );
  }
}
