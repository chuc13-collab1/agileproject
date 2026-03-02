import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/constants/api_endpoints.dart';
import '../../../../core/network/dio_client.dart';
import '../../../auth/presentation/providers/auth_provider.dart';
import '../../../project/domain/project_model.dart';
import '../../../../shared/models/student_model.dart';
import '../../../../shared/models/topic_model.dart';
import '../../../supervisor/domain/teacher_model.dart';

/// Admin state
class AdminState {
  final List<StudentModel> students;
  final List<TeacherModel> teachers;
  final List<ProjectModel> projects;
  final List<ClassModel> classes;
  final List<TopicModel> topics;
  final bool isLoading;
  final String? error;

  const AdminState({
    this.students = const [],
    this.teachers = const [],
    this.projects = const [],
    this.classes = const [],
    this.topics = const [],
    this.isLoading = false,
    this.error,
  });

  AdminState copyWith({
    List<StudentModel>? students,
    List<TeacherModel>? teachers,
    List<ProjectModel>? projects,
    List<ClassModel>? classes,
    List<TopicModel>? topics,
    bool? isLoading,
    String? error,
  }) {
    return AdminState(
      students: students ?? this.students,
      teachers: teachers ?? this.teachers,
      projects: projects ?? this.projects,
      classes: classes ?? this.classes,
      topics: topics ?? this.topics,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}

/// Admin notifier
class AdminNotifier extends StateNotifier<AdminState> {
  final DioClient _dioClient;

  AdminNotifier(this._dioClient) : super(const AdminState());

  /// Load all admin data
  Future<void> loadAll() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      await Future.wait([
        _loadStudents(),
        _loadTeachers(),
        _loadProjects(),
        _loadClasses(),
        _loadTopics(),
      ]);
      state = state.copyWith(isLoading: false);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: 'Lỗi tải dữ liệu');
    }
  }

  Future<void> _loadStudents() async {
    try {
      final response = await _dioClient.get(ApiEndpoints.students);
      final data = response.data;
      List<StudentModel> list = [];
      if (data is List) {
        list = data.map((s) => StudentModel.fromJson(s as Map<String, dynamic>)).toList();
      } else if (data is Map && data['data'] != null) {
        list = (data['data'] as List).map((s) => StudentModel.fromJson(s as Map<String, dynamic>)).toList();
      }
      state = state.copyWith(students: list);
    } catch (_) {}
  }

  Future<void> _loadTeachers() async {
    try {
      final response = await _dioClient.get(ApiEndpoints.teachers);
      final data = response.data;
      List<TeacherModel> list = [];
      if (data is List) {
        list = data.map((t) => TeacherModel.fromJson(t as Map<String, dynamic>)).toList();
      } else if (data is Map && data['data'] != null) {
        list = (data['data'] as List).map((t) => TeacherModel.fromJson(t as Map<String, dynamic>)).toList();
      }
      state = state.copyWith(teachers: list);
    } catch (_) {}
  }

  Future<void> _loadProjects() async {
    try {
      final response = await _dioClient.get(ApiEndpoints.projects);
      final data = response.data;
      List<ProjectModel> list = [];
      if (data is List) {
        list = data.map((p) => ProjectModel.fromJson(p as Map<String, dynamic>)).toList();
      } else if (data is Map && data['data'] != null) {
        list = (data['data'] as List).map((p) => ProjectModel.fromJson(p as Map<String, dynamic>)).toList();
      }
      state = state.copyWith(projects: list);
    } catch (_) {}
  }

  Future<void> _loadClasses() async {
    try {
      final response = await _dioClient.get(ApiEndpoints.classes);
      final data = response.data;
      List<ClassModel> list = [];
      if (data is List) {
        list = data.map((c) => ClassModel.fromJson(c as Map<String, dynamic>)).toList();
      } else if (data is Map && data['data'] != null) {
        list = (data['data'] as List).map((c) => ClassModel.fromJson(c as Map<String, dynamic>)).toList();
      }
      state = state.copyWith(classes: list);
    } catch (_) {}
  }

  Future<void> _loadTopics() async {
    try {
      final response = await _dioClient.get(ApiEndpoints.topics);
      final data = response.data;
      List<TopicModel> list = [];
      if (data is List) {
        list = data.map((t) => TopicModel.fromJson(t as Map<String, dynamic>)).toList();
      } else if (data is Map && data['data'] != null) {
        list = (data['data'] as List).map((t) => TopicModel.fromJson(t as Map<String, dynamic>)).toList();
      }
      state = state.copyWith(topics: list);
    } catch (_) {}
  }

  /// Toggle student active status
  Future<void> toggleStudentActive(String id) async {
    try {
      await _dioClient.patch(ApiEndpoints.toggleStudentActive(id));
      await _loadStudents();
    } catch (_) {}
  }

  /// Toggle teacher active status
  Future<void> toggleTeacherActive(String id) async {
    try {
      await _dioClient.patch(ApiEndpoints.toggleTeacherActive(id));
      await _loadTeachers();
    } catch (_) {}
  }
}

/// Admin provider
final adminProvider = StateNotifierProvider<AdminNotifier, AdminState>((ref) {
  final dioClient = ref.watch(dioClientProvider);
  return AdminNotifier(dioClient);
});
