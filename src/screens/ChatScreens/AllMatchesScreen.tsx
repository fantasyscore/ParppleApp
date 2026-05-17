import React, { useCallback, useMemo, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import FastImage from "react-native-fast-image";
import { useDispatch, useSelector } from "react-redux";
import { AppSafeAreaView } from "../../common/AppSafeAreaView";
import { TouchableOpacityView } from "../../common/TouchableOpacityView";
import SearchContainer from "../../common/SearchContainer";
import { AppText, BLACK, FORTEEN, INTER_BOLD, INTER_REGULAR, INTER_SEMI_BOLD, LIGHT_BLACK, OPECITY_DARK, SIXTEEN, TWELVE } from "../../common/AppText";
import metrics from "../../assets/Metrics";
import { colors } from "../../theme/colors";
import { backIcon, blueTikeIcon, reversIcoin } from "../../helper/ImageAssets";
import NavigationService from "../../navigation/NavigationService";
import { NAVIGATION_TAKING_SCREEN } from "../../navigation/routes";
import { chatHistoryAPI } from "../../actions/authActions";
import { chatHistoryDetails, matchChatDetails } from "../../slices/loginServices/authSlice";

const normalize = (v: any) => String(v ?? "").toLowerCase();

const AllMatchesScreen = () => {
  const dispatch = useDispatch();
  const [search, setSearch] = useState("");
  const recentMatches = useSelector((state: any) => state.auth.recentMatches) || [];
  const userData = useSelector((state: any) => state.auth.userData);
  const query = useMemo(() => normalize(search).trim(), [search]);

  const filtered = useMemo(() => {
    if (!query) return recentMatches;
    return recentMatches.filter((m: any) => {
      return normalize(m?.name).includes(query) || normalize(m?.username).includes(query);
    });
  }, [recentMatches, query]);

  const noSearchFound = useCallback(() => {
    return (
      <View style={{ alignItems: "center", justifyContent: "center", marginTop: metrics.hp6, paddingHorizontal: metrics.hp2 }}>
        <AppText type={TWELVE} weight={INTER_BOLD} color={BLACK}>
          No results found
        </AppText>
      </View>
    );
  }, []);

  const openChat = useCallback(
    (item: any) => {
      const data = {
        otherUserId: item.userId,
        matchId: item.matchId,
      };
      const params = { page: 1, limit: 50 };
      dispatch(chatHistoryDetails([]));
      dispatch(matchChatDetails(item));
      NavigationService.navigate(NAVIGATION_TAKING_SCREEN);
      dispatch(chatHistoryAPI(data, params, false));
    },
    [dispatch]
  );

  const renderItem = useCallback(
    ({ item }: any) => {
      return (
        <TouchableOpacityView onPress={() => openChat(item)} style={styles.row}>
          <FastImage source={{ uri: item?.profilePicture?.url }} resizeMode="cover" style={styles.avatar} />
          <View style={{ flex: 1, marginLeft: metrics.hp2, }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              {item.online && userData?.subscription?.plan !== "FREE" &&
                <View style={styles.activeBackground} />
              }
              <AppText style={{textTransform:"capitalize"}} type={SIXTEEN} weight={INTER_BOLD} color={BLACK}>
                {item?.name}{" "}
              </AppText>
              {!!item?.username && (
                <AppText style={{textTransform:"capitalize"}} type={TWELVE} weight={INTER_REGULAR} color={colors.darkOpecity}>
                  {item?.username}
                </AppText>
              )}
              
              {userData?.faceVerified == true ?  <FastImage source={blueTikeIcon} resizeMode="contain" style={styles.blueTickIcon} />:<></>}
            </View>
            <AppText type={TWELVE} numberOfLines={1} weight={INTER_REGULAR} color={OPECITY_DARK}>
              Write your first message
            </AppText>
          </View>

        </TouchableOpacityView>
      );
    },
    [openChat]
  );

  const keyExtractor = useCallback((item: any) => String(item?.userId || item?._id || item?.matchId), []);

  return (
    <AppSafeAreaView>

      <View style={styles.header}>
        <TouchableOpacityView onPress={() => NavigationService.goBack()} style={styles.backBtn}>
          <FastImage source={backIcon} resizeMode="contain" style={styles.backIcon} />
        </TouchableOpacityView>
        <AppText type={FORTEEN} weight={INTER_BOLD} color={BLACK}>
          All Matches
        </AppText>
        <View style={{ width: metrics.hp4 }} />
      </View>

      <View style={{ paddingHorizontal: metrics.hp2, marginTop: metrics.hp1 }}>
        <SearchContainer value={search} onChangeText={setSearch} placeholder={"Search matches"} style={{ height: metrics.hp7 }} />
      </View>

      <FlatList
        data={filtered}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={{ paddingHorizontal: metrics.hp2, paddingTop: metrics.hp2, paddingBottom: metrics.hp6 }}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={query ? noSearchFound : null}
      />
    </AppSafeAreaView>
  );
};

export default AllMatchesScreen;

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: metrics.hp2,
    marginTop: metrics.hp5,
    backgroundColor: colors.white,
  },
  backBtn: {
    height: metrics.hp4,
    width: metrics.hp4,
    alignItems: "center",
    justifyContent: "center",
  },
  backIcon: {
    height: metrics.hp2_5,
    width: metrics.hp2_5,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: metrics.hp1_8,
    borderBottomWidth: metrics.hp0_1,
    borderBottomColor: colors.borderfifty,
  },
  avatar: {
    height: metrics.hp7,
    width: metrics.hp7,
    borderRadius: metrics.hp50,
    overflow: "hidden",
    backgroundColor: colors.lightBack,
  },
  blueTickIcon: {
    height: metrics.hp2,
    width: metrics.hp2,
    marginTop: metrics.hp0_5
  },
  activeBackground: {
    height: metrics.hp1, width: metrics.hp1,
    backgroundColor: colors.darkGreen, borderRadius: metrics.hp20,
    marginRight: metrics.hp0_5
},
});


