import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../features/admin/presentation/screens/admin_dashboard_screen.dart';
import '../../features/admin/presentation/screens/admin_statistics_screen.dart';
import '../../features/admin/presentation/screens/admin_topics_screen.dart';
import '../../features/admin/presentation/screens/announcements_screen.dart';
import '../../features/admin/presentation/screens/class_assignment_screen.dart';
import '../../features/admin/presentation/screens/project_management_screen.dart';
import '../../features/admin/presentation/screens/reviewer_assignment_screen.dart';
import '../../features/admin/presentation/screens/user_management_screen.dart';
import '../../features/auth/presentation/providers/auth_provider.dart';
import '../../features/auth/presentation/screens/login_screen.dart';
import '../../features/dashboard/presentation/screens/student_dashboard_screen.dart';
import '../../features/notification/presentation/screens/notification_screen.dart';
import '../../features/project/presentation/screens/my_project_screen.dart';
import '../../features/sprint/presentation/screens/sprint_board_screen.dart';
import '../../features/student/presentation/screens/ai_chat_screen.dart';
import '../../features/student/presentation/screens/book_meeting_screen.dart';
import '../../features/student/presentation/screens/document_management_screen.dart';
import '../../features/student/presentation/screens/progress_report_screen.dart';
import '../../features/student/presentation/screens/project_results_screen.dart';
import '../../features/student/presentation/screens/student_topic_proposal_screen.dart';
import '../../features/student/presentation/screens/topic_browsing_screen.dart';
import '../../features/supervisor/presentation/screens/proposal_review_screen.dart';
import '../../features/supervisor/presentation/screens/supervisor_dashboard_screen.dart';
import '../../features/supervisor/presentation/screens/teacher_calendar_screen.dart';
import '../../features/supervisor/presentation/screens/teacher_project_detail_screen.dart';
import '../../features/supervisor/presentation/screens/teacher_statistics_screen.dart';
import '../../features/supervisor/presentation/screens/teacher_student_list_screen.dart';
import '../../features/supervisor/presentation/screens/teacher_topic_list_screen.dart';
import '../../features/supervisor/presentation/screens/teacher_topic_proposal_screen.dart';
import 'main_shell.dart';
import 'role_shells.dart';

/// App router configuration with role-based redirect
GoRouter createAppRouter(WidgetRef ref) {
  final authState = ref.watch(authProvider);

  return GoRouter(
    initialLocation: '/dashboard',
    redirect: (context, state) {
      final isAuth = authState.isAuthenticated;
      final location = state.matchedLocation;
      final isLoginRoute = location == '/login';

      // Not authenticated → go to login
      if (!isAuth && !isLoginRoute) return '/login';

      // Authenticated but on login page → redirect by role
      if (isAuth && isLoginRoute) {
        return _homeForRole(authState.user?.role);
      }

      // Authenticated → ensure correct role path
      if (isAuth && location == '/dashboard') {
        final role = authState.user?.role;
        if (role == 'teacher' || role == 'supervisor') {
          return '/supervisor/dashboard';
        }
        if (role == 'admin') {
          return '/admin/dashboard';
        }
      }

      return null;
    },
    routes: [
      // Login
      GoRoute(path: '/login', builder: (context, state) => const LoginScreen()),

      // ==================== STUDENT ====================
      ShellRoute(
        builder: (context, state, child) => MainShell(child: child),
        routes: [
          GoRoute(
            path: '/dashboard',
            pageBuilder: (context, state) =>
                const NoTransitionPage(child: StudentDashboardScreen()),
          ),
          GoRoute(
            path: '/project',
            pageBuilder: (context, state) =>
                const NoTransitionPage(child: MyProjectScreen()),
          ),
          GoRoute(
            path: '/sprints',
            pageBuilder: (context, state) =>
                const NoTransitionPage(child: SprintBoardScreen()),
          ),
          GoRoute(
            path: '/topics',
            pageBuilder: (context, state) =>
                const NoTransitionPage(child: TopicBrowsingScreen()),
          ),
          GoRoute(
            path: '/reports',
            pageBuilder: (context, state) =>
                const NoTransitionPage(child: ProgressReportScreen()),
          ),
          GoRoute(
            path: '/documents',
            pageBuilder: (context, state) =>
                const NoTransitionPage(child: DocumentManagementScreen()),
          ),
          GoRoute(
            path: '/results',
            pageBuilder: (context, state) =>
                const NoTransitionPage(child: ProjectResultsScreen()),
          ),
          GoRoute(
            path: '/notifications',
            pageBuilder: (context, state) =>
                const NoTransitionPage(child: NotificationScreen()),
          ),
          GoRoute(
            path: '/book-meeting',
            pageBuilder: (context, state) =>
                const NoTransitionPage(child: BookMeetingScreen()),
          ),
          GoRoute(
            path: '/propose-topic',
            pageBuilder: (context, state) =>
                const NoTransitionPage(child: StudentTopicProposalScreen()),
          ),
          GoRoute(
            path: '/ai-chat',
            pageBuilder: (context, state) =>
                const NoTransitionPage(child: AiChatScreen()),
          ),
        ],
      ),

      // ==================== SUPERVISOR ====================
      ShellRoute(
        builder: (context, state, child) => SupervisorShell(child: child),
        routes: [
          GoRoute(
            path: '/supervisor/dashboard',
            pageBuilder: (context, state) =>
                const NoTransitionPage(child: SupervisorDashboardScreen()),
          ),
          GoRoute(
            path: '/supervisor/students',
            pageBuilder: (context, state) =>
                const NoTransitionPage(child: TeacherStudentListScreen()),
          ),
          GoRoute(
            path: '/supervisor/topics',
            pageBuilder: (context, state) =>
                const NoTransitionPage(child: TeacherTopicListScreen()),
          ),
          GoRoute(
            path: '/supervisor/statistics',
            pageBuilder: (context, state) =>
                const NoTransitionPage(child: TeacherStatisticsScreen()),
          ),
          GoRoute(
            path: '/supervisor/calendar',
            pageBuilder: (context, state) =>
                const NoTransitionPage(child: TeacherCalendarScreen()),
          ),
          GoRoute(
            path: '/supervisor/proposals',
            pageBuilder: (context, state) =>
                const NoTransitionPage(child: ProposalReviewScreen()),
          ),
          GoRoute(
            path: '/supervisor/topic-proposal',
            pageBuilder: (context, state) =>
                const NoTransitionPage(child: TeacherTopicProposalScreen()),
          ),
          GoRoute(
            path: '/supervisor/review-list',
            pageBuilder: (context, state) =>
                const NoTransitionPage(child: TeacherReviewListScreen()),
          ),
          GoRoute(
            path: '/supervisor/project-detail/:id',
            pageBuilder: (context, state) {
              final id = state.pathParameters['id']!;
              final role = state.uri.queryParameters['role'] ?? 'supervisor';
              return NoTransitionPage(
                child: TeacherProjectDetailScreen(projectId: id, role: role),
              );
            },
          ),
        ],
      ),
      ShellRoute(
        builder: (context, state, child) => AdminShell(child: child),
        routes: [
          GoRoute(
            path: '/admin/dashboard',
            pageBuilder: (context, state) =>
                const NoTransitionPage(child: AdminDashboardScreen()),
          ),
          GoRoute(
            path: '/admin/users',
            pageBuilder: (context, state) =>
                const NoTransitionPage(child: UserManagementScreen()),
          ),
          GoRoute(
            path: '/admin/projects',
            pageBuilder: (context, state) =>
                const NoTransitionPage(child: AdminProjectManagementScreen()),
          ),
          GoRoute(
            path: '/admin/statistics',
            pageBuilder: (context, state) =>
                const NoTransitionPage(child: AdminStatisticsScreen()),
          ),
          GoRoute(
            path: '/admin/class-assignment',
            pageBuilder: (context, state) =>
                const NoTransitionPage(child: ClassAssignmentScreen()),
          ),
          GoRoute(
            path: '/admin/reviewer-assignment',
            pageBuilder: (context, state) =>
                const NoTransitionPage(child: ReviewerAssignmentScreen()),
          ),
          GoRoute(
            path: '/admin/announcements',
            pageBuilder: (context, state) =>
                const NoTransitionPage(child: AnnouncementsScreen()),
          ),
          GoRoute(
            path: '/admin/topics',
            pageBuilder: (context, state) =>
                const NoTransitionPage(child: AdminTopicsScreen()),
          ),
        ],
      ),
    ],
  );
}

/// Get home route for each role
String _homeForRole(String? role) {
  switch (role) {
    case 'teacher':
    case 'supervisor':
      return '/supervisor/dashboard';
    case 'admin':
      return '/admin/dashboard';
    default:
      return '/dashboard';
  }
}
