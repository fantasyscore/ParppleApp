package com.parpple.faceliveness

import android.app.Activity
import android.content.Intent
import com.facebook.react.bridge.*

class FaceLivenessModule(private val reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext), ActivityEventListener {

  private var pendingPromise: Promise? = null

  override fun getName(): String = "FaceLiveness"

  override fun initialize() {
    super.initialize()
    reactContext.addActivityEventListener(this)
  }

  override fun invalidate() {
    reactContext.removeActivityEventListener(this)
    super.invalidate()
  }

  @ReactMethod
  fun startLiveness(sessionId: String, promise: Promise) {
    if (pendingPromise != null) {
      promise.reject("E_LIVENESS_IN_PROGRESS", "Face liveness is already in progress")
      return
    }

    val activity = currentActivity
    if (activity == null) {
      promise.reject("E_NO_ACTIVITY", "Cannot start face liveness: no foreground activity")
      return
    }

    val region = reactContext.getStringMetaData("com.parpple.AWS_REKOGNITION_REGION")
    val identityPoolId = reactContext.getStringMetaData("com.parpple.AWS_COGNITO_IDENTITY_POOL_ID")

    if (region.isNullOrBlank()) {
      promise.reject(
        "E_MISSING_CONFIG",
        "Missing AndroidManifest meta-data com.parpple.AWS_REKOGNITION_REGION"
      )
      return
    }
    if (identityPoolId.isNullOrBlank()) {
      promise.reject(
        "E_MISSING_CONFIG",
        "Missing AndroidManifest meta-data com.parpple.AWS_COGNITO_IDENTITY_POOL_ID"
      )
      return
    }

    pendingPromise = promise
    try {
      val intent = Intent(activity, FaceLivenessActivity::class.java).apply {
        putExtra(FaceLivenessActivity.EXTRA_SESSION_ID, sessionId)
        putExtra(FaceLivenessActivity.EXTRA_REGION, region)
        putExtra(FaceLivenessActivity.EXTRA_IDENTITY_POOL_ID, identityPoolId)
      }
      activity.startActivityForResult(intent, REQUEST_CODE)
    } catch (t: Throwable) {
      pendingPromise = null
      promise.reject("E_LIVENESS_LAUNCH_FAILED", "Failed to launch face liveness UI", t)
    }
  }

  override fun onActivityResult(activity: Activity?, requestCode: Int, resultCode: Int, data: Intent?) {
    if (requestCode != REQUEST_CODE) return

    val promise = pendingPromise ?: return
    pendingPromise = null

    if (resultCode == Activity.RESULT_OK) {
      val result = Arguments.createMap().apply {
        putString("status", "success")
      }
      promise.resolve(result)
      return
    }

    val errorMessage =
      data?.getStringExtra(FaceLivenessActivity.EXTRA_ERROR_MESSAGE) ?: "User cancelled"

    val result = Arguments.createMap().apply {
      putString("status", "cancelled")
      putString("message", errorMessage)
    }
    // Treat cancellation as a resolved result for smoother UX.
    promise.resolve(result)
  }

  override fun onNewIntent(intent: Intent?) {}

  private fun ReactApplicationContext.getStringMetaData(key: String): String? {
    return try {
      val appInfo = packageManager.getApplicationInfo(packageName, android.content.pm.PackageManager.GET_META_DATA)
      appInfo.metaData?.getString(key)
    } catch (_: Throwable) {
      null
    }
  }

  companion object {
    private const val REQUEST_CODE = 9821
  }
}

