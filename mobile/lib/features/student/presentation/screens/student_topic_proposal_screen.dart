import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/constants/api_endpoints.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../shared/widgets/common_widgets.dart';
import '../../../auth/presentation/providers/auth_provider.dart';

// ─── Model ───────────────────────────────────────────────────────────

class TopicProposal {
  final String id;
  final String title;
  final String description;
  final String field;
  final String status; // pending | approved | rejected
  final String? rejectionReason;
  final String createdAt;

  const TopicProposal({
    required this.id,
    required this.title,
    required this.description,
    required this.field,
    required this.status,
    this.rejectionReason,
    required this.createdAt,
  });

  factory TopicProposal.fromJson(Map<String, dynamic> json) => TopicProposal(
    id: json['id'] ?? '',
    title: json['title'] ?? '',
    description: json['description'] ?? '',
    field: json['field'] ?? '',
    status: json['status'] ?? 'pending',
    rejectionReason: json['rejection_reason'],
    createdAt: json['created_at'] ?? '',
  );
}

// ─── Provider ────────────────────────────────────────────────────────

final topicProposalProvider =
    StateNotifierProvider<TopicProposalNotifier, TopicProposalState>(
      (ref) => TopicProposalNotifier(ref.watch(dioClientProvider)),
    );

class TopicProposalState {
  final List<TopicProposal> myProposals;
  final bool isLoading;
  final bool isSubmitting;
  final String? error;

  const TopicProposalState({
    this.myProposals = const [],
    this.isLoading = false,
    this.isSubmitting = false,
    this.error,
  });

  TopicProposalState copyWith({
    List<TopicProposal>? myProposals,
    bool? isLoading,
    bool? isSubmitting,
    String? error,
  }) => TopicProposalState(
    myProposals: myProposals ?? this.myProposals,
    isLoading: isLoading ?? this.isLoading,
    isSubmitting: isSubmitting ?? this.isSubmitting,
    error: error,
  );
}

class TopicProposalNotifier extends StateNotifier<TopicProposalState> {
  final dynamic _dioClient;

  TopicProposalNotifier(this._dioClient) : super(const TopicProposalState()) {
    loadMyProposals();
  }

  Future<void> loadMyProposals() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final res = await _dioClient.get(
        '${ApiEndpoints.topicProposals}/my-proposals',
      );
      final list = (res.data['data'] as List? ?? [])
          .map((e) => TopicProposal.fromJson(e as Map<String, dynamic>))
          .toList();
      state = state.copyWith(myProposals: list, isLoading: false);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<bool> submitProposal({
    required String title,
    required String description,
    required String requirements,
    required String expectedResults,
    required String field,
  }) async {
    state = state.copyWith(isSubmitting: true, error: null);
    try {
      await _dioClient.post(
        ApiEndpoints.topicProposals,
        data: {
          'title': title,
          'description': description,
          'requirements': requirements,
          'expected_results': expectedResults,
          'field': field,
          'proposed_by': 'student',
        },
      );
      await loadMyProposals();
      state = state.copyWith(isSubmitting: false);
      return true;
    } catch (e) {
      state = state.copyWith(
        isSubmitting: false,
        error: 'Gửi đề xuất thất bại',
      );
      return false;
    }
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

class StudentTopicProposalScreen extends ConsumerStatefulWidget {
  const StudentTopicProposalScreen({super.key});

  @override
  ConsumerState<StudentTopicProposalScreen> createState() =>
      _StudentTopicProposalScreenState();
}

class _StudentTopicProposalScreenState
    extends ConsumerState<StudentTopicProposalScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Đề xuất đề tài'),
        bottom: TabBar(
          controller: _tabController,
          tabs: const [
            Tab(text: 'Gửi đề xuất'),
            Tab(text: 'Đề xuất của tôi'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _ProposalForm(onSuccess: () => _tabController.animateTo(1)),
          _MyProposalList(),
        ],
      ),
    );
  }
}

// ─── Proposal Form ────────────────────────────────────────────────────

class _ProposalForm extends ConsumerStatefulWidget {
  final VoidCallback onSuccess;
  const _ProposalForm({required this.onSuccess});

  @override
  ConsumerState<_ProposalForm> createState() => _ProposalFormState();
}

class _ProposalFormState extends ConsumerState<_ProposalForm> {
  final _formKey = GlobalKey<FormState>();
  final _titleCtrl = TextEditingController();
  final _descCtrl = TextEditingController();
  final _reqCtrl = TextEditingController();
  final _resultCtrl = TextEditingController();
  String? _selectedField;

  @override
  void dispose() {
    _titleCtrl.dispose();
    _descCtrl.dispose();
    _reqCtrl.dispose();
    _resultCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    if (_selectedField == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Chọn lĩnh vực'),
          backgroundColor: AppColors.error,
        ),
      );
      return;
    }

    final ok = await ref
        .read(topicProposalProvider.notifier)
        .submitProposal(
          title: _titleCtrl.text.trim(),
          description: _descCtrl.text.trim(),
          requirements: _reqCtrl.text.trim(),
          expectedResults: _resultCtrl.text.trim(),
          field: _selectedField!,
        );

    if (!mounted) return;
    if (ok) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Gửi đề xuất thành công! ✅'),
          backgroundColor: AppColors.success,
        ),
      );
      widget.onSuccess();
    }
  }

  @override
  Widget build(BuildContext context) {
    final isSubmitting = ref.watch(topicProposalProvider).isSubmitting;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _FieldLabel('Tên đề tài *'),
            AppTextField(
              controller: _titleCtrl,
              label: 'Nhập tên đề tài',
              prefixIcon: Icons.title,
              validator: (v) => (v == null || v.trim().length < 10)
                  ? 'Tên đề tài tối thiểu 10 ký tự'
                  : null,
            ),
            const SizedBox(height: 16),

            _FieldLabel('Mô tả *'),
            _MultilineField(
              controller: _descCtrl,
              hint: 'Mô tả vấn đề cần giải quyết...',
              minLines: 3,
            ),
            const SizedBox(height: 16),

            _FieldLabel('Yêu cầu kỹ thuật *'),
            _MultilineField(
              controller: _reqCtrl,
              hint: 'Công nghệ, thư viện, ngôn ngữ...',
              minLines: 2,
            ),
            const SizedBox(height: 16),

            _FieldLabel('Kết quả mong đợi *'),
            _MultilineField(
              controller: _resultCtrl,
              hint: 'Sản phẩm, tính năng sẽ hoàn thành...',
              minLines: 2,
            ),
            const SizedBox(height: 16),

            _FieldLabel('Lĩnh vực *'),
            DropdownButtonFormField<String>(
              value: _selectedField,
              hint: const Text('Chọn lĩnh vực'),
              decoration: InputDecoration(
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                contentPadding: const EdgeInsets.symmetric(
                  horizontal: 16,
                  vertical: 14,
                ),
              ),
              items: _fields
                  .map((f) => DropdownMenuItem(value: f, child: Text(f)))
                  .toList(),
              onChanged: (v) => setState(() => _selectedField = v),
            ),
            const SizedBox(height: 32),

            GradientButton(
              text: 'Gửi đề xuất',
              isLoading: isSubmitting,
              onPressed: isSubmitting ? null : _submit,
            ),

            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: AppColors.info.withValues(alpha: 0.08),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: AppColors.info.withValues(alpha: 0.3),
                ),
              ),
              child: const Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Icon(Icons.info_outline, size: 18, color: AppColors.info),
                  SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      'Đề xuất sẽ được giảng viên xem xét và phê duyệt. Bạn sẽ nhận thông báo khi có kết quả.',
                      style: TextStyle(
                        fontSize: 13,
                        color: AppColors.textSecondary,
                        height: 1.5,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ─── My Proposals List ────────────────────────────────────────────────

class _MyProposalList extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(topicProposalProvider);

    if (state.isLoading) return const LoadingList();
    if (state.myProposals.isEmpty) {
      return const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.lightbulb_outline, size: 64, color: AppColors.textHint),
            SizedBox(height: 16),
            Text(
              'Chưa có đề xuất nào',
              style: TextStyle(color: AppColors.textSecondary, fontSize: 16),
            ),
          ],
        ),
      );
    }

    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: state.myProposals.length,
      separatorBuilder: (_, __) => const SizedBox(height: 12),
      itemBuilder: (_, i) => _ProposalCard(proposal: state.myProposals[i]),
    );
  }
}

class _ProposalCard extends StatelessWidget {
  final TopicProposal proposal;
  const _ProposalCard({required this.proposal});

  Color get _statusColor {
    switch (proposal.status) {
      case 'approved':
        return AppColors.success;
      case 'rejected':
        return AppColors.error;
      default:
        return AppColors.warning;
    }
  }

  String get _statusLabel {
    switch (proposal.status) {
      case 'approved':
        return 'Đã duyệt';
      case 'rejected':
        return 'Từ chối';
      default:
        return 'Chờ duyệt';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(14),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Text(
                  proposal.title,
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 15,
                    color: AppColors.textPrimary,
                  ),
                ),
              ),
              const SizedBox(width: 8),
              StatusChip(label: _statusLabel, color: _statusColor),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            proposal.description,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(
              fontSize: 13,
              color: AppColors.textSecondary,
              height: 1.4,
            ),
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              const Icon(
                Icons.category_outlined,
                size: 14,
                color: AppColors.textHint,
              ),
              const SizedBox(width: 6),
              Text(
                proposal.field,
                style: const TextStyle(fontSize: 12, color: AppColors.textHint),
              ),
            ],
          ),
          if (proposal.rejectionReason != null) ...[
            const SizedBox(height: 10),
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: AppColors.error.withValues(alpha: 0.08),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(
                  color: AppColors.error.withValues(alpha: 0.2),
                ),
              ),
              child: Row(
                children: [
                  const Icon(
                    Icons.error_outline,
                    size: 14,
                    color: AppColors.error,
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      proposal.rejectionReason!,
                      style: const TextStyle(
                        fontSize: 12,
                        color: AppColors.error,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }
}

// ─── Shared Widgets ───────────────────────────────────────────────────

class _FieldLabel extends StatelessWidget {
  final String text;
  const _FieldLabel(this.text);

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

class _MultilineField extends StatelessWidget {
  final TextEditingController controller;
  final String hint;
  final int minLines;
  const _MultilineField({
    required this.controller,
    required this.hint,
    this.minLines = 2,
  });

  @override
  Widget build(BuildContext context) {
    return TextFormField(
      controller: controller,
      minLines: minLines,
      maxLines: minLines + 2,
      validator: (v) =>
          (v == null || v.trim().isEmpty) ? 'Không được để trống' : null,
      decoration: InputDecoration(
        hintText: hint,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
        contentPadding: const EdgeInsets.all(14),
      ),
    );
  }
}
