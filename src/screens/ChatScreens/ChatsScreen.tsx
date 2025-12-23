import React, { useEffect, useState } from "react";
import { AppSafeAreaView } from "../../common/AppSafeAreaView";
import { FlatList, ImageBackground, StyleSheet, View } from "react-native";
import PeopleHeader from "../../common/PeopleHeader";
import metrics from "../../assets/Metrics";
import { colors } from "../../theme/colors";
import FastImage from "react-native-fast-image";
import { blackHeart, blueTikeIcon, chatNoMatchEmpty, goldCard, matchRoundCircle, messageIcon, upgradPlan } from "../../helper/ImageAssets";
import { AppText, BLACK, DARKGREEN, FORTEEN, INTER_BOLD, INTER_MEDIUM, INTER_REGULAR, INTER_SEMI_BOLD, LIGHT_BLACK, LIGHT_GREEN, OPECITY_DARK, SCHEHERAZADE_BOLD, TEN, THIRTEEN, TWELVE, TWENTY_FOUR, WHITE } from "../../common/AppText";
import { TouchableOpacityView } from "../../common/TouchableOpacityView";
import { chatData, newMatchData } from "../../common/UiltData";
import SearchContainer from "../../common/SearchContainer";
import NavigationService from "../../navigation/NavigationService";
import { NAVIGATION_SUBSCRIPTION_SCREEN, NAVIGATION_TAKING_SCREEN } from "../../navigation/routes";
import { Screen } from "../../theme/dimens";
import { useDispatch, useSelector } from "react-redux";
import { getNewMatches } from "../../actions/authActions";
import { matchChatDetails } from "../../slices/loginServices/authSlice";

const ChatsScreen = () => {
    const [search, setSearch] = useState("");
    const newMatches = useSelector((state: any) => state.auth.newMatches);

    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(getNewMatches())
    }, [])

    const emptyScreen = () => {
        let item = { id: "2", icon: goldCard, title: "Gold" }
        return (
            <>
                <FastImage source={chatNoMatchEmpty} resizeMode="contain" style={styles.emptyImage} />
                <View style={{ alignItems: "center", justifyContent: "center", marginTop: metrics.hp10, paddingHorizontal: metrics.hp2 }}>
                    <AppText type={TWENTY_FOUR} weight={SCHEHERAZADE_BOLD}>
                        You’ve no matches yet!
                    </AppText>
                    <AppText style={{ marginTop: -metrics.hp1 }} color={OPECITY_DARK} type={TWELVE} weight={INTER_REGULAR}>
                        You can start messaging when you get mutual like.
                    </AppText>
                    <TouchableOpacityView style={styles.buttonContiner}>
                        <AppText color={WHITE} weight={INTER_SEMI_BOLD} type={FORTEEN}>
                            Get Matches
                        </AppText>
                    </TouchableOpacityView>
                    <TouchableOpacityView onPress={() => NavigationService.navigate(NAVIGATION_SUBSCRIPTION_SCREEN, { comming: item })} >
                        <FastImage source={upgradPlan} resizeMode="contain" style={{ height: metrics.hp10, width: Screen.Width / 1, marginTop: metrics.hp5 }} />
                    </TouchableOpacityView>
                </View>
            </>
        )
    };
    const renderItemChats = ({ item, index }: any) => {
        return (
            <TouchableOpacityView onPress={() => NavigationService.navigate(NAVIGATION_TAKING_SCREEN)} style={styles.chatListContainer}>
                <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                    <FastImage source={item.profile} resizeMode="contain" style={styles.newMatchProfile} />
                    <View style={styles.messageContainer}>
                        <AppText type={TWELVE} weight={INTER_BOLD} color={LIGHT_BLACK}>
                            {item.name}, <AppText type={TWELVE} weight={INTER_SEMI_BOLD}>
                                {item.age}
                            </AppText>{"  "}
                            <FastImage source={blueTikeIcon} resizeMode="contain" style={styles.blueTickIcon} />
                        </AppText>
                        <AppText type={TWELVE} numberOfLines={1} weight={!item?.upComingMesaage ? INTER_REGULAR : INTER_SEMI_BOLD} color={LIGHT_BLACK}>
                            {item.message}
                        </AppText>
                    </View>
                </View>
                <View style={{ alignItems: "flex-end", marginTop: metrics.hp0_8 }}>
                    <AppText type={TEN} weight={INTER_MEDIUM} color={!item?.upComingMesaage ? OPECITY_DARK : LIGHT_GREEN}>
                        {item.lastMessage}
                    </AppText>
                    {item?.upComingMesaage &&
                        <View style={[styles.numberCount, { marginTop: metrics.hp0_5 }]}>
                            <AppText type={TEN} weight={INTER_MEDIUM}>
                                9
                            </AppText>
                        </View>
                    }
                </View>
            </TouchableOpacityView>
        )
    };
    const HeaderListChats = () => {
        return (
            <View>
                <View style={{ paddingHorizontal: metrics.hp2 }}>
                    <SearchContainer onChangeText={setSearch} value={search} placeholder={"Search matches"} />
                    <View style={styles.newMatchTextContainer}>
                        <FastImage source={blackHeart} resizeMode="contain" style={styles.heartIcon} />
                        <AppText type={TWELVE} weight={INTER_SEMI_BOLD} color={BLACK}>
                            {"  "}New Matches{"  "}
                        </AppText>
                        <View style={styles.numberCount}>
                            <AppText type={TEN} weight={INTER_MEDIUM}>
                                10
                            </AppText>
                        </View>
                    </View>
                </View>
                <FlatList
                    data={newMatches}
                    horizontal
                    keyExtractor={(item) => item.userId}
                    renderItem={({ item, index }: any) => {
                        return (
                            <TouchableOpacityView  onPress={() => {dispatch(matchChatDetails(item)), NavigationService.navigate(NAVIGATION_TAKING_SCREEN)}}  key={item?.userId} style={[styles.newmatchContainer, {
                                marginLeft: newMatches?.length + 1 == index ? 0 : metrics.hp2,
                                marginRight: newMatches?.length - 1 == index ? metrics.hp2 : 0
                            }]}>
                                <ImageBackground source={{uri:item?.profilePicture[0]?.url}} resizeMode="cover" style={styles.newMatchProfile}>
                                    {index == 0 &&
                                        <View style={styles.numbersMatchContainer}>
                                            <AppText type={FORTEEN} color={WHITE} weight={INTER_BOLD}>
                                                10+
                                            </AppText>
                                        </View>
                                    }
                                </ImageBackground>
                                <AppText style={{ marginTop: metrics.hp0_3 }} type={TEN} weight={INTER_SEMI_BOLD}>
                                    {item.name}
                                </AppText>
                                {index == 0 &&
                                    <ImageBackground source={matchRoundCircle} resizeMode="cover" style={styles.matchRoudImage} />
                                }
                            </TouchableOpacityView>
                        )
                    }}
                />
                <View style={[styles.newMatchTextContainer, {
                    paddingHorizontal: metrics.hp2,
                    marginTop: metrics.hp4
                }]}>
                    <FastImage source={messageIcon} resizeMode="contain" style={styles.heartIcon} />
                    <AppText type={TWELVE} weight={INTER_SEMI_BOLD} color={BLACK}>
                        {"  "}Messages{"  "}
                    </AppText>
                    <View style={styles.numberCount}>
                        <AppText type={TEN} weight={INTER_MEDIUM}>
                            9
                        </AppText>
                    </View>
                </View>
            </View>
        )
    }
    return (
        <AppSafeAreaView>
            <PeopleHeader profile={true} filter={true} />
            <View style={styles.singlelIne} />
            <FlatList
                data={chatData}
                renderItem={renderItemChats}
                keyExtractor={(item) => item.id}
                ListEmptyComponent={emptyScreen}
                ListHeaderComponent={HeaderListChats}
                contentContainerStyle={{ marginTop: metrics.hp2 }} />
        </AppSafeAreaView>
    )
};
export default ChatsScreen;
const styles = StyleSheet.create({
    singlelIne: {
        height: metrics.hp0_1,
        backgroundColor: colors.borderfifty,
        marginTop: metrics.hp1
    },
    emptyImage: {
        height: metrics.hp25,
        width: metrics.hp25,
        alignSelf: "center",
        marginTop: metrics.hp10,
    },
    buttonContiner: {
        height: metrics.hp5,
        borderRadius: metrics.hp4,
        backgroundColor: colors.purple,
        alignItems: "center",
        justifyContent: "center",
        marginTop: metrics.hp2,
        width: "100%"
    },
    heartIcon: {
        height: metrics.hp2,
        width: metrics.hp2
    },
    numberCount: {
        height: metrics.hp2,
        borderRadius: metrics.hp3,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.singleButtonGreen,
        paddingHorizontal: metrics.hp0_7
    },
    newMatchTextContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: metrics.hp3
    },
    newMatchProfile: {
        height: metrics.hp6,
        width: metrics.hp6,
        borderRadius: metrics.hp50,
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden"
    },
    newmatchContainer: {
        marginTop: metrics.hp2,
        alignItems: "center",
        justifyContent: "center"
    },
    matchRoudImage: {
        height: metrics.hp6_8,
        width: metrics.hp6_8,
        position: "absolute",
        top: -metrics.hp0_4,
        borderRadius: metrics.hp50,
    },
    numbersMatchContainer: {
        height: metrics.hp6,
        width: metrics.hp6,
        borderRadius: metrics.hp50,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#00000050",
        overflow: "hidden"
    },
    chatListContainer: {
        paddingVertical: metrics.hp2,
        borderBottomWidth: metrics.hp0_1,
        borderBottomColor: colors.borderfifty,
        marginHorizontal: metrics.hp2,
        flexDirection: "row",
        justifyContent: "space-between"
    },
    blueTickIcon: {
        height: metrics.hp2,
        width: metrics.hp2
    },
    messageContainer: {
        marginLeft: metrics.hp2
    }
})