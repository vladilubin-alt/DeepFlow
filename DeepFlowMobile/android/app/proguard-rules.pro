# React Native
-keep class com.facebook.hermes.unicode.** { *; }
-keep class com.facebook.jni.** { *; }

# Supabase / OkHttp
-dontwarn okhttp3.**
-dontwarn okio.**

# RevenueCat
-keep class com.revenuecat.purchases.** { *; }

# Mixpanel
-keep class com.mixpanel.** { *; }

# Keep enum classes
-keepclassmembers enum * {
    public static **[] values();
    public static ** valueOf(java.lang.String);
}

# Keep React Native module interfaces
-keep class com.facebook.react.** { *; }

# Obfuscate everything else
-optimizationpasses 5
-allowaccessmodification
-repackageclasses 'df'
