import React from "react";
import { ImageBackground, StyleSheet, View } from "react-native";
import FastImage from "react-native-fast-image";
import metrics from "../../../../assets/Metrics";
import { AppSafeAreaView } from "../../../../common/AppSafeAreaView";
import { AppText, SCHEHERAZADE_BOLD, SIXTEEN, TWENTY, WHITE } from "../../../../common/AppText";
import NewHeader from "../../../../common/NewHeader";
import PortraitAvatar from "../../../../common/PortraitAvatar";
import { TouchableOpacityView } from "../../../../common/TouchableOpacityView";
import NavigationService from "../../../../navigation/NavigationService";
import { NAVIGATION_EDIT_PROFILE_SCREEN, NAVIGATION_SETTING_SCREEN } from "../../../../navigation/routes";
import { capitalizeFirstLetter } from "../../../../utils/profile";
import {
  dobIcon,
  dummyfemaleProfile,
  dummyMaleProfile,
  editButtonBackground,
  heightIconWhiteNew,
  locationIconWhiteNew,
  pronounIcon,
  sexualityIcon,
  verifiedBadgeIcon,
} from "../../../../helper/ImageAssets";
import InfoChip from "./InfoChip";

const AVATAR_AREA = metrics.hp12;

interface ProfileHeaderProps {
  userData: any;
  /** The profile is currently hidden (the publish button offers to publish it) */
  isHidden: boolean;
  onVerificationPress: () => void;
}

/** Top of the profile screen: nav bar, avatar + name, info chips and the Edit Profile button. */
const ProfileHeader = ({ userData, isHidden, onVerificationPress }: ProfileHeaderProps) => {
  const avatarUrl: string | undefined = userData?.gallery?.[0]?.url;
  const heightChip = <InfoChip icon={heightIconWhiteNew} text={`${userData?.height || ""} ft`} />;

  return (
    <AppSafeAreaView color="transparent" style={styles.safeArea}>
      <NewHeader
        profile={"Profile"}
        onPress={() => NavigationService.goBack()}
        onPressTwo={() => NavigationService.navigate(NAVIGATION_SETTING_SCREEN)}
        isPublishButton={isHidden}
        onVerificationPress={onVerificationPress}
      />
      <View style={styles.identityRow}>
        <TouchableOpacityView activeOpacity={1} style={styles.avatarArea}>
          <PortraitAvatar
            source={avatarUrl ? { uri: avatarUrl } : userData?.gender === "male" ? dummyMaleProfile : dummyfemaleProfile}
            style={styles.avatar}
          />
          {userData?.faceVerified ? (
            <FastImage source={verifiedBadgeIcon} resizeMode="contain" style={styles.verifiedBadge} />
          ) : null}
        </TouchableOpacityView>
        <AppText type={TWENTY} weight={SCHEHERAZADE_BOLD} style={styles.username}>
          {" "}{userData?.username}
        </AppText>
      </View>

      <View style={styles.chips}>
        <View style={styles.chipRow}>
          <InfoChip icon={pronounIcon} text={capitalizeFirstLetter(userData?.gender)} />
          {userData?.sexualOrientation ? (
            <InfoChip icon={sexualityIcon} text={capitalizeFirstLetter(userData.sexualOrientation)} />
          ) : null}
          <InfoChip icon={dobIcon} text={`${userData?.age} years`} />
          {userData?.sexualOrientation ? null : heightChip}
        </View>
        <View style={[styles.chipRow, styles.secondChipRow]}>
          {userData?.sexualOrientation ? heightChip : null}
          {userData?.city ? <InfoChip icon={locationIconWhiteNew} text={capitalizeFirstLetter(userData.city)} /> : null}
        </View>
      </View>

      <TouchableOpacityView onPress={() => NavigationService.navigate(NAVIGATION_EDIT_PROFILE_SCREEN)}>
        <ImageBackground source={editButtonBackground} resizeMode="stretch" style={styles.editButton}>
          <AppText type={SIXTEEN} weight={SCHEHERAZADE_BOLD} color={WHITE}>
            Edit Profile{"   "}
          </AppText>
        </ImageBackground>
      </TouchableOpacityView>
    </AppSafeAreaView>
  );
};

export default ProfileHeader;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "transparent",
  },
  identityRow: {
    marginTop: metrics.hp2,
    paddingHorizontal: metrics.hp2,
    flexDirection: "row",
    alignItems: "center",
  },
  avatarArea: {
    width: AVATAR_AREA,
    height: AVATAR_AREA,
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: {
    position: "absolute",
    height: metrics.hp10,
    width: metrics.hp10,
    borderRadius: metrics.hp50,
    borderWidth: metrics.hp0_2,
    borderColor: "#E6B7A8",
  },
  verifiedBadge: {
    height: metrics.hp4,
    width: metrics.hp4,
    position: "absolute",
    right: metrics.hp0_5,
    top: metrics.hp1,
  },
  username: {
    color: "#E6B7A8",
  },
  chips: {
    paddingHorizontal: metrics.hp2,
  },
  chipRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: metrics.hp2,
  },
  secondChipRow: {
    marginTop: metrics.hp1,
  },
  editButton: {
    height: metrics.hp6,
    width: "95%",
    alignSelf: "center",
    marginLeft: metrics.hp2,
    marginTop: metrics.hp2,
    alignItems: "center",
    justifyContent: "center",
  },
});
