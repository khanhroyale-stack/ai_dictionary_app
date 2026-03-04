import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const notificationService = {
  registerForPushNotifications: async (userId) => {
    try {
      if (!Device.isDevice) return null;

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') return null;

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'AI Dictionary',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#6C63FF',
        });
      }

      // Bỏ getExpoPushTokenAsync vì không hoạt động trên Expo Go SDK 54+
      return null;
    } catch (error) {
      // Im lặng, không log lỗi ra console
      return null;
    }
  },

  sendScanSuccessNotification: async (wordName) => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '✅ Quét thành công!',
          body: `Đã thêm "${wordName}" vào từ điển.`,
          sound: 'default',
        },
        trigger: null,
      });
    } catch (error) {
      return null;
    }
  },

  scheduleDailyReviewReminder: async () => {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '📚 Ôn tập từ vựng!',
          body: 'Đừng quên ôn tập từ vựng hôm nay nhé!',
          sound: 'default',
        },
        trigger: { hour: 20, minute: 0, repeats: true },
      });
    } catch (error) {
      return null;
    }
  },

  sendMilestoneNotification: async (count) => {
    try {
      const milestones = [10, 50, 100, 500];
      if (!milestones.includes(count)) return;
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🎉 Chúc mừng!',
          body: `Bạn đã học được ${count} từ vựng!`,
          sound: 'default',
        },
        trigger: null,
      });
    } catch (error) {
      return null;
    }
  },

  addNotificationResponseListener: (callback) => {
    try {
      return Notifications.addNotificationResponseReceivedListener(callback);
    } catch (error) {
      return { remove: () => {} }; // trả về object giả để không crash khi gọi .remove()
    }
  },

  addNotificationReceivedListener: (callback) => {
    try {
      return Notifications.addNotificationReceivedListener(callback);
    } catch (error) {
      return { remove: () => {} };
    }
  },

  cancelAllScheduled: async () => {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      return null;
    }
  },
};