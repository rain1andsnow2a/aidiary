package com.yinji.smartdiary

import android.annotation.SuppressLint
import android.content.Intent
import android.os.Bundle
import android.webkit.WebView
import com.getcapacitor.BridgeActivity

/**
 * 映记主 Activity（Capacitor BridgeActivity）。
 *
 * 在 WebView 启动后注入 [WebAppInterface]，前端可调
 *   window.YinjiNative.setWidgetData(streak, points, emoji)
 * 把数据写到桌面小组件。
 *
 * 当用户从桌面 Widget 点击"点亮今天"按钮时，intent action 是
 * [HeartLightWidgetProvider.ACTION_OPEN_HEART_LIGHT]，我们让 WebView
 * 跳转到 #/heart-light（hash router 兼容）。
 */
class MainActivity : BridgeActivity() {

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        bridge?.webView?.addJavascriptInterface(
            WebAppInterface(applicationContext),
            "YinjiNative"
        )
        handleWidgetIntent(intent)
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        handleWidgetIntent(intent)
    }

    private fun handleWidgetIntent(intent: Intent?) {
        if (intent?.action != HeartLightWidgetProvider.ACTION_OPEN_HEART_LIGHT) return
        val webView: WebView = bridge?.webView ?: return
        webView.post {
            // 优先调用前端挂载的全局 navigate 函数（保持 SPA 状态）；
            // 没挂上时回退到硬跳，至少能拉起心灯页。
            val js = """
                (function(){
                  if (typeof window.__yinjiNavigate === 'function') {
                    window.__yinjiNavigate('/heart-light');
                  } else {
                    window.location.assign('/heart-light');
                  }
                })();
            """.trimIndent()
            webView.evaluateJavascript(js, null)
        }
    }
}
