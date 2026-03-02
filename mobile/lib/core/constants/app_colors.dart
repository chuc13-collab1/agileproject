import 'package:flutter/material.dart';

/// App color palette — modern light theme
class AppColors {
  AppColors._();

  // Primary
  static const Color primary = Color(0xFF4F46E5);
  static const Color primaryLight = Color(0xFF818CF8);
  static const Color primaryDark = Color(0xFF3730A3);

  // Accent
  static const Color accent = Color(0xFF0EA5E9);
  static const Color accentLight = Color(0xFF7DD3FC);
  static const Color accentDark = Color(0xFF0284C7);

  // Background — LIGHT
  static const Color background = Color(0xFFF8FAFC);
  static const Color surface = Color(0xFFFFFFFF);
  static const Color surfaceLight = Color(0xFFE2E8F0);
  static const Color card = Color(0xFFFFFFFF);

  // Text
  static const Color textPrimary = Color(0xFF1E293B);
  static const Color textSecondary = Color(0xFF64748B);
  static const Color textHint = Color(0xFF94A3B8);

  // Status
  static const Color success = Color(0xFF22C55E);
  static const Color warning = Color(0xFFF59E0B);
  static const Color error = Color(0xFFEF4444);
  static const Color info = Color(0xFF3B82F6);

  // Sprint status colors
  static const Color todo = Color(0xFF94A3B8);
  static const Color inProgress = Color(0xFFF59E0B);
  static const Color done = Color(0xFF22C55E);

  // Gradient
  static const LinearGradient primaryGradient = LinearGradient(
    colors: [primary, Color(0xFF7C3AED)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient cardGradient = LinearGradient(
    colors: [Color(0xFFF1F5F9), Color(0xFFFFFFFF)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
}
