package com.parpple.faceliveness

import android.app.Activity
import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.ui.platform.LocalContext
import com.amplifyframework.auth.AWSCredentials
import com.amplifyframework.auth.AWSCredentialsProvider
import com.amplifyframework.auth.AWSTemporaryCredentials
import com.amplifyframework.auth.AuthException
import com.amplifyframework.ui.liveness.ui.FaceLivenessDetector
import com.amazonaws.auth.CognitoCachingCredentialsProvider
import com.amazonaws.regions.Regions
import java.util.Date
import aws.smithy.kotlin.runtime.time.toSdkInstant
import java.util.concurrent.Executors
import com.amplifyframework.core.Consumer

class FaceLivenessActivity : ComponentActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)

    val sessionId = intent.getStringExtra(EXTRA_SESSION_ID)
    if (sessionId.isNullOrBlank()) {
      setResult(
        Activity.RESULT_CANCELED,
        Intent().putExtra(EXTRA_ERROR_MESSAGE, "Missing sessionId")
      )
      finish()
      return
    }

    val region = intent.getStringExtra(EXTRA_REGION)
    val identityPoolId = intent.getStringExtra(EXTRA_IDENTITY_POOL_ID)
    if (region.isNullOrBlank()) {
      setResult(
        Activity.RESULT_CANCELED,
        Intent().putExtra(EXTRA_ERROR_MESSAGE, "Missing AWS region")
      )
      finish()
      return
    }
    if (identityPoolId.isNullOrBlank()) {
      setResult(
        Activity.RESULT_CANCELED,
        Intent().putExtra(EXTRA_ERROR_MESSAGE, "Missing Cognito Identity Pool Id")
      )
      finish()
      return
    }

    val credsProvider = CognitoIdentityPoolCredentialsProvider(
      applicationContext,
      identityPoolId = identityPoolId,
      region = region
    )

    setContent {
      MaterialTheme {
        val ctx = LocalContext.current
        val finished = remember { mutableStateOf(false) }

        LaunchedEffect(Unit) {
          // If the Activity is backgrounded immediately, avoid running multiple finish calls.
          finished.value = false
        }

        FaceLivenessDetector(
          sessionId = sessionId,
          region = region,
          credentialsProvider = credsProvider,
          onComplete = {
            if (finished.value) return@FaceLivenessDetector
            finished.value = true
            setResult(Activity.RESULT_OK, Intent())
            finish()
          },
          onError = { error ->
            if (finished.value) return@FaceLivenessDetector
            finished.value = true
            setResult(
              Activity.RESULT_CANCELED,
              Intent()
                .putExtra(EXTRA_ERROR_MESSAGE, error.message ?: "Face liveness failed")
            )
            finish()
          }
        )
      }
    }
  }

  private class CognitoIdentityPoolCredentialsProvider(
    private val context: android.content.Context,
    private val identityPoolId: String,
    private val region: String
  ) : AWSCredentialsProvider<AWSCredentials> {
    private val executor = Executors.newSingleThreadExecutor()

    override fun fetchAWSCredentials(
      onSuccess: Consumer<AWSCredentials>,
      onError: Consumer<AuthException>
    ) {
      executor.execute {
        try {
          val provider = CognitoCachingCredentialsProvider(
            context,
            identityPoolId,
            Regions.fromName(region)
          )

          // Force refresh if needed
          provider.refresh()
          val sessionCreds = provider.credentials

          val expiration =
            provider.sessionCredentialsExpiration?.let { Date(it.time) } ?: Date(System.currentTimeMillis() + 55 * 60 * 1000)

          val amplifyCreds = AWSTemporaryCredentials(
            sessionCreds.awsAccessKeyId,
            sessionCreds.awsSecretKey,
            sessionCreds.sessionToken,
            java.time.Instant.ofEpochMilli(expiration.time).toSdkInstant()
          )
          onSuccess.accept(amplifyCreds)
        } catch (t: Throwable) {
          onError.accept(
            AuthException(
              "Failed to obtain AWS credentials",
              "Ensure Cognito Identity Pool is configured and network is available.",
              t
            )
          )
        }
      }
    }
  }

  companion object {
    const val EXTRA_SESSION_ID = "sessionId"
    const val EXTRA_REGION = "region"
    const val EXTRA_IDENTITY_POOL_ID = "identityPoolId"

    const val EXTRA_ERROR_MESSAGE = "errorMessage"
  }
}

