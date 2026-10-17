import React, { useCallback, useState } from "react";
import { ImageBackground, StyleSheet } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { useIsFocused } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { AppSafeAreaView } from "../../common/AppSafeAreaView";
import { AppText, BLACK, EIGHTEEN, FORTEEN, SCHEHERAZADE_BOLD, TWELVE, WHITE } from "../../common/AppText";
import { TouchableOpacityView } from "../../common/TouchableOpacityView";
import metrics from "../../assets/Metrics";
import { colors } from "../../theme/colors";
import { bioBackground, biosToggla, BottomLayer, ProfileBackGroundNew } from "../../helper/ImageAssets";
import { editProfile } from "../../actions/authActions";
import PhotoEditorModal from "../../components/PhotoEditor/PhotoEditorModal";
import { useFaceVerification } from "../../hooks/useFaceVerification";
import ProfileHeader from "./profile/components/ProfileHeader";
import ProfileTabs, { ProfileTab } from "./profile/components/ProfileTabs";
import ProfilePhotosTab from "./profile/components/ProfilePhotosTab";
import TurnOnTab from "./profile/components/TurnOnTab";
import EditBioModal from "./profile/components/EditBioModal";
import ProfileVerifyModal from "./profile/components/ProfileVerifyModal";
import { usePublishToggle } from "./profile/hooks/usePublishToggle";
import { useProfilePhotos } from "./profile/hooks/useProfilePhotos";
import { useTurnOnSelection } from "./profile/hooks/useTurnOnSelection";

const BIO_PLACEHOLDER = "Write something about yourself...";

const ProfileScreenAndroid = () => {
  const dispatch = useDispatch();
  const isFocused = useIsFocused();
  const userData = useSelector((state: any) => state.auth.userData);
  const turnOnData = useSelector((state: any) => state?.auth?.turnOnData);

  const [selectedTab, setSelectedTab] = useState<ProfileTab>("My Bio");
  const [bioModalVisible, setBioModalVisible] = useState(false);
  const [verifyVisible, setVerifyVisible] = useState(false);

  const publish = usePublishToggle(userData);
  const photos = useProfilePhotos(userData?.gallery);
  const turnOns = useTurnOnSelection(userData?.turnOns, isFocused);
  const faceVerification = useFaceVerification();
  const { reset: resetFaceVerification } = faceVerification;

  const openVerify = useCallback(() => {
    resetFaceVerification();
    setVerifyVisible(true);
  }, [resetFaceVerification]);

  const saveBio = (bio: string) => {
    dispatch(editProfile({ bio }, false));
    setBioModalVisible(false);
  };

  return (
    <AppSafeAreaView color={colors.transparent}>
      <LinearGradient style={styles.gradient} colors={["#212123", "#555359"]}>
        <ImageBackground source={ProfileBackGroundNew} resizeMode="cover" style={styles.header}>
          <ProfileHeader userData={userData} isHidden={publish.isHidden} onVerificationPress={openVerify} />
          <ProfileTabs selected={selectedTab} onSelect={setSelectedTab} />
        </ImageBackground>

        {selectedTab === "My Bio" && (
          <TouchableOpacityView activeOpacity={0.9} onPress={() => setBioModalVisible(true)}>
            <ImageBackground source={bioBackground} resizeMode="stretch" style={styles.bioCard}>
              <ImageBackground source={biosToggla} resizeMode="contain" style={styles.bioTag}>
                <AppText style={styles.bioTagText} type={FORTEEN} weight={SCHEHERAZADE_BOLD} color={WHITE}>
                  " My bio
                </AppText>
              </ImageBackground>
              <AppText style={styles.bioText} type={TWELVE} weight={SCHEHERAZADE_BOLD} color={WHITE}>
                {userData?.bio ? userData.bio : BIO_PLACEHOLDER}
              </AppText>
            </ImageBackground>
          </TouchableOpacityView>
        )}
        {selectedTab === "Photos" && (
          <ProfilePhotosTab
            photos={photos.photos}
            canAddMore={photos.canAddMore}
            onUpload={() => photos.pickAndEdit()}
            onDelete={photos.deletePhoto}
          />
        )}
        {selectedTab === "Turn On" && (
          <TurnOnTab turnOns={turnOnData} selectedIds={turnOns.selectedIds} onToggle={turnOns.toggle} />
        )}
      </LinearGradient>

      <ImageBackground source={BottomLayer} resizeMode="stretch" style={styles.bottomLayer}>
        <TouchableOpacityView style={styles.publishTouchable} onPress={publish.onPress}>
          <LinearGradient
            colors={publish.isHidden ? ["#D08FA9", "#FDD2C1"] : ["#151517", "#151517"]}
            style={[styles.publishButton, !publish.isHidden && styles.hideButtonBorder]}
          >
            <AppText type={EIGHTEEN} weight={SCHEHERAZADE_BOLD} color={publish.isHidden ? BLACK : WHITE}>
              {publish.isHidden ? "Publish Profile" : "Hide Profile"}
            </AppText>
          </LinearGradient>
        </TouchableOpacityView>
      </ImageBackground>

      <ProfileVerifyModal
        visible={verifyVisible}
        stage={faceVerification.stage}
        error={faceVerification.error}
        onStart={faceVerification.start}
        onClose={() => setVerifyVisible(false)}
      />
      <EditBioModal
        visible={bioModalVisible}
        initialBio={userData?.bio || ""}
        onClose={() => setBioModalVisible(false)}
        onSave={saveBio}
      />
      {photos.editorVisible && <PhotoEditorModal {...photos.editorProps} />}
    </AppSafeAreaView>
  );
};

export default ProfileScreenAndroid;

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  header: {
    height: metrics.hp47,
    marginBottom: metrics.hp4,
    position: "relative",
    zIndex: 1,
    overflow: "visible",
  },
  bioCard: {
    marginTop: metrics.hp6,
    marginHorizontal: metrics.hp2,
  },
  bioTag: {
    height: metrics.hp4,
    width: metrics.hp13,
    alignSelf: "center",
    marginTop: -metrics.hp2,
  },
  bioTagText: {
    textAlign: "center",
  },
  bioText: {
    marginHorizontal: metrics.hp2,
    textAlign: "center",
    marginVertical: metrics.hp1,
    lineHeight: metrics.hp2,
    marginBottom: metrics.hp3,
  },
  bottomLayer: {
    width: "100%",
    paddingVertical: metrics.hp2,
    alignItems: "center",
    backgroundColor: "#555359",
  },
  publishTouchable: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  publishButton: {
    height: metrics.hp7,
    width: "90%",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 0,
    borderColor: colors.transparent,
  },
  hideButtonBorder: {
    borderWidth: metrics.hp0_1,
    borderColor: colors.white,
  },
});
