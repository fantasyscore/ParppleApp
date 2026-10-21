//
// Copyright Amazon.com Inc. or its affiliates.
// All Rights Reserved.
//
// SPDX-License-Identifier: Apache-2.0
//

import SwiftUI

struct WarningBox<PopoverView: View>: View {
    @State var isPresentingPopover = false
    let titleText: String
    let bodyText: String
    let popoverContent: PopoverView

    init(
        titleText: String,
        bodyText: String,
        @ViewBuilder popoverContent: () -> PopoverView
    ) {
        self.titleText = titleText
        self.bodyText = bodyText
        self.popoverContent = popoverContent()
    }

    var body: some View {
        HStack {
            VStack(alignment: .leading) {
                // PARPPLE: compact warning (smaller text and padding) so it does not cover the camera preview
                Text(titleText)
                    .font(.system(size: 12, weight: .semibold))
                    .foregroundColor(.livenessWarningLabel)

                Text(bodyText)
                    .font(.system(size: 11))
                    .foregroundColor(.livenessWarningLabel)
            }
            Spacer()
            Button(
                action: { isPresentingPopover = true },
                label: {
                    Image(systemName: "info.circle")
                        .foregroundColor(.livenessWarningLabel)
                        .frame(width: 16, height: 16)
                }
            )
            .frame(width: 28, height: 28)
            .popover(
                isPresented: $isPresentingPopover,
                attachmentAnchor: .point(.top),
                arrowEdge: .bottom,
                content: {  popoverContent }
            )
        }
        .padding(.horizontal, 10)
        .padding(.vertical, 4)
        .background(
            Rectangle()
                .foregroundColor(.livenessWarningBackground)
                .cornerRadius(6)
        )
    }
}
