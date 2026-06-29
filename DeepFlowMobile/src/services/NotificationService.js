import { Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import notifee, { AndroidImportance } from '@notifee/react-native';

const REMINDER_KEY = '@deepflow/settings/reminder';
const REMINDER_TIME_KEY = '@deepflow/settings/reminder_time';

const CHANNEL_ID = 'deepflow-reminders';

async function ensureChannel() {
  if (Platform.OS !== 'android') return;
  try {
    await notifee.createChannel({
      id: CHANNEL_ID,
      name: 'Daily Reminders',
      importance: AndroidImportance.HIGH,
      vibration: true,
    });
  } catch (e) {}
}

export async function requestNotificationPermission() {
  try {
    if (Platform.OS === 'android') {
      await notifee.requestPermission();
    }
    const settings = await notifee.requestPermission();
    return settings.authorizationStatus === 1;
  } catch (e) {
    return false;
  }
}

export async function scheduleDailyReminder(hour = 9, minute = 0) {
  try {
    await ensureChannel();
    await notifee.cancelAllNotifications();

    const now = new Date();
    const scheduled = new Date(now);
    scheduled.setHours(hour, minute, 0, 0);
    if (scheduled <= now) scheduled.setDate(scheduled.getDate() + 1);

    await notifee.createTriggerNotification(
      {
        title: 'Time to write',
        body: 'Your flow state is waiting. Open DeepFlow and start a session.',
        android: {
          channelId: CHANNEL_ID,
          pressAction: { id: 'default' },
        },
      },
      { type: 0, timestamp: scheduled.getTime() },
    );

    await AsyncStorage.setItem(REMINDER_KEY, 'true');
    await AsyncStorage.setItem(REMINDER_TIME_KEY, `${hour}:${minute}`);
  } catch (e) {
    console.warn('[Notification] schedule error:', e.message);
  }
}

export async function cancelDailyReminder() {
  try {
    await notifee.cancelAllNotifications();
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
