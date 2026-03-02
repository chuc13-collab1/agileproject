/// Environment configuration for the app.
/// Uses dart-define for build-time config, with fallback defaults.
class EnvConfig {
  /// Base URL for the backend API.
  /// Override with: --dart-define=API_BASE_URL=http://192.168.1.x:3001/api
  static const String apiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'https://reserved-bountifully-hermila.ngrok-free.dev/api',
  );

  /// Firebase config (using same project as web client)
  static const String firebaseApiKey =
      'AIzaSyCEQvAkpWbqeUD7MpS3IEuArrHuZ_VmBTo';
  static const String firebaseAuthDomain = 'quanlyduan-8918b.firebaseapp.com';
  static const String firebaseProjectId = 'quanlyduan-8918b';
  static const String firebaseStorageBucket =
      'quanlyduan-8918b.firebasestorage.app';
  static const String firebaseMessagingSenderId = '858648978872';
  static const String firebaseAppId =
      '1:858648978872:android:082c0f10372a8d7e7cdb4d';
}
