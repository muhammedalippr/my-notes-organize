# ProGuard & R8 optimization rules for My Notes

# Preserve stack traces with line numbers
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile

# WebKit & JavaScript Interface (Crucial for Capacitor WebView)
-keepattributes JavascriptInterface
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}
-keepclassmembers class * extends android.webkit.WebViewClient {
    <methods>;
}
-keepclassmembers class * extends android.webkit.WebChromeClient {
    <methods>;
}

# Capacitor Core & Plugin reflection
-keep public class * extends com.getcapacitor.Plugin {
    public *;
}
-keep class com.getcapacitor.** { *; }
-dontwarn com.getcapacitor.**
-keep @interface com.getcapacitor.annotation.CapacitorPlugin { *; }
-keep @interface com.getcapacitor.PluginMethod { *; }

# Cordova Plugin reflection
-keep public class * extends org.apache.cordova.CordovaPlugin {
    public *;
}
-keep class org.apache.cordova.** { *; }
-dontwarn org.apache.cordova.**

# Google AdMob SDK
-keep class com.google.android.gms.ads.** { *; }
-dontwarn com.google.android.gms.ads.**

# Biometric Authentication
-keep class androidx.biometric.** { *; }
-dontwarn androidx.biometric.**

# In-App Update (Play Core App Update)
-keep class com.google.android.play.core.** { *; }
-dontwarn com.google.android.play.core.**
