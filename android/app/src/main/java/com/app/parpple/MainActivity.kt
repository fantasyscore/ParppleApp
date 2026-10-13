package com.app.parpple

import android.content.Context
import android.content.res.Configuration
import android.view.WindowManager
import android.os.Bundle
import android.view.View
import androidx.appcompat.app.AppCompatDelegate
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import org.devio.rn.splashscreen.SplashScreen
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsControllerCompat
class MainActivity : ReactActivity() {

  override fun getMainComponentName(): String = "parpple"

  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

  override fun onCreate(savedInstanceState: Bundle?) {
    SplashScreen.show(this) // show splash BEFORE super.onCreate
    super.onCreate(null)

   window.setFlags(
        WindowManager.LayoutParams.FLAG_SECURE,
        WindowManager.LayoutParams.FLAG_SECURE
    )

    // Make STATUS BAR transparent and allow content to draw behind it
    window.statusBarColor = android.graphics.Color.TRANSPARENT
    
    // Make NAVIGATION BAR transparent to remove the bottom strip
    window.navigationBarColor = android.graphics.Color.TRANSPARENT
    if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.Q) {
        window.isNavigationBarContrastEnforced = false
    }

    WindowCompat.setDecorFitsSystemWindows(window, false)
    val controller = WindowCompat.getInsetsController(window, window.decorView)
    controller.systemBarsBehavior = WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
  }
}


