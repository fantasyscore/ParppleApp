import Foundation
import UIKit
import React
@objc(FaceLiveness)
final class FaceLiveness: NSObject {
  private var inFlight: Bool = false
  private var resolve: RCTPromiseResolveBlock?
  private var reject: RCTPromiseRejectBlock?

  @objc static func requiresMainQueueSetup() -> Bool {
    true
  }

  @objc(startLiveness:resolver:rejecter:)
  func startLiveness(_ sessionId: String, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
    DispatchQueue.main.async {
      if self.inFlight {
        rejecter("E_LIVENESS_IN_PROGRESS", "Face liveness is already in progress", nil)
        return
      }

      guard !sessionId.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else {
        rejecter("E_INVALID_SESSION_ID", "Missing sessionId", nil)
        return
      }

      guard let presenter = Self.topMostViewController() else {
        rejecter("E_NO_ROOT_VIEW_CONTROLLER", "Unable to find a rootViewController to present Face Liveness", nil)
        return
      }

      guard let region = Bundle.main.object(forInfoDictionaryKey: "AWS_REKOGNITION_REGION") as? String,
            !region.isEmpty else {
        rejecter("E_MISSING_CONFIG", "Missing Info.plist key AWS_REKOGNITION_REGION", nil)
        return
      }

      guard let identityPoolId = Bundle.main.object(forInfoDictionaryKey: "AWS_COGNITO_IDENTITY_POOL_ID") as? String,
            !identityPoolId.isEmpty else {
        rejecter("E_MISSING_CONFIG", "Missing Info.plist key AWS_COGNITO_IDENTITY_POOL_ID", nil)
        return
      }

      self.inFlight = true
      self.resolve = resolver
      self.reject = rejecter

      let vc = FaceLivenessViewController(
        sessionId: sessionId,
        region: region,
        identityPoolId: identityPoolId,
        onFinish: { [weak self] outcome in
          guard let self else { return }
          self.inFlight = false

          let resolve = self.resolve
          let reject = self.reject
          self.resolve = nil
          self.reject = nil

          switch outcome {
          case .success:
            resolve?(["status": "success"])
          case .cancelled(let message):
            // Cancellation should not be treated as an error for UX parity with Android.
            resolve?(["status": "cancelled", "message": message ?? "User cancelled"])
          case .failure(let code, let message, let underlying):
            reject?(code, message, underlying)
          }
        }
      )

      vc.modalPresentationStyle = .pageSheet
      if #available(iOS 15.0, *) {
        if let sheet = vc.sheetPresentationController {
          sheet.detents = [.medium()]
        }
      }
      presenter.present(vc, animated: true)
    }
  }

  private static func topMostViewController() -> UIViewController? {
    let scenes = UIApplication.shared.connectedScenes
      .compactMap { $0 as? UIWindowScene }
      .filter { $0.activationState == .foregroundActive }

    let window = scenes
      .flatMap { $0.windows }
      .first { $0.isKeyWindow } ?? scenes.flatMap { $0.windows }.first

    guard var top = window?.rootViewController else { return nil }
    while let presented = top.presentedViewController {
      top = presented
    }
    return top
  }
}

