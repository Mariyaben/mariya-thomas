package love.betweenus;

import android.app.Activity;
import android.appwidget.AppWidgetManager;
import android.content.*;
import android.os.Bundle;
import android.webkit.*;
import org.json.JSONObject;
import java.net.*;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.Executors;

public class MainActivity extends Activity {
    WebView web;
    final java.util.concurrent.ExecutorService relayExecutor = Executors.newSingleThreadExecutor();
    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        getWindow().setStatusBarColor(0xfffff5f9);
        getWindow().setNavigationBarColor(0xfffff5f9);
        getWindow().getDecorView().setSystemUiVisibility(android.view.View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR);
        web = new WebView(this);
        web.setBackgroundColor(0xfffff5f9);
        web.getSettings().setJavaScriptEnabled(true);
        web.getSettings().setDomStorageEnabled(true);
        web.getSettings().setAllowFileAccess(false);
        web.addJavascriptInterface(new Bridge(), "Android");
        setContentView(web);
        web.loadUrl("file:///android_asset/index.html");
    }
    class Bridge {
        @JavascriptInterface public void relay(String requestId, String topic, String body) {
            if (!requestId.matches("[a-zA-Z0-9-]{1,80}") || !topic.matches("mt-[a-f0-9]{48}") || body.length() > 4000) return;
            relayExecutor.execute(() -> {
                int status = 0;
                HttpURLConnection connection = null;
                try {
                    connection = (HttpURLConnection) new URL("https://ntfy.sh/" + topic).openConnection();
                    connection.setInstanceFollowRedirects(false);
                    connection.setConnectTimeout(15000);
                    connection.setReadTimeout(15000);
                    connection.setRequestMethod("POST");
                    connection.setRequestProperty("Content-Type", "text/plain; charset=utf-8");
                    connection.setDoOutput(true);
                    try (java.io.OutputStream out = connection.getOutputStream()) { out.write(body.getBytes(StandardCharsets.UTF_8)); }
                    status = connection.getResponseCode();
                } catch (Exception ignored) {} finally { if (connection != null) connection.disconnect(); }
                final int response = status;
                runOnUiThread(() -> web.evaluateJavascript("window.chatRelayResult(" + JSONObject.quote(requestId) + "," + response + ")", null));
            });
        }
        @JavascriptInterface public void updateClock(int minutes, String person) {
            if (minutes < -720 || minutes > 840) return;
            getSharedPreferences("clock", MODE_PRIVATE).edit().putInt("offset", minutes).putString("person", person.equals("thomas") ? "thomas" : "mariya").apply();
            ClockWidget.refresh(MainActivity.this);
            runOnUiThread(() -> {
                int color = person.equals("thomas") ? 0xfff6f1ff : 0xfffff5f9;
                getWindow().setStatusBarColor(color);
                getWindow().setNavigationBarColor(color);
                web.setBackgroundColor(color);
            });
        }
        @JavascriptInterface public void pinWidget() {
            runOnUiThread(() -> {
                AppWidgetManager manager = getSystemService(AppWidgetManager.class);
                if (manager.isRequestPinAppWidgetSupported()) manager.requestPinAppWidget(new ComponentName(MainActivity.this, ClockWidget.class), null, null);
                else android.widget.Toast.makeText(MainActivity.this, "Long press your home screen → Widgets → Mariya & Thomas", android.widget.Toast.LENGTH_LONG).show();
            });
        }
        @JavascriptInterface public void share(String value) {
            runOnUiThread(() -> { Intent i = new Intent(Intent.ACTION_SEND); i.setType("text/plain"); i.putExtra(Intent.EXTRA_TEXT, value); startActivity(Intent.createChooser(i, "Share")); });
        }
    }
}
