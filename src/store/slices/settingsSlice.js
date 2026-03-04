import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { authService, settingsService } from '../../services/firebaseService';

// ==================== ASYNC THUNKS ====================

export const loginUser = createAsyncThunk(
  'settings/loginUser',
  async ({ email, password }, { rejectWithValue }) => {
    const result = await authService.login(email, password);
    if (result.success) return {
      uid: result.user.uid,
      email: result.user.email,
      displayName: result.user.displayName,
      photoURL: result.user.photoURL,
      dateOfBirth: result.user.dateOfBirth || null,
      gender: result.user.gender || null,
      phone: result.user.phone || null,
      address: result.user.address || null,
    };
    return rejectWithValue(result.error);
  }
);
export const registerUser = createAsyncThunk(
  'settings/registerUser',
  async ({ email, password, displayName }, { rejectWithValue }) => {
    const result = await authService.register(email, password, displayName);
    if (result.success) return {
      uid: result.user.uid,
      email: result.user.email,
      displayName: result.user.displayName,
      photoURL: result.user.photoURL,
      dateOfBirth,
      gender,
      phone,
      address,
    };
    return rejectWithValue(result.error);
  }
);

export const logoutUser = createAsyncThunk('settings/logoutUser', async () => {
  await authService.logout();
  return null;
});

export const saveSettings = createAsyncThunk(
  'settings/saveSettings',
  async ({ userId, settings }, { rejectWithValue }) => {
    const result = await settingsService.updateSettings(userId, settings);
    if (result.success) return settings;
    return rejectWithValue(result.error);
  }
);

// ==================== SLICE ====================

const settingsSlice = createSlice({
  name: 'settings',
  initialState: {
    // Auth
    user: null,
    isAuthenticated: false,
    authLoading: false,
    authError: null,

    // Settings
    sourceLanguage: 'vi',
    targetLanguage: 'en',
    soundEnabled: true,
    showTrustLevel: true,
    realTimeScan: true,
    batterySaver: false,
    offlineMode: false,

    // Notifications
    pushToken: null,
    notificationsEnabled: true,
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    clearAuthError: (state) => {
      state.authError = null;
    },
    setSourceLanguage: (state, action) => {
      state.sourceLanguage = action.payload;
    },
    setTargetLanguage: (state, action) => {
      state.targetLanguage = action.payload;
    },
    toggleSound: (state) => {
      state.soundEnabled = !state.soundEnabled;
    },
    toggleShowTrustLevel: (state) => {
      state.showTrustLevel = !state.showTrustLevel;
    },
    toggleRealTimeScan: (state) => {
      state.realTimeScan = !state.realTimeScan;
    },
    toggleBatterySaver: (state) => {
      state.batterySaver = !state.batterySaver;
    },
    toggleOfflineMode: (state) => {
      state.offlineMode = !state.offlineMode;
    },
    setPushToken: (state, action) => {
      state.pushToken = action.payload;
    },
    loadSettingsFromFirebase: (state, action) => {
      const s = action.payload;
      if (s) {
        state.sourceLanguage = s.sourceLanguage || 'vi';
        state.targetLanguage = s.targetLanguage || 'en';
        state.soundEnabled = s.soundEnabled ?? true;
        state.showTrustLevel = s.showTrustLevel ?? true;
        state.realTimeScan = s.realTimeScan ?? true;
        state.batterySaver = s.batterySaver ?? false;
        state.offlineMode = s.offlineMode ?? false;
      }
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.authLoading = true;
        state.authError = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.authLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.authLoading = false;
        state.authError = action.payload;
      });

    // Register
    builder
      .addCase(registerUser.pending, (state) => {
        state.authLoading = true;
        state.authError = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.authLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.authLoading = false;
        state.authError = action.payload;
      });

    // Logout
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user = null;
      state.isAuthenticated = false;
    });

    // Save settings
    builder.addCase(saveSettings.fulfilled, (state, action) => {
      const s = action.payload;
      state.sourceLanguage = s.sourceLanguage;
      state.targetLanguage = s.targetLanguage;
      state.soundEnabled = s.soundEnabled;
      state.showTrustLevel = s.showTrustLevel;
      state.realTimeScan = s.realTimeScan;
      state.batterySaver = s.batterySaver;
      state.offlineMode = s.offlineMode;
    });
  },
});

export const {
  setUser,
  clearAuthError,
  setSourceLanguage,
  setTargetLanguage,
  toggleSound,
  toggleShowTrustLevel,
  toggleRealTimeScan,
  toggleBatterySaver,
  toggleOfflineMode,
  setPushToken,
  loadSettingsFromFirebase,
} = settingsSlice.actions;

export default settingsSlice.reducer;