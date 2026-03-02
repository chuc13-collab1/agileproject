import 'package:flutter/material.dart';

import '../../../../core/constants/app_colors.dart';

/// Notification screen (placeholder — can be expanded later)
class NotificationScreen extends StatelessWidget {
  const NotificationScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Thông báo')),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: AppColors.surfaceLight,
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.notifications_none_rounded,
                size: 48,
                color: AppColors.textHint,
              ),
            ),
            const SizedBox(height: 20),
            const Text(
              'Không có thông báo mới',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
                color: AppColors.textSecondary,
              ),
            ),
            const SizedBox(height: 6),
            const Text(
              'Thông báo sẽ hiển thị ở đây',
              style: TextStyle(fontSize: 13, color: AppColors.textHint),
            ),
          ],
        ),
      ),
    );
  }
}
