package love.betweenus;
import android.app.PendingIntent;
import android.appwidget.*;
import android.content.*;
import android.widget.RemoteViews;
import java.util.Locale;

public class ClockWidget extends AppWidgetProvider {
    public static void refresh(Context c) {
        AppWidgetManager m = AppWidgetManager.getInstance(c);
        new ClockWidget().onUpdate(c, m, m.getAppWidgetIds(new ComponentName(c, ClockWidget.class)));
    }
    @Override public void onUpdate(Context c, AppWidgetManager m, int[] ids) {
        android.content.SharedPreferences p = c.getSharedPreferences("clock", Context.MODE_PRIVATE);
        boolean thomas = p.getString("person", "mariya").equals("thomas");
        int offset = thomas ? 330 : p.getInt("offset", 0);
        String zone = String.format(Locale.US, "GMT%s%02d:%02d", offset < 0 ? "-" : "+", Math.abs(offset)/60, Math.abs(offset)%60);
        for (int id : ids) {
            RemoteViews v = new RemoteViews(c.getPackageName(), R.layout.clock_widget);
            v.setInt(R.id.widget_root, "setBackgroundResource", thomas ? R.drawable.widget_purple : R.drawable.widget_bg);
            int ink = thomas ? 0xff513574 : 0xff74394f;
            v.setTextColor(R.id.widget_title, ink);
            v.setTextColor(R.id.widget_clock, ink);
            v.setTextColor(R.id.widget_caption, ink);
            v.setTextViewText(R.id.widget_title, (thomas ? "MARIYA IN INDIA" : "THOMAS AT SEA") + "  ♡");
            v.setString(R.id.widget_clock, "setTimeZone", zone);
            v.setTextViewText(R.id.widget_caption, thomas ? "India time · tap to open" : "Ship time · tap to open");
            v.setOnClickPendingIntent(R.id.widget_root, PendingIntent.getActivity(c, 0, new Intent(c, MainActivity.class), PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT));
            m.updateAppWidget(id, v);
        }
    }
}
