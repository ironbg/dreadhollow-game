package com.dreadhollow.game;

import android.os.Bundle;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // The game lays out its own text for every screen size: the phone's "font size" setting would otherwise
        // enlarge it and push it out of its boxes, so the web view keeps the game's own sizes.
        WebView web = getBridge() != null ? getBridge().getWebView() : null;
        if (web != null) web.getSettings().setTextZoom(100);
    }
}
