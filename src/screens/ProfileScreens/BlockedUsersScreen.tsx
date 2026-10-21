import React, { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, ImageBackground, Modal, StyleSheet, View } from "react-native";
import FastImage from "react-native-fast-image";
import { useDispatch, useSelector } from "react-redux";
import { AppSafeAreaView } from "../../common/AppSafeAreaView";
import NewHeader from "../../common/NewHeader";
import PortraitAvatar from "../../common/PortraitAvatar";
import { TouchableOpacityView } from "../../common/TouchableOpacityView";
import { AppText, BLACK, INTER_MEDIUM, INTER_SEMI_BOLD, INTER_BOLD, OPECITY, OPECITY_DARK, SCHEHERAZADE_BOLD, SIXTEEN, TWELVE, TWENTY, WHITE } from "../../common/AppText";
import metrics from "../../assets/Metrics";
import { colors, newColor } from "../../theme/colors";
import { blackIcon, ChatSearchIcon, dummyfemaleProfile, dummyMaleProfile, locIcon } from "../../helper/ImageAssets";
import NavigationService from "../../navigation/NavigationService";
import { unblockUserAPI } from "../../actions/authActions";
import { blockedUserIdOf } from "../../slices/loginServices/authSlice";
import { capitalizeFirstLetter } from "../../utils/profile";

const MAX_NAME_LENGTH = 14;
/** Long names are cut so the age after them always stays visible */
const shortName = (name: string) => (name.length > MAX_NAME_LENGTH ? `${name.substring(0, MAX_NAME_LENGTH)}` : name);

const avatarOf = (item: any) => {
  const url = item?.profilePicture?.url ?? item?.profilePicture?.[0]?.url ?? item?.gallery?.[0]?.url;
  if (url) return { uri: url };
  return item?.gender === "male" ? dummyMaleProfile : dummyfemaleProfile;
};

/** Settings → Blocked Users: everyone you blocked, with an Unblock button that updates the list at once. */
const BlockedUsersScreen = () => {
  const dispatch = useDispatch();
  // The list lives in the store (auth.blockedUsers); undefined means it has not loaded yet
  const users: any[] | undefined = useSelector((state: any) => state.auth.blockedUsers);
  // The user the confirmation dialog is asking about (null = dialog closed)
  const [confirmUser, setConfirmUser] = useState<any>(null);

  // The list is loaded by the Settings screen before this page opens (see SettingScreen), so it is already here

  const unblock = useCallback((user: any) => dispatch(unblockUserAPI(user)), [dispatch]);

  const renderUser = ({ item }: { item: any }) => (
    <ImageBackground source={ChatSearchIcon} resizeMode="stretch" style={styles.card}>
      <PortraitAvatar source={avatarOf(item)} style={styles.avatar} />
      <View style={styles.nameBox}>
        {/* Same line as a Home card: "name, 25 y" in the peach name colour, then the city */}
        <AppText type={SIXTEEN} weight={SCHEHERAZADE_BOLD} numberOfLines={1} style={styles.name}>
          {shortName(String(item?.username || item?.name || "User"))}
          {item?.age ? `, ${item.age} y` : ""}
        </AppText>
        {item?.city ? (
          <View style={styles.cityRow}>
            <FastImage source={locIcon} resizeMode="contain" tintColor={colors.white} style={styles.cityIcon} />
            <AppText type={TWELVE} weight={INTER_SEMI_BOLD} color={WHITE} numberOfLines={1} style={styles.cityText}>
              {" "}{capitalizeFirstLetter(item.city)}
            </AppText>
          </View>
        ) : null}
      </View>
      <TouchableOpacityView onPress={() => setConfirmUser(item)} style={styles.unblockButton}>
        <AppText type={TWELVE} weight={SCHEHERAZADE_BOLD} color={BLACK}>
          Unblock
        </AppText>
      </TouchableOpacityView>
    </ImageBackground>
  );

  return (
    <AppSafeAreaView color={newColor.blackNew}>
      <NewHeader title="Blocked Users" onPress={() => NavigationService.goBack()} />
      {users === undefined ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.white} />
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item, index) => blockedUserIdOf(item) || String(index)}
          renderItem={renderUser}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.center}>
              <FastImage source={blackIcon} resizeMode="contain" style={{height: metrics.hp6, width: metrics.hp6, marginBottom:metrics.hp2}} tintColor={colors.white}/>
              <AppText type={TWELVE} weight={INTER_MEDIUM} color={OPECITY}>
                You haven't blocked anyone.
              </AppText>
            </View>
          }
        />
      )}

      <Modal animationType="fade" transparent statusBarTranslucent visible={!!confirmUser} onRequestClose={() => setConfirmUser(null)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <AppText type={TWENTY} weight={SCHEHERAZADE_BOLD} color={WHITE} style={styles.modalText}>
              Unblock {confirmUser ? shortName(String(confirmUser?.username || confirmUser?.name || "this user")) : ""}?
            </AppText>
            <AppText type={TWELVE} weight={INTER_MEDIUM} color={OPECITY_DARK} style={[styles.modalText, styles.modalMessage]}>
              They will be able to see your profile and find you on Parpple again.
            </AppText>
            <View style={styles.modalButtons}>
              <TouchableOpacityView onPress={() => setConfirmUser(null)} style={[styles.modalButton, styles.modalCancel]}>
                <AppText type={TWELVE} weight={INTER_BOLD} color={WHITE}>
                  Cancel
                </AppText>
              </TouchableOpacityView>
              <TouchableOpacityView
                onPress={() => {
                  const user = confirmUser;
                  setConfirmUser(null);
                  if (user) unblock(user);
                }}
                style={[styles.modalButton, styles.modalConfirm]}
              >
                <AppText type={TWELVE} weight={INTER_BOLD} color={BLACK}>
                  Yes, Unblock
                </AppText>
              </TouchableOpacityView>
            </View>
          </View>
        </View>
      </Modal>
    </AppSafeAreaView>
  );
};

export default BlockedUsersScreen;

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: metrics.hp2,
    paddingTop: metrics.hp2,
    paddingBottom: metrics.hp10,
    flexGrow: 1,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: metrics.hp10,
  },
  card: {
    height: metrics.hp10,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: metrics.hp1_5,
  },
  avatar: {
    height: metrics.hp6,
    width: metrics.hp6,
    borderRadius: metrics.hp3,
    marginLeft: metrics.hp2,
  },
  nameBox: {
    flex: 1,
    marginHorizontal: metrics.hp1_5,
  },
  name: {
    color: "#E6B7A8",
     marginTop: -metrics.hp0_5,
  },
  cityRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: -metrics.hp0_5,
  },
  cityIcon: {
    height: metrics.hp2,
    width: metrics.hp2,
    marginLeft: -metrics.hp0_3,
  },
  cityText: {
    flexShrink: 1,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "#000000B3",
    justifyContent: "center",
    paddingHorizontal: metrics.hp2,
  },
  modalCard: {
    backgroundColor: "#151517",
    borderRadius: metrics.hp2,
    padding: metrics.hp3,
    borderWidth: metrics.hp0_1,
    borderColor: "#E6B7A8",
  },
  modalText: {
    textAlign: "center",
  },
  modalMessage: {
    marginTop: metrics.hp1,
  },
  modalButtons: {
    flexDirection: "row",
    gap: metrics.hp1_5,
    marginTop: metrics.hp3,
  },
  modalButton: {
    flex: 1,
    height: metrics.hp6,
    alignItems: "center",
    justifyContent: "center",
  },
  modalCancel: {
    borderWidth: metrics.hp0_1,
    borderColor: "#E6B7A8",
  },
  modalConfirm: {
    backgroundColor: "#E6B7A8",
  },
  unblockButton: {
    height: metrics.hp4_5,
    paddingHorizontal: metrics.hp2,
    backgroundColor: "#E6B7A8",
    alignItems: "center",
    justifyContent: "center",
    marginRight: metrics.hp2,
  },
});
