import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/api_endpoints.dart';
import '../../../../core/network/dio_client.dart';
import '../../../../shared/models/topic_model.dart';
import '../../../../shared/widgets/common_widgets.dart';
import '../../../auth/presentation/providers/auth_provider.dart';

/// Topic browsing for students — view, register, propose
class TopicBrowsingScreen extends ConsumerStatefulWidget {
  const TopicBrowsingScreen({super.key});

  @override
  ConsumerState<TopicBrowsingScreen> createState() =>
      _TopicBrowsingScreenState();
}

class _TopicBrowsingScreenState extends ConsumerState<TopicBrowsingScreen> {
  List<TopicModel> _topics = [];
  bool _isLoading = true;
  String _searchQuery = '';

  @override
  void initState() {
    super.initState();
    _loadTopics();
  }

  Future<void> _loadTopics() async {
    setState(() => _isLoading = true);
    try {
      final dio = ref.read(dioClientProvider);
      final response = await dio.get(ApiEndpoints.topics);
      final data = response.data;
      List<TopicModel> topics = [];
      if (data is List) {
        topics = data
            .map((t) => TopicModel.fromJson(t as Map<String, dynamic>))
            .toList();
      } else if (data is Map && data['data'] != null) {
        topics = (data['data'] as List)
            .map((t) => TopicModel.fromJson(t as Map<String, dynamic>))
            .toList();
      }
      setState(() {
        _topics = topics;
        _isLoading = false;
      });
    } catch (e) {
      print('[TopicBrowsing] Error: $e');
      setState(() => _isLoading = false);
    }
  }

  List<TopicModel> get _filteredTopics {
    if (_searchQuery.isEmpty) return _topics;
    final q = _searchQuery.toLowerCase();
    return _topics
        .where(
          (t) =>
              t.title.toLowerCase().contains(q) ||
              (t.teacherName?.toLowerCase().contains(q) ?? false) ||
              (t.field?.toLowerCase().contains(q) ?? false),
        )
        .toList();
  }

  void _showTopicDetail(TopicModel topic) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => _TopicDetailSheet(
        topic: topic,
        dio: ref.read(dioClientProvider),
        onDone: () {
          Navigator.pop(ctx);
          _loadTopics();
        },
      ),
    );
  }

  void _showProposeForm() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => _ProposeTopicForm(
        dio: ref.read(dioClientProvider),
        onCreated: () {
          Navigator.pop(ctx);
          _loadTopics();
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Duyệt đề tài')),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _showProposeForm,
        backgroundColor: AppColors.accent,
        foregroundColor: Colors.white,
        icon: const Icon(Icons.lightbulb_outline),
        label: const Text('Đề xuất đề tài'),
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: TextField(
              decoration: InputDecoration(
                hintText: 'Tìm kiếm đề tài...',
                prefixIcon: const Icon(Icons.search),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              onChanged: (v) => setState(() => _searchQuery = v),
            ),
          ),
          Expanded(
            child: _isLoading
                ? const LoadingList()
                : _filteredTopics.isEmpty
                ? const Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.search_off,
                          size: 56,
                          color: AppColors.textHint,
                        ),
                        SizedBox(height: 12),
                        Text(
                          'Không tìm thấy đề tài',
                          style: TextStyle(color: AppColors.textSecondary),
                        ),
                      ],
                    ),
                  )
                : RefreshIndicator(
                    onRefresh: _loadTopics,
                    child: ListView.separated(
                      padding: const EdgeInsets.fromLTRB(16, 0, 16, 80),
                      itemCount: _filteredTopics.length,
                      separatorBuilder: (_, i) => const SizedBox(height: 10),
                      itemBuilder: (_, index) {
                        final t = _filteredTopics[index];
                        return GestureDetector(
                          onTap: () => _showTopicDetail(t),
                          child: _TopicCard(topic: t),
                        );
                      },
                    ),
                  ),
          ),
        ],
      ),
    );
  }
}

/// Topic Detail Sheet with register button
class _TopicDetailSheet extends StatefulWidget {
  final TopicModel topic;
  final DioClient dio;
  final VoidCallback onDone;
  const _TopicDetailSheet({
    required this.topic,
    required this.dio,
    required this.onDone,
  });

  @override
  State<_TopicDetailSheet> createState() => _TopicDetailSheetState();
}

class _TopicDetailSheetState extends State<_TopicDetailSheet> {
  bool _isRegistering = false;

  Future<void> _registerTopic() async {
    setState(() => _isRegistering = true);
    try {
      // Server: POST /api/topics/:id/register or similar
      // Using a generic project creation approach
      await widget.dio.post(
        '/api/projects',
        data: {
          'title': widget.topic.title,
          'description': widget.topic.description ?? '',
          'topicId': widget.topic.id,
        },
      );
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Đăng ký đề tài thành công!'),
            backgroundColor: AppColors.success,
          ),
        );
        widget.onDone();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Lỗi: $e'), backgroundColor: AppColors.error),
        );
      }
    } finally {
      if (mounted) setState(() => _isRegistering = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final t = widget.topic;
    return Container(
      height: MediaQuery.of(context).size.height * 0.65,
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
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          t.title,
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: AppColors.textPrimary,
                          ),
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
                  const SizedBox(height: 16),
                  _infoRow(Icons.person, 'GVHD', t.teacherName ?? 'Chưa có'),
                  _infoRow(
                    Icons.category,
                    'Lĩnh vực',
                    t.field ?? 'Chưa phân loại',
                  ),
                  _infoRow(
                    Icons.people,
                    'Sinh viên',
                    '${t.currentStudents}/${t.maxStudents}',
                  ),
                  _infoRow(Icons.calendar_month, 'Học kỳ', t.semester ?? '—'),
                  _infoRow(Icons.badge, 'Trạng thái', t.statusText),
                  if (t.description != null) ...[
                    const SizedBox(height: 16),
                    const Text(
                      'Mô tả:',
                      style: TextStyle(
                        fontWeight: FontWeight.w600,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: AppColors.surface,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Text(
                        t.description!,
                        style: const TextStyle(
                          fontSize: 13,
                          color: AppColors.textSecondary,
                        ),
                      ),
                    ),
                  ],
                  const SizedBox(height: 24),
                  if (t.isAvailable)
                    SizedBox(
                      width: double.infinity,
                      height: 48,
                      child: ElevatedButton.icon(
                        onPressed: _isRegistering ? null : _registerTopic,
                        icon: _isRegistering
                            ? const SizedBox(
                                width: 20,
                                height: 20,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                  color: Colors.white,
                                ),
                              )
                            : const Icon(Icons.how_to_reg),
                        label: Text(
                          _isRegistering
                              ? 'Đang xử lý...'
                              : 'Đăng ký đề tài này',
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
        ],
      ),
    );
  }

  Widget _infoRow(IconData icon, String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 5),
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
}

/// Propose Topic Form (for students)
class _ProposeTopicForm extends StatefulWidget {
  final DioClient dio;
  final VoidCallback onCreated;
  const _ProposeTopicForm({required this.dio, required this.onCreated});

  @override
  State<_ProposeTopicForm> createState() => _ProposeTopicFormState();
}

class _ProposeTopicFormState extends State<_ProposeTopicForm> {
  final _formKey = GlobalKey<FormState>();
  final _titleCtrl = TextEditingController();
  final _descCtrl = TextEditingController();
  final _fieldCtrl = TextEditingController();
  bool _isSubmitting = false;

  @override
  void dispose() {
    _titleCtrl.dispose();
    _descCtrl.dispose();
    _fieldCtrl.dispose();
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
          'maxStudents': 2,
          'semester': 'HK1',
          'academicYear': '2024-2025',
        },
      );
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Đề xuất thành công! Admin sẽ xem xét.'),
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
      height: MediaQuery.of(context).size.height * 0.7,
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
                  'Đề xuất đề tài',
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
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: AppColors.info.withValues(alpha: 0.08),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Row(
                        children: [
                          Icon(
                            Icons.info_outline,
                            size: 18,
                            color: AppColors.info,
                          ),
                          SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              'Đề xuất sẽ gửi cho Admin duyệt. '
                              'Sau khi duyệt, GVHD sẽ được phân công.',
                              style: TextStyle(
                                fontSize: 12,
                                color: AppColors.info,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: _titleCtrl,
                      decoration: const InputDecoration(
                        labelText: 'Tên đề tài *',
                        hintText: 'VD: Hệ thống quản lý...',
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
                        labelText: 'Mô tả chi tiết *',
                        hintText: 'Mô tả mục tiêu, phạm vi...',
                        prefixIcon: Icon(Icons.description),
                      ),
                      maxLines: 4,
                      validator: (v) =>
                          v == null || v.trim().isEmpty ? 'Nhập mô tả' : null,
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
                          _isSubmitting ? 'Đang gửi...' : 'Gửi đề xuất',
                        ),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.accent,
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

class _TopicCard extends StatelessWidget {
  final TopicModel topic;
  const _TopicCard({required this.topic});

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
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: AppColors.primary.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Icon(
                  Icons.topic,
                  color: AppColors.primary,
                  size: 20,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  topic.title,
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
                label: topic.statusText,
                color: topic.isAvailable
                    ? AppColors.success
                    : AppColors.warning,
              ),
            ],
          ),
          if (topic.description != null) ...[
            const SizedBox(height: 10),
            Text(
              topic.description!,
              style: const TextStyle(
                fontSize: 13,
                color: AppColors.textSecondary,
              ),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
          ],
          const SizedBox(height: 12),
          Row(
            children: [
              if (topic.teacherName != null) ...[
                const Icon(Icons.person, size: 14, color: AppColors.textHint),
                const SizedBox(width: 4),
                Text(
                  topic.teacherName!,
                  style: const TextStyle(
                    fontSize: 12,
                    color: AppColors.textSecondary,
                  ),
                ),
                const SizedBox(width: 16),
              ],
              if (topic.field != null) ...[
                const Icon(Icons.category, size: 14, color: AppColors.textHint),
                const SizedBox(width: 4),
                Text(
                  topic.field!,
                  style: const TextStyle(
                    fontSize: 12,
                    color: AppColors.textSecondary,
                  ),
                ),
              ],
              const Spacer(),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: AppColors.info.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  '${topic.currentStudents}/${topic.maxStudents} SV',
                  style: const TextStyle(
                    fontSize: 11,
                    color: AppColors.info,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
