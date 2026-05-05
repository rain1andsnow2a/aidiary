package com.yinji.smartdiary

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.widget.RemoteViews

/**
 * 映记 · 今日心灯桌面小组件。
 *
 * 数据来源：MainActivity 的 WebAppInterface 把前端 streak/points 写入
 * SharedPreferences，再调用 AppWidgetManager 触发 onUpdate。
 *
 * 用户点小组件 → 通过 deep link 启动 MainActivity 并把 intent extra
 * 传给前端，让 WebView 跳到 /heart-light。
 */
class HeartLightWidgetProvider : AppWidgetProvider() {

    companion object {
        const val PREFS_NAME = "yinji_widget_prefs"
        const val KEY_STREAK = "streak"
        const val KEY_POINTS = "points"
        const val KEY_EMOJI = "emoji"
        const val ACTION_OPEN_HEART_LIGHT = "com.yinji.smartdiary.OPEN_HEART_LIGHT"

        /** 由 WebAppInterface 调用，刷新所有 widget 实例。 */
        fun refreshAll(context: Context) {
            val mgr = AppWidgetManager.getInstance(context)
            val ids = mgr.getAppWidgetIds(
                ComponentName(context, HeartLightWidgetProvider::class.java)
            )
            for (id in ids) updateOne(context, mgr, id)
        }

        private fun updateOne(
            context: Context,
            mgr: AppWidgetManager,
            widgetId: Int
        ) {
            val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            val streak = prefs.getInt(KEY_STREAK, 0)
            val points = prefs.getInt(KEY_POINTS, 0)
            val emoji = prefs.getString(KEY_EMOJI, "🕯️") ?: "🕯️"

            val views = RemoteViews(context.packageName, R.layout.heart_light_widget)
            views.setTextViewText(R.id.widget_streak_value, streak.toString())
            views.setTextViewText(R.id.widget_points_value, points.toString())
            views.setTextViewText(R.id.widget_emoji, emoji)

            val intent = Intent(context, MainActivity::class.java).apply {
                action = ACTION_OPEN_HEART_LIGHT
                addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_CLEAR_TOP)
            }
            val flags = PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            val pending = PendingIntent.getActivity(context, widgetId, intent, flags)
            views.setOnClickPendingIntent(R.id.widget_action_button, pending)
            views.setOnClickPendingIntent(android.R.id.background, pending)

            mgr.updateAppWidget(widgetId, views)
        }
    }

    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        for (id in appWidgetIds) updateOne(context, appWidgetManager, id)
    }
}
