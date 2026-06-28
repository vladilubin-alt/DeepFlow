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
public class TabNavigationTest {

    @Rule
    public ActivityTestRule<MainActivity> activityRule =
            new ActivityTestRule<>(MainActivity.class);

    @Before
    public void setUp() {
        ReactNativeHelper.keepScreenOn();
        ReactNativeHelper.waitForTextExact("ADHD WRITING INSTRUMENT", 12000);
    }

    @After
    public void tearDown() {
        ReactNativeHelper.releaseScreenLock();
    }

    @Test
    public void navigateToHistoryTab() {
        ReactNativeHelper.tap("HISTORY");
        assertTrue("History screen", ReactNativeHelper.assertTextVisible("History"));
    }

    @Test
    public void navigateToVaultTab() {
        ReactNativeHelper.tap("VAULT");
        assertTrue("Vault screen", ReactNativeHelper.assertTextVisible("Vault"));
        assertTrue("Vault subtitle", ReactNativeHelper.assertTextVisible("TAP TO RECOVER"));
    }

    @Test
    public void navigateToSettingsTab() {
        ReactNativeHelper.tap("SETTINGS");
        assertTrue("Settings screen", ReactNativeHelper.assertTextVisible("Haptic feedback"));
    }

    @Test
    public void navigateBackToHome() {
        ReactNativeHelper.tap("SETTINGS");
        ReactNativeHelper.tap("HOME");
        assertTrue("Back to home", ReactNativeHelper.assertTextVisible("ADHD WRITING INSTRUMENT"));
    }

    @Test
    public void tabNavigationCycles() {
        ReactNativeHelper.tap("HISTORY");
        ReactNativeHelper.tap("VAULT");
        ReactNativeHelper.tap("SETTINGS");
        ReactNativeHelper.tap("HOME");
        assertTrue("Cycle complete", ReactNativeHelper.assertTextVisible("ADHD WRITING INSTRUMENT"));
    }
}
