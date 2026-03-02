import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/constants/api_endpoints.dart';
import '../../../../core/network/dio_client.dart';
import '../../../auth/presentation/providers/auth_provider.dart';
import '../../domain/sprint_model.dart';

/// Sprint state
class SprintState {
  final List<SprintModel> sprints;
  final SprintModel? currentSprint;
  final bool isLoading;
  final String? error;

  const SprintState({
    this.sprints = const [],
    this.currentSprint,
    this.isLoading = false,
    this.error,
  });

  SprintState copyWith({
    List<SprintModel>? sprints,
    SprintModel? currentSprint,
    bool? isLoading,
    String? error,
  }) {
    return SprintState(
      sprints: sprints ?? this.sprints,
      currentSprint: currentSprint ?? this.currentSprint,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}

/// Sprint state notifier
class SprintNotifier extends StateNotifier<SprintState> {
  final DioClient _dioClient;

  SprintNotifier(this._dioClient) : super(const SprintState());

  /// Load sprints for a project — GET /api/sprints/:projectId
  Future<void> loadSprints(String projectId) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final response = await _dioClient.get(
        ApiEndpoints.sprintsByProject(projectId),
      );
      final data = response.data;

      List<SprintModel> sprints = [];
      if (data is List) {
        sprints = data
            .map((s) => SprintModel.fromJson(s as Map<String, dynamic>))
            .toList();
      } else if (data is Map && data['data'] != null) {
        final list = data['data'] as List;
        sprints = list
            .map((s) => SprintModel.fromJson(s as Map<String, dynamic>))
            .toList();
      }

      // Set current sprint (latest active or in_progress one)
      SprintModel? current;
      final active = sprints.where((s) => s.status == 'in_progress');
      if (active.isNotEmpty) {
        current = active.last;
      } else if (sprints.isNotEmpty) {
        current = sprints.first;
      }

      state = SprintState(sprints: sprints, currentSprint: current);
    } catch (e) {
      print('[SprintProvider] Error: $e');
      state = state.copyWith(
        isLoading: false,
        error: 'Không thể tải danh sách sprint',
      );
    }
  }

  /// Select a sprint to view
  void selectSprint(SprintModel sprint) {
    state = state.copyWith(currentSprint: sprint);
  }
}

/// Sprint provider
final sprintProvider = StateNotifierProvider<SprintNotifier, SprintState>((
  ref,
) {
  final dioClient = ref.watch(dioClientProvider);
  return SprintNotifier(dioClient);
});
