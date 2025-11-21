import React, { useEffect, useState } from "react";
import { AppSafeAreaView } from "../../common/AppSafeAreaView";
import { FlatList, ImageBackground, StyleSheet, View } from "react-native";
import FastImage from "react-native-fast-image";
import { blueTikeIcon, bostIconWhite, goldCard, likeYouIcon, lockIconWhite, logoBlue, profileImage, upgradPlan, viewsIcon } from "../../helper/ImageAssets";
import metrics from "../../assets/Metrics";
import { TouchableOpacityView } from "../../common/TouchableOpacityView";
import { AppText, INTER_BOLD, INTER_MEDIUM, INTER_REGULAR, INTER_SEMI_BOLD, LIGHT_BLACK, OPECITY_DARK, PURPLE, SCHEHERAZADE_BOLD, SIXTEEN, TEN, THIRTEEN, TWELVE, TWENTY_FOUR, WHITE } from "../../common/AppText";
import { colors } from "../../theme/colors";
import NavigationService from "../../navigation/NavigationService";
import { NAVIGATION_SUBSCRIPTION_SCREEN } from "../../navigation/routes";
import { Screen } from "../../theme/dimens";
import { useDispatch, useSelector } from "react-redux";
import { getOtherProfile, likeByOther, likeYou, viewProfileByOther, youView } from "../../actions/authActions";
import { useIsFocused } from "@react-navigation/native";

const LikesYouScreen = () => {
    const dispatch = useDispatch();
    const fouces = useIsFocused()
    const [tabSelect, setTabSelect] = useState('Likes');
    const likeByOtherData = useSelector((state: any) => state.auth.likeByOtherData);
    const likeYouData = useSelector((state: any) => state.auth.likeYouData);
    const viewByOtherData = useSelector((state: any) => state.auth.viewByOtherData);
    const viewYouData = useSelector((state: any) => state.auth.viewYouData);
    const userData = useSelector((state: any) => state.auth.userData);
    const [likeYoue, setlikeYou] = useState('Likes You');
    const [ViewYoue, setViewYou] = useState('Viewed You');
    useEffect(() => {
        dispatch(likeByOther());
        dispatch(likeYou());
        dispatch(viewProfileByOther());
        dispatch(youView());
    }, []);
    let item = { id: "2", icon: goldCard, title: "Gold" }
    const renderUpgradeData = () => {
        return (
            <View style={styles.upgradeDataContainer}>
                <ImageBackground imageStyle={{ borderRadius: metrics.hp1_5 }} blurRadius={metrics.hp8} source={profileImage} resizeMode="cover" style={styles.profileImage}>
                    <FastImage source={lockIconWhite} resizeMode="contain" style={styles.lockIcon} />
                    <View style={styles.whiteLine} />
                    <View style={styles.lightwhiteLine} />
                </ImageBackground>
            </View>
        )
    };
    const renderEmptyLikes = () => {
        return (
            <View style={{ alignItems: "center", justifyContent: "center", marginTop: metrics.hp5, }}>
                <FastImage source={likeYouIcon} resizeMode="contain" style={styles.likeYouIcon} />
                <AppText type={TWENTY_FOUR} weight={SCHEHERAZADE_BOLD} color={LIGHT_BLACK}>
                    You’re new here, you have no
                </AppText>
                <AppText style={{ marginTop: -metrics.hp3 }} type={TWENTY_FOUR} weight={SCHEHERAZADE_BOLD} color={LIGHT_BLACK}>
                    like yet!
                </AppText>
                <AppText type={TWELVE} weight={INTER_REGULAR} color={OPECITY_DARK}>
                    Get profile boost to get your first sooner.
                </AppText>
                <View style={[styles.shareDetailsContaier]}>
                    <FastImage source={bostIconWhite} resizeMode="contain" style={styles.shareIcon} />
                    <AppText color={WHITE} weight={INTER_SEMI_BOLD} type={TWELVE}>
                        {"  "}
                        Boost your profile
                    </AppText>
                </View>
            </View>
        )
    };
    const renderEmptyView = () => {
        return (
            <View style={{ alignItems: "center", justifyContent: "center", marginTop: metrics.hp5, }}>
                <FastImage source={viewsIcon} resizeMode="contain" style={styles.viewsIcon} />
                <AppText type={TWENTY_FOUR} weight={SCHEHERAZADE_BOLD} color={LIGHT_BLACK}>
                    You’re new here, you have no
                </AppText>
                <AppText style={{ marginTop: -metrics.hp3 }} type={TWENTY_FOUR} weight={SCHEHERAZADE_BOLD} color={LIGHT_BLACK}>
                    views yet!
                </AppText>
                <AppText type={TWELVE} weight={INTER_REGULAR} color={OPECITY_DARK}>
                    Get profile boost to get your first sooner.
                </AppText>
                <View style={[styles.shareDetailsContaier]}>
                    <FastImage source={bostIconWhite} resizeMode="contain" style={styles.shareIcon} />
                    <AppText color={WHITE} weight={INTER_SEMI_BOLD} type={TWELVE}>
                        {"  "}
                        Boost your profile
                    </AppText>
                </View>
            </View>
        )
    };
    const viewProfile = (item: any) => {
        let data = {
            "userId": item?.userId
        };
        dispatch(getOtherProfile(data));
    }
    const renderItems = ({ item, index }: any) => {
        console.log(item, "itemitemitem");

        return (
            <TouchableOpacityView onPress={() => viewProfile(item)} key={index} style={[styles.upgradeDataContainer, { marginBottom: metrics.hp2 }]}>
                <ImageBackground imageStyle={{ borderRadius: metrics.hp1_5 }} source={{ uri: item?.profilePicture[0]?.url }} resizeMode="cover" style={styles.profileImageTwo}>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <AppText type={THIRTEEN} weight={INTER_BOLD} color={WHITE}>
                            {item.name}<AppText type={THIRTEEN} weight={INTER_SEMI_BOLD} color={WHITE}>
                                ,{" "}{item.age}{" "}
                            </AppText>
                        </AppText>
                        <FastImage source={blueTikeIcon} resizeMode="contain" style={{ height: metrics.hp1_6, width: metrics.hp1_6 }} />
                    </View>
                    <View style={styles.activeContainer}>
                        {/* {item.active == "Active Now" && */}
                        <View style={styles.activeBackground}>
                            <View style={styles.activeDot} />
                        </View>
                        {/* } */}
                        <AppText type={TEN} color={WHITE} weight={INTER_SEMI_BOLD}>
                            Recently Active
                        </AppText>
                    </View>
                </ImageBackground>
            </TouchableOpacityView>
        )
    };
    const dataCorrect = () => {
        const { subscription } = userData || {};
        const { perks = {}, plan } = subscription || {};

        // Define permission logic based on subscription plan/perks
        const canSeeLikes = perks?.canSeeLikes || plan !== "FREE";
        const canSeeViews = perks?.canSeeViews || plan !== "FREE";

        let data: any[] = [];

        if (tabSelect === "Likes" && likeYoue === "Likes You") {
            data = likeByOtherData?.length ? likeByOtherData : [];
            return data.map((item) => ({ ...item, see: canSeeLikes }));
        }

        if (tabSelect === "Likes" && likeYoue === "You Liked") {
            data = likeYouData?.length ? likeYouData : [];
            return data.map((item) => ({ ...item, see: true })); // You can always see who you liked
        }

        if (tabSelect === "Views" && ViewYoue === "Viewed You") {
            data = viewYouData?.length ? viewYouData : [];
            return data.map((item) => ({ ...item, see: canSeeViews }));
        }

        if (tabSelect === "Views" && ViewYoue === "You Viewed") {
            data = viewByOtherData?.length ? viewByOtherData : [];
            return data.map((item) => ({ ...item, see: true })); // You can see whom you viewed
        }

        return [];
    };
    return (
        <AppSafeAreaView>
            <FastImage source={logoBlue} resizeMode="contain" style={styles.logo} />
            <View style={styles.tabContainer}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacityView onPress={() => setTabSelect('Likes')} style={styles.inTabContainer}>
                        <AppText type={TWELVE} weight={INTER_BOLD} color={tabSelect === 'Likes' ? PURPLE : OPECITY_DARK}>Likes</AppText>
                        <View style={[styles.selectLine, { backgroundColor: tabSelect === 'Likes' ? colors.purple : colors.transparent }]} />
                    </TouchableOpacityView>
                    <AppText type={SIXTEEN} style={{ color: "#C3B7D0" }}>
                        /
                    </AppText>
                    <TouchableOpacityView onPress={() => setTabSelect('Views')} style={styles.inTabContainer}>
                        <AppText type={TWELVE} weight={INTER_BOLD} color={tabSelect === 'Views' ? PURPLE : OPECITY_DARK}>Views</AppText>
                        <View style={[styles.selectLine, { backgroundColor: tabSelect === 'Views' ? colors.purple : colors.transparent }]} />
                    </TouchableOpacityView>
                </View>
            </View>
            {tabSelect == "Likes" &&
                <View style={styles.likeYouContainer}>
                    <TouchableOpacityView onPress={() => setlikeYou("Likes You")} style={[styles.selectBoxContainer, { backgroundColor: likeYoue == "Likes You" ? colors.purple : colors.white }]}>
                        <AppText type={TWELVE} weight={INTER_MEDIUM} color={likeYoue == "Likes You" ? WHITE : LIGHT_BLACK}>
                            Likes You
                        </AppText>
                    </TouchableOpacityView>
                    <TouchableOpacityView onPress={() => setlikeYou("You Liked")} style={[styles.selectBoxContainer, { backgroundColor: likeYoue == "You Liked" ? colors.purple : colors.white }]}>
                        <AppText type={TWELVE} weight={INTER_MEDIUM} color={likeYoue == "You Liked" ? WHITE : LIGHT_BLACK}>
                            You Liked
                        </AppText>
                    </TouchableOpacityView>
                </View>}
            {tabSelect == "Views" &&
                <View style={styles.likeYouContainer}>
                    <TouchableOpacityView onPress={() => setViewYou("Viewed You")} style={[styles.selectBoxContainer, { backgroundColor: ViewYoue == "Viewed You" ? colors.purple : colors.white }]}>
                        <AppText type={TWELVE} weight={INTER_MEDIUM} color={ViewYoue == "Viewed You" ? WHITE : LIGHT_BLACK}>
                            Viewed You
                        </AppText>
                    </TouchableOpacityView>
                    <TouchableOpacityView onPress={() => setViewYou("You Viewed")} style={[styles.selectBoxContainer, { backgroundColor: ViewYoue == "You Viewed" ? colors.purple : colors.white }]}>
                        <AppText type={TWELVE} weight={INTER_MEDIUM} color={ViewYoue == "You Viewed" ? WHITE : LIGHT_BLACK}>
                            You Viewed
                        </AppText>
                    </TouchableOpacityView>
                </View>
            }
            <FlatList
                data={dataCorrect()}
                renderItem={renderItems}
                keyExtractor={(item) => item._id}
                numColumns={2}
                columnWrapperStyle={{ justifyContent: 'space-between' }}
                contentContainerStyle={{ paddingHorizontal: metrics.hp2, marginTop: metrics.hp2, paddingBottom: metrics.hp10 }}
                ListEmptyComponent={tabSelect == "Views" ? renderEmptyView : renderEmptyLikes}
                ListFooterComponent={() => {
                    return likeYoue == "You Liked" && tabSelect == "Likes" ? (
                        <AppText style={{ textAlign: "center", marginTop: metrics.hp2 }} type={TWELVE} weight={INTER_MEDIUM} color={LIGHT_BLACK}>
                            Upgrade to gold to see people who have already{'\n'}liked you
                        </AppText>
                    ) : (<></>)
                }} />
            {likeYoue == "You Liked" && tabSelect == "Likes" &&
                <TouchableOpacityView onPress={() => NavigationService.navigate(NAVIGATION_SUBSCRIPTION_SCREEN, { comming: item })} >
                    <FastImage source={upgradPlan} resizeMode="contain" style={{ height: metrics.hp10, width: Screen.Width / 1, marginBottom: metrics.hp3 }} />
                </TouchableOpacityView>
            }
        </AppSafeAreaView>
    )
};
export default LikesYouScreen;
const styles = StyleSheet.create({
    logo: { marginLeft: metrics.hp2, marginTop: metrics.hp5, height: metrics.hp4, width: metrics.hp10 },
    tabContainer: { backgroundColor: colors.white, justifyContent: 'flex-end', marginTop: metrics.hp1, borderBottomWidth: metrics.hp0_1, borderBottomColor: colors.nanoOpecity },
    selectLine: { height: metrics.hp0_3, width: metrics.hp11, borderTopRightRadius: metrics.hp1, borderTopLeftRadius: metrics.hp1 },
    inTabContainer: { alignItems: 'center', justifyContent: 'center', flex: 1 },
    likeYouContainer: { borderWidth: metrics.hp0_2, borderColor: colors.nanoOpecity, borderRadius: metrics.hp6, marginHorizontal: metrics.hp6_5, marginTop: metrics.hp2, flexDirection: "row", alignItems: "center" },
    selectBoxContainer: { alignItems: "center", justifyContent: "center", height: metrics.hp5, borderRadius: metrics.hp6, borderWidth: metrics.hp0_1, borderColor: colors.white, width: "50%" },
    upgradeDataContainer: { height: metrics.hp20, width: "48%", borderRadius: metrics.hp1_5 },
    profileImage: { height: metrics.hp20, justifyContent: "center" },
    lockIcon: { height: metrics.hp2_5, width: metrics.hp2_5, alignSelf: "center" },
    whiteLine: { height: metrics.hp1, width: metrics.hp10, backgroundColor: colors.white, borderRadius: metrics.hp6, position: "absolute", bottom: metrics.hp3, left: metrics.hp1 },
    lightwhiteLine: { height: metrics.hp0_7, width: metrics.hp15, borderRadius: metrics.hp6, backgroundColor: colors.nanoOpecity, position: "absolute", bottom: metrics.hp1_5, left: metrics.hp1, },
    likeYouIcon: { height: metrics.hp25, width: metrics.hp20 },
    viewsIcon: { height: metrics.hp25, width: metrics.hp30 },
    shareIcon: { height: metrics.hp2, width: metrics.hp2, },
    shareDetailsContaier: { height: metrics.hp5, borderRadius: metrics.hp1_5, backgroundColor: colors.black, marginTop: metrics.hp18, alignItems: "center", justifyContent: "center", flexDirection: "row", width: "100%" },
    activeBackground: { height: metrics.hp1_2, width: metrics.hp1_2, borderWidth: metrics.hp0_1, borderColor: "#28EC594D", backgroundColor: "#28EC591A", borderRadius: metrics.hp20, alignItems: "center", justifyContent: "center", marginRight: metrics.hp0_3 },
    activeDot: { height: metrics.hp0_8, width: metrics.hp0_8, backgroundColor: "#28EC59", borderRadius: metrics.hp50 },
    activeContainer: { height: metrics.hp2, paddingHorizontal: metrics.hp1, flexDirection: "row", alignItems: "center", borderRadius: metrics.hp5, backgroundColor: "#FFFFFF33", marginTop: metrics.hp0_5 },
    profileImageTwo: { height: metrics.hp20, alignItems: "flex-start", justifyContent: "flex-end", paddingHorizontal: metrics.hp2, paddingVertical: metrics.hp1 }
})