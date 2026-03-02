/// Teacher model mapped from API
class TeacherModel {
  final String id;
  final String uid;
  final String email;
  final String displayName;
  final String? phone;
  final String? department;
  final String? position;
  final String? specialization;
  final bool isActive;
  final int projectCount;
  final DateTime? createdAt;

  const TeacherModel({
    required this.id,
    required this.uid,
    required this.email,
    required this.displayName,
    this.phone,
    this.department,
    this.position,
    this.specialization,
    this.isActive = true,
    this.projectCount = 0,
    this.createdAt,
  });

  factory TeacherModel.fromJson(Map<String, dynamic> json) {
    return TeacherModel(
      id: (json['id'] ?? json['teacher_id'] ?? '').toString(),
      uid: json['uid'] ?? '',
      email: json['email'] ?? '',
      displayName: json['display_name'] ?? json['displayName'] ?? '',
      phone: json['phone'],
      department: json['department'],
      position: json['position'],
      specialization: json['specialization'],
      isActive: json['is_active'] == 1 || json['is_active'] == true,
      projectCount: json['project_count'] ?? json['projectCount'] ?? 0,
      createdAt: json['created_at'] != null
          ? DateTime.tryParse(json['created_at'].toString())
          : null,
    );
  }
}
