import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Bubble, GiftedChat, Time } from 'react-native-gifted-chat';
import { blockModalImage, emojiIcon, profileImage, sendButton, unmatchModalImage } from '../../helper/ImageAssets';
import { AppSafeAreaView } from '../../common/AppSafeAreaView';
import ChatHeader from '../../common/ChatHeader';
import { StyleSheet, View, TextInput, KeyboardAvoidingView, Keyboard, Dimensions, Modal } from 'react-native';
import { colors } from '../../theme/colors';
import metrics from '../../assets/Metrics';
import { AppText, fontSize, FORTEEN, INTER_BOLD, INTER_MEDIUM, INTER_SEMI_BOLD, LIGHT_BLACK, OPECITY_DARK, PURPLE, SCHEHERAZADE_BOLD, SIXTEEN, TEN, TWELVE, TWENTY_FOUR, WHITE } from '../../common/AppText';
import { TouchableOpacityView } from '../../common/TouchableOpacityView';
import FastImage from 'react-native-fast-image';
import { interMedium, interSemiBold } from '../../theme/typography';
import EmojiSelector, { Categories } from 'react-native-emoji-selector';
import { Screen } from '../../theme/dimens';
import ChatProfileScreen from './ChatProfileScreen';
import RBSheet from 'react-native-raw-bottom-sheet';
import { threeDotData } from '../../common/UiltData';
import NavigationService from '../../navigation/NavigationService';
import { NAVIGATION_REPORT_SCREEN } from '../../navigation/routes';
import { useDispatch, useSelector } from 'react-redux';
import { getOtherProfile, userBlockAPI, userUnmatchAPI } from '../../actions/authActions';

const USER_ID = 1;

type ChatMessage = {
    _id: number;
    text: string;
    createdAt: Date;
    user: {
        _id: number;
        name: string;
        avatar: any;
    };
}

const initialMessages: ChatMessage[] = [
    {
        _id: 5,
        text: "That sounds great! I'm looking forward to it.",
        createdAt: new Date(),
        user: { _id: 2, name: 'Jane Doe', avatar: profileImage },
    },
    {
        _id: 4,
        text: 'We should meet next week to discuss the project 🗓️.',
        createdAt: new Date(2025, 8, 25, 14, 10, 0),
        user: { _id: USER_ID, name: 'Gaurav User', avatar: profileImage },
    },
    {
        _id: 3,
        text: 'Hello there! How are you doing today?',
        createdAt: new Date(2025, 8, 29, 17, 20, 0),
        user: { _id: 2, name: 'Jane Doe', avatar: profileImage },
    },
];

const TakingScreen = () => {
    const dispatch = useDispatch();
    const matchChatUserDetails = useSelector((state: any) => state.auth.matchChatUserDetails);
    const otherUserProfile = useSelector((state: any) => state.auth.otherUserProfile);

    const refFilter: any = useRef(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [tabSelect, setTabSelect] = useState('Chat');
    const [inputText, setInputText] = useState('');
    const [emojiVisible, setEmojiVisible] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [saveReportTitle, setSaveReportTitle] = useState("");
    const [profileData, setProfileData] = useState();

    useEffect(() => {
            let data = {
                "userId": matchChatUserDetails?.userId
            };
            dispatch(getOtherProfile(data, true, setProfileData, true));
        setMessages(initialMessages);
    }, []);
    useEffect(() => {
        const showSubscription = Keyboard.addListener("keyboardDidShow", () => {
            setEmojiVisible(false);
        });
        return () => showSubscription.remove();
    }, []);

    const onSend = useCallback((newMessages: ChatMessage[] = []) => {
        setMessages(prev => GiftedChat.append(prev, newMessages));
        setInputText('');
    }, []);

    const renderDay = (props: any) => {
        const date = props.currentMessage?.createdAt ? new Date(props.currentMessage.createdAt) : null;
        if (!date) return null;

        const today = new Date();
        const isToday = date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
        const displayText = isToday ? 'Today' : `${date.getDate()} ${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][date.getMonth()]} ${date.getFullYear()}`;

        return (
            <View style={{ alignSelf: 'center', marginVertical: 10 }}>
                <AppText color={OPECITY_DARK} weight={INTER_SEMI_BOLD} type={TEN}>{displayText}</AppText>
            </View>
        );
    };

    const renderBubble = (props: any) => (
        <Bubble
            {...props}
            wrapperStyle={{
                left: { backgroundColor: '#FFFFFF', borderRadius: metrics.hp0_5, padding: metrics.hp0_2, marginBottom: metrics.hp1_2 },
                right: { backgroundColor: '#EDE0FF', borderRadius: metrics.hp0_5, padding: metrics.hp0_2, marginBottom: metrics.hp1_2, marginRight: 0 },
            }}
            textStyle={{
                left: { color: 'black', fontSize: fontSize(14), fontFamily: interSemiBold },
                right: { color: 'black', fontSize: fontSize(14), fontFamily: interSemiBold },
            }}
        />
    );

    const renderAvatar = (props: any) => {
        if (props.currentMessage.user._id === USER_ID) return null; // hide sent avatars
        return (
            <FastImage
                source={matchChatUserDetails?.profilePicture[0]?.url ? { uri: matchChatUserDetails?.profilePicture[0]?.url } : profileImage}
                resizeMode='cover'
                style={{ width: metrics.hp4, height: metrics.hp4, borderRadius: metrics.hp2, marginBottom: metrics.hp1_5 }}
            />
        );
    };
    const unMatchButton = () => {
        const data = {
            matchId: matchChatUserDetails?.matchId
        }
        dispatch(userUnmatchAPI(data))
        setModalVisible(false)
    }
    const unBlockButton = () => {
        const data = {
            matchId: matchChatUserDetails?.matchId
        }
        dispatch(userBlockAPI(data))
        setModalVisible(false)
    }
    const renderTime = (props: any) => <Time {...props} timeTextStyle={{ left: { color: colors.darkOpecity }, right: { color: colors.darkOpecity } }} containerStyle={{ left: { marginTop: 2 }, right: { marginTop: 2 } }} />;

    const renderCustomInput = () => (
        <KeyboardAvoidingView keyboardVerticalOffset={80} style={styles.inputContainer}>
            <View style={styles.inputContainerType}>
                <TextInput
                    style={styles.textInput}
                    value={inputText}
                    onChangeText={setInputText}
                    placeholder="Type a message..."
                    multiline
                />
            </View>
            <TouchableOpacityView
                style={styles.sendButton}
                onPress={() => {
                    if (inputText.trim().length > 0) {
                        console.log("Hello")
                        onSend([{
                            _id: Math.random(),
                            text: inputText,
                            createdAt: new Date(),
                            user: { _id: USER_ID, name: 'Gurrent User', avatar: profileImage }
                        }]);
                    }
                }}>
                <FastImage source={sendButton} resizeMode='contain' style={{ height: metrics.hp3, width: metrics.hp3 }} />
            </TouchableOpacityView>
        </KeyboardAvoidingView>
    );
    const onthreedot = (index: any) => {
        if (index == "0") refFilter?.current?.close(), setModalVisible(true), setSaveReportTitle("unMatch");
        if (index == "1") refFilter?.current?.close(), NavigationService.navigate(NAVIGATION_REPORT_SCREEN)
        if (index == '2') refFilter?.current?.close(), setModalVisible(true), setSaveReportTitle("Block");

    }
    return (
        <AppSafeAreaView>
            <ChatHeader onPress={() => refFilter?.current?.open()} />

            <View style={styles.tabContainer}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacityView onPress={() => setTabSelect('Chat')} style={styles.inTabContainer}>
                        <AppText type={TWELVE} weight={INTER_BOLD} color={tabSelect === 'Chat' ? PURPLE : OPECITY_DARK}>Chat</AppText>
                        <View style={[styles.selectLine, { backgroundColor: tabSelect === 'Chat' ? colors.purple : colors.transparent }]} />
                    </TouchableOpacityView>
                    <AppText type={SIXTEEN} style={{ color: "#C3B7D0" }}>
                        /
                    </AppText>
                    <TouchableOpacityView onPress={() => setTabSelect('Profile')} style={styles.inTabContainer}>
                        <AppText type={TWELVE} weight={INTER_BOLD} color={tabSelect === 'Profile' ? PURPLE : OPECITY_DARK}>Profile</AppText>
                        <View style={[styles.selectLine, { backgroundColor: tabSelect === 'Profile' ? colors.purple : colors.transparent }]} />
                    </TouchableOpacityView>
                </View>
            </View>
            {tabSelect == "Chat" ?
                <View style={{ flex: 1 }}>
                    <View style={styles.containerChat}>
                        <GiftedChat
                            messages={messages}
                            onSend={onSend}
                            user={{ _id: USER_ID, name: 'Gurrent User', avatar: profileImage }}
                            renderAvatar={renderAvatar}
                            renderBubble={renderBubble}
                            renderDay={renderDay}
                            renderTime={renderTime}
                            renderInputToolbar={renderCustomInput}
                            showUserAvatar={false}

                        />
                    </View>
                </View> :
                <ChatProfileScreen />
            }
            <RBSheet ref={refFilter} openDuration={100}
                height={Dimensions.get('window').height / 3.10}
                customStyles={{
                    wrapper: {
                        backgroundColor: '#00000080',
                    },
                    container: {
                        backgroundColor: colors.white,
                        borderTopLeftRadius: metrics.hp2,
                        borderTopRightRadius: metrics.hp2
                    }
                }}>
                <View style={styles.containerRb}>
                    {threeDotData?.map((item, index) => {
                        return (
                            <TouchableOpacityView onPress={() => onthreedot(index)} key={index} style={styles.containerViewRb}>
                                <FastImage source={item.icon} resizeMode='contain' style={styles.rbIcon} />
                                <View style={styles.textContainerRb}>
                                    <AppText type={FORTEEN} weight={INTER_SEMI_BOLD}>
                                        {item.headLine}
                                    </AppText>
                                    <AppText type={TEN} weight={INTER_MEDIUM} color={OPECITY_DARK}>
                                        {item.disLine}
                                    </AppText>
                                </View>
                            </TouchableOpacityView>
                        )
                    })}
                </View>
            </RBSheet>
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}>
                {saveReportTitle == "unMatch" &&
                    <View style={styles.centeredView}>
                        <View style={styles.confirmContainer}>
                            <FastImage source={unmatchModalImage} resizeMode="stretch" style={styles.bdyBack} />
                            <AppText style={{ textAlign: "center" }} type={TWENTY_FOUR} weight={SCHEHERAZADE_BOLD} color={LIGHT_BLACK}>
                                Would you like to
                            </AppText>
                            <AppText style={{ marginTop: -metrics.hp3, textAlign: "center" }} type={TWENTY_FOUR} weight={SCHEHERAZADE_BOLD} color={LIGHT_BLACK}>
                                Unmatch this user?
                            </AppText>
                            <TouchableOpacityView onPress={() => unMatchButton()} style={[styles.ediButton, { backgroundColor: colors.purple, marginTop: metrics.hp0 }]}>
                                <AppText color={WHITE} weight={INTER_SEMI_BOLD} type={TWELVE}>
                                    Yes, Unmatch
                                </AppText>
                            </TouchableOpacityView>
                            <AppText onPress={() => setModalVisible(false)} weight={INTER_SEMI_BOLD} type={TWELVE} style={{ textAlign: "center", marginTop: metrics.hp2 }} color={LIGHT_BLACK}>
                                No, cancel
                            </AppText>
                        </View>
                    </View>}
                {saveReportTitle == "Block" &&
                    <View style={styles.centeredView}>
                        <View style={[styles.confirmContainer, { height: metrics.hp42, }]}>
                            <FastImage source={blockModalImage} resizeMode="stretch" style={[styles.bdyBack, { height: metrics.hp18 }]} />
                            <AppText style={{ textAlign: "center" }} type={TWENTY_FOUR} weight={SCHEHERAZADE_BOLD} color={LIGHT_BLACK}>
                                Block Diskha?
                            </AppText>
                            <AppText style={{ marginTop: -metrics.hp2, textAlign: "center" }} type={TWELVE} weight={INTER_MEDIUM} color={OPECITY_DARK}>
                                You won’t be able to undo this. You sure{'\n'} to continue?
                            </AppText>
                            <TouchableOpacityView onPress={() => unBlockButton()} style={[styles.ediButton, { backgroundColor: colors.purple, marginTop: metrics.hp2 }]}>
                                <AppText color={WHITE} weight={INTER_SEMI_BOLD} type={TWELVE}>
                                    Yes, Block
                                </AppText>
                            </TouchableOpacityView>
                            <AppText onPress={() => setModalVisible(false)} weight={INTER_SEMI_BOLD} type={TWELVE} style={{ textAlign: "center", marginTop: metrics.hp2 }} color={LIGHT_BLACK}>
                                No, cancel
                            </AppText>
                        </View>
                    </View>}
            </Modal>
        </AppSafeAreaView>
    );
};

export default TakingScreen;

const styles = StyleSheet.create({
    tabContainer: { backgroundColor: colors.white, height: metrics.hp5, justifyContent: 'flex-end' },
    selectLine: { height: metrics.hp0_3, width: metrics.hp11, borderTopRightRadius: metrics.hp1, borderTopLeftRadius: metrics.hp1 },
    inTabContainer: { alignItems: 'center', justifyContent: 'center', flex: 1 },
    containerChat: { flex: 1, backgroundColor: '#F5F7FA' },
    inputContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: metrics.hp2, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e0e0e0', paddingVertical: metrics.hp2 },
    textInput: { minHeight: metrics.hp4, maxHeight: metrics.hp8, fontSize: fontSize(13), width: "83%", fontFamily: interMedium, marginLeft: metrics.hp1 },
    sendButton: { backgroundColor: '#6F13F2', borderRadius: metrics.hp50, marginLeft: 6, justifyContent: 'center', alignItems: 'center', height: metrics.hp5_5, width: metrics.hp5_5 },
    inputContainerType: { borderWidth: metrics.hp0_1, borderColor: colors.nanoOpecity, borderRadius: metrics.hp5, paddingHorizontal: metrics.hp1, alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row', paddingVertical: metrics.hp0_5 },
    emojiIcon: { height: metrics.hp3, width: metrics.hp3 },
    containerRb: { paddingHorizontal: metrics.hp2, paddingVertical: metrics.hp2 },
    containerViewRb: { paddingHorizontal: metrics.hp1, paddingVertical: metrics.hp2, flexDirection: "row", backgroundColor: colors.lightBack, marginBottom: metrics.hp0_5, borderRadius: metrics.hp1_5 },
    rbIcon: { height: metrics.hp2_5, width: metrics.hp2_5, marginTop: metrics.hp0_5 },
    textContainerRb: { paddingLeft: metrics.hp2, paddingRight: metrics.hp5 },
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colors.transparentBlack,
        paddingHorizontal: metrics.hp2
    },
    confirmContainer: {
        height: metrics.hp40,
        backgroundColor: colors.white,
        width: Screen.Width / 1.20,
        borderRadius: metrics.hp2,
    },
    bdyBack: {
        // width: Screen.Width / 1.20,/
        height: metrics.hp17,
        borderTopRightRadius: metrics.hp2,
        borderTopLeftRadius: metrics.hp2,

    },
    ediButton: {
        height: metrics.hp5,
        borderWidth: 1,
        borderColor: colors.purple,
        borderRadius: metrics.hp4,
        alignItems: "center",
        justifyContent: "center",
        width: "40%",
        alignSelf: "center",
    },
});
