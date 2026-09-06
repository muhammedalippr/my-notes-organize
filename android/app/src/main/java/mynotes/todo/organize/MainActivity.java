package mynotes.todo.organize;

import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.ViewGroup;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.widget.RelativeLayout;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private int currentBottomNavInsetPx = 0;
    private int detectedAdHeightPx = 0;
    private boolean isKeyboardVisible = false;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // 1. Transparent edge-to-edge status bar at the top
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);

        // 2. Real-time system navigation bar & IME keyboard insets listener
        View rootView = getWindow().getDecorView();
        ViewCompat.setOnApplyWindowInsetsListener(rootView, (v, insets) -> {
            Insets navInsets = insets.getInsets(WindowInsetsCompat.Type.systemBars());
            currentBottomNavInsetPx = navInsets.bottom;

            // Detect IME keyboard visibility in real-time
            boolean keyboardNowVisible = insets.isVisible(WindowInsetsCompat.Type.ime());
            this.isKeyboardVisible = keyboardNowVisible;

            applyNativeLayoutBounds();
            return insets;
        });

        // 3. Android Native Global Layout Listener (Event-driven)
        rootView.getViewTreeObserver().addOnGlobalLayoutListener(this::applyNativeLayoutBounds);

        // 4. Expose native theme updater so JavaScript can toggle bottom nav color & status bar icons in real time
        if (getBridge() != null && getBridge().getWebView() != null) {
            getBridge().getWebView().post(() -> {
                getBridge().getWebView().addJavascriptInterface(new Object() {
                    @JavascriptInterface
                    public void updateTheme(boolean isDark) {
                        runOnUiThread(() -> applyNativeThemeColors(isDark));
                    }
                }, "AndroidNativeTheme");

                getBridge().getWebView().evaluateJavascript(
                    "window.updateNativeNavTheme = function(isDark) { if(window.AndroidNativeTheme) { window.AndroidNativeTheme.updateTheme(isDark); } };",
                    null
                );
            });
        }
    }

    public void applyNativeThemeColors(boolean isDark) {
        Window window = getWindow();
        WindowInsetsControllerCompat controller = WindowCompat.getInsetsController(window, window.getDecorView());

        if (controller != null) {
            controller.setAppearanceLightStatusBars(!isDark);
            controller.setAppearanceLightNavigationBars(!isDark);
        }

        int navColor = isDark ? Color.parseColor("#121214") : Color.parseColor("#f5f5f7");
        window.setNavigationBarColor(navColor);
    }

    private void applyNativeLayoutBounds() {
        ViewGroup contentRoot = (ViewGroup) findViewById(android.R.id.content);
        if (contentRoot != null) {
            // Measure exact runtime height of the AdMob banner.
            // If hidden or keyboard is visible, ad height drops to 0.
            detectedAdHeightPx = isKeyboardVisible ? 0 : measureAdViewHeight(contentRoot);

            // Lift AdMob banner container above the system navigation bar
            adjustAdViewsRecursively(contentRoot, isKeyboardVisible ? 0 : currentBottomNavInsetPx);
        }

        // Apply EXACT bottom margin to the Capacitor WebView:
        if (getBridge() != null && getBridge().getWebView() != null) {
            final View webView = getBridge().getWebView();
            ViewGroup.LayoutParams lp = webView.getLayoutParams();
            if (lp instanceof ViewGroup.MarginLayoutParams) {
                ViewGroup.MarginLayoutParams mlp = (ViewGroup.MarginLayoutParams) lp;
                int totalBottomMargin = isKeyboardVisible ? 0 : (currentBottomNavInsetPx + detectedAdHeightPx);
                if (mlp.bottomMargin != totalBottomMargin) {
                    mlp.bottomMargin = totalBottomMargin;
                    webView.setLayoutParams(mlp);
                    webView.requestLayout();
                }
            }
        }
    }

    private int measureAdViewHeight(ViewGroup parent) {
        for (int i = 0; i < parent.getChildCount(); i++) {
            View child = parent.getChildAt(i);
            if (child instanceof RelativeLayout) {
                if (child.getVisibility() == View.VISIBLE && child.getHeight() > 0) {
                    return child.getHeight();
                }
            } else if (child instanceof ViewGroup) {
                int height = measureAdViewHeight((ViewGroup) child);
                if (height > 0) return height;
            }
        }
        return 0;
    }

    private void adjustAdViewsRecursively(ViewGroup parent, int bottomInsetPx) {
        for (int i = 0; i < parent.getChildCount(); i++) {
            View child = parent.getChildAt(i);
            if (child instanceof RelativeLayout) {
                ViewGroup.LayoutParams lp = child.getLayoutParams();
                if (lp instanceof ViewGroup.MarginLayoutParams) {
                    ViewGroup.MarginLayoutParams mlp = (ViewGroup.MarginLayoutParams) lp;
                    if (mlp.bottomMargin != bottomInsetPx) {
                        mlp.bottomMargin = bottomInsetPx;
                        child.setLayoutParams(mlp);
                        child.requestLayout();
                    }
                }
            } else if (child instanceof ViewGroup) {
                adjustAdViewsRecursively((ViewGroup) child, bottomInsetPx);
            }
        }
    }
}
