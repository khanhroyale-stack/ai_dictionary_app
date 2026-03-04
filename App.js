import 'react-native-gesture-handler';
import React, { useEffect, useRef } from 'react';
import { LogBox } from 'react-native';

LogBox.ignoreLogs([
  'expo-notifications: Android Push notifications',
  '`expo-notifications` functionality is not fully supported',
]);

import { StatusBar } from 'expo-status-bar';
import { Provider, useDispatch } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { ActivityIndicator, View } from 'react-native';
import { store, persistor } from './src/store';
import AppNavigator from './src/navigation/AppNavigator';
import { authService, settingsService } from './src/services/firebaseService';
import { setUser, loadSettingsFromFirebase, setPushToken } from './src/store/slices/settingsSlice';
import { fetchWords } from './src/store/slices/wordsSlice';
import { notificationService } from './src/services/notificationService';
import { COLORS } from './src/constants/colors';

// Auth listener component
const AuthListener = () => {
  const dispatch = useDispatch();
  const notifListenerRef = useRef(null);
  const responseListenerRef = useRef(null);

  useEffect(() => {
    // Listen to Firebase auth state
    const unsubscribeAuth = authService.onAuthChange(async (firebaseUser) => {
      if (firebaseUser) {
        dispatch(setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
        }));

        // Fetch user words from Firebase
        dispatch(fetchWords(firebaseUser.uid));

        // Load settings from Firebase
        const settingsResult = await settingsService.getSettings(firebaseUser.uid);
        if (settingsResult.success && settingsResult.settings) {
          dispatch(loadSettingsFromFirebase(settingsResult.settings));
        }

        // Register for push notifications
        // const token = await notificationService.registerForPushNotifications(firebaseUser.uid);
        // if (token) {
        //   dispatch(setPushToken(token));
        // }

        // Schedule daily reminder
        // await notificationService.scheduleDailyReviewReminder();
      } else {
        dispatch(setUser(null));
      }
    });

    // Setup notification listeners
    // notifListenerRef.current = notificationService.addNotificationReceivedListener(
    //   (notification) => {
    //     console.log('Notification received:', notification.request.content.title);
    //   }
    // );

    // responseListenerRef.current = notificationService.addNotificationResponseListener(
    //   (response) => {
    //     const data = response.notification.request.content.data;
    //     console.log('Notification tapped:', data);
    // You can navigate based on notification type here
    //   }
    // );

    return () => {
      unsubscribeAuth();
      // if (notifListenerRef.current) notifListenerRef.current.remove();
      // if (responseListenerRef.current) responseListenerRef.current.remove();
    };
  }, []);

  return null;
};

// Root app
export default function App() {
  return (
    <Provider store={store}>
      <PersistGate
        loading={
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.primary }}>
            <ActivityIndicator size="large" color={COLORS.white} />
          </View>
        }
        persistor={persistor}>
        <AuthListener />
        <AppNavigator />
        <StatusBar style="auto" />
      </PersistGate>
    </Provider>
  );
}