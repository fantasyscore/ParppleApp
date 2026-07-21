import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider
import CodePush
import Firebase
import GoogleSignIn
import SDWebImage

@main
class AppDelegate: UIResponder, UIApplicationDelegate {

  var window: UIWindow?
  var reactNativeDelegate: ReactNativeDelegate?
  var reactNativeFactory: RCTReactNativeFactory?

  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {

    

    // 🔥 Firebase Init
    FirebaseApp.configure()

    // 🚀 SDWebImage Memory & Thread Optimization
    // Limit memory cost to 80MB to prevent EXC_BAD_ACCESS memory crashes under high preloading pressure
    SDImageCache.shared.config.maxMemoryCost = 80 * 1024 * 1024
    SDImageCache.shared.config.maxMemoryCount = 60
    SDImageCache.shared.config.shouldUseWeakMemoryCache = true
    SDImageCache.shared.config.shouldCacheImagesInMemory = true
    SDWebImageDownloader.shared.config.maxConcurrentDownloads = 4
    // Limit parallel downloads/decodes to 4 to reduce thread safety contention and memory spikes on iPhone 16
    

    let delegate = ReactNativeDelegate()
    let factory = RCTReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()

    reactNativeDelegate = delegate
    reactNativeFactory = factory

    window = UIWindow(frame: UIScreen.main.bounds)

    factory.startReactNative(
      withModuleName: "parpple",
      in: window,
      launchOptions: launchOptions
    )

    // 🎨 Match the app background (#212123) on the window and RN root view.
    // The default root view background is white — it shows for a frame
    // during screen transitions ("white flash"). Painting it with the app
    // color makes transitions seamless.
    let appBackground = UIColor(red: 0x21 / 255.0, green: 0x21 / 255.0, blue: 0x23 / 255.0, alpha: 1.0)
    window?.backgroundColor = appBackground
    window?.rootViewController?.view.backgroundColor = appBackground

    return true
  }

  // ✅ REQUIRED for Google Sign-In (URL Scheme handling)
  func application(
    _ app: UIApplication,
    open url: URL,
    options: [UIApplication.OpenURLOptionsKey : Any] = [:]
  ) -> Bool {

    if GIDSignIn.sharedInstance.handle(url) {
      return true
    }

    return false
  }
}

class ReactNativeDelegate: RCTDefaultReactNativeFactoryDelegate {

  override func sourceURL(for bridge: RCTBridge) -> URL? {
    return bundleURL()
  }

  override func bundleURL() -> URL? {
#if DEBUG
    return RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
#else
    return CodePush.bundleURL() ??
      Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }
}




