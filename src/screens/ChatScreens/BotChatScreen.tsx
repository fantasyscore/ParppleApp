import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { Bubble, GiftedChat, Time } from 'react-native-gifted-chat';
import { AppIcon, backIcon, blackIcon, blockModalImage, blueTikeIcon, check, checks, emojiIcon, noccce, profileImage, rightBlack, sendButton, unmatchModalImage } from '../../helper/ImageAssets';
import { AppSafeAreaView } from '../../common/AppSafeAreaView';
import ChatHeader from '../../common/ChatHeader';
import { StyleSheet, View, TextInput, KeyboardAvoidingView, Keyboard, Dimensions, Modal, Animated } from 'react-native';
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
import { createSocket } from '../../common/Socket';
import { appOperation } from '../../appOperation';
import { ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { clearActiveChat, setActiveChatMatchId } from '../../slices/inAppNotificationSlice';
import { chatHistoryDetails } from '../../slices/loginServices/authSlice';

const USER_ID = 1;


const ChatMessage = [
  {
    _id: 1,
    text: 'Welcome to Parpple! This is where meaningful conversations begin—be genuine, stay respectful, and enjoy getting to know someone new.',
    createdAt: new Date(),
    user: {
      _id: 2,
      name: 'John Doe',
      avatar: AppIcon,
    },
  },
]


const BotChatScreen = () => {
  const dispatch = useDispatch();
  const renderDay = useCallback((props: any) => {
    if (props.currentMessage?._id === 'typing-indicator') return null;
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
  }, []);

  const renderBubble = useCallback((props: any) => {
    return (
      <View style={styles.bubbleWrapperRight}>
        <Bubble
          {...props}
          wrapperStyle={{
            left: { backgroundColor: '#FFFFFF', borderRadius: metrics.hp0_5, padding: metrics.hp0_2, marginBottom: metrics.hp1_2 },
            right: { backgroundColor: '#EDE0FF', borderRadius: metrics.hp0_5, padding: metrics.hp0_2, paddingRight: metrics.hp3, marginBottom: metrics.hp1_2, marginRight: metrics.hp1, position: 'relative' },
          }}
          textStyle={{
            left: { color: 'black', fontSize: fontSize(14), fontFamily: interSemiBold },
            right: { color: 'black', fontSize: fontSize(14), fontFamily: interSemiBold },
          }}
        />

      </View>
    );
  }, []);

  const renderAvatar = useCallback((props: any) => {
    return (
      <FastImage
        source={AppIcon}
        resizeMode='cover'
        style={{ width: metrics.hp4, height: metrics.hp4, borderRadius: metrics.hp2, marginBottom: metrics.hp1_5 }}
      />
    );
  }, []);

  const renderTime = (props: any) => {
    return (
      <View>
        <Time {...props} timeTextStyle={{ left: { color: colors.darkOpecity }, right: { color: colors.darkOpecity } }} containerStyle={{ left: { marginTop: 2 }, right: { marginTop: 2 } }} />
        {props?.currentMessage?.isMine ?
          <FastImage source={noccce} resizeMode='contain' style={{
            height: metrics.hp2, width: metrics.hp2_3, position: 'absolute',
            bottom: -metrics.hp0_29,
            right: -metrics.hp3_7,
          }} tintColor={"#EDE0FF"} /> :
          <FastImage
            source={noccce} resizeMode='contain' style={{
              height: metrics.hp2, width: metrics.hp2_3, position: 'absolute',
              bottom: -metrics.hp0_29,
              left: -metrics.hp1,
              alignItems: 'center',
              justifyContent: 'center',
            }} />
        }
      </View>
    );
  };

  const renderCustomInput = () => (
    <></>
  );

  return (
    <AppSafeAreaView>
      <View style={styles.container}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacityView onPress={() => NavigationService.goBack()}>
            <FastImage source={backIcon} resizeMode="contain" style={styles.backIcon} />
          </TouchableOpacityView>
          <TouchableOpacityView style={{ flexDirection: "row", alignItems: "center" }}>
            <FastImage source={AppIcon} resizeMode="contain" style={styles.profileImage} />
            <AppText type={TWELVE} weight={INTER_BOLD}>{"  "}Parpple Team,
            </AppText>
            <FastImage source={blueTikeIcon} resizeMode="contain" style={styles.blueTickIcon} />
          </TouchableOpacityView>
        </View>
        <TouchableOpacityView style={{ padding: metrics.hp1 }} disabled={true}>
        </TouchableOpacityView>
      </View>
      <View style={{ flex: 1 }}>
        <View style={styles.containerChat}>
          <GiftedChat
            messages={ChatMessage}
            user={{ _id: USER_ID, name: 'Gurrent User', avatar: profileImage }}
            renderAvatar={renderAvatar}
            renderBubble={renderBubble}
            renderDay={renderDay}
            renderTime={renderTime}
            renderInputToolbar={renderCustomInput}
            showUserAvatar={false}
          />
        </View>
      </View>
    </AppSafeAreaView>
  );
};

export default BotChatScreen;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: metrics.hp2, flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: colors.white,
    marginTop: metrics.hp4_5,
    height: metrics.hp5_5
  },
  backIcon: {
    height: metrics.hp2_5,
    width: metrics.hp2_5,
  },
  profileImage: {
    height: metrics.hp4,
    width: metrics.hp4,
    borderRadius: metrics.hp50,
    marginLeft: metrics.hp2_5
  },
  blueTickIcon: {
    height: metrics.hp2,
    width: metrics.hp2,
    marginTop:metrics.hp0_4
  },
  tabContainer: { backgroundColor: colors.white, height: metrics.hp5, justifyContent: 'flex-end' },
  selectLine: { height: metrics.hp0_3, width: metrics.hp11, borderTopRightRadius: metrics.hp1, borderTopLeftRadius: metrics.hp1 },
  inTabContainer: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  containerChat: { flex: 1, backgroundColor: '#F5F7FA', paddingHorizontal: metrics.hp2, paddingVertical: metrics.hp5 },
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
  bubbleWrapperRight: {
    position: 'relative',
    alignSelf: 'flex-end',
  },
  loaderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#F5F7FA',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  readReceiptContainer: {
    position: 'absolute',
    bottom: metrics.hp1_2,
    right: metrics.hp2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  readReceiptIcon: {
    height: metrics.hp2_5,
    width: metrics.hp2_5,
  },
  readReceiptIconUnread: {
    height: metrics.hp2,
    width: metrics.hp2,
    marginBottom: metrics.hp0_5,
    marginLeft: metrics.hp0_5,
  },
  typingBubbleWrapper: {
    marginBottom: metrics.hp1_2,
    marginLeft: metrics.hp2,
    alignSelf: 'flex-start',
  },
  typingBubble: {
    backgroundColor: '#FFFFFF',
    borderRadius: metrics.hp1_5,
    paddingHorizontal: metrics.hp1,
    paddingVertical: metrics.hp0_5,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: metrics.hp1_7,
  },
  typingDotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: metrics.hp0_5,
  },
  typingDot: {
    backgroundColor: colors.darkOpecity,
    borderRadius: metrics.hp0_5,
  },
});
