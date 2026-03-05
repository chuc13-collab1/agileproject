import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/constants/api_endpoints.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../shared/widgets/common_widgets.dart';
import '../../../auth/presentation/providers/auth_provider.dart';

// ─── Models ───────────────────────────────────────────────────────────
class AdminClass {
  final String id, code, name, academicYear;
  final int studentCount;
  const AdminClass({
    required this.id,
    required this.code,
    required this.name,
    required this.academicYear,
    required this.studentCount,
  });
  factory AdminClass.fromJson(Map<String, dynamic> j) => AdminClass(
    id: j['id'] ?? '',
    code: j['class_code'] ?? j['code'] ?? '',
    name: j['class_name'] ?? j['name'] ?? '',
    academicYear: j['academic_year'] ?? '',
    studentCount: j['student_count'] ?? 0,
  );
}

class UnassignedStudent {
  final String id, name, email, studentCode;
  String? assignedClass;
  UnassignedStudent({
    required this.id,
    required this.name,
    required this.email,
    required this.studentCode,
    this.assignedClass,
  });
  factory UnassignedStudent.fromJson(Map<String, dynamic> j) =>
      UnassignedStudent(
        id: j['id'] ?? '',
        name: j['display_name'] ?? '',
        email: j['email'] ?? '',
        studentCode: j['student_id'] ?? '',
      );
}

// ─── Provider ─────────────────────────────────────────────────────────
final classAssignmentProvider =
    StateNotifierProvider<ClassAssignmentNotifier, ClassAssignmentState>(
      (ref) => ClassAssignmentNotifier(ref.watch(dioClientProvider)),
    );

class ClassAssignmentState {
  final List<AdminClass> classes;
  final List<UnassignedStudent> students;
  final bool isLoading;
  final Set<String> selectedStudents;
  const ClassAssignmentState({
    this.classes = const [],
    this.students = const [],
    this.isLoading = false,
    this.selectedStudents = const {},
  });
  ClassAssignmentState copyWith({
    List<AdminClass>? classes,
    List<UnassignedStudent>? students,
    bool? isLoading,
    Set<String>? selectedStudents,
  }) => ClassAssignmentState(
    classes: classes ?? this.classes,
    students: students ?? this.students,
    isLoading: isLoading ?? this.isLoading,
    selectedStudents: selectedStudents ?? this.selectedStudents,
  );
}

class ClassAssignmentNotifier extends StateNotifier<ClassAssignmentState> {
  final dynamic _dio;
  ClassAssignmentNotifier(this._dio) : super(const ClassAssignmentState()) {
    load();
  }

  Future<void> load() async {
    state = state.copyWith(isLoading: true);
    try {
      final r1 = await _dio.get(ApiEndpoints.classes);
      final r2 = await _dio.get('${ApiEndpoints.students}?unassigned=true');
      state = state.copyWith(
        classes: (r1.data['data'] as List? ?? [])
            .map((e) => AdminClass.fromJson(e as Map<String, dynamic>))
            .toList(),
        students: (r2.data['data'] as List? ?? [])
            .map((e) => UnassignedStudent.fromJson(e as Map<String, dynamic>))
            .toList(),
        isLoading: false,
      );
    } catch (_) {
      state = state.copyWith(isLoading: false);
    }
  }

  void toggleStudent(String id) {
    final set = Set<String>.from(state.selectedStudents);
    if (set.contains(id))
      set.remove(id);
    else
      set.add(id);
    state = state.copyWith(selectedStudents: set);
  }

  Future<bool> assign(String classCode) async {
    if (state.selectedStudents.isEmpty) return false;
    try {
      await _dio.post(
        '${ApiEndpoints.classes}/$classCode/assign-students',
        data: {'studentIds': state.selectedStudents.toList()},
      );
      state = state.copyWith(selectedStudents: {});
      await load();
      return true;
    } catch (_) {
      return false;
    }
  }
}

// ─── Screen ───────────────────────────────────────────────────────────
class ClassAssignmentScreen extends ConsumerStatefulWidget {
  const ClassAssignmentScreen({super.key});
  @override
  ConsumerState<ClassAssignmentScreen> createState() =>
      _ClassAssignmentScreenState();
}

class _ClassAssignmentScreenState extends ConsumerState<ClassAssignmentScreen> {
  String? _selectedClass;

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(classAssignmentProvider);
    return Scaffold(
      appBar: AppBar(
        title: const Text('Phân lớp sinh viên'),
        actions: [
          if (state.selectedStudents.isNotEmpty)
            TextButton.icon(
              icon: const Icon(Icons.check, color: Colors.white),
              label: Text(
                'Gán (${state.selectedStudents.length})',
                style: const TextStyle(color: Colors.white),
              ),
              onPressed: _selectedClass == null
                  ? null
                  : () async {
                      final ok = await ref
                          .read(classAssignmentProvider.notifier)
                          .assign(_selectedClass!);
                      if (!mounted) return;
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text(
                            ok ? 'Phân lớp thành công!' : 'Thất bại',
                          ),
                          backgroundColor: ok
                              ? AppColors.success
                              : AppColors.error,
                        ),
                      );
                    },
            ),
        ],
      ),
      body: state.isLoading
          ? const LoadingList()
          : Column(
              children: [
                // Class selector
                Padding(
                  padding: const EdgeInsets.all(16),
                  child: DropdownButtonFormField<String>(
                    value: _selectedClass,
                    hint: const Text('Chọn lớp để gán'),
                    decoration: InputDecoration(
                      labelText: 'Lớp học',
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      prefixIcon: const Icon(Icons.class_outlined),
                    ),
                    items: state.classes
                        .map(
                          (c) => DropdownMenuItem(
                            value: c.code,
                            child: Text('${c.name} (${c.studentCount} SV)'),
                          ),
                        )
                        .toList(),
                    onChanged: (v) => setState(() => _selectedClass = v),
                  ),
                ),
                // Student list
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: Row(
                    children: [
                      const Icon(
                        Icons.people_outlined,
                        size: 16,
                        color: AppColors.textSecondary,
                      ),
                      const SizedBox(width: 8),
                      Text(
                        'Sinh viên chưa có lớp (${state.students.length})',
                        style: const TextStyle(
                          fontWeight: FontWeight.w600,
                          color: AppColors.textSecondary,
                        ),
                      ),
                      const Spacer(),
                      if (state.selectedStudents.isNotEmpty)
                        Text(
                          'Đã chọn: ${state.selectedStudents.length}',
                          style: const TextStyle(
                            color: AppColors.primary,
                            fontSize: 13,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                    ],
                  ),
                ),
                const SizedBox(height: 8),
                Expanded(
                  child: state.students.isEmpty
                      ? const Center(
                          child: Text(
                            'Tất cả sinh viên đã được phân lớp ✅',
                            style: TextStyle(
                              color: AppColors.success,
                              fontSize: 14,
                            ),
                          ),
                        )
                      : ListView.separated(
                          padding: const EdgeInsets.symmetric(horizontal: 16),
                          itemCount: state.students.length,
                          separatorBuilder: (_, __) =>
                              const SizedBox(height: 8),
                          itemBuilder: (_, i) {
                            final s = state.students[i];
                            final selected = state.selectedStudents.contains(
                              s.id,
                            );
                            return InkWell(
                              onTap: () => ref
                                  .read(classAssignmentProvider.notifier)
                                  .toggleStudent(s.id),
                              borderRadius: BorderRadius.circular(12),
                              child: AnimatedContainer(
                                duration: const Duration(milliseconds: 180),
                                padding: const EdgeInsets.all(14),
                                decoration: BoxDecoration(
                                  color: selected
                                      ? AppColors.primary.withValues(
                                          alpha: 0.08,
                                        )
                                      : AppColors.card,
                                  borderRadius: BorderRadius.circular(12),
                                  border: Border.all(
                                    color: selected
                                        ? AppColors.primary
                                        : AppColors.surfaceLight,
                                  ),
                                ),
                                child: Row(
                                  children: [
                                    Checkbox(
                                      value: selected,
                                      onChanged: (_) => ref
                                          .read(
                                            classAssignmentProvider.notifier,
                                          )
                                          .toggleStudent(s.id),
                                      activeColor: AppColors.primary,
                                    ),
                                    CircleAvatar(
                                      radius: 16,
                                      backgroundColor: AppColors.primary
                                          .withValues(alpha: 0.12),
                                      child: Text(
                                        s.name.isNotEmpty ? s.name[0] : '?',
                                        style: const TextStyle(
                                          color: AppColors.primary,
                                          fontWeight: FontWeight.bold,
                                          fontSize: 12,
                                        ),
                                      ),
                                    ),
                                    const SizedBox(width: 10),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            s.name,
                                            style: const TextStyle(
                                              fontWeight: FontWeight.w600,
                                              fontSize: 14,
                                              color: AppColors.textPrimary,
                                            ),
                                          ),
                                          Text(
                                            '${s.studentCode} · ${s.email}',
                                            style: const TextStyle(
                                              fontSize: 11,
                                              color: AppColors.textHint,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            );
                          },
                        ),
                ),
              ],
            ),
    );
  }
}
