import React, { useEffect, useState } from "react";
import { AppSafeAreaView } from "../../common/AppSafeAreaView";
import { FlatList, ImageBackground, StyleSheet, View } from "react-native";
import PeopleHeader from "../../common/PeopleHeader";
import metrics from "../../assets/Metrics";
import { colors } from "../../theme/colors";
import FastImage from "react-native-fast-image";
import { blackHeart, blueTikeIcon, chatNoMatchEmpty, goldCard, matchRoundCircle, messageIcon, upgradPlan } from "../../helper/ImageAssets";
import { AppText, BLACK, DARK_GREEN, DARKGREEN, FORTEEN, INTER_BOLD, INTER_MEDIUM, INTER_REGULAR, INTER_SEMI_BOLD, LIGHT_BLACK, LIGHT_GREEN, OPECITY_DARK, PURPLE, SCHEHERAZADE_BOLD, SIXTEEN, TEN, THIRTEEN, TWELVE, TWENTY_FOUR, WHITE } from "../../common/AppText";
import { TouchableOpacityView } from "../../common/TouchableOpacityView";
import { chatData, newMatchData } from "../../common/UiltData";
import SearchContainer from "../../common/SearchContainer";
import NavigationService from "../../navigation/NavigationService";
import { NAVIGATION_SUBSCRIPTION_SCREEN, NAVIGATION_TAKING_SCREEN } from "../../navigation/routes";
import { Screen } from "../../theme/dimens";
import { useDispatch, useSelector } from "react-redux";
import { chatHistoryAPI, getNewMatches } from "../../actions/authActions";
import { chatHistoryDetails, matchChatDetails, setNewMatches } from "../../slices/loginServices/authSlice";
import { useIsFocused } from "@react-navigation/native";
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
    const userData = useSelector((state: any) => state.auth.userData);

    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(getNewMatches())
    }, [isFoucse])

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
    const onSubmit = (item: any) => {
        const data = {
            otherUserId: item.userId,
            matchId: item.matchId,
        };
        const params = {
            page: 1,
            limit: 50,
        };
        // Prevent previous chat messages from flashing in the next chat
        dispatch(chatHistoryDetails([]));
        dispatch(matchChatDetails(item));
        // Open chat instantly; load messages in background (WhatsApp-like)
        NavigationService.navigate(NAVIGATION_TAKING_SCREEN);
        dispatch(chatHistoryAPI(data, params, false));
    };

    const renderItemChats = ({ item, index }: any) => {

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
            <TouchableOpacityView key={item?.userId} onPress={() => onSubmit(item)} style={styles.chatListContainer}>
                <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                    <FastImage source={{ uri: item?.profilePicture?.url }} resizeMode="cover" style={styles.newMatchProfile} />
                    <View style={styles.messageContainer}>
                        <View style={{ flexDirection: "row" }}>
                            <AppText type={SIXTEEN} weight={INTER_BOLD} color={LIGHT_BLACK}>
                                {item.name}{"  "}
                            </AppText>
                            <FastImage source={blueTikeIcon} resizeMode="contain" style={styles.blueTickIcon} />
                        </View>
                        <AppText type={FORTEEN} numberOfLines={1} weight={item.unreadCount > 0 ? INTER_SEMI_BOLD : INTER_REGULAR} color={item.unreadCount > 0 ? BLACK : LIGHT_BLACK}>
                            {item?.lastMessage?.text ? truncateText(item?.lastMessage?.text) : "Send your first message"}
                        </AppText>
                    </View>
                </View>
                <View style={{ alignItems: "flex-end", marginTop: metrics.hp2_3 }}>
                    <AppText type={TEN} weight={item.unreadCount > 0 ? INTER_SEMI_BOLD : INTER_MEDIUM} color={item.unreadCount > 0 ? BLACK : OPECITY_DARK}>
                        {formatChatTime(item?.lastMessage?.createdAt) == "Invalid Date" ? "" : formatChatTime(item?.lastMessage?.createdAt)}
                    </AppText>
                    {item.unreadCount > 0 &&
                        <View style={[styles.numberCount, { marginTop: metrics.hp0_5 }]}>
                            <AppText type={TEN} weight={INTER_MEDIUM}>
                                {item.unreadCount}
                            </AppText>
                        </View>
                    }
                    {item.unreadCount == 0 && item?.lastMessage?.senderId !== userData?._id &&
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
    const HeaderListChats = () => {
        return (
            <View>
                <View style={{ paddingHorizontal: metrics.hp2 }}>
                    <SearchContainer onChangeText={setSearch} value={search} placeholder={"Search matches"} style={{ height: metrics.hp7 }} />
                    <View style={styles.newMatchTextContainer}>
                        <FastImage source={blackHeart} resizeMode="contain" style={styles.heartIcon} />
                        <AppText type={TWELVE} weight={INTER_SEMI_BOLD} color={BLACK}>
                            {"  "}New Matches{"  "}
                        </AppText>

                    </View>
                </View>
                <FlatList
                    data={newMatches}
                    horizontal
                    keyExtractor={(item) => item.userId}
                    showsHorizontalScrollIndicator={false}
                    renderItem={({ item, index }: any) => {
                        return (
                            <TouchableOpacityView onPress={() => onSubmit(item)} key={item?.userId} style={[styles.newmatchContainer, {
                                marginLeft: newMatches?.length + 1 == index ? 0 : metrics.hp2,
                                marginRight: newMatches?.length - 1 == index ? metrics.hp2 : 0
                            }]}>
                                <ImageBackground source={{ uri: item?.profilePicture?.url }} resizeMode="cover" style={styles.newMatchProfile}>
                                    {index == 0 &&
                                        <View style={styles.numbersMatchContainer}>
                                            <AppText type={FORTEEN} color={WHITE} weight={INTER_BOLD}>
                                                10+
                                            </AppText>
                                        </View>
                                    }
                                </ImageBackground>
                                <AppText style={{ marginTop: metrics.hp0_3 }} type={TWELVE} weight={INTER_SEMI_BOLD}>
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
                </View>
            </View>
        )
    }
    return (
        <AppSafeAreaView>
            <PeopleHeader profile={true} filter={true} />
            <View style={styles.singlelIne} />
            {newMatches?.length  === 0 ? emptyScreen()  :
                <FlatList
                    data={newMatches}
                    renderItem={renderItemChats}
                    keyExtractor={(item) => item.userId}
                    ListEmptyComponent={emptyScreen}
                    ListHeaderComponent={HeaderListChats}
                    contentContainerStyle={{ marginTop: metrics.hp2 }} />
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
    }
})