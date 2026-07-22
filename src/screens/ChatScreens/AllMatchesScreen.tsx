import React, { useCallback, useMemo, useState } from "react";
import { FlatList, ImageBackground, Platform, StyleSheet, View } from "react-native";
import FastImage from "react-native-fast-image";
import { useDispatch, useSelector } from "react-redux";
import { AppSafeAreaView } from "../../common/AppSafeAreaView";
import { TouchableOpacityView } from "../../common/TouchableOpacityView";
import SearchContainer from "../../common/SearchContainer";
import { AppText, BLACK, FORTEEN, INTER_BOLD, INTER_REGULAR, INTER_SEMI_BOLD, LIGHT_BLACK, OPECITY_DARK, SIXTEEN, TWELVE, WHITE } from "../../common/AppText";
import metrics from "../../assets/Metrics";
import { colors, newColor } from "../../theme/colors";
// import { backIcon, blueTikeIcon, reversIcoin } from "../../helper/ImageAssets";
import NavigationService from "../../navigation/NavigationService";
import { NAVIGATION_TAKING_SCREEN } from "../../navigation/routes";
import { chatHistoryAPI } from "../../actions/authActions";
import { chatHistoryDetails, matchChatDetails } from "../../slices/loginServices/authSlice";
import NewHeaderAndroid from "../../common/NewHeaderAndroid";
import NewHeader from "../../common/NewHeader";
import { ChatSearchIcon, dummyfemaleProfile, dummyMaleProfile } from "../../helper/ImageAssets";

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
        <AppText type={TWELVE} weight={INTER_BOLD} color={WHITE}>
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
          <FastImage source={ item?.profilePicture ? { uri: item?.profilePicture?.url } : item.gender == "male" ? dummyMaleProfile : dummyfemaleProfile} resizeMode="cover" style={styles.avatar} />
          <View style={{ flex: 1, marginLeft: metrics.hp2, }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
            
              <AppText style={{ textTransform: "capitalize" }} type={SIXTEEN} weight={INTER_BOLD} color={WHITE}>
              {item.username ? item.username : item.name}{" "}
              </AppText>
              {/* {userData?.faceVerified == true && Platform.OS ==="ios"?  <FastImage source={blueTikeIcon} resizeMode="contain" style={styles.blueTickIcon} />:
               <FastImage source={blueTikeIcon} resizeMode="contain" style={styles.blueTickIcon} />
              } */}
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
    <AppSafeAreaView color={newColor.blackNew}>
      <NewHeader title={"All Matches"} onPress={() => NavigationService.goBack()} />
      <ImageBackground source={ChatSearchIcon} resizeMode="stretch" style={{ height: metrics.hp7, width: "95%", alignSelf: "center", marginLeft: metrics.hp2, marginTop: metrics.hp2, justifyContent: "center" }}>
        <SearchContainer value={search} onChangeText={setSearch} placeholder={"Search matches"} style={{ height: metrics.hp7 }} />

      </ImageBackground>


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
    // borderBottomWidth: metrics.hp0_1,
    // borderBottomColor: colors.borderfifty,
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


