import React, { useCallback, useEffect, useMemo, useState } from "react";
import { AppSafeAreaView } from "../../common/AppSafeAreaView";
import { ActivityIndicator, FlatList, ImageBackground, Platform, StyleSheet, View } from "react-native";
import metrics from "../../assets/Metrics";
import { colors, newColor } from "../../theme/colors";
import { ChatSearchIcon, dummyfemaleProfile, dummyMaleProfile, HomeBackground, } from "../../helper/ImageAssets";
import { AppText, BLACK, FORTEEN, INTER_BOLD, INTER_MEDIUM, INTER_REGULAR, INTER_SEMI_BOLD, LIGHT_BLACK, OPECITY, SIXTEEN, TEN, TWELVE, WHITE } from "../../common/AppText";
import { TouchableOpacityView } from "../../common/TouchableOpacityView";
import SearchContainer from "../../common/SearchContainer";
import NavigationService from "../../navigation/NavigationService";
import { NAVIGATION_ALL_MATCHES_SCREEN, NAVIGATION_BOT_CHAT_SCREEN } from "../../navigation/routes";
import { useDispatch, useSelector } from "react-redux";
import { getNewMatches, getRecentMatches, openMatchChat } from "../../actions/authActions";
import { useIsFocused } from "@react-navigation/native";
import { AppIcon } from "../../helper/ImageAssets";
import NewHeaderAndroid from "../../common/NewHeaderAndroid";
import PortraitAvatar from "../../common/PortraitAvatar";
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
    // Only the very first visit has nothing cached to show; later visits refresh silently in the background.
    const [isFirstLoad, setIsFirstLoad] = useState(
        () => !(newMatches?.length || recentMatches?.length)
    );
    useEffect(() => {
        if (!isFoucse) return;
        let cancelled = false;
        Promise.all([dispatch(getNewMatches()), dispatch(getRecentMatches())]).finally(() => {
            if (!cancelled) setIsFirstLoad(false);
        });
        return () => {
            cancelled = true;
        };
    }, [isFoucse, dispatch]);

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
        // Copy before reversing: Array.reverse() mutates in place, which would silently flip the Redux state.
        const list = [...(recentMatches ?? [])].reverse();
        if (list.length <= 3) return list;

        const remaining = list.length - 3;
        const fourth = list[3];
        return [
            {
                __type: "MORE",
                remaining,
                avatarUrl: fourth?.profilePicture?.url,
                gender: fourth?.gender,
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
    const onSubmit = useCallback((item: any) => {
        dispatch(openMatchChat(item));
    }, [dispatch]);

    const renderItemChats = ({ item }: any) => {
        const isBot = item?.__type === "BOT";

        const rawTime = formatChatTime(item?.lastMessage?.createdAt);
        const timeLabel = rawTime === "Invalid Date" ? "" : rawTime;

        return (
            <TouchableOpacityView
                onPress={() => (isBot ? NavigationService.navigate(NAVIGATION_BOT_CHAT_SCREEN) : onSubmit(item))}
                style={styles.chatListContainer}
            >
                <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                    <PortraitAvatar
                        source={isBot ? AppIcon : item?.profilePicture?.url ? { uri: item.profilePicture.url } : item.gender == "male" ? dummyMaleProfile : dummyfemaleProfile}
                        style={styles.newMatchProfile}
                    />
                    {item.online && !isBot &&
                        <View style={{
                            height: metrics.hp2,
                            width: metrics.hp2,
                            borderRadius: metrics.hp50,
                            backgroundColor: "#39E75F",
                            borderWidth: metrics.hp0_5,
                            borderColor: "#2A2A2C", position: "absolute", top: metrics.hp0, left: metrics.hp0_5
                        }} />
                     } 
                    <View style={styles.messageContainer}>
                        <View style={{ flexDirection: "row" }}>
                            <AppText style={{ textTransform: "capitalize" }} type={SIXTEEN} weight={INTER_BOLD} color={WHITE}>
                                {item.username ? item.username : item.name}{"  "}
                            </AppText>
                        </View>
                        <AppText type={FORTEEN} numberOfLines={1} weight={item.unreadCount > 0 ? INTER_SEMI_BOLD : INTER_REGULAR} color={item.unreadCount > 0 ? WHITE : OPECITY}>
                            {item?.lastMessage?.text ? truncateText(item?.lastMessage?.text) : "Send your first message"}
                        </AppText>
                    </View>
                </View>
                <View style={{ alignItems: "flex-end", marginTop: metrics.hp2_3 }}>
                    <AppText type={TEN} weight={item.unreadCount > 0 ? INTER_SEMI_BOLD : INTER_MEDIUM} style={{ color: "#E6B7A8" }} color={item.unreadCount > 0 ? WHITE : OPECITY}>
                        {timeLabel}
                    </AppText>
                    {item?.lastMessage?.type == "crushNote" && userData?.subscription?.plan !== "PLATINUM" ?
                        <View style={[styles.numberCount, { marginTop: metrics.hp1, backgroundColor: "#E6B7A8" }]}>
                            <AppText type={TEN} weight={INTER_MEDIUM}>
                                {1}
                            </AppText>
                        </View> : <></>}
                    {!isBot && item.unreadCount > 0 &&
                        <View style={[styles.numberCount, { marginTop: metrics.hp0_5, backgroundColor: "#E6B7A8" }]}>
                            <AppText type={TEN} color={BLACK} weight={INTER_MEDIUM}>
                                {item.unreadCount}
                            </AppText>
                        </View>
                    }
                    {isBot &&
                        <View style={[styles.numberCount, { marginTop: metrics.hp0_5, backgroundColor: "#E6B7A8" }]}>
                            <AppText type={TEN} weight={INTER_MEDIUM}>
                                {1}
                            </AppText>
                        </View>
                    }
                    {!isBot && item.unreadCount == 0 && item?.lastMessage?.senderId !== userData?._id &&
                        <View style={{ paddingHorizontal: metrics.hp1, paddingVertical: metrics.hp0_2, backgroundColor: "#E6B7A8", borderRadius: metrics.hp4, marginTop: metrics.hp0_5 }}>
                            <AppText color={BLACK} weight={INTER_SEMI_BOLD}>
                                Your Turn
                            </AppText>
                        </View>
                    }
                </View>
            </TouchableOpacityView>
        )
    };
    // Rendered as an element (not passed as a component) so the horizontal strip keeps its scroll position
    // and state when the search text changes.
    const renderRecentMatches = () => {
        return recentPreviewData?.length === 0 ? (
            <></>
        ) : (
            <View>
                <View style={{ paddingHorizontal: metrics.hp2 }}>
                    <View style={styles.newMatchTextContainer}>
                        <AppText type={TWELVE} weight={INTER_SEMI_BOLD} color={WHITE}>
                            {"  "}New Matches{"  "}
                        </AppText>
                    </View>
                </View>
                <FlatList
                    data={recentPreviewData}
                    horizontal
                    keyExtractor={(item: any, idx: number) => item?.__type === "MORE" ? `more-${idx}` : String(item?.userId || item?._id || idx)}
                    showsHorizontalScrollIndicator={false}
                    renderItem={({ item }: any) => {
                        if (item?.__type === "MORE") {
                            return (
                                <TouchableOpacityView onPress={openAllMatches} style={[styles.newmatchContainer, {
                                    marginLeft: metrics.hp2,
                                    marginRight: metrics.hp2,
                                }]}>
                                    <PortraitAvatar
                                        source={item?.avatarUrl ? { uri: item?.avatarUrl } : item?.gender == "male" ? dummyMaleProfile : dummyfemaleProfile}
                                        style={styles.newMatchProfile}
                                    >
                                        {item.online ?
                                            <View style={{ height: metrics.hp1, width: metrics.hp1, backgroundColor: "#26F600", borderRadius: metrics.hp50, position: "absolute", top: metrics.hp1, left: metrics.hp1 }} /> : <></>}
                                        <View style={styles.moreOverlay}>
                                            <AppText type={FORTEEN} color={WHITE} weight={INTER_BOLD}>
                                                +{item.remaining}
                                            </AppText>
                                        </View>
                                    </PortraitAvatar>
                                    <AppText style={{ marginTop: metrics.hp0_3, color: colors.white }} type={TWELVE} weight={INTER_SEMI_BOLD}>
                                        {item.username ? item.username : item.name}
                                    </AppText>
                                </TouchableOpacityView>
                            )
                        }
                        return (
                            <TouchableOpacityView onPress={() => onSubmit(item)} key={item?.userId} style={[styles.newmatchContainer, {
                                marginLeft: recentPreviewData?.length <= 3 ? metrics.hp2 : 0,
                                marginRight: recentPreviewData?.length > 3 ? metrics.hp2 : 0
                            }]}>
                                <PortraitAvatar source={item?.profilePicture?.url ? { uri: item?.profilePicture?.url } : item?.gender == "male" ? dummyMaleProfile : dummyfemaleProfile} style={styles.newMatchProfile} />
                                <AppText style={{ marginTop: metrics.hp1, color: colors.white, }} type={TWELVE} weight={INTER_SEMI_BOLD}>
                                    {item.username ? item.username : item.name}

                                </AppText>
                            </TouchableOpacityView>
                        )
                    }}
                />

            </View>
        )
    };



    const listHeader = (
        <>
            {renderRecentMatches()}
            <View style={[styles.newMatchTextContainer, {
                paddingHorizontal: metrics.hp2,
                marginTop: metrics.hp4
            }]}>
                <AppText type={TWELVE} weight={INTER_SEMI_BOLD} color={WHITE}>
                    Messages{"  "}
                </AppText>
            </View>
        </>
    );



    return (
        <AppSafeAreaView color={newColor.blackNew}>
            <ImageBackground source={HomeBackground} resizeMode='contain' style={{ flex: 1 }}>
                <NewHeaderAndroid message={true} filterShow={false} />
                <ImageBackground source={ChatSearchIcon} resizeMode="stretch" style={{ height: metrics.hp7, width: "95%", alignSelf: "center", marginLeft: metrics.hp2, marginTop: metrics.hp2, justifyContent: "center" }}>
                    {newMatches?.length ?
                        <SearchContainer onChangeText={setSearch} value={search} placeholder={"Search matches"} style={{ height: metrics.hp7, marginTop: Platform.OS === "ios" ? metrics.hp0_7 : 0 }} /> :
                        <SearchContainer editable={false} onChangeText={setSearch} value={search} placeholder={"Search matches"} style={{ height: metrics.hp7 }} />
                    }
                </ImageBackground>
                {isFirstLoad && !newMatches?.length ? (
                    <View style={styles.firstLoadContainer}>
                        <ActivityIndicator size="small" color={colors.white} />
                    </View>
                ) : newMatches?.length === 0 ? (
                    <FlatList
                        data={query ? (normalize(botChatItem.name).includes(query) ? [botChatItem] : []) : [botChatItem]}
                        renderItem={renderItemChats}
                        keyExtractor={(item: any) => item.matchId || item.userId || 'bot'}
                        ListEmptyComponent={query ? noSearchFound : null}
                        ListHeaderComponent={listHeader}
                        contentContainerStyle={{ paddingBottom: metrics.hp5 }}
                        showsVerticalScrollIndicator={false}
                    />
                ) : (
                    <FlatList
                        data={filteredChats}
                        renderItem={renderItemChats}
                        keyExtractor={(item) => item.matchId}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={noSearchFound}
                        ListHeaderComponent={listHeader}
                        contentContainerStyle={{ paddingBottom: metrics.hp20 }}
                    />
                )}
            </ImageBackground>
        </AppSafeAreaView>
    )
};
export default ChatsScreen;
const styles = StyleSheet.create({
    firstLoadContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    }, numberCount: {
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
    }, chatListContainer: {
        paddingVertical: metrics.hp2,
        borderBottomWidth: 0.2,
        borderBottomColor: colors.borderfifty,
        marginHorizontal: metrics.hp2,
        flexDirection: "row",
        justifyContent: "space-between"
    }, messageContainer: {
        marginLeft: metrics.hp2
    }, moreOverlay: {
        height: metrics.hp9,
        width: metrics.hp9,
        borderRadius: metrics.hp50,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#00000070",
        overflow: "hidden"
    },
})