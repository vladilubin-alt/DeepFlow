package com.deepflowmobile;

import org.junit.runner.RunWith;
import org.junit.runners.Suite;

@RunWith(Suite.class)
@Suite.SuiteClasses({
    AppLaunchTest.class,
    TabNavigationTest.class,
    SessionFlowTest.class,
    SettingsTest.class,
    VaultTest.class
})
public class UiTestSuite {}
