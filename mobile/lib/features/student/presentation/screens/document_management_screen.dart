import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../shared/widgets/common_widgets.dart';
import '../../../auth/presentation/providers/auth_provider.dart';

/// Document model
class DocumentItem {
  final String id;
  final String title;
  final String? type;
  final String? url;
  final String? fileSize;
  final DateTime? uploadedAt;

  DocumentItem({
    required this.id,
    required this.title,
    this.type,
    this.url,
    this.fileSize,
    this.uploadedAt,
  });

  factory DocumentItem.fromJson(Map<String, dynamic> json) {
    return DocumentItem(
      id: (json['id'] ?? '').toString(),
      title: json['title'] ?? json['file_name'] ?? json['name'] ?? '',
      type: json['type'] ?? json['document_type'] ?? json['file_type'],
      url: json['url'] ?? json['file_url'],
      fileSize: json['file_size']?.toString(),
      uploadedAt: json['created_at'] != null
          ? DateTime.tryParse(json['created_at'].toString())
          : null,
    );
  }

  IconData get icon {
    switch (type?.toLowerCase()) {
      case 'pdf':
        return Icons.picture_as_pdf;
      case 'doc':
      case 'docx':
        return Icons.description;
      case 'xls':
      case 'xlsx':
        return Icons.table_chart;
      case 'ppt':
      case 'pptx':
        return Icons.slideshow;
      case 'image':
      case 'jpg':
      case 'png':
        return Icons.image;
      default:
        return Icons.insert_drive_file;
    }
  }
}

/// Document Management screen for students
class DocumentManagementScreen extends ConsumerStatefulWidget {
  const DocumentManagementScreen({super.key});

  @override
  ConsumerState<DocumentManagementScreen> createState() =>
      _DocumentManagementScreenState();
}

class _DocumentManagementScreenState
    extends ConsumerState<DocumentManagementScreen> {
  List<DocumentItem> _documents = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadDocuments();
  }

  Future<void> _loadDocuments() async {
    setState(() => _isLoading = true);
    try {
      final dio = ref.read(dioClientProvider);
      final response = await dio.get('/documents');
      final data = response.data;
      List<DocumentItem> docs = [];
      if (data is List) {
        docs = data
            .map((d) => DocumentItem.fromJson(d as Map<String, dynamic>))
            .toList();
      } else if (data is Map && data['data'] != null) {
        docs = (data['data'] as List)
            .map((d) => DocumentItem.fromJson(d as Map<String, dynamic>))
            .toList();
      }
      setState(() {
        _documents = docs;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Tài liệu')),
      body: _isLoading
          ? const LoadingList()
          : _documents.isEmpty
          ? const Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.folder_open, size: 56, color: AppColors.textHint),
                  SizedBox(height: 12),
                  Text(
                    'Chưa có tài liệu',
                    style: TextStyle(color: AppColors.textSecondary),
                  ),
                ],
              ),
            )
          : RefreshIndicator(
              onRefresh: _loadDocuments,
              child: ListView.separated(
                padding: const EdgeInsets.all(16),
                itemCount: _documents.length,
                separatorBuilder: (_, i) => const SizedBox(height: 8),
                itemBuilder: (_, index) {
                  final doc = _documents[index];
                  return Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: AppColors.card,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppColors.surfaceLight),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.03),
                          blurRadius: 6,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: AppColors.primary.withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Icon(
                            doc.icon,
                            color: AppColors.primary,
                            size: 22,
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                doc.title,
                                style: const TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w500,
                                  color: AppColors.textPrimary,
                                ),
                              ),
                              if (doc.type != null)
                                Text(
                                  doc.type!.toUpperCase(),
                                  style: const TextStyle(
                                    fontSize: 11,
                                    color: AppColors.textHint,
                                  ),
                                ),
                            ],
                          ),
                        ),
                        const Icon(
                          Icons.download,
                          color: AppColors.textHint,
                          size: 20,
                        ),
                      ],
                    ),
                  );
                },
              ),
            ),
    );
  }
}
