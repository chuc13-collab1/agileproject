import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/constants/api_endpoints.dart';
import '../../../../core/network/dio_client.dart';
import '../../../auth/presentation/providers/auth_provider.dart';
import '../../domain/project_model.dart';

/// Project state
class ProjectState {
  final ProjectModel? currentProject;
  final List<ProjectModel> projects;
  final bool isLoading;
  final String? error;

  const ProjectState({
    this.currentProject,
    this.projects = const [],
    this.isLoading = false,
    this.error,
  });

  ProjectState copyWith({
    ProjectModel? currentProject,
    List<ProjectModel>? projects,
    bool? isLoading,
    String? error,
    bool clearProject = false,
  }) {
    return ProjectState(
      currentProject: clearProject
          ? null
          : (currentProject ?? this.currentProject),
      projects: projects ?? this.projects,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}

/// Project state notifier
class ProjectNotifier extends StateNotifier<ProjectState> {
  final DioClient _dioClient;
  final String? _userUid;
  final String? _userEmail;

  ProjectNotifier(this._dioClient, this._userUid, this._userEmail)
    : super(const ProjectState()) {
    loadProjects();
  }

  /// Load all projects (filtered for current student)
  Future<void> loadProjects() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final response = await _dioClient.get(ApiEndpoints.projects);
      final data = response.data;

      List<ProjectModel> projects = [];
      if (data is List) {
        // GET /api/projects returns plain array
        projects = data
            .map((p) => ProjectModel.fromJson(p as Map<String, dynamic>))
            .toList();
      } else if (data is Map && data['data'] != null) {
        final list = data['data'] as List;
        projects = list
            .map((p) => ProjectModel.fromJson(p as Map<String, dynamic>))
            .toList();
      }

      // Find current student's project — match by uid OR email
      ProjectModel? myProject;
      for (final p in projects) {
        if (_userUid != null && p.studentId == _userUid) {
          myProject = p;
          break;
        }
        if (_userEmail != null && p.studentEmail == _userEmail) {
          myProject = p;
          break;
        }
      }

      state = ProjectState(projects: projects, currentProject: myProject);
    } catch (e) {
      print('[ProjectProvider] Error: $e');
      state = state.copyWith(
        isLoading: false,
        error: 'Không thể tải danh sách đồ án',
      );
    }
  }

  /// Load project by ID
  Future<void> loadProjectById(String id) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final response = await _dioClient.get(ApiEndpoints.projectById(id));
      final data = response.data;

      if (data['success'] == true && data['data'] != null) {
        final project = ProjectModel.fromJson(
          data['data'] as Map<String, dynamic>,
        );
        state = state.copyWith(currentProject: project, isLoading: false);
      }
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: 'Không thể tải thông tin đồ án',
      );
    }
  }
}

/// Project provider
final projectProvider = StateNotifierProvider<ProjectNotifier, ProjectState>((
  ref,
) {
  final dioClient = ref.watch(dioClientProvider);
  final authState = ref.watch(authProvider);
  return ProjectNotifier(dioClient, authState.user?.uid, authState.user?.email);
});
