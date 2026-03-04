export const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

export const FIREBASE_CONFIG = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: 'mma301-7855a.firebaseapp.com',
  databaseURL: 'https://mma301-7855a-default-rtdb.asia-southeast1.firebasedatabase.app/',
  projectId: 'mma301-7855a',
  storageBucket: 'mma301-7855a.firebasestorage.app',
  messagingSenderId: '633881303503',
  appId: '1:633881303503:web:156b51402ef6b15d271aba',
};

// export const FCM_SERVER_KEY = 'YOUR_FCM_SERVER_KEY';

export const SUPPORTED_LANGUAGES = [
  { code: 'vi', name: 'Tiếng Việt' },
  { code: 'en', name: 'Tiếng Anh' },
  { code: 'ja', name: 'Tiếng Nhật' },
  { code: 'ko', name: 'Tiếng Hàn' },
  { code: 'zh', name: 'Tiếng Trung' },
  { code: 'fr', name: 'Tiếng Pháp' },
];