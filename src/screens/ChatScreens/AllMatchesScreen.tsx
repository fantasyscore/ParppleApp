import React, { useCallback, useMemo, useState } from "react";
import { FlatList, ImageBackground, StyleSheet, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { AppSafeAreaView } from "../../common/AppSafeAreaView";
import { TouchableOpacityView } from "../../common/TouchableOpacityView";
import SearchContainer from "../../common/SearchContainer";
import { AppText, INTER_BOLD, INTER_REGULAR, OPECITY_DARK, SIXTEEN, TWELVE, WHITE } from "../../common/AppText";
import metrics from "../../assets/Metrics";
import { colors, newColor } from "../../theme/colors";
import NavigationService from "../../navigation/NavigationService";
import { openMatchChat } from "../../actions/authActions";
import NewHeader from "../../common/NewHeader";
import PortraitAvatar from "../../common/PortraitAvatar";
import { ChatSearchIcon, dummyfemaleProfile, dummyMaleProfile } from "../../helper/ImageAssets";

const normalize = (v: any) => String(v ?? "").toLowerCase();

const AllMatchesScreen = () => {
  const dispatch = useDispatch();
  const [search, setSearch] = useState("");
  const recentMatches = useSelector((state: any) => state.auth.recentMatches);
  const query = useMemo(() => normalize(search).trim(), [search]);

  // Same newest-first order as the "New Matches" strip on the Chats screen (copy: never mutate Redux state).
  const orderedMatches = useMemo(() => [...(recentMatches ?? [])].reverse(), [recentMatches]);

  const filtered = useMemo(() => {
    if (!query) return orderedMatches;
    return orderedMatches.filter((m: any) => {
      return normalize(m?.name).includes(query) || normalize(m?.username).includes(query);
    });
  }, [orderedMatches, query]);

  const noSearchFound = useCallback(() => {
    return (
      <View style={{ alignItems: "center", justifyContent: "center", marginTop: metrics.hp6, paddingHorizontal: metrics.hp2 }}>
        <AppText type={TWELVE} weight={INTER_BOLD} color={WHITE}>
          No results found
        </AppText>
      </View>
    );
  }, []);

  const openChat = useCallback((item: any) => dispatch(openMatchChat(item)), [dispatch]);

  const renderItem = useCallback(
    ({ item }: any) => {
      return (
        <TouchableOpacityView onPress={() => openChat(item)} style={styles.row}>
          <PortraitAvatar source={item?.profilePicture?.url ? { uri: item.profilePicture.url } : item.gender == "male" ? dummyMaleProfile : dummyfemaleProfile} style={styles.avatar} />
          {item.online ?
            <View style={{ height: metrics.hp1, width: metrics.hp1, backgroundColor: "#26F600", borderRadius: metrics.hp50, position: "absolute", top: metrics.hp1, left: metrics.hp1 }} /> : <></>}
          <View style={{ flex: 1, marginLeft: metrics.hp2, }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>

              <AppText style={{ textTransform: "capitalize" }} type={SIXTEEN} weight={INTER_BOLD} color={WHITE}>
                {item.username ? item.username : item.name}{" "}
              </AppText>
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

const styles = StyleSheet.create({row: {
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
  },});


