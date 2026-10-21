import React from "react";
import { StyleSheet, View } from "react-native";
import metrics from "../../../../assets/Metrics";
import { colors } from "../../../../theme/colors";
import PortraitAvatar from "../../../../common/PortraitAvatar";
import PulsingCircle from "../../../../common/PulsingCircle";
import { dummyfemaleProfile, dummyMaleProfile } from "../../../../helper/ImageAssets";

/** Shown while the feed has no profiles yet: the user's own photo with a radar pulse. */
const FeedEmptyState = ({ userData }: { userData: any }) => {
  const photoUrl: string | undefined = userData?.gallery?.[0]?.url;
  const source = photoUrl ? { uri: photoUrl } : userData?.gender === "male" ? dummyMaleProfile : dummyfemaleProfile;

  return (
    <View style={styles.container}>
      <PulsingCircle
        size={metrics.hp15}
        color="#F69E8250"
        fillColor="#F69E8225"
        ringWidth={metrics.hp0_1}
      />
      <View style={styles.avatarRing}>
        <PortraitAvatar source={source} style={styles.avatar} />
      </View>
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
});
