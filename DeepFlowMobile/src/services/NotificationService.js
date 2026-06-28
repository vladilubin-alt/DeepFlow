import { Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const REMINDER_KEY = '@deepflow/settings/reminder';
const REMINDER_TIME_KEY = '@deepflow/settings/reminder_time';

let notificationModule = null;
try {
  if (Platform.OS === 'android') {
    notificationModule = require('react-native').Notifications;
  }
} catch (e) {}

export async function requestNotificationPermission() {
  if (!notificationModule) return false;
  try {
    const granted = await notificationModule.requestPermission();
    return granted;
  } catch (e) {
    return false;
  }
}

export async function scheduleDailyReminder(hour = 9, minute = 0) {
  if (!notificationModule) return;
  try {
    await notificationModule.cancelAllLocalNotifications();

    const now = new Date();
    const scheduled = new Date(now);
    scheduled.setHours(hour, minute, 0, 0);
    if (scheduled <= now) scheduled.setDate(scheduled.getDate() + 1);

    await notificationModule.scheduleLocalNotification({
      title: 'Time to write',
      message: 'Your flow state is waiting. Open DeepFlow and start a session.',
      date: scheduled,
      repeatType: 'day',
    });

    await AsyncStorage.setItem(REMINDER_KEY, 'true');
    await AsyncStorage.setItem(REMINDER_TIME_KEY, `${hour}:${minute}`);
  } catch (e) {
    console.warn('[Notification] schedule error:', e.message);
  }
}

export async function cancelDailyReminder() {
  if (!notificationModule) return;
  try {
    await notificationModule.cancelAllLocalNotifications();
    await AsyncStorage.setItem(REMINDER_KEY, 'false');
  } catch (e) {}
}

export async function getReminderSettings() {
  const enabled = await AsyncStorage.getItem(REMINDER_KEY).catch(() => 'false');
  const time = await AsyncStorage.getItem(REMINDER_TIME_KEY).catch(() => '9:0');
  const [hour, minute] = (time || '9:0').split(':').map(Number);
  return { enabled: enabled === 'true', hour, minute };
}

export async function setReminderEnabled(enabled) {
  if (enabled) {
    const settings = await getReminderSettings();
    await scheduleDailyReminder(settings.hour, settings.minute);
  } else {
    await cancelDailyReminder();
  }
}

export async function setReminderTime(hour, minute) {
  const settings = await getReminderSettings();
  if (settings.enabled) {
    await scheduleDailyReminder(hour, minute);
  } else {
    await AsyncStorage.setItem(REMINDER_TIME_KEY, `${hour}:${minute}`);
  }
}
