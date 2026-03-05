import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/constants/api_endpoints.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../shared/widgets/common_widgets.dart';
import '../../../auth/presentation/providers/auth_provider.dart';

// ─── Model ───────────────────────────────────────────────────────────
class ProposalReview {
  final String id;
  final String title;
  final String description;
  final String field;
  final String studentName;
  final String studentCode;
  final String status;
  final String createdAt;

  const ProposalReview({
    required this.id,
    required this.title,
    required this.description,
    required this.field,
    required this.studentName,
    required this.studentCode,
    required this.status,
    required this.createdAt,
  });

  factory ProposalReview.fromJson(Map<String, dynamic> j) => ProposalReview(
    id: j['id'] ?? '',
    title: j['title'] ?? '',
    description: j['description'] ?? '',
    field: j['field'] ?? '',
    studentName: j['student_name'] ?? j['studentName'] ?? '',
    studentCode: j['student_code'] ?? j['studentCode'] ?? '',
    status: j['status'] ?? 'pending',
    createdAt: j['created_at'] ?? '',
  );
}

// ─── Provider ─────────────────────────────────────────────────────────
final proposalReviewProvider =
    StateNotifierProvider<ProposalReviewNotifier, ProposalReviewState>(
      (ref) => ProposalReviewNotifier(ref.watch(dioClientProvider)),
    );

class ProposalReviewState {
  final List<ProposalReview> proposals;
  final bool isLoading;
  const ProposalReviewState({
    this.proposals = const [],
    this.isLoading = false,
  });
  ProposalReviewState copyWith({
    List<ProposalReview>? proposals,
    bool? isLoading,
  }) => ProposalReviewState(
    proposals: proposals ?? this.proposals,
    isLoading: isLoading ?? this.isLoading,
  );
}

class ProposalReviewNotifier extends StateNotifier<ProposalReviewState> {
  final dynamic _dio;
  ProposalReviewNotifier(this._dio) : super(const ProposalReviewState()) {
    load();
  }

  Future<void> load() async {
    state = state.copyWith(isLoading: true);
    try {
      final res = await _dio.get('${ApiEndpoints.topicProposals}/for-review');
      final list = (res.data['data'] as List? ?? [])
          .map((e) => ProposalReview.fromJson(e as Map<String, dynamic>))
          .toList();
      state = state.copyWith(proposals: list, isLoading: false);
    } catch (_) {
      state = state.copyWith(isLoading: false);
    }
  }

  Future<void> approve(String id) async {
    try {
      await _dio.patch('${ApiEndpoints.topicProposals}/$id/approve');
      await load();
    } catch (_) {}
  }

  Future<void> reject(String id, String reason) async {
    try {
      await _dio.patch(
        '${ApiEndpoints.topicProposals}/$id/reject',
        data: {'rejection_reason': reason},
      );
      await load();
    } catch (_) {}
  }
}

// ─── Screen ──────────────────────────────────────────────────────────
class ProposalReviewScreen extends ConsumerWidget {
  const ProposalReviewScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(proposalReviewProvider);
    final pending = state.proposals
        .where((p) => p.status == 'pending')
        .toList();
    final reviewed = state.proposals
        .where((p) => p.status != 'pending')
        .toList();

    return DefaultTabController(
      length: 2,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Đề xuất đề tài'),
          bottom: TabBar(
            tabs: [
              Tab(text: 'Chờ duyệt (${pending.length})'),
              Tab(text: 'Đã xử lý (${reviewed.length})'),
            ],
          ),
        ),
        body: state.isLoading
            ? const LoadingList()
            : TabBarView(
                children: [
                  _ProposalList(proposals: pending, showActions: true),
                  _ProposalList(proposals: reviewed, showActions: false),
                ],
              ),
      ),
    );
  }
}

class _ProposalList extends ConsumerWidget {
  final List<ProposalReview> proposals;
  final bool showActions;
  const _ProposalList({required this.proposals, required this.showActions});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    if (proposals.isEmpty) {
      return const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.inbox_outlined, size: 64, color: AppColors.textHint),
            SizedBox(height: 16),
            Text(
              'Không có đề xuất nào',
              style: TextStyle(color: AppColors.textSecondary, fontSize: 16),
            ),
          ],
        ),
      );
    }
    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: proposals.length,
      separatorBuilder: (_, __) => const SizedBox(height: 12),
      itemBuilder: (_, i) => _ProposalCard(
        proposal: proposals[i],
        showActions: showActions,
        onApprove: () =>
            ref.read(proposalReviewProvider.notifier).approve(proposals[i].id),
        onReject: (reason) => ref
            .read(proposalReviewProvider.notifier)
            .reject(proposals[i].id, reason),
      ),
    );
  }
}

class _ProposalCard extends StatelessWidget {
  final ProposalReview proposal;
  final bool showActions;
  final VoidCallback onApprove;
  final void Function(String reason) onReject;
  const _ProposalCard({
    required this.proposal,
    required this.showActions,
    required this.onApprove,
    required this.onReject,
  });

  void _showRejectDialog(BuildContext context) {
    final ctrl = TextEditingController();
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Từ chối đề xuất'),
        content: TextField(
          controller: ctrl,
          maxLines: 3,
          decoration: const InputDecoration(
            hintText: 'Lý do từ chối...',
            border: OutlineInputBorder(),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Hủy'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.error),
            onPressed: () {
              Navigator.pop(context);
              onReject(ctrl.text.trim());
            },
            child: const Text('Từ chối', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

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

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(14),
        boxShadow: [
          BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 6),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
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
              StatusChip(
                label: proposal.status == 'approved'
                    ? 'Đã duyệt'
                    : proposal.status == 'rejected'
                    ? 'Từ chối'
                    : 'Chờ duyệt',
                color: _statusColor,
              ),
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
                Icons.person_outline,
                size: 14,
                color: AppColors.textHint,
              ),
              const SizedBox(width: 6),
              Text(
                '${proposal.studentName} (${proposal.studentCode})',
                style: const TextStyle(fontSize: 12, color: AppColors.textHint),
              ),
              const SizedBox(width: 14),
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
          if (showActions) ...[
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () => _showRejectDialog(context),
                    icon: const Icon(Icons.close, size: 16),
                    label: const Text('Từ chối'),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AppColors.error,
                      side: const BorderSide(color: AppColors.error),
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: onApprove,
                    icon: const Icon(Icons.check, size: 16),
                    label: const Text('Duyệt'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.success,
                      foregroundColor: Colors.white,
                    ),
                  ),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }
}
