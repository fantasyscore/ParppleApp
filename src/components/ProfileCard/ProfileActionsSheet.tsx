import React, { forwardRef, useCallback, useImperativeHandle, useRef, useState } from "react";
import { Dimensions, Modal, StyleSheet, View } from "react-native";
import RBSheet from "react-native-raw-bottom-sheet";
import FastImage from "react-native-fast-image";
import { useDispatch } from "react-redux";
import metrics from "../../assets/Metrics";
import { colors } from "../../theme/colors";
import { Screen } from "../../theme/dimens";
import { AppText, BLACK, FORTEEN, INTER_MEDIUM, INTER_SEMI_BOLD, OPECITY, SCHEHERAZADE_BOLD, TEN, TWELVE, TWENTY_FOUR, WHITE } from "../../common/AppText";
import { TouchableOpacityView } from "../../common/TouchableOpacityView";
import { threeDotDataHome } from "../../common/UiltData";
import { blockModalImage } from "../../helper/ImageAssets";
import NavigationService from "../../navigation/NavigationService";
import { NAVIGATION_REPORT_SCREEN } from "../../navigation/routes";
import { blockByIdAPIUser } from "../../actions/authActions";

export interface ProfileActionsSheetProps {
  /** Called after the profile was blocked, so the screen can drop it from its list */
  onBlocked?: (profile: any) => void;
}

export interface ProfileActionsSheetHandle {
  open: (profile: any) => void;
}

const REPORT_INDEX = 0;
const BLOCK_INDEX = 1;

/** Report / block actions for a profile: a bottom sheet plus the block confirmation dialog. */
const ProfileActionsSheet = forwardRef<ProfileActionsSheetHandle, ProfileActionsSheetProps>(({ onBlocked }, ref) => {
  const dispatch = useDispatch();
  const sheetRef = useRef<any>(null);
  const [profile, setProfile] = useState<any>({});
  const [confirmBlockVisible, setConfirmBlockVisible] = useState(false);

  useImperativeHandle(ref, () => ({
    open: (target: any) => {
      setProfile(target);
      sheetRef.current?.open();
    },
  }));

  const onActionPress = useCallback(
    (index: number) => {
      sheetRef.current?.close();
      if (index === REPORT_INDEX) {
        // returnToOrigin: after the report is submitted, come back to this screen instead of going to Chats
        NavigationService.navigate(NAVIGATION_REPORT_SCREEN, { reportedUserId: profile?.userId, returnToOrigin: true });
      } else if (index === BLOCK_INDEX) {
        setConfirmBlockVisible(true);
      }
    },
    [profile?.userId]
  );

  const confirmBlock = useCallback(async () => {
    setConfirmBlockVisible(false);
    // Stay on the current screen (no jump to Chats) and remove the profile from its list
    const blocked = await dispatch(blockByIdAPIUser({ blockedId: profile?.userId }, { navigateToChats: false }));
    if (blocked) onBlocked?.(profile);
  }, [dispatch, profile, onBlocked]);

  const profileName = profile?.username ? profile.username : profile?.name;

  return (
    <>
      <RBSheet
        ref={sheetRef}
        openDuration={100}
        height={Dimensions.get("window").height / 4.1}
        customStyles={{
          wrapper: { backgroundColor: "#00000020" },
          container: {
            backgroundColor: "#151517",
            borderTopLeftRadius: metrics.hp2,
            borderTopRightRadius: metrics.hp2,
          },
        }}
      >
        <View style={styles.sheetContent}>
          {threeDotDataHome?.map((action, index) => (
            <TouchableOpacityView onPress={() => onActionPress(index)} key={index} style={styles.actionRow}>
              <FastImage source={action.icon} resizeMode="contain" style={styles.actionIcon} />
              <View style={styles.actionText}>
                <AppText type={FORTEEN} weight={INTER_SEMI_BOLD} color={WHITE}>
                  {action.headLine}{" "}{profileName}
                </AppText>
                <AppText type={TEN} weight={INTER_MEDIUM} color={WHITE}>
                  {action.disLine}
                </AppText>
              </View>
            </TouchableOpacityView>
          ))}
        </View>
      </RBSheet>

      <Modal
        animationType="fade"
        transparent
        visible={confirmBlockVisible}
        onRequestClose={() => setConfirmBlockVisible(false)}
      >
        <View style={styles.dialogBackdrop}>
          <View style={styles.dialog}>
            <FastImage source={blockModalImage} resizeMode="stretch" style={styles.dialogImage} />
            <AppText style={styles.dialogTitle} type={TWENTY_FOUR} weight={SCHEHERAZADE_BOLD} color={WHITE}>
              Block {profile?.name}?
            </AppText>
            <AppText style={styles.dialogMessage} type={TWELVE} weight={INTER_MEDIUM} color={OPECITY}>
              You won’t be able to undo this. You sure{"\n"} to continue?
            </AppText>
            <TouchableOpacityView onPress={confirmBlock} style={styles.dialogConfirm}>
              <AppText color={BLACK} weight={INTER_SEMI_BOLD} type={TWELVE}>
                Yes, Block
              </AppText>
            </TouchableOpacityView>
            <AppText
              onPress={() => setConfirmBlockVisible(false)}
              weight={INTER_SEMI_BOLD}
              type={TWELVE}
              style={styles.dialogCancel}
              color={WHITE}
            >
              No, cancel
            </AppText>
          </View>
        </View>
      </Modal>
    </>
  );
});

ProfileActionsSheet.displayName = "ProfileActionsSheet";

export default ProfileActionsSheet;

const styles = StyleSheet.create({
  sheetContent: {
    paddingHorizontal: metrics.hp2,
    paddingVertical: metrics.hp2,
  },
  actionRow: {
    paddingHorizontal: metrics.hp1,
    paddingVertical: metrics.hp2,
    flexDirection: "row",
    backgroundColor: "#212123",
    marginBottom: metrics.hp0_5,
    borderRadius: metrics.hp1_5,
  },
  actionIcon: {
    height: metrics.hp2_5,
    width: metrics.hp2_5,
    marginTop: metrics.hp0_5,
    marginLeft: metrics.hp1,
  },
  actionText: {
    paddingLeft: metrics.hp2,
    paddingRight: metrics.hp5,
  },
  dialogBackdrop: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.transparentBlack,
    paddingHorizontal: metrics.hp2,
  },
  dialog: {
    height: metrics.hp42,
    backgroundColor: "#212123",
    width: Screen.Width / 1.2,
    borderRadius: metrics.hp2,
  },
  dialogImage: {
    height: metrics.hp18,
    borderTopRightRadius: metrics.hp2,
    borderTopLeftRadius: metrics.hp2,
  },
  dialogTitle: {
    textAlign: "center",
  },
  dialogMessage: {
    marginTop: -metrics.hp2,
    textAlign: "center",
  },
  dialogConfirm: {
    height: metrics.hp5,
    borderWidth: 1,
    borderColor: "#E6B7A810",
    borderRadius: metrics.hp4,
    alignItems: "center",
    justifyContent: "center",
    width: "40%",
    alignSelf: "center",
    backgroundColor: "#E6B7A8",
    marginTop: metrics.hp2,
  },
  dialogCancel: {
    textAlign: "center",
    marginTop: metrics.hp2,
  },
});
