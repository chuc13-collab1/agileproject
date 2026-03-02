import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/constants/api_endpoints.dart';
import '../../../../core/network/dio_client.dart';
import '../../../auth/presentation/providers/auth_provider.dart';
import '../../../project/domain/project_model.dart';
import '../../../../shared/models/student_model.dart';
import '../../../../shared/models/topic_model.dart';

/// Supervisor state
class SupervisorState {
  final List<ProjectModel> projects;
  final List<StudentModel> students;
  final List<TopicModel> topics;
  final bool isLoading;
  final String? error;

  const SupervisorState({
    this.projects = const [],
    this.students = const [],
    this.topics = const [],
    this.isLoading = false,
    this.error,
  });

  SupervisorState copyWith({
    List<ProjectModel>? projects,
    List<StudentModel>? students,
    List<TopicModel>? topics,
    bool? isLoading,
    String? error,
  }) {
    return SupervisorState(
      projects: projects ?? this.projects,
      students: students ?? this.students,
      topics: topics ?? this.topics,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}

/// Supervisor notifier
class SupervisorNotifier extends StateNotifier<SupervisorState> {
  final DioClient _dioClient;
  final String? _userUid;

  SupervisorNotifier(this._dioClient, this._userUid)
    : super(const SupervisorState());

  /// Load all data for supervisor
  Future<void> loadAll() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      await Future.wait([_loadProjects(), _loadStudents(), _loadTopics()]);
      state = state.copyWith(isLoading: false);
    } catch (e) {
      print('[SupervisorProvider] loadAll error: $e');
      state = state.copyWith(isLoading: false, error: 'Lỗi tải dữ liệu');
    }
  }

  Future<void> _loadProjects() async {
    try {
      final response = await _dioClient.get(ApiEndpoints.projects);
      final data = response.data;
      List<ProjectModel> projects = [];
      if (data is List) {
        projects = data
            .map((p) => ProjectModel.fromJson(p as Map<String, dynamic>))
            .toList();
      } else if (data is Map && data['data'] != null) {
        final list = data['data'] as List;
        projects = list
            .map((p) => ProjectModel.fromJson(p as Map<String, dynamic>))
            .toList();
      }

      // Filter: only projects where this teacher is supervisor
      if (_userUid != null) {
        final myProjects = projects
            .where((p) => p.supervisorId == _userUid)
            .toList();
        // Show filtered if found, otherwise show all (teacher might be admin)
        state = state.copyWith(
          projects: myProjects.isNotEmpty ? myProjects : projects,
        );
      } else {
        state = state.copyWith(projects: projects);
      }
      print('[SupervisorProvider] Loaded ${state.projects.length} projects');
    } catch (e) {
      print('[SupervisorProvider] _loadProjects error: $e');
    }
  }

  Future<void> _loadStudents() async {
    try {
      final response = await _dioClient.get(ApiEndpoints.students);
      final data = response.data;
      List<StudentModel> students = [];
      if (data is List) {
        students = data
            .map((s) => StudentModel.fromJson(s as Map<String, dynamic>))
            .toList();
      } else if (data is Map && data['data'] != null) {
        final list = data['data'] as List;
        students = list
            .map((s) => StudentModel.fromJson(s as Map<String, dynamic>))
            .toList();
      }
      state = state.copyWith(students: students);
      print('[SupervisorProvider] Loaded ${students.length} students');
    } catch (e) {
      print('[SupervisorProvider] _loadStudents error: $e');
    }
  }

  Future<void> _loadTopics() async {
    try {
      final response = await _dioClient.get(ApiEndpoints.topics);
      final data = response.data;
      List<TopicModel> topics = [];
      if (data is List) {
        topics = data
            .map((t) => TopicModel.fromJson(t as Map<String, dynamic>))
            .toList();
      } else if (data is Map && data['data'] != null) {
        final list = data['data'] as List;
        topics = list
            .map((t) => TopicModel.fromJson(t as Map<String, dynamic>))
            .toList();
      }
      state = state.copyWith(topics: topics);
      print('[SupervisorProvider] Loaded ${topics.length} topics');
    } catch (e) {
      print('[SupervisorProvider] _loadTopics error: $e');
    }
  }
}

/// Supervisor provider
final supervisorProvider =
    StateNotifierProvider<SupervisorNotifier, SupervisorState>((ref) {
      final dioClient = ref.watch(dioClientProvider);
      final authState = ref.watch(authProvider);
      return SupervisorNotifier(dioClient, authState.user?.uid);
    });
