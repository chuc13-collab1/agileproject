/// API endpoint constants — all roles
class ApiEndpoints {
  ApiEndpoints._();

  // Auth
  static const String authMe = '/auth/me';

  // Projects
  static const String projects = '/projects';
  static String projectById(String id) => '/projects/$id';
  static String projectSprints(String projectId) =>
      '/projects/$projectId/sprints';

  // Sprints
  static const String sprints = '/sprints';
  static String sprintById(String id) => '/sprints/$id';
  static String sprintsByProject(String projectId) => '/sprints/$projectId';
  static String sprintTasks(String sprintId) => '/sprints/$sprintId/tasks';

  // Students
  static const String students = '/students';
  static String studentById(String id) => '/students/$id';
  static String toggleStudentActive(String id) => '/students/$id/toggle-active';

  // Teachers
  static const String teachers = '/teachers';
  static String teacherById(String id) => '/teachers/$id';
  static String toggleTeacherActive(String id) => '/teachers/$id/toggle-active';

  // Admins
  static const String admins = '/admins';
  static String adminById(String id) => '/admins/$id';
  static String toggleAdminActive(String id) => '/admins/$id/toggle-active';

  // Classes
  static const String classes = '/classes';
  static String classById(String id) => '/classes/$id';
  static String classStudents(String classCode) =>
      '/classes/$classCode/students';

  // Topics
  static const String topics = '/topics';
  static String topicById(String id) => '/topics/$id';

  // Topic Proposals
  static const String topicProposals = '/topic-proposals';
  static String topicProposalById(String id) => '/topic-proposals/$id';

  // Notifications
  static const String notifications = '/notifications';

  // Progress Reports
  static const String progressReports = '/progress-reports';
  static String progressReportById(String id) => '/progress-reports/$id';

  // Evaluations
  static const String evaluations = '/evaluations';

  // Statistics
  static const String stats = '/stats';

  // Announcements
  static const String announcements = '/announcements';
}
