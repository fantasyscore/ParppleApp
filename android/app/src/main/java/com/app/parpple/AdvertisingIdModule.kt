package com.app.parpple

import com.facebook.react.bridge.*
import com.google.android.gms.ads.identifier.AdvertisingIdClient

/** Reads the Google Advertising ID (GAID) and the user's ad-personalization opt-out flag. */
class AdvertisingIdModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    companion object {
        const val MODULE_NAME = "AdvertisingId"
        private const val ZERO_ID = "00000000-0000-0000-0000-000000000000"
    }

    override fun getName(): String = MODULE_NAME

    // Device facts for Snap's extinfo that react-native-device-info does not expose
    override fun getConstants(): Map<String, Any> =
        mapOf("cpuCores" to Runtime.getRuntime().availableProcessors())

    @ReactMethod
    fun getAdvertisingInfo(promise: Promise) {
        // AdvertisingIdClient blocks on a Play Services call, so it must not run on the JS/UI thread
        Thread {
            try {
                val info = AdvertisingIdClient.getAdvertisingIdInfo(reactContext.applicationContext)
                val rawId = info.id
                val limited = info.isLimitAdTrackingEnabled
                val id = if (rawId.isNullOrEmpty() || rawId == ZERO_ID) null else rawId.lowercase()
                val result = Arguments.createMap().apply {
                    if (id != null) putString("id", id) else putNull("id")
                    putBoolean("isLimitAdTrackingEnabled", limited)
                }
                promise.resolve(result)
            } catch (e: Exception) {
                promise.reject("GAID_ERROR", e.message ?: "Failed to read advertising ID", e)
            }
        }.start()
    }
}
