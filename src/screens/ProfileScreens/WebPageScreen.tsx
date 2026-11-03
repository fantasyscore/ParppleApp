import React, { useRef, useState } from "react";
import { ActivityIndicator, Linking, StyleSheet, View } from "react-native";
import { WebView, WebViewNavigation } from "react-native-webview";
import { AppSafeAreaView } from "../../common/AppSafeAreaView";
import NewHeader from "../../common/NewHeader";
import { AppText, INTER_MEDIUM, SCHEHERAZADE_BOLD, TWELVE, TWENTY, WHITE } from "../../common/AppText";
import { TouchableOpacityView } from "../../common/TouchableOpacityView";
import metrics from "../../assets/Metrics";
import { colors, newColor } from "../../theme/colors";
import NavigationService from "../../navigation/NavigationService";
import { NAVIGATION_WEB_PAGE_SCREEN } from "../../navigation/routes";

export const PARPPLE_LINKS = {
  privacy: { title: "Privacy Policy", url: "https://parpple.com/privacy_policy" },
  terms: { title: "Terms & Conditions", url: "https://parpple.com/terms_conditions" },
  safety: { title: "Safety Center", url: "https://parpple.com/safety" },
  childSafety: { title: "Child Safety", url: "https://parpple.com/child-safety" },
} as const;

/** Opens one of our web pages (legal, safety) inside the app instead of the browser */
export const openWebPage = (page: { title: string; url: string }) =>
  NavigationService.navigate(NAVIGATION_WEB_PAGE_SCREEN, page);

// The package's typings resolve WebView's props to `never` with this project's React types; the component works
const AppWebView = WebView as unknown as React.ComponentType<any>;

/**
 * Inside the app only the page content is wanted: the site's header (menu, "Get the app") and footer are hidden.
 * This also removes a black band: Android WebView paints the site's hidden mobile menu (visibility:hidden + CSS mask)
 * as a solid block under the header.
 */
const HIDE_SITE_CHROME_JS = `
(function () {
  var css = '.pp-skip, .pp-header, .pp-nav, .pp-footer { display: none !important; }';
  var add = function () {
    if (document.getElementById('pp-in-app-style')) return;
    var style = document.createElement('style');
    style.id = 'pp-in-app-style';
    style.textContent = css;
    (document.head || document.documentElement).appendChild(style);
  };
  add();
  document.addEventListener('DOMContentLoaded', add);
})();
true;
`;

const isOwnSite = (url: string) => /^https?:\/\/([a-z0-9-]+\.)*parpple\.com(\/|$|\?|#)/i.test(url);

/**
 * In-app web page for our legal and safety pages. Links to parpple.com stay inside; anything else (mailto:, tel:,
 * other websites) is handed to the system, since we can't vouch for it inside our app.
 */
const WebPageScreen = ({ route }: any) => {
  const { title = "", url = "" } = route?.params ?? {};
  const webViewRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const onShouldStartLoad = (request: WebViewNavigation) => {
    if (isOwnSite(request.url) || request.url === "about:blank") return true;
    Linking.openURL(request.url).catch(() => {});
    return false;
  };

  const retry = () => {
    setFailed(false);
    setLoading(true);
    webViewRef.current?.reload();
  };

  return (
    <AppSafeAreaView color={newColor.blackNew}>
      <NewHeader title={title} onPress={() => NavigationService.goBack()} />
      <View style={styles.body}>
        {failed ? (
          <View style={styles.center}>
            <AppText style={styles.centerText} type={TWELVE} weight={INTER_MEDIUM} color={WHITE}>
              Couldn't load this page. Please check your internet connection.
            </AppText>
            <TouchableOpacityView onPress={retry} style={styles.retryButton}>
              <AppText type={TWENTY} weight={SCHEHERAZADE_BOLD} color={WHITE}>
                Retry
              </AppText>
            </TouchableOpacityView>
          </View>
        ) : (
          <AppWebView
            ref={webViewRef}
            source={{ uri: url }}
            style={styles.webView}
            originWhitelist={["https://*", "http://*", "mailto:*", "tel:*"]}
            onShouldStartLoadWithRequest={onShouldStartLoad}
            onLoadEnd={() => setLoading(false)}
            onError={() => setFailed(true)}
            onHttpError={(event: any) => {
              if (event.nativeEvent.statusCode >= 400) setFailed(true);
            }}
            setSupportMultipleWindows={false}
            injectedJavaScriptBeforeContentLoaded={HIDE_SITE_CHROME_JS}
            injectedJavaScript={HIDE_SITE_CHROME_JS}
          />
        )}
        {loading && !failed && (
          <View style={[StyleSheet.absoluteFill, styles.center]} pointerEvents="none">
            <ActivityIndicator size="large" color={colors.white} />
          </View>
        )}
      </View>
    </AppSafeAreaView>
  );
};

export default WebPageScreen;

const styles = StyleSheet.create({
  body: {
    flex: 1,
  },
  webView: {
    flex: 1,
    backgroundColor: newColor.blackNew,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: metrics.hp3,
  },
  centerText: {
    textAlign: "center",
    marginBottom: metrics.hp3,
  },
  retryButton: {
    height: metrics.hp6,
    paddingHorizontal: metrics.hp5,
    alignItems: "center",
    justifyContent: "center",
    borderColor: "#FAFAFA",
    borderWidth: metrics.hp0_1,
  },
});
