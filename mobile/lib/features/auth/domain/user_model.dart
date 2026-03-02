/// User model mapped from API response `/api/auth/me`
class UserModel {
  final String uid;
  final String email;
  final String displayName;
  final String role;
  final String? phone;
  final String? photoUrl;
  final bool isActive;
  final String? studentId;
  final String? className;
  final String? major;
  final String? academicYear;
  final String? department;
  final DateTime? createdAt;

  const UserModel({
    required this.uid,
    required this.email,
    required this.displayName,
    required this.role,
    this.phone,
    this.photoUrl,
    this.isActive = true,
    this.studentId,
    this.className,
    this.major,
    this.academicYear,
    this.department,
    this.createdAt,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      uid: json['uid'] ?? '',
      email: json['email'] ?? '',
      displayName: json['display_name'] ?? json['displayName'] ?? '',
      role: json['role'] ?? 'student',
      phone: json['phone'],
      photoUrl: json['photo_url'] ?? json['photoURL'],
      isActive: json['is_active'] == 1 || json['is_active'] == true,
      studentId: json['student_id'],
      className: json['class_name'],
      major: json['major'],
      academicYear: json['academic_year'],
      department: json['department'],
      createdAt: json['created_at'] != null
          ? DateTime.tryParse(json['created_at'].toString())
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'uid': uid,
      'email': email,
      'display_name': displayName,
      'role': role,
      'phone': phone,
      'photo_url': photoUrl,
      'is_active': isActive,
      'student_id': studentId,
      'class_name': className,
      'major': major,
      'academic_year': academicYear,
      'department': department,
    };
  }
}
