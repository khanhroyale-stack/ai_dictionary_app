import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers } from 'redux';
import wordsReducer from './slices/wordsSlice';
import settingsReducer from './slices/settingsSlice';

// Persist config - lưu settings vào AsyncStorage
const settingsPersistConfig = {
  key: 'settings',
  storage: AsyncStorage,
  whitelist: [
    'sourceLanguage',
    'targetLanguage',
    'soundEnabled',
    'showTrustLevel',
    'realTimeScan',
    'batterySaver',
    'offlineMode',
    'notificationsEnabled',
  ],
};

const wordsPersistConfig = {
  key: 'words',
  storage: AsyncStorage,
  whitelist: ['list'], // Cache words locally
};

const rootReducer = combineReducers({
  words: persistReducer(wordsPersistConfig, wordsReducer),
  settings: persistReducer(settingsPersistConfig, settingsReducer),
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export const persistor = persistStore(store);