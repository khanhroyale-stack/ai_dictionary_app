import { initializeApp } from 'firebase/app';
import { createUserWithEmailAndPassword, getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { get, getDatabase, onValue, push, ref, remove, set } from 'firebase/database';
import { FIREBASE_CONFIG } from '../constants/config';

// Initialize Firebase
const app = initializeApp(FIREBASE_CONFIG);
export const auth = getAuth(app);
export const database = getDatabase(app);

// ==================== AUTH SERVICES ====================

export const authService = {
  // Đăng ký
  register: async (email, password, displayName) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      // Lưu thông tin user vào Realtime DB
      await set(ref(database, `users/${user.uid}`), {
        uid: user.uid,
        email,
        displayName,
        createdAt: Date.now(),
        settings: {
          sourceLanguage: 'vi',
          targetLanguage: 'en',
          soundEnabled: true,
          showTrustLevel: true,
          realTimeScan: true,
          batterySaver: false,
          offlineMode: false,
        },
      });
      return { success: true, user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Đăng nhập
  login: async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: userCredential.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Đăng xuất
  logout: async () => {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Lắng nghe trạng thái auth
  onAuthChange: (callback) => {
    return onAuthStateChanged(auth, callback);
  },
};

// ==================== WORDS DATABASE SERVICES ====================

export const wordsService = {
  // Thêm từ mới
  addWord: async (userId, wordData) => {
    try {
      const wordsRef = ref(database, `words/${userId}`);
      const newWordRef = push(wordsRef);
      const wordWithId = {
        ...wordData,
        id: newWordRef.key,
        createdAt: Date.now(),
        isFavorite: false,
        isLearned: false,
      };
      await set(newWordRef, wordWithId);
      return { success: true, id: newWordRef.key, word: wordWithId };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Lấy tất cả từ của user
  getWords: async (userId) => {
    try {
      const wordsRef = ref(database, `words/${userId}`);
      const snapshot = await get(wordsRef);
      if (snapshot.exists()) {
        const data = snapshot.val();
        return {
          success: true,
          words: Object.values(data).sort((a, b) => b.createdAt - a.createdAt),
        };
      }
      return { success: true, words: [] };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Lắng nghe real-time thay đổi
  subscribeWords: (userId, callback) => {
    const wordsRef = ref(database, `words/${userId}`);
    return onValue(wordsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const words = Object.values(data).sort((a, b) => b.createdAt - a.createdAt);
        callback(words);
      } else {
        callback([]);
      }
    });
  },

  // Cập nhật từ (yêu thích / đã học)
  updateWord: async (userId, wordId, updates) => {
    try {
      const wordRef = ref(database, `words/${userId}/${wordId}`);
      const snapshot = await get(wordRef);
      if (snapshot.exists()) {
        await set(wordRef, { ...snapshot.val(), ...updates });
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Xóa từ
  deleteWord: async (userId, wordId) => {
    try {
      const wordRef = ref(database, `words/${userId}/${wordId}`);
      await remove(wordRef);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
};

// ==================== USER SETTINGS ====================

export const settingsService = {
  // Lấy settings
  getSettings: async (userId) => {
    try {
      const settingsRef = ref(database, `users/${userId}/settings`);
      const snapshot = await get(settingsRef);
      if (snapshot.exists()) {
        return { success: true, settings: snapshot.val() };
      }
      return { success: true, settings: null };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Cập nhật settings
  updateSettings: async (userId, settings) => {
    try {
      const settingsRef = ref(database, `users/${userId}/settings`);
      await set(settingsRef, settings);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Lưu FCM token
  saveFCMToken: async (userId, token) => {
    try {
      const tokenRef = ref(database, `users/${userId}/fcmToken`);
      await set(tokenRef, token);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
};