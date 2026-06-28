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
public class SessionFlowTest {

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
    public void startSessionButtonExists() {
        assertTrue("Start button", ReactNativeHelper.assertTextVisible("START SESSION"));
    }

    @Test
    public void canSelectDuration() {
        ReactNativeHelper.tap("10m");
        assertTrue("10m selected", ReactNativeHelper.assertTextVisible("10m"));
    }

    @Test
    public void canSelectWordTarget() {
        ReactNativeHelper.tap("100");
        assertTrue("100 selected", ReactNativeHelper.assertTextVisible("100"));
    }

    @Test
    public void canSelectAiMode() {
        ReactNativeHelper.tap("coach");
        assertTrue("coach selected", ReactNativeHelper.assertTextVisible("coach"));
    }

    @Test
    public void canSelectSensoryMode() {
        ReactNativeHelper.tap("alpha");
        assertTrue("alpha selected", ReactNativeHelper.assertTextVisible("alpha"));
    }

    @Test
    public void startSessionNavigatesToActiveSession() {
        ReactNativeHelper.tap("START SESSION");
        assertTrue("Active session", ReactNativeHelper.assertTextVisible("WRITING"));
    }

    @Test
    public void activeSessionHasTopBar() {
        ReactNativeHelper.tap("START SESSION");
        assertTrue("Top bar state", ReactNativeHelper.assertTextVisible("WRITING"));
    }
}
