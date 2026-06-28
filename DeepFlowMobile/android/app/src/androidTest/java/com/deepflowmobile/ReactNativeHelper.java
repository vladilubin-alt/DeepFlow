package com.deepflowmobile;

import android.os.PowerManager;
import android.os.SystemClock;
import android.view.View;
import android.view.ViewGroup;
import android.view.ViewParent;

import androidx.test.platform.app.InstrumentationRegistry;
import androidx.test.uiautomator.By;
import androidx.test.uiautomator.UiDevice;
import androidx.test.uiautomator.Until;

import org.hamcrest.Description;
import org.hamcrest.Matcher;
import org.hamcrest.TypeSafeMatcher;

public class ReactNativeHelper {

    private static final long DEFAULT_TIMEOUT = 10_000;
    private static PowerManager.WakeLock sWakeLock;

    public static UiDevice device() {
        return UiDevice.getInstance(InstrumentationRegistry.getInstrumentation());
    }

    public static void keepScreenOn() {
        try {
            PowerManager pm = (PowerManager) InstrumentationRegistry.getInstrumentation()
                    .getTargetContext().getSystemService(PowerManager.class);
            sWakeLock = pm.newWakeLock(
                    PowerManager.FULL_WAKE_LOCK | PowerManager.ACQUIRE_CAUSES_WAKEUP,
                    "DeepFlowTest:screenOn");
            sWakeLock.acquire(600_000);
            device().wakeUp();
        } catch (Exception ignored) {}
    }

    public static void releaseScreenLock() {
        if (sWakeLock != null && sWakeLock.isHeld()) {
            sWakeLock.release();
            sWakeLock = null;
        }
    }

    public static boolean waitForText(String text, long timeoutMs) {
        return device().wait(Until.hasObject(By.textContains(text)), timeoutMs)
            || device().wait(Until.hasObject(By.textContains(text.toUpperCase())), timeoutMs);
    }

    public static boolean waitForTextExact(String text, long timeoutMs) {
        return device().wait(Until.hasObject(By.text(text)), timeoutMs);
    }

    public static boolean assertTextVisible(String text) {
        boolean found = waitForText(text, DEFAULT_TIMEOUT);
        if (!found) {
            throw new AssertionError("Text not found within timeout: " + text);
        }
        return true;
    }

    public static void tap(String text) {
        waitForTextExact(text, DEFAULT_TIMEOUT);
        device().findObject(By.text(text)).click();
        SystemClock.sleep(500);
    }

    public static Matcher<View> withIndex(final Matcher<View> matcher, final int index) {
        return new TypeSafeMatcher<View>() {
            @Override
            public void describeTo(Description description) {
                description.appendText("with index: ");
                description.appendValue(index);
                matcher.describeTo(description);
            }

            @Override
            public boolean matchesSafely(View view) {
                if (!matcher.matches(view)) return false;
                ViewParent parent = view.getParent();
                if (parent == null || !(parent instanceof ViewGroup)) return false;
                ViewGroup group = (ViewGroup) parent;
                int childCount = 0;
                for (int i = 0; i < group.getChildCount(); i++) {
                    View child = group.getChildAt(i);
                    if (matcher.matches(child)) {
                        if (childCount == index) return true;
                        childCount++;
                    }
                }
                return false;
            }
        };
    }
}
