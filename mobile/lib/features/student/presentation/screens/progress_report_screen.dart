import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/api_endpoints.dart';
import '../../../../core/network/dio_client.dart';
import '../../../../shared/widgets/common_widgets.dart';
import '../../../auth/presentation/providers/auth_provider.dart';
import '../../../project/presentation/providers/project_provider.dart';

/// Progress report model
class ProgressReport {
  final String id;
  final String title;
  final String? content;
  final String? achievements;
  final String? difficulties;
  final String? nextSteps;
  final String status;
  final int? weekNumber;
  final String? fileName;
  final String? feedback;
  final DateTime? createdAt;

  ProgressReport({
    required this.id,
    required this.title,
    this.content,
    this.achievements,
    this.difficulties,
    this.nextSteps,
    this.status = 'submitted',
    this.weekNumber,
    this.fileName,
    this.feedback,
    this.createdAt,
  });

  factory ProgressReport.fromJson(Map<String, dynamic> json) {
    return ProgressReport(
      id: (json['id'] ?? '').toString(),
      title: json['report_title'] ?? json['title'] ?? 'Báo cáo',
      content: json['content'] ?? json['description'],
      achievements: json['achievements'],
      difficulties: json['difficulties'],
      nextSteps: json['next_steps'] ?? json['nextSteps'],
      status: json['status'] ?? 'submitted',
      weekNumber: json['week_number'] ?? json['weekNumber'],
      fileName: json['file_name'] ?? json['fileName'],
      feedback: json['feedback'],
      createdAt: json['created_at'] != null
          ? DateTime.tryParse(json['created_at'].toString())
          : json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt'].toString())
          : null,
    );
  }

  String get statusText {
    switch (status) {
      case 'submitted':
        return 'Đã nộp';
      case 'reviewed':
        return 'Đã xem';
      case 'approved':
        return 'Đã duyệt';
      case 'revision_needed':
        return 'Cần sửa';
      case 'rejected':
        return 'Từ chối';
      default:
        return status;
    }
  }
}

/// Progress Reports screen for students
class ProgressReportScreen extends ConsumerStatefulWidget {
  const ProgressReportScreen({super.key});

  @override
  ConsumerState<ProgressReportScreen> createState() =>
      _ProgressReportScreenState();
}

class _ProgressReportScreenState extends ConsumerState<ProgressReportScreen> {
  List<ProgressReport> _reports = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadReports();
  }

  Future<void> _loadReports() async {
    setState(() => _isLoading = true);
    try {
      final dio = ref.read(dioClientProvider);
      final response = await dio.get(ApiEndpoints.progressReports);
      final data = response.data;
      List<ProgressReport> reports = [];
      if (data is List) {
        reports = data
            .map((r) => ProgressReport.fromJson(r as Map<String, dynamic>))
            .toList();
      } else if (data is Map && data['data'] != null) {
        final list = data['data'];
        if (list is List) {
          reports = list
              .map((r) => ProgressReport.fromJson(r as Map<String, dynamic>))
              .toList();
        }
      }
      setState(() {
        _reports = reports;
        _isLoading = false;
      });
    } catch (e) {
      print('[ProgressReport] Error: $e');
      setState(() => _isLoading = false);
    }
  }

  void _showSubmitDialog() {
    final projectState = ref.read(projectProvider);
    final project = projectState.currentProject;

    if (project == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Bạn chưa có đồ án để nộp báo cáo')),
      );
      return;
    }

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => _SubmitReportForm(
        projectId: project.id,
        dio: ref.read(dioClientProvider),
        onSubmitted: () {
          Navigator.pop(ctx);
          _loadReports();
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Báo cáo tiến độ')),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _showSubmitDialog,
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        icon: const Icon(Icons.add),
        label: const Text('Nộp báo cáo'),
      ),
      body: _isLoading
          ? const LoadingList()
          : _reports.isEmpty
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.description_outlined,
                    size: 56,
                    color: AppColors.textHint,
                  ),
                  const SizedBox(height: 12),
                  const Text(
                    'Chưa có báo cáo nào',
                    style: TextStyle(color: AppColors.textSecondary),
                  ),
                  const SizedBox(height: 16),
                  ElevatedButton.icon(
                    onPressed: _showSubmitDialog,
                    icon: const Icon(Icons.add),
                    label: const Text('Tạo báo cáo mới'),
                  ),
                ],
              ),
            )
          : RefreshIndicator(
              onRefresh: _loadReports,
              child: ListView.separated(
                padding: const EdgeInsets.fromLTRB(16, 16, 16, 80),
                itemCount: _reports.length,
                separatorBuilder: (_, i) => const SizedBox(height: 10),
                itemBuilder: (_, index) {
                  final r = _reports[index];
                  return _ReportCard(report: r);
                },
              ),
            ),
    );
  }
}

/// Submit Report Form
class _SubmitReportForm extends StatefulWidget {
  final String projectId;
  final DioClient dio;
  final VoidCallback onSubmitted;

  const _SubmitReportForm({
    required this.projectId,
    required this.dio,
    required this.onSubmitted,
  });

  @override
  State<_SubmitReportForm> createState() => _SubmitReportFormState();
}

class _SubmitReportFormState extends State<_SubmitReportForm> {
  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController();
  final _contentController = TextEditingController();
  final _achievementsController = TextEditingController();
  final _difficultiesController = TextEditingController();
  final _nextStepsController = TextEditingController();
  final _weekController = TextEditingController();
  bool _isSubmitting = false;

  @override
  void dispose() {
    _titleController.dispose();
    _contentController.dispose();
    _achievementsController.dispose();
    _difficultiesController.dispose();
    _nextStepsController.dispose();
    _weekController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isSubmitting = true);
    try {
      await widget.dio.post(
        ApiEndpoints.progressReports,
        data: {
          'projectId': widget.projectId,
          'reportTitle': _titleController.text.trim(),
          'content': _contentController.text.trim(),
          'achievements': _achievementsController.text.trim(),
          'difficulties': _difficultiesController.text.trim(),
          'nextSteps': _nextStepsController.text.trim(),
          'weekNumber': int.tryParse(_weekController.text) ?? 1,
        },
      );
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Nộp báo cáo thành công!'),
            backgroundColor: AppColors.success,
          ),
        );
        widget.onSubmitted();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Lỗi: $e'), backgroundColor: AppColors.error),
        );
      }
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      height: MediaQuery.of(context).size.height * 0.85,
      decoration: const BoxDecoration(
        color: AppColors.background,
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: Column(
        children: [
          // Handle bar
          Container(
            margin: const EdgeInsets.only(top: 12),
            width: 40,
            height: 4,
            decoration: BoxDecoration(
              color: AppColors.textHint,
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          // Header
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                const Text(
                  'Nộp báo cáo tiến độ',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: AppColors.textPrimary,
                  ),
                ),
                const Spacer(),
                IconButton(
                  onPressed: () => Navigator.pop(context),
                  icon: const Icon(Icons.close),
                ),
              ],
            ),
          ),
          const Divider(height: 1),
          // Form
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    TextFormField(
                      controller: _titleController,
                      decoration: const InputDecoration(
                        labelText: 'Tiêu đề báo cáo *',
                        hintText: 'VD: Báo cáo tuần 3',
                        prefixIcon: Icon(Icons.title),
                      ),
                      validator: (v) =>
                          v == null || v.trim().isEmpty ? 'Nhập tiêu đề' : null,
                    ),
                    const SizedBox(height: 14),
                    TextFormField(
                      controller: _weekController,
                      decoration: const InputDecoration(
                        labelText: 'Tuần thứ',
                        hintText: 'VD: 3',
                        prefixIcon: Icon(Icons.calendar_today),
                      ),
                      keyboardType: TextInputType.number,
                    ),
                    const SizedBox(height: 14),
                    TextFormField(
                      controller: _contentController,
                      decoration: const InputDecoration(
                        labelText: 'Nội dung báo cáo *',
                        hintText: 'Mô tả công việc đã thực hiện...',
                        prefixIcon: Icon(Icons.description),
                      ),
                      maxLines: 3,
                      validator: (v) => v == null || v.trim().isEmpty
                          ? 'Nhập nội dung'
                          : null,
                    ),
                    const SizedBox(height: 14),
                    TextFormField(
                      controller: _achievementsController,
                      decoration: const InputDecoration(
                        labelText: 'Kết quả đạt được',
                        hintText: 'Các kết quả chính...',
                        prefixIcon: Icon(Icons.check_circle_outline),
                      ),
                      maxLines: 2,
                    ),
                    const SizedBox(height: 14),
                    TextFormField(
                      controller: _difficultiesController,
                      decoration: const InputDecoration(
                        labelText: 'Khó khăn',
                        hintText: 'Các vấn đề gặp phải...',
                        prefixIcon: Icon(Icons.warning_amber),
                      ),
                      maxLines: 2,
                    ),
                    const SizedBox(height: 14),
                    TextFormField(
                      controller: _nextStepsController,
                      decoration: const InputDecoration(
                        labelText: 'Kế hoạch tiếp theo',
                        hintText: 'Các bước tiếp theo...',
                        prefixIcon: Icon(Icons.next_plan_outlined),
                      ),
                      maxLines: 2,
                    ),
                    const SizedBox(height: 24),
                    SizedBox(
                      height: 48,
                      child: ElevatedButton.icon(
                        onPressed: _isSubmitting ? null : _submit,
                        icon: _isSubmitting
                            ? const SizedBox(
                                width: 20,
                                height: 20,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                  color: Colors.white,
                                ),
                              )
                            : const Icon(Icons.send),
                        label: Text(
                          _isSubmitting ? 'Đang nộp...' : 'Nộp báo cáo',
                        ),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.primary,
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _ReportCard extends StatelessWidget {
  final ProgressReport report;
  const _ReportCard({required this.report});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.surfaceLight),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              if (report.weekNumber != null)
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 8,
                    vertical: 3,
                  ),
                  margin: const EdgeInsets.only(right: 8),
                  decoration: BoxDecoration(
                    color: AppColors.primary.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    'Tuần ${report.weekNumber}',
                    style: const TextStyle(
                      fontSize: 11,
                      color: AppColors.primary,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              Expanded(
                child: Text(
                  report.title,
                  style: const TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textPrimary,
                  ),
                ),
              ),
              StatusChip(
                label: report.statusText,
                color: _statusColor(report.status),
              ),
            ],
          ),
          if (report.content != null) ...[
            const SizedBox(height: 8),
            Text(
              report.content!,
              style: const TextStyle(
                fontSize: 13,
                color: AppColors.textSecondary,
              ),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
          ],
          if (report.fileName != null) ...[
            const SizedBox(height: 8),
            Row(
              children: [
                const Icon(Icons.attach_file, size: 14, color: AppColors.info),
                const SizedBox(width: 4),
                Text(
                  report.fileName!,
                  style: const TextStyle(fontSize: 12, color: AppColors.info),
                ),
              ],
            ),
          ],
          if (report.feedback != null) ...[
            const SizedBox(height: 10),
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: AppColors.info.withValues(alpha: 0.08),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Icon(Icons.comment, size: 14, color: AppColors.info),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      report.feedback!,
                      style: const TextStyle(
                        fontSize: 12,
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
          const SizedBox(height: 8),
          if (report.createdAt != null)
            Text(
              DateFormat('dd/MM/yyyy HH:mm').format(report.createdAt!),
              style: const TextStyle(fontSize: 11, color: AppColors.textHint),
            ),
        ],
      ),
    );
  }

  Color _statusColor(String status) {
    switch (status) {
      case 'approved':
        return AppColors.success;
      case 'revision_needed':
      case 'rejected':
        return AppColors.error;
      case 'reviewed':
        return AppColors.info;
      default:
        return AppColors.warning;
    }
  }
}
