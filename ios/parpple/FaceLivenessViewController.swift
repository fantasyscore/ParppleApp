import UIKit
import SwiftUI
import AWSCore
#if canImport(FaceLiveness)
import FaceLiveness
import AWSPluginsCore
#endif

final class FaceLivenessViewController: UIViewController {

  enum Outcome {
    case success
    case cancelled(message: String?)
    case failure(code: String, message: String, underlying: NSError?)
  }

  private let sessionId: String
  private let region: String
  private let identityPoolId: String
  private let onFinish: (Outcome) -> Void

  private var hostingController: UIHostingController<FaceLivenessHostView>?
  private var finished = false

  init(
    sessionId: String,
    region: String,
    identityPoolId: String,
    onFinish: @escaping (Outcome) -> Void
  ) {
    self.sessionId = sessionId
    self.region = region
    self.identityPoolId = identityPoolId
    self.onFinish = onFinish
    super.init(nibName: nil, bundle: nil)
  }

  @available(*, unavailable)
  required init?(coder: NSCoder) {
    fatalError("init(coder:) has not been implemented")
  }

  override func viewDidLoad() {
    super.viewDidLoad()
    view.backgroundColor = .black

    // ✅ Use AWS built-in provider (NO custom class)
    let provider = AWSCognitoCredentialsProvider(
      regionType: AWSRegionMapper.regionType(from: region),
      identityPoolId: identityPoolId
    )

    let root = FaceLivenessHostView(
      sessionId: sessionId,
      region: region,
      credentialsProvider: provider,
      onOutcome: { [weak self] outcome in
        self?.finish(outcome)
      }
    )

    let host = UIHostingController(rootView: root)
    host.view.backgroundColor = .clear

    addChild(host)
    view.addSubview(host.view)

    host.view.translatesAutoresizingMaskIntoConstraints = false
    NSLayoutConstraint.activate([
      host.view.leadingAnchor.constraint(equalTo: view.leadingAnchor),
      host.view.trailingAnchor.constraint(equalTo: view.trailingAnchor),
      host.view.topAnchor.constraint(equalTo: view.topAnchor),
      host.view.bottomAnchor.constraint(equalTo: view.bottomAnchor),
    ])

    host.didMove(toParent: self)
    hostingController = host
  }

  private func finish(_ outcome: Outcome) {
    DispatchQueue.main.async {
      guard !self.finished else { return }
      self.finished = true

      let performDismissal = {
        self.dismiss(animated: true) {
          self.onFinish(outcome)
        }
      }

      if self.isBeingPresented {
        // Defer dismissal if presentation is still in progress (iOS 18 transition safety)
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
          performDismissal()
        }
      } else {
        performDismissal()
      }
    }
  }
}

private struct FaceLivenessHostView: View {

  let sessionId: String
  let region: String
  let credentialsProvider: AWSCognitoCredentialsProvider
  let onOutcome: (FaceLivenessViewController.Outcome) -> Void

  @State private var isPresented: Bool = true

  var body: some View {
    ZStack(alignment: .topTrailing) {
#if canImport(FaceLiveness)
    let livenessCreds = LivenessCredentialsProvider(awsCognitoProvider: credentialsProvider)
    FaceLivenessDetectorView(
      sessionID: sessionId,
      credentialsProvider: livenessCreds,
      region: "ap-south-1",
      isPresented: $isPresented,
      onCompletion: { result in
        switch result {
        case .success:
          onOutcome(.success)

        case .failure(let error):
          onOutcome(
            .failure(
              code: "E_LIVENESS_FAILED",
              message: error.localizedDescription,
              underlying: error as NSError
            )
          )

        default:
          onOutcome(.cancelled(message: "User cancelled"))
        }
      }
    )
    .onChange(of: isPresented) { presented in
      if !presented {
        onOutcome(.cancelled(message: "User cancelled"))
      }
    }
#else
    Text("Missing FaceLiveness SDK (SPM).")
      .foregroundColor(.white)
      .onAppear {
        onOutcome(
          .failure(
            code: "E_SDK_MISSING",
            message: "FaceLiveness Swift Package not found. Add https://github.com/aws-amplify/amplify-ui-swift-liveness (product: FaceLiveness) to the Xcode project.",
            underlying: nil
          )
        )
      }
#endif

      // Close Button
      Button(action: {
        onOutcome(.cancelled(message: "User cancelled"))
      }) {
        Image(systemName: "xmark")
          .font(.system(size: 16, weight: .bold))
          .foregroundColor(.white)
          .padding(12)
          .background(Color.black.opacity(0.5))
          .clipShape(Circle())
      }
      .padding(.top, 16)
      .padding(.trailing, 16)
    }
  }
}

#if canImport(FaceLiveness)
/// Adapter that provides `AWSPluginsCore.AWSTemporaryCredentials` to the Face Liveness UI,
/// backed by a Cognito Identity Pool.
private final class LivenessCredentialsProvider: AWSPluginsCore.AWSCredentialsProvider {
  private let awsCognitoProvider: AWSCognitoCredentialsProvider

  init(awsCognitoProvider: AWSCognitoCredentialsProvider) {
    self.awsCognitoProvider = awsCognitoProvider
  }

  func fetchAWSCredentials() async throws -> AWSPluginsCore.AWSCredentials {
    try await withCheckedThrowingContinuation { continuation in
      awsCognitoProvider.credentials().continueWith { task -> Any? in
        // ✅ Ensure all mapping and continuation resumption happens on the main thread.
        // This is critical for iOS 18 / iPhone 16 Pro Max to prevent background thread
        // camera session initialization and SwiftUI layout updates.
        DispatchQueue.main.async {
          if let error = task.error as NSError? {
            continuation.resume(throwing: error)
            return
          }
          guard let creds = task.result else {
            continuation.resume(
              throwing: NSError(
                domain: "FaceLiveness",
                code: -1,
                userInfo: [NSLocalizedDescriptionKey: "Failed to obtain AWS credentials"]
              )
            )
            return
          }

          let mapped = TemporaryCredentials(
            accessKeyId: creds.accessKey ?? "",
            secretAccessKey: creds.secretKey ?? "",
            sessionToken: creds.sessionKey ?? "",
            expiration: creds.expiration ?? Date().addingTimeInterval(55 * 60)
          )

          guard !mapped.accessKeyId.isEmpty,
                !mapped.secretAccessKey.isEmpty,
                !mapped.sessionToken.isEmpty else {
            continuation.resume(
              throwing: NSError(
                domain: "FaceLiveness",
                code: -2,
                userInfo: [NSLocalizedDescriptionKey: "Invalid AWS credentials received from Cognito"]
              )
            )
            return
          }

          continuation.resume(returning: mapped)
        }
        return nil
      }
    }
  }
}

private struct TemporaryCredentials: AWSPluginsCore.AWSTemporaryCredentials {
  let accessKeyId: String
  let secretAccessKey: String
  let sessionToken: String
  let expiration: Date
}
#endif

private enum AWSRegionMapper {
  static func regionType(from regionName: String) -> AWSRegionType {
    switch regionName.lowercased() {
    case "us-east-1": return .USEast1
    case "us-east-2": return .USEast2
    case "us-west-1": return .USWest1
    case "us-west-2": return .USWest2
    case "eu-west-1": return .EUWest1
    case "eu-west-2": return .EUWest2
    case "eu-west-3": return .EUWest3
    case "eu-central-1": return .EUCentral1
    case "eu-north-1": return .EUNorth1
    case "ap-south-1": return .APSouth1
    case "ap-southeast-1": return .APSoutheast1
    case "ap-southeast-2": return .APSoutheast2
    case "ap-northeast-1": return .APNortheast1
    case "ap-northeast-2": return .APNortheast2
    case "ca-central-1": return .CACentral1
    case "sa-east-1": return .SAEast1
    default:
      return .APSouth1
    }
  }
}
