package com.app.parpple

import android.app.Activity
import android.content.Intent
import android.content.IntentSender
import com.facebook.react.bridge.*
import com.google.android.play.core.appupdate.AppUpdateInfo
import com.google.android.play.core.appupdate.AppUpdateManager
import com.google.android.play.core.appupdate.AppUpdateManagerFactory
import com.google.android.play.core.appupdate.AppUpdateOptions
import com.google.android.play.core.install.model.AppUpdateType
import com.google.android.play.core.install.model.UpdateAvailability

class InAppUpdateModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext), ActivityEventListener, LifecycleEventListener {

    private val appUpdateManager: AppUpdateManager = AppUpdateManagerFactory.create(reactContext)
    private var pendingPromise: Promise? = null

    companion object {
        private const val REQUEST_CODE = 8219 // Unique request code for update flow
        const val MODULE_NAME = "InAppUpdate"
    }

    override fun getName(): String = MODULE_NAME

    override fun initialize() {
        super.initialize()
        reactContext.addActivityEventListener(this)
        reactContext.addLifecycleEventListener(this)
    }

    override fun invalidate() {
        reactContext.removeActivityEventListener(this)
        reactContext.removeLifecycleEventListener(this)
        super.invalidate()
    }

    @ReactMethod
    fun checkForUpdate(promise: Promise) {
        val activity = currentActivity
        if (activity == null) {
            val result = Arguments.createMap().apply {
                putString("status", "NO_ACTIVITY")
                putString("message", "No active activity to display the update popup.")
            }
            promise.resolve(result)
            return
        }

        appUpdateManager.appUpdateInfo.addOnSuccessListener { appUpdateInfo ->
            val availability = appUpdateInfo.updateAvailability()
            
            if (availability == UpdateAvailability.UPDATE_AVAILABLE
                && appUpdateInfo.isUpdateTypeAllowed(AppUpdateType.IMMEDIATE)
            ) {
                // Keep references safe
                pendingPromise?.let {
                    try {
                        val result = Arguments.createMap().apply {
                            putString("status", "CANCELED")
                            putString("message", "Superseded by new request.")
                        }
                        it.resolve(result)
                    } catch (_: Exception) {}
                }
                pendingPromise = promise

                try {
                    appUpdateManager.startUpdateFlowForResult(
                        appUpdateInfo,
                        activity,
                        AppUpdateOptions.newBuilder(AppUpdateType.IMMEDIATE).build(),
                        REQUEST_CODE
                    )
                } catch (e: IntentSender.SendIntentException) {
                    pendingPromise = null
                    promise.reject("E_INTENT_SENDER_ERROR", "IntentSender exception during flow start", e)
                }
            } else if (availability == UpdateAvailability.UPDATE_NOT_AVAILABLE) {
                val result = Arguments.createMap().apply {
                    putString("status", "UPDATE_NOT_AVAILABLE")
                }
                promise.resolve(result)
            } else {
                val result = Arguments.createMap().apply {
                    putString("status", "UNKNOWN")
                    putInt("availability", availability)
                }
                promise.resolve(result)
            }
        }.addOnFailureListener { exception ->
            promise.reject("E_CHECK_UPDATE_FAILED", "Failed to retrieve Play Store update info: ${exception.message}", exception)
        }
    }

    // --- ActivityEventListener Hooks ---

    override fun onActivityResult(activity: Activity?, requestCode: Int, resultCode: Int, data: Intent?) {
        if (requestCode != REQUEST_CODE) return

        val promise = pendingPromise ?: return
        pendingPromise = null

        val result = Arguments.createMap()
        if (resultCode == Activity.RESULT_OK) {
            result.putString("status", "SUCCESS")
            promise.resolve(result)
        } else if (resultCode == Activity.RESULT_CANCELED) {
            result.putString("status", "CANCELED")
            promise.resolve(result)
        } else {
            result.putString("status", "FAILED")
            result.putInt("resultCode", resultCode)
            promise.resolve(result)
        }
    }

    override fun onNewIntent(intent: Intent?) {
        // No-op
    }

    // --- LifecycleEventListener Hooks ---

    override fun onHostResume() {
        val activity = currentActivity ?: return
        
        // Resume immediate updates that were already in progress
        appUpdateManager.appUpdateInfo.addOnSuccessListener { appUpdateInfo ->
            if (appUpdateInfo.updateAvailability() == UpdateAvailability.DEVELOPER_TRIGGERED_UPDATE_IN_PROGRESS) {
                try {
                    appUpdateManager.startUpdateFlowForResult(
                        appUpdateInfo,
                        activity,
                        AppUpdateOptions.newBuilder(AppUpdateType.IMMEDIATE).build(),
                        REQUEST_CODE
                    )
                } catch (_: IntentSender.SendIntentException) {
                    // Safely ignore or log auto-resume errors to prevent app-wide crashes
                }
            }
        }
    }

    override fun onHostPause() {
        // No-op
    }

    override fun onHostDestroy() {
        // No-op
    }
}
