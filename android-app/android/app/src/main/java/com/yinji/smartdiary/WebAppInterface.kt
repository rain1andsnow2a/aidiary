package com.yinji.smartdiary

import android.content.Context
import android.webkit.JavascriptInterface

/**
 * JS 调 Native 的桥：让映记 WebView 把数据写到桌面小组件。
 *
 * 前端调用：
 *   (window as any).YinjiNative?.setWidgetData(streak, points, emoji)
 *   (window as any).YinjiNative?.openHeartLight() // 主动跳页（被 deep link 触发后用）
 *
 * 在 Capacitor WebView 容器里通过 [MainActivity] 注入。
 */
class WebAppInterface(private val context: Context) {

    @JavascriptInterface
    fun setWidgetData(streak: Int, points: Int, emoji: String?) {
        val prefs = context.getSharedPreferences(
            HeartLightWidgetProvider.PREFS_NAME,
            Context.MODE_PRIVATE
        )
        prefs.edit()
            .putInt(HeartLightWidgetProvider.KEY_STREAK, streak)
            .putInt(HeartLightWidgetProvider.KEY_POINTS, points)
            .putString(HeartLightWidgetProvider.KEY_EMOJI, emoji ?: "🕯️")
            .apply()
        HeartLightWidgetProvider.refreshAll(context)
    }
}
