import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/constants/api_endpoints.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../shared/widgets/common_widgets.dart';
import '../../../auth/presentation/providers/auth_provider.dart';

// ─── Model ───────────────────────────────────────────────────────────
class SupervisorTopicForm {
  String title;
  String description;
  String requirements;
  String expectedResults;
  String field;
  int maxStudents;

  SupervisorTopicForm({
    this.title = '',
    this.description = '',
    this.requirements = '',
    this.expectedResults = '',
    this.field = '',
    this.maxStudents = 1,
  });
}

class SupervisorTopic {
  final String id;
  final String title;
  final String field;
  final String status;
  final int currentStudents;
  final int maxStudents;
  final String createdAt;

  const SupervisorTopic({
    required this.id,
    required this.title,
    required this.field,
    required this.status,
    required this.currentStudents,
    required this.maxStudents,
    required this.createdAt,
  });

  factory SupervisorTopic.fromJson(Map<String, dynamic> j) => SupervisorTopic(
    id: j['id'] ?? '',
    title: j['title'] ?? '',
    field: j['field'] ?? '',
    status: j['status'] ?? 'active',
    currentStudents: j['current_students'] ?? 0,
    maxStudents: j['max_students'] ?? 1,
    createdAt: j['created_at'] ?? '',
  );
}

// ─── Provider ─────────────────────────────────────────────────────────
final teacherTopicProposalProvider =
    StateNotifierProvider<
      TeacherTopicProposalNotifier,
      TeacherTopicProposalState
    >((ref) => TeacherTopicProposalNotifier(ref.watch(dioClientProvider)));

class TeacherTopicProposalState {
  final List<SupervisorTopic> myTopics;
  final bool isLoading;
  final bool isSubmitting;
  const TeacherTopicProposalState({
    this.myTopics = const [],
    this.isLoading = false,
    this.isSubmitting = false,
  });
  TeacherTopicProposalState copyWith({
    List<SupervisorTopic>? myTopics,
    bool? isLoading,
    bool? isSubmitting,
  }) => TeacherTopicProposalState(
    myTopics: myTopics ?? this.myTopics,
    isLoading: isLoading ?? this.isLoading,
    isSubmitting: isSubmitting ?? this.isSubmitting,
  );
}

class TeacherTopicProposalNotifier
    extends StateNotifier<TeacherTopicProposalState> {
  final dynamic _dio;
  TeacherTopicProposalNotifier(this._dio)
    : super(const TeacherTopicProposalState()) {
    load();
  }

  Future<void> load() async {
    state = state.copyWith(isLoading: true);
    try {
      final res = await _dio.get('${ApiEndpoints.topics}/my-topics');
      final list = (res.data['data'] as List? ?? [])
          .map((e) => SupervisorTopic.fromJson(e as Map<String, dynamic>))
          .toList();
      state = state.copyWith(myTopics: list, isLoading: false);
    } catch (_) {
      state = state.copyWith(isLoading: false);
    }
  }

  Future<bool> submit(SupervisorTopicForm form) async {
    state = state.copyWith(isSubmitting: true);
    try {
      await _dio.post(
        ApiEndpoints.topics,
        data: {
          'title': form.title,
          'description': form.description,
          'requirements': form.requirements,
          'expected_results': form.expectedResults,
          'field': form.field,
          'max_students': form.maxStudents,
        },
      );
      await load();
      state = state.copyWith(isSubmitting: false);
      return true;
    } catch (_) {
      state = state.copyWith(isSubmitting: false);
      return false;
    }
  }

  Future<void> deleteTopic(String id) async {
    try {
      await _dio.delete('${ApiEndpoints.topics}/$id');
      await load();
    } catch (_) {}
  }
}

// ─── Screen ──────────────────────────────────────────────────────────
const _fields = [
  'Web Development',
  'Mobile Development',
  'AI & Machine Learning',
  'Data Science',
  'IoT',
  'Blockchain',
  'Cloud Computing',
  'Cybersecurity',
  'Game Development',
  'DevOps',
  'Other',
];

class TeacherTopicProposalScreen extends ConsumerStatefulWidget {
  const TeacherTopicProposalScreen({super.key});

  @override
  ConsumerState<TeacherTopicProposalScreen> createState() => _State();
}

class _State extends ConsumerState<TeacherTopicProposalScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tab;

  @override
  void initState() {
    super.initState();
    _tab = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tab.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(
      title: const Text('Quản lý đề tài'),
      bottom: TabBar(
        controller: _tab,
        tabs: const [
          Tab(text: 'Tạo đề tài'),
          Tab(text: 'Đề tài của tôi'),
        ],
      ),
    ),
    body: TabBarView(
      controller: _tab,
      children: [
        _TopicForm(onSuccess: () => _tab.animateTo(1)),
        const _MyTopicList(),
      ],
    ),
  );
}

// ─── Form ─────────────────────────────────────────────────────────────
class _TopicForm extends ConsumerStatefulWidget {
  final VoidCallback onSuccess;
  const _TopicForm({required this.onSuccess});

  @override
  ConsumerState<_TopicForm> createState() => _TopicFormState();
}

class _TopicFormState extends ConsumerState<_TopicForm> {
  final _formKey = GlobalKey<FormState>();
  final _form = SupervisorTopicForm();
  String? _selectedField;

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate() || _selectedField == null) return;
    _form.field = _selectedField!;
    final ok = await ref
        .read(teacherTopicProposalProvider.notifier)
        .submit(_form);
    if (!mounted) return;
    if (ok) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Tạo đề tài thành công! ✅'),
          backgroundColor: AppColors.success,
        ),
      );
      widget.onSuccess();
    }
  }

  @override
  Widget build(BuildContext context) {
    final isSubmitting = ref.watch(teacherTopicProposalProvider).isSubmitting;
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _Label('Tên đề tài *'),
            _Field(
              hint: 'Nhập tên đề tài',
              onChanged: (v) => _form.title = v,
              validator: (v) => (v == null || v.trim().length < 5)
                  ? 'Tối thiểu 5 ký tự'
                  : null,
            ),
            const SizedBox(height: 16),
            _Label('Mô tả *'),
            _MultiField(
              hint: 'Mô tả nội dung...',
              onChanged: (v) => _form.description = v,
            ),
            const SizedBox(height: 16),
            _Label('Yêu cầu kỹ thuật *'),
            _MultiField(
              hint: 'Công nghệ, kỹ năng cần thiết...',
              onChanged: (v) => _form.requirements = v,
            ),
            const SizedBox(height: 16),
            _Label('Kết quả mong đợi *'),
            _MultiField(
              hint: 'Sản phẩm cuối cùng...',
              onChanged: (v) => _form.expectedResults = v,
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  flex: 2,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _Label('Lĩnh vực *'),
                      DropdownButtonFormField<String>(
                        value: _selectedField,
                        hint: const Text('Chọn...'),
                        decoration: InputDecoration(
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          contentPadding: const EdgeInsets.symmetric(
                            horizontal: 12,
                            vertical: 14,
                          ),
                        ),
                        items: _fields
                            .map(
                              (f) => DropdownMenuItem(
                                value: f,
                                child: Text(
                                  f,
                                  style: const TextStyle(fontSize: 13),
                                ),
                              ),
                            )
                            .toList(),
                        onChanged: (v) => setState(() => _selectedField = v),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _Label('Số SV tối đa'),
                      DropdownButtonFormField<int>(
                        value: _form.maxStudents,
                        decoration: InputDecoration(
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          contentPadding: const EdgeInsets.symmetric(
                            horizontal: 12,
                            vertical: 14,
                          ),
                        ),
                        items: [1, 2, 3, 4, 5]
                            .map(
                              (n) =>
                                  DropdownMenuItem(value: n, child: Text('$n')),
                            )
                            .toList(),
                        onChanged: (v) =>
                            setState(() => _form.maxStudents = v ?? 1),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 32),
            GradientButton(
              text: 'Tạo đề tài',
              isLoading: isSubmitting,
              onPressed: isSubmitting ? null : _submit,
            ),
          ],
        ),
      ),
    );
  }
}

class _MyTopicList extends ConsumerWidget {
  const _MyTopicList();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(teacherTopicProposalProvider);
    if (state.isLoading) return const LoadingList();
    if (state.myTopics.isEmpty) {
      return const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.topic_outlined, size: 64, color: AppColors.textHint),
            SizedBox(height: 16),
            Text(
              'Chưa có đề tài nào',
              style: TextStyle(color: AppColors.textSecondary, fontSize: 16),
            ),
          ],
        ),
      );
    }
    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: state.myTopics.length,
      separatorBuilder: (_, __) => const SizedBox(height: 12),
      itemBuilder: (_, i) {
        final t = state.myTopics[i];
        return Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.card,
            borderRadius: BorderRadius.circular(14),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.05),
                blurRadius: 6,
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Text(
                      t.title,
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 14,
                        color: AppColors.textPrimary,
                      ),
                    ),
                  ),
                  IconButton(
                    icon: const Icon(
                      Icons.delete_outline,
                      color: AppColors.error,
                      size: 20,
                    ),
                    onPressed: () => ref
                        .read(teacherTopicProposalProvider.notifier)
                        .deleteTopic(t.id),
                    padding: EdgeInsets.zero,
                    constraints: const BoxConstraints(),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  const Icon(
                    Icons.category_outlined,
                    size: 13,
                    color: AppColors.textHint,
                  ),
                  const SizedBox(width: 6),
                  Text(
                    t.field,
                    style: const TextStyle(
                      fontSize: 12,
                      color: AppColors.textHint,
                    ),
                  ),
                  const Spacer(),
                  Text(
                    '${t.currentStudents}/${t.maxStudents} SV',
                    style: const TextStyle(
                      fontSize: 12,
                      color: AppColors.textHint,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 6),
              LinearProgressIndicator(
                value: t.maxStudents > 0
                    ? t.currentStudents / t.maxStudents
                    : 0,
                borderRadius: BorderRadius.circular(4),
                color: t.currentStudents >= t.maxStudents
                    ? AppColors.error
                    : AppColors.success,
                backgroundColor: AppColors.surfaceLight,
              ),
            ],
          ),
        );
      },
    );
  }
}

// ─── Shared ───────────────────────────────────────────────────────────
class _Label extends StatelessWidget {
  final String text;
  const _Label(this.text);
  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.only(bottom: 8),
    child: Text(
      text,
      style: const TextStyle(
        fontSize: 13,
        fontWeight: FontWeight.w600,
        color: AppColors.textSecondary,
      ),
    ),
  );
}

class _Field extends StatelessWidget {
  final String hint;
  final void Function(String) onChanged;
  final String? Function(String?)? validator;
  const _Field({required this.hint, required this.onChanged, this.validator});
  @override
  Widget build(BuildContext context) => TextFormField(
    onChanged: onChanged,
    validator: validator,
    decoration: InputDecoration(
      hintText: hint,
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
    ),
  );
}

class _MultiField extends StatelessWidget {
  final String hint;
  final void Function(String) onChanged;
  const _MultiField({required this.hint, required this.onChanged});
  @override
  Widget build(BuildContext context) => TextFormField(
    onChanged: onChanged,
    minLines: 2,
    maxLines: 4,
    validator: (v) =>
        (v == null || v.trim().isEmpty) ? 'Không được để trống' : null,
    decoration: InputDecoration(
      hintText: hint,
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
      contentPadding: const EdgeInsets.all(14),
    ),
  );
}
