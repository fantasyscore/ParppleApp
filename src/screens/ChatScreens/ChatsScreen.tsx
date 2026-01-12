import React, { useCallback, useEffect, useMemo, useState } from "react";
import { AppSafeAreaView } from "../../common/AppSafeAreaView";
import { FlatList, ImageBackground, StyleSheet, View } from "react-native";
import PeopleHeader from "../../common/PeopleHeader";
import metrics from "../../assets/Metrics";
import { colors } from "../../theme/colors";
import FastImage from "react-native-fast-image";
import { blackHeart, blueTikeIcon, chatNoMatchEmpty, goldCard, matchRoundCircle, messageIcon, Platinum, shareRedIcon, textforBlurImage, upgradPlan } from "../../helper/ImageAssets";
import { AppText, BLACK, DARK_GREEN, DARKGREEN, FORTEEN, INTER_BOLD, INTER_MEDIUM, INTER_REGULAR, INTER_SEMI_BOLD, LIGHT_BLACK, LIGHT_GREEN, OPECITY_DARK, PURPLE, SCHEHERAZADE_BOLD, SIXTEEN, TEN, THIRTEEN, TWELVE, TWENTY_FOUR, WHITE } from "../../common/AppText";
import { TouchableOpacityView } from "../../common/TouchableOpacityView";
import { chatData, newMatchData } from "../../common/UiltData";
import SearchContainer from "../../common/SearchContainer";
import NavigationService from "../../navigation/NavigationService";
import { NAVIGATION_ALL_MATCHES_SCREEN, NAVIGATION_BOT_CHAT_SCREEN, NAVIGATION_PEOPLE_SCREEN, NAVIGATION_SUBSCRIPTION_SCREEN, NAVIGATION_TAKING_SCREEN } from "../../navigation/routes";
import { Screen } from "../../theme/dimens";
import { useDispatch, useSelector } from "react-redux";
import { chatHistoryAPI, getNewMatches, getOtherProfile, getRecentMatches } from "../../actions/authActions";
import { chatHistoryDetails, matchChatDetails, setNewMatches } from "../../slices/loginServices/authSlice";
import { useIsFocused } from "@react-navigation/native";
import { AppIcon } from "../../helper/ImageAssets";
import { Modal } from "react-native";
import UserEditProfile from "../ProfileScreens/UserEditProfile";
export const formatChatTime = (utcDate: any) => {
    const date = new Date(utcDate);
    const now = new Date();

    const isToday =
        date.toDateString() === now.toDateString();

    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);

    const isYesterday =
        date.toDateString() === yesterday.toDateString();

    if (isToday) {
        return `Today ${date.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        })}`;
    }

    if (isYesterday) {
        return 'Yesterday';
    }

    return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
};
export const truncateText = (text: any, limit = 15) => {
    if (text?.length > limit) {
        return text.substring(0, limit) + '...';
    }
    return text;
};

const ChatsScreen = () => {
    const isFoucse = useIsFocused()
    const [search, setSearch] = useState("");
    const newMatches = useSelector((state: any) => state.auth.newMatches);
    const recentMatches = useSelector((state: any) => state.auth.recentMatches);
    const userData = useSelector((state: any) => state.auth.userData);
    const dispatch = useDispatch();
    const [profileData, setProfileData] = useState();
    useEffect(() => {
        dispatch(getNewMatches())
        dispatch(getRecentMatches())
    }, [isFoucse])

    const normalize = useCallback((v: any) => String(v ?? "").toLowerCase(), []);
    const query = useMemo(() => normalize(search).trim(), [normalize, search]);

    const filteredChats = useMemo(() => {
        const list = newMatches || [];
        if (!query) return list;
        return list.filter((c: any) => {
            return (
                normalize(c?.name).includes(query) ||
                normalize(c?.username).includes(query)
            );
        });
    }, [newMatches, normalize, query]);

    const recentPreviewData = useMemo(() => {
        const list = recentMatches?.reverse() || [];
        if (list.length <= 3) return list;

        const remaining = list.length - 3;
        const fourth = list[3];
        return [
            {
                __type: "MORE",
                remaining,
                avatarUrl: fourth?.profilePicture?.url,
                name: fourth?.name,
            },
            list[0],
            list[1],
            list[2],
        ].filter(Boolean);
    }, [recentMatches]);

    const openAllMatches = useCallback(() => {
        NavigationService.navigate(NAVIGATION_ALL_MATCHES_SCREEN);
    }, []);

    const noSearchFound = useCallback(() => {
        return (
            <View style={{ alignItems: "center", justifyContent: "center", marginTop: metrics.hp6, paddingHorizontal: metrics.hp2 }}>
                <AppText type={TWELVE} weight={INTER_SEMI_BOLD} color={LIGHT_BLACK}>
                    No results found
                </AppText>
            </View>
        );
    }, []);

    const botChatItem = useMemo(() => {
        return {
            __type: "BOT",
            userId: "parpple-bot",
            name: "Parpple",
            username: "Parpple",
            profilePicture: null,
            unreadCount: 1,
            lastMessage: {
                text: "Welcome to Parpple! This is where meaningful conversations begin—be genuine, stay respectful, and enjoy getting to know someone new.",
                createdAt: new Date().toISOString(),
            },
        };
    }, []);
    const onSubmit = (item: any) => {
        const data = {
            otherUserId: item.userId,
            matchId: item.matchId,
        };
        const params = {
            page: 1,
            limit: 50,
        };
        dispatch(chatHistoryDetails([]));
        dispatch(matchChatDetails(item));
        NavigationService.navigate(NAVIGATION_TAKING_SCREEN);
        dispatch(chatHistoryAPI(data, params, false));
    };
    let itemss = { id: "2", icon: goldCard, title: "Gold" }
    const navigateITems = { id: "3", icon: Platinum, title: "Platinum" };


    const onChatSubmit = (item: any) => {
        console.log(item, "itemitemitemitem")
        const isBot = item?.__type === "BOT";
        if (item?.lastMessage?.type == "crushNote" && userData?.subscription?.plan !== "PLATINUM") {
            NavigationService.navigate(NAVIGATION_SUBSCRIPTION_SCREEN, { comming: navigateITems }); return;
        } else if (item?.lastMessage?.type == "crushNote" && userData?.subscription?.plan === "PLATINUM") {
            let data = {
                "userId": item?.userId
            };
            let from = "Chat"
            dispatch(getOtherProfile(data, false, setProfileData, true, from));
            dispatch(matchChatDetails(item))
        } else if (isBot) {
            NavigationService.navigate(NAVIGATION_BOT_CHAT_SCREEN);
        } else {
            onSubmit(item);
        }
    }
    const renderItemChats = ({ item, index }: any) => {
        const isBot = item?.__type === "BOT";

        let messageText = '';
        if (typeof item.message === 'string') {
            messageText = item.message;
        } else if (item.message && typeof item.message === 'object') {
            messageText = item.message.text || item.message.content || '';
        }
        let lastMessageText = '';
        if (typeof item.lastMessage === 'string') {
            lastMessageText = item.lastMessage;
        } else if (item.lastMessage && typeof item.lastMessage === 'object') {
            lastMessageText = item.lastMessage.text || item.lastMessage.content || '';
        };

        return (
            <TouchableOpacityView
                key={item?.userId}
                onPress={() => onChatSubmit(item)/* () => {
                    let data = {
                        "userId": item?.userId
                    };
                    let from = "Chat"
                    dispatch(getOtherProfile(data, false, setProfileData, true, from));
                    dispatch(matchChatDetails(item)); */
                    // if (item?.lastMessage?.type == "crushNote" && userData?.subscription?.plan !== "PLATINUM") { NavigationService.navigate(NAVIGATION_SUBSCRIPTION_SCREEN, { comming: navigateITems }); return; }

                    // if (isBot) {
                    //     NavigationService.navigate(NAVIGATION_BOT_CHAT_SCREEN);
                    //     return;
                    // }
                    // onSubmit(item);
                    // }
                }
                style={styles.chatListContainer}
            >
                <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                    <ImageBackground
                        blurRadius={item?.lastMessage?.type == "crushNote" && userData?.subscription?.plan !== "PLATINUM" ? metrics.hp7 : 0}
                        source={isBot ? AppIcon : { uri: item?.profilePicture?.url }}
                        resizeMode="cover"
                        style={styles.newMatchProfile}
                    />
                    {item.online && !isBot && userData?.subscription?.plan !== "FREE" &&
                        <View style={styles.activeBackground} />
                    }
                    {item?.lastMessage?.type == "crushNote" ?
                        <View style={{ height: metrics.hp4, width: metrics.hp4, alignItems: "center", justifyContent: "center", position: "absolute", bottom: 0, left: metrics.hp5, backgroundColor: colors.white, borderRadius: metrics.hp50, borderWidth: metrics.hp0_1, borderColor: colors.blackopcity }}>
                            <FastImage source={shareRedIcon} resizeMode="contain" style={{ height: metrics.hp2_5, width: metrics.hp2_5, }} />
                        </View>
                        : <></>}
                    <View style={styles.messageContainer}>
                        {item?.lastMessage?.type == "crushNote" && userData?.subscription?.plan !== "PLATINUM" ?
                            <ImageBackground source={textforBlurImage} resizeMode="cover" blurRadius={metrics.hp5} imageStyle={{ borderRadius: metrics.hp1 }} style={{ height: metrics.hp1_5, width: metrics.hp12 }} />
                            :
                            <View style={{ flexDirection: "row" }}>

                                <AppText style={{ textTransform: "capitalize" }} type={SIXTEEN} weight={INTER_BOLD} color={LIGHT_BLACK}>
                                    {item.name}{"  "}
                                </AppText>
                                <FastImage source={blueTikeIcon} resizeMode="contain" style={styles.blueTickIcon} />
                            </View>
                        }
                        {item?.lastMessage?.type == "crushNote" && userData?.subscription?.plan !== "PLATINUM" ?
                            <AppText style={{ marginTop: metrics.hp0_5 }} type={FORTEEN} numberOfLines={1} weight={item.unreadCount > 0 ? INTER_SEMI_BOLD : INTER_REGULAR} color={item.unreadCount > 0 ? BLACK : LIGHT_BLACK}>
                                Sent you a message
                            </AppText>
                            :
                            <AppText type={FORTEEN} numberOfLines={1} weight={item.unreadCount > 0 ? INTER_SEMI_BOLD : INTER_REGULAR} color={item.unreadCount > 0 ? BLACK : LIGHT_BLACK}>
                                {item?.lastMessage?.text ? truncateText(item?.lastMessage?.text) : "Send your first message"}
                            </AppText>
                        }
                    </View>
                </View>
                <View style={{ alignItems: "flex-end", marginTop: metrics.hp2_3 }}>
                    <AppText type={TEN} weight={item.unreadCount > 0 ? INTER_SEMI_BOLD : INTER_MEDIUM} color={item.unreadCount > 0 ? BLACK : OPECITY_DARK}>
                        {isBot ? (formatChatTime(item?.lastMessage?.createdAt)) : (formatChatTime(item?.lastMessage?.createdAt) == "Invalid Date" ? "" : formatChatTime(item?.lastMessage?.createdAt))}
                    </AppText>
                    {item?.lastMessage?.type == "crushNote" && userData?.subscription?.plan !== "PLATINUM" ?
                        <View style={[styles.numberCount, { marginTop: metrics.hp1 }]}>
                            <AppText type={TEN} weight={INTER_MEDIUM}>
                                {1}
                            </AppText>
                        </View> : <></>}
                    {!isBot && item.unreadCount > 0 &&
                        <View style={[styles.numberCount, { marginTop: metrics.hp0_5 }]}>
                            <AppText type={TEN} weight={INTER_MEDIUM}>
                                {item.unreadCount}
                            </AppText>
                        </View>
                    }
                    {isBot &&
                        <View style={[styles.numberCount, { marginTop: metrics.hp0_5 }]}>
                            <AppText type={TEN} weight={INTER_MEDIUM}>
                                {1}
                            </AppText>
                        </View>
                    }
                    {!isBot && item.unreadCount == 0 && item?.lastMessage?.senderId !== userData?._id &&
                        <View style={{ paddingHorizontal: metrics.hp1, paddingVertical: metrics.hp0_2, backgroundColor: colors.singleButtonGreen, borderRadius: metrics.hp4, marginTop: metrics.hp0_5 }}>
                            <AppText weight={INTER_SEMI_BOLD}>
                                Your Turn
                            </AppText>
                        </View>
                    }
                </View>
            </TouchableOpacityView>
        )
    };
    const dataempty = [
        {
            id: "1"
        },
        {
            id: "2"
        },
        {
            id: "3"
        },
        {
            id: "4"
        },
    ]
    const HeaderListChats = () => {
        return recentPreviewData?.length === 0 ? (
            <View>
                <View style={{ paddingHorizontal: metrics.hp2 }}>
                    <View style={styles.newMatchTextContainer}>
                        <FastImage source={blackHeart} resizeMode="contain" style={styles.heartIcon} />
                        <AppText type={TWELVE} weight={INTER_SEMI_BOLD} color={BLACK}>
                            {"  "}New Matches{"  "}
                        </AppText>
                    </View>
                </View>
                <FlatList
                    data={dataempty}
                    horizontal
                    keyExtractor={(item: any, idx: number) => item.id}
                    showsHorizontalScrollIndicator={false}
                    renderItem={({ item, index }: any) => {
                        return (
                            <TouchableOpacityView style={[styles.newmatchContainer, {
                                marginLeft: index === 0 ? metrics.hp2 : metrics.hp0,
                                marginRight: metrics.hp2,
                                height: metrics.hp9,
                                width: metrics.hp9,
                                borderRadius: metrics.hp50,
                                backgroundColor: "#EDEDED"
                            }]}>
                            </TouchableOpacityView>
                        )
                    }}
                />
            </View>
        ) : (
            <View>
                <View style={{ paddingHorizontal: metrics.hp2 }}>
                    <View style={styles.newMatchTextContainer}>
                        <FastImage source={blackHeart} resizeMode="contain" style={styles.heartIcon} />
                        <AppText type={TWELVE} weight={INTER_SEMI_BOLD} color={BLACK}>
                            {"  "}New Matches{"  "}
                        </AppText>
                    </View>
                </View>
                <FlatList
                    data={recentPreviewData}
                    horizontal
                    keyExtractor={(item: any, idx: number) => item?.__type === "MORE" ? `more-${idx}` : String(item?.userId || item?._id || idx)}
                    showsHorizontalScrollIndicator={false}
                    renderItem={({ item, index }: any) => {
                        if (item?.__type === "MORE") {
                            return (
                                <TouchableOpacityView onPress={openAllMatches} style={[styles.newmatchContainer, {
                                    marginLeft: index === 0 ? metrics.hp2 : metrics.hp2,
                                    marginRight: metrics.hp2,
                                }]}>
                                    <ImageBackground
                                        source={{ uri: item?.avatarUrl }}
                                        resizeMode="cover"
                                        style={styles.newMatchProfile}
                                        imageStyle={{ borderRadius: metrics.hp50 }}
                                    >
                                        <View style={styles.moreOverlay}>
                                            <AppText type={FORTEEN} color={WHITE} weight={INTER_BOLD}>
                                                +{item.remaining}
                                            </AppText>
                                        </View>
                                    </ImageBackground>
                                    <AppText style={{ marginTop: metrics.hp0_3 }} type={TWELVE} weight={INTER_SEMI_BOLD}>
                                        {item.name}
                                    </AppText>
                                    <ImageBackground source={matchRoundCircle} resizeMode="cover" style={styles.matchRoudImage} />
                                </TouchableOpacityView>
                            )
                        }
                        return (
                            <TouchableOpacityView onPress={() => onSubmit(item)} key={item?.userId} style={[styles.newmatchContainer, {
                                marginLeft: recentPreviewData?.length <= 3 ? metrics.hp2 : 0,
                                marginRight: recentPreviewData?.length > 3 ? metrics.hp2 : 0
                            }]}>
                                <ImageBackground source={{ uri: item?.profilePicture?.url }} resizeMode="cover" style={styles.newMatchProfile}>
                                    {/* Match avatar */}
                                </ImageBackground>
                                <AppText style={{ marginTop: metrics.hp0_3 }} type={TWELVE} weight={INTER_SEMI_BOLD}>
                                    {item.name}
                                </AppText>
                            </TouchableOpacityView>
                        )
                    }}
                />

            </View>
        )
    };


    return (
        <AppSafeAreaView>
            <PeopleHeader profile={true} filter={true} />
            <View style={styles.singlelIne} />
            {newMatches?.length &&
                <View style={{ paddingHorizontal: metrics.hp2 }}>
                    <SearchContainer onChangeText={setSearch} value={search} placeholder={"Search matches"} style={{ height: metrics.hp7 }} />
                </View>
            }
            {!newMatches?.length &&
                <View style={{ paddingHorizontal: metrics.hp2 }}>
                    <SearchContainer editable={false} onChangeText={setSearch} value={search} placeholder={"Search matches"} style={{ height: metrics.hp7 }} />
                </View>
            }
            {HeaderListChats()}
            {newMatches?.length === 0 ? (
                <>
                    <View style={[styles.newMatchTextContainer, {
                        paddingHorizontal: metrics.hp2,
                        marginTop: metrics.hp4
                    }]}>
                        <FastImage source={messageIcon} resizeMode="contain" style={styles.heartIcon} />
                        <AppText type={TWELVE} weight={INTER_SEMI_BOLD} color={BLACK}>
                            {"  "}Messages{"  "}
                        </AppText>
                    </View>
                    <FlatList
                        data={query ? (normalize(botChatItem.name).includes(query) ? [botChatItem] : []) : [botChatItem]}
                        renderItem={renderItemChats}
                        keyExtractor={(item: any) => item.matchId}
                        ListEmptyComponent={query ? noSearchFound : null}
                        contentContainerStyle={{ marginTop: metrics.hp2 }}
                    />
                    <View style={{ marginBottom: metrics.hp4 }}>
                        <TouchableOpacityView onPress={() => NavigationService.navigate(NAVIGATION_SUBSCRIPTION_SCREEN, { comming: itemss })} >
                            <FastImage source={upgradPlan} resizeMode="contain" style={{ height: metrics.hp10, width: Screen.Width / 1, }} />
                        </TouchableOpacityView>
                    </View>
                </>
            ) :
                <>
                    <View style={[styles.newMatchTextContainer, {
                        paddingHorizontal: metrics.hp2,
                        marginTop: metrics.hp4
                    }]}>
                        <FastImage source={messageIcon} resizeMode="contain" style={styles.heartIcon} />
                        <AppText type={TWELVE} weight={INTER_SEMI_BOLD} color={BLACK}>
                            {"  "}Messages{"  "}
                        </AppText>
                    </View>
                    <FlatList
                        data={filteredChats}
                        renderItem={renderItemChats}
                        keyExtractor={(item) => item.matchId}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={noSearchFound}
                        // ListHeaderComponent={HeaderListChats}
                        contentContainerStyle={{ marginTop: metrics.hp2, paddingBottom: metrics.hp5 }} />

                </>
            }

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
        marginTop: metrics.hp6,
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
        marginTop: metrics.hp1
    },
    newMatchProfile: {
        height: metrics.hp9,
        width: metrics.hp9,
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
        height: metrics.hp10,
        width: metrics.hp10,
        position: "absolute",
        top: -metrics.hp0_4,
        borderRadius: metrics.hp50,
    },
    numbersMatchContainer: {
        height: metrics.hp9,
        width: metrics.hp9,
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
        width: metrics.hp2,
        marginTop: metrics.hp0_5
    },
    messageContainer: {
        marginLeft: metrics.hp2
    },
    moreCard: {
        height: metrics.hp9,
        width: metrics.hp9,
        borderRadius: metrics.hp50,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.purple,
        overflow: "hidden"
    },
    moreOverlay: {
        height: metrics.hp9,
        width: metrics.hp9,
        borderRadius: metrics.hp50,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#00000070",
        overflow: "hidden"
    },
    activeBackground: {
        height: metrics.hp1, width: metrics.hp1,
        backgroundColor: colors.darkGreen, borderRadius: metrics.hp20,
        position: "absolute", top: metrics.hp1, left: metrics.hp7_3,
    },
})