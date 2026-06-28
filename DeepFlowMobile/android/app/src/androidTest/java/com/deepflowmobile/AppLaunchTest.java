package com.deepflowmobile;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

import androidx.test.ext.junit.runners.AndroidJUnit4;
import androidx.test.platform.app.InstrumentationRegistry;
import androidx.test.rule.ActivityTestRule;

import org.junit.After;
import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;
import org.junit.runner.RunWith;

@RunWith(AndroidJUnit4.class)
public class AppLaunchTest {

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
    public void appLaunchesSuccessfully() {
        String pkg = InstrumentationRegistry.getInstrumentation()
                .getTargetContext().getPackageName();
        assertEquals("com.deepflowmobile", pkg);
    }

    @Test
    public void homeScreenRenders() {
        assertTrue("Title visible", ReactNativeHelper.assertTextVisible("ADHD WRITING INSTRUMENT"));
    }

    @Test
    public void bottomTabsAreVisible() {
        assertTrue("Home tab", ReactNativeHelper.assertTextVisible("HOME"));
        assertTrue("History tab", ReactNativeHelper.assertTextVisible("HISTORY"));
        assertTrue("Vault tab", ReactNativeHelper.assertTextVisible("VAULT"));
        assertTrue("Settings tab", ReactNativeHelper.assertTextVisible("SETTINGS"));
    }

    @Test
    public void durationOptionsAreDisplayed() {
        assertTrue("Duration label", ReactNativeHelper.assertTextVisible("DURATION"));
        assertTrue("25m option", ReactNativeHelper.assertTextVisible("25m"));
    }

    @Test
    public void wordTargetOptionsAreDisplayed() {
        assertTrue("Word Target label", ReactNativeHelper.assertTextVisible("WORD TARGET"));
        assertTrue("300 option", ReactNativeHelper.assertTextVisible("300"));
    }
}
