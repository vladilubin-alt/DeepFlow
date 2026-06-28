package com.deepflowmobile;

import static org.junit.Assert.assertTrue;

import androidx.test.ext.junit.runners.AndroidJUnit4;
import androidx.test.rule.ActivityTestRule;

import org.junit.After;
import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;
import org.junit.runner.RunWith;

@RunWith(AndroidJUnit4.class)
public class SettingsTest {

    @Rule
    public ActivityTestRule<MainActivity> activityRule =
            new ActivityTestRule<>(MainActivity.class);

    @Before
    public void setUp() {
        ReactNativeHelper.keepScreenOn();
        ReactNativeHelper.waitForTextExact("ADHD WRITING INSTRUMENT", 12000);
        ReactNativeHelper.tap("SETTINGS");
        ReactNativeHelper.waitForText("Haptic feedback", 5000);
    }

    @After
    public void tearDown() {
        ReactNativeHelper.releaseScreenLock();
    }

    @Test
    public void hapticFeedbackToggleExists() {
        assertTrue("Haptic toggle", ReactNativeHelper.assertTextVisible("Haptic feedback"));
    }

    @Test
    public void soundEffectsToggleExists() {
        assertTrue("Sound toggle", ReactNativeHelper.assertTextVisible("Sound effects"));
    }

    @Test
    public void themeSectionExists() {
        assertTrue("Appearance", ReactNativeHelper.assertTextVisible("Appearance"));
    }

    @Test
    public void sessionSectionExists() {
        assertTrue("Idle threshold", ReactNativeHelper.assertTextVisible("Idle threshold"));
        assertTrue("Guillotine fuse", ReactNativeHelper.assertTextVisible("Guillotine fuse"));
    }

    @Test
    public void aboutSectionExists() {
        ReactNativeHelper.device().swipe(540, 1800, 540, 600, 10);
        assertTrue("Version", ReactNativeHelper.assertTextVisible("Version"));
        assertTrue("Build", ReactNativeHelper.assertTextVisible("Build"));
    }

    @Test
    public void canToggleHapticFeedback() {
        ReactNativeHelper.tap("Haptic feedback");
        assertTrue("Haptic still visible", ReactNativeHelper.assertTextVisible("Haptic feedback"));
    }

    @Test
    public void canToggleSoundEffects() {
        ReactNativeHelper.tap("Sound effects");
        assertTrue("Sound still visible", ReactNativeHelper.assertTextVisible("Sound effects"));
    }
}
