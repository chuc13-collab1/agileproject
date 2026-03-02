import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/api_endpoints.dart';
import '../../../../core/network/dio_client.dart';
import '../../../../shared/widgets/common_widgets.dart';
import '../../../auth/presentation/providers/auth_provider.dart';
import '../providers/supervisor_provider.dart';

/// Teacher Topic List screen
class TeacherTopicListScreen extends ConsumerWidget {
  const TeacherTopicListScreen({super.key});

  void _showCreateTopicForm(BuildContext context, WidgetRef ref) {
    final dio = ref.read(dioClientProvider);
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => _CreateTopicForm(
        dio: dio,
        onCreated: () {
          Navigator.pop(ctx);
          ref.read(supervisorProvider.notifier).loadAll();
        },
      ),
    );
  }

  void _showTopicDetail(BuildContext context, dynamic topic) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        padding: const EdgeInsets.all(20),
        decoration: const BoxDecoration(
          color: AppColors.background,
          borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
        ),
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  margin: const EdgeInsets.only(bottom: 16),
                  decoration: BoxDecoration(
                    color: AppColors.textHint,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              Text(
                topic.title,
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: AppColors.textPrimary,
                ),
              ),
              const SizedBox(height: 12),
              _detailRow(Icons.badge, 'Trạng thái', topic.statusText),
              if (topic.field != null)
                _detailRow(Icons.category, 'Lĩnh vực', topic.field!),
              if (topic.teacherName != null)
                _detailRow(Icons.person, 'GVHD', topic.teacherName!),
              _detailRow(
                Icons.people,
                'Sinh viên',
                '${topic.currentStudents}/${topic.maxStudents}',
              ),
              if (topic.semester != null)
                _detailRow(Icons.calendar_month, 'Học kỳ', topic.semester!),
              if (topic.description != null) ...[
                const SizedBox(height: 12),
                const Text(
                  'Mô tả:',
                  style: TextStyle(
                    fontWeight: FontWeight.w600,
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  topic.description!,
                  style: const TextStyle(
                    fontSize: 13,
                    color: AppColors.textSecondary,
                  ),
                ),
              ],
              const SizedBox(height: 16),
            ],
          ),
        ),
      ),
    );
  }

  Widget _detailRow(IconData icon, String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        children: [
          Icon(icon, size: 18, color: AppColors.textHint),
          const SizedBox(width: 10),
          Text(
            '$label: ',
            style: const TextStyle(fontSize: 13, color: AppColors.textHint),
          ),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w500,
                color: AppColors.textPrimary,
              ),
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(supervisorProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Đề tài')),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _showCreateTopicForm(context, ref),
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        icon: const Icon(Icons.add),
        label: const Text('Thêm đề tài'),
      ),
      body: state.isLoading
          ? const LoadingList()
          : state.topics.isEmpty
          ? const Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.topic_outlined,
                    size: 56,
                    color: AppColors.textHint,
                  ),
                  SizedBox(height: 12),
                  Text(
                    'Chưa có đề tài',
                    style: TextStyle(color: AppColors.textSecondary),
                  ),
                ],
              ),
            )
          : RefreshIndicator(
              onRefresh: () => ref.read(supervisorProvider.notifier).loadAll(),
              child: ListView.separated(
                padding: const EdgeInsets.fromLTRB(16, 16, 16, 80),
                itemCount: state.topics.length,
                separatorBuilder: (_, i) => const SizedBox(height: 10),
                itemBuilder: (_, index) {
                  final t = state.topics[index];
                  return GestureDetector(
                    onTap: () => _showTopicDetail(context, t),
                    child: Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: AppColors.card,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: AppColors.surfaceLight),
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
                                    fontSize: 15,
                                    fontWeight: FontWeight.w600,
                                    color: AppColors.textPrimary,
                                  ),
                                  maxLines: 2,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                              StatusChip(
                                label: t.statusText,
                                color: t.isAvailable
                                    ? AppColors.success
                                    : AppColors.warning,
                              ),
                            ],
                          ),
                          if (t.description != null) ...[
                            const SizedBox(height: 8),
                            Text(
                              t.description!,
                              style: const TextStyle(
                                fontSize: 13,
                                color: AppColors.textSecondary,
                              ),
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ],
                          const SizedBox(height: 10),
                          Row(
                            children: [
                              if (t.field != null)
                                Container(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 8,
                                    vertical: 2,
                                  ),
                                  decoration: BoxDecoration(
                                    color: AppColors.primary.withValues(
                                      alpha: 0.1,
                                    ),
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: Text(
                                    t.field!,
                                    style: const TextStyle(
                                      fontSize: 11,
                                      color: AppColors.primary,
                                    ),
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
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
    );
  }
}

/// Create Topic Form (for teachers)
class _CreateTopicForm extends StatefulWidget {
  final DioClient dio;
  final VoidCallback onCreated;
  const _CreateTopicForm({required this.dio, required this.onCreated});

  @override
  State<_CreateTopicForm> createState() => _CreateTopicFormState();
}

class _CreateTopicFormState extends State<_CreateTopicForm> {
  final _formKey = GlobalKey<FormState>();
  final _titleCtrl = TextEditingController();
  final _descCtrl = TextEditingController();
  final _fieldCtrl = TextEditingController();
  final _maxCtrl = TextEditingController(text: '2');
  String _semester = 'HK1 2024-2025';
  bool _isSubmitting = false;

  @override
  void dispose() {
    _titleCtrl.dispose();
    _descCtrl.dispose();
    _fieldCtrl.dispose();
    _maxCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _isSubmitting = true);
    try {
      await widget.dio.post(
        ApiEndpoints.topics,
        data: {
          'title': _titleCtrl.text.trim(),
          'description': _descCtrl.text.trim(),
          'field': _fieldCtrl.text.trim(),
          'maxStudents': int.tryParse(_maxCtrl.text) ?? 2,
          'semester': _semester.split(' ').first,
          'academicYear': _semester.contains(' ')
              ? _semester.split(' ').last
              : '2024-2025',
        },
      );
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Thêm đề tài thành công!'),
            backgroundColor: AppColors.success,
          ),
        );
        widget.onCreated();
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
      height: MediaQuery.of(context).size.height * 0.8,
      decoration: const BoxDecoration(
        color: AppColors.background,
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: Column(
        children: [
          Container(
            margin: const EdgeInsets.only(top: 12),
            width: 40,
            height: 4,
            decoration: BoxDecoration(
              color: AppColors.textHint,
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                const Text(
                  'Thêm đề tài mới',
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
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    TextFormField(
                      controller: _titleCtrl,
                      decoration: const InputDecoration(
                        labelText: 'Tên đề tài *',
                        prefixIcon: Icon(Icons.title),
                      ),
                      validator: (v) => v == null || v.trim().isEmpty
                          ? 'Nhập tên đề tài'
                          : null,
                    ),
                    const SizedBox(height: 14),
                    TextFormField(
                      controller: _descCtrl,
                      decoration: const InputDecoration(
                        labelText: 'Mô tả',
                        prefixIcon: Icon(Icons.description),
                      ),
                      maxLines: 3,
                    ),
                    const SizedBox(height: 14),
                    TextFormField(
                      controller: _fieldCtrl,
                      decoration: const InputDecoration(
                        labelText: 'Lĩnh vực',
                        hintText: 'VD: Web, Mobile, AI...',
                        prefixIcon: Icon(Icons.category),
                      ),
                    ),
                    const SizedBox(height: 14),
                    TextFormField(
                      controller: _maxCtrl,
                      decoration: const InputDecoration(
                        labelText: 'Số SV tối đa',
                        prefixIcon: Icon(Icons.people),
                      ),
                      keyboardType: TextInputType.number,
                    ),
                    const SizedBox(height: 14),
                    DropdownButtonFormField<String>(
                      initialValue: _semester,
                      decoration: const InputDecoration(
                        labelText: 'Học kỳ',
                        prefixIcon: Icon(Icons.calendar_today),
                      ),
                      items: const [
                        DropdownMenuItem(
                          value: 'HK1 2024-2025',
                          child: Text('HK1 2024-2025'),
                        ),
                        DropdownMenuItem(
                          value: 'HK2 2024-2025',
                          child: Text('HK2 2024-2025'),
                        ),
                        DropdownMenuItem(
                          value: 'HK1 2025-2026',
                          child: Text('HK1 2025-2026'),
                        ),
                      ],
                      onChanged: (v) => setState(() => _semester = v!),
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
                            : const Icon(Icons.save),
                        label: Text(
                          _isSubmitting ? 'Đang lưu...' : 'Lưu đề tài',
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
