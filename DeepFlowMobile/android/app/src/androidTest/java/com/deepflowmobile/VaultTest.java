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
public class VaultTest {

    @Rule
    public ActivityTestRule<MainActivity> activityRule =
            new ActivityTestRule<>(MainActivity.class);

    @Before
    public void setUp() {
        ReactNativeHelper.keepScreenOn();
        ReactNativeHelper.waitForTextExact("ADHD WRITING INSTRUMENT", 12000);
        ReactNativeHelper.tap("VAULT");
        ReactNativeHelper.waitForText("tap to recover", 5000);
    }

    @After
    public void tearDown() {
        ReactNativeHelper.releaseScreenLock();
    }

    @Test
    public void vaultScreenDisplays() {
        assertTrue("Vault title", ReactNativeHelper.assertTextVisible("Vault"));
    }

    @Test
    public void vaultSubtitleIsVisible() {
        assertTrue("Subtitle", ReactNativeHelper.assertTextVisible("tap to recover"));
    }

    @Test
    public void graceTokensCountIsVisible() {
        assertTrue("Grace tokens", ReactNativeHelper.assertTextVisible("grace tokens remaining"));
    }

    @Test
    public void navigateToVaultFromHome() {
        ReactNativeHelper.tap("HOME");
        ReactNativeHelper.waitForTextExact("ADHD WRITING INSTRUMENT", 5000);
        assertTrue("Back home", ReactNativeHelper.assertTextVisible("ADHD WRITING INSTRUMENT"));

        ReactNativeHelper.tap("VAULT");
        ReactNativeHelper.waitForText("tap to recover", 5000);
        assertTrue("Vault loaded", ReactNativeHelper.assertTextVisible("tap to recover"));
    }
}
