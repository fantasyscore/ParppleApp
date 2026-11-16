import React from "react";
import { StyleSheet, View } from "react-native";
import metrics from "../../../../assets/Metrics";
import { colors } from "../../../../theme/colors";
import PortraitAvatar from "../../../../common/PortraitAvatar";
import PulsingCircle from "../../../../common/PulsingCircle";
import { AppText, INTER_SEMI_BOLD, SIXTEEN, WHITE } from "../../../../common/AppText";
import { dummyfemaleProfile, dummyMaleProfile } from "../../../../helper/ImageAssets";

type Props = {
  userData: any;
  /** A request is running: only the pulse. Once it has ended the title is shown under it. */
  searching: boolean;
  title?: string;
};

/**
 * The feed has no profiles to show: the user's own photo with a radar pulse (always), plus a short title once the
 * request has ended. Pull down on the list to load again.
 */
const FeedEmptyState = ({ userData, searching, title = "No profiles yet" }: Props) => {
  const photoUrl: string | undefined = userData?.gallery?.[0]?.url;
  const source = photoUrl ? { uri: photoUrl } : userData?.gender === "male" ? dummyMaleProfile : dummyfemaleProfile;

  return (
    <View style={styles.container}>
      <View style={styles.avatarArea}>
        <PulsingCircle size={metrics.hp15} color="#F69E8250" fillColor="#F69E8225" ringWidth={metrics.hp0_1} />
        <View style={styles.avatarRing}>
          <PortraitAvatar source={source} style={styles.avatar} />
        </View>
      </View>
      {!searching && (
        <View style={styles.messageBox}>
          <AppText type={SIXTEEN} weight={INTER_SEMI_BOLD} color={WHITE} style={styles.centerText}>
            {title}
          </AppText>
        </View>
      )}
    </View>
  );
};

export default FeedEmptyState;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: metrics.hp10,
  },
  avatarArea: {
    alignItems: "center",
    justifyContent: "center",
  },
  avatarRing: {
    height: metrics.hp15,
    width: metrics.hp15,
    borderRadius: metrics.hp50,
    borderWidth: metrics.hp0_3,
    borderColor: "#F69E8250",
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: {
    height: metrics.hp14,
    width: metrics.hp14,
    borderRadius: metrics.hp50,
    borderWidth: metrics.hp0_1,
    borderColor: colors.white,
  },
  messageBox: {
    alignItems: "center",
    marginTop: metrics.hp4,
    paddingHorizontal: metrics.hp4,
  },
  centerText: {
    textAlign: "center",
  },
});
