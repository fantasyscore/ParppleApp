import React, { useCallback } from 'react';
import { Chat, Bubble } from '@kesha-antonov/react-native-chat';
import { AppIcon, backIconNew, HeaderHomeBack, profileImage, timeShowNewBackground } from '../../helper/ImageAssets';
import { AppSafeAreaView } from '../../common/AppSafeAreaView';
import { StyleSheet, View, ImageBackground } from 'react-native';
import { newColor } from '../../theme/colors';
import metrics from '../../assets/Metrics';
import { AppText, fontSize, INTER_BOLD, INTER_SEMI_BOLD, TEN, TWELVE, WHITE } from '../../common/AppText';
import { TouchableOpacityView } from '../../common/TouchableOpacityView';
import FastImage from 'react-native-fast-image';
import { interSemiBold } from '../../theme/typography';
import NavigationService from '../../navigation/NavigationService';
import { useDispatch } from 'react-redux';

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
      <ImageBackground source={timeShowNewBackground} resizeMode='stretch' style={{ height: metrics.hp4, width: metrics.hp14, alignSelf: 'center', marginVertical: 10, alignItems: "center", justifyContent: "center" }} >
        <AppText color={WHITE} weight={INTER_SEMI_BOLD} type={TEN}>{displayText}</AppText>
      </ImageBackground>
    );
  }, []);

  const renderBubble = useCallback((props: any) => {
    return (
      // <View style={styles.bubbleWrapperRight}>
        <Bubble
          {...props}
          wrapperStyle={{
            left: { backgroundColor: '#7A4E40', borderRadius: metrics.hp0_5, padding: metrics.hp0_2, marginBottom: metrics.hp1_2 },
            right: { backgroundColor: '#555359', borderRadius: metrics.hp0_5, padding: metrics.hp0_2, paddingRight: metrics.hp3, marginBottom: metrics.hp1_2, marginRight: metrics.hp1, position: 'relative' },
          }}
          textStyle={{
            left: { color: 'white', fontSize: fontSize(14), fontFamily: interSemiBold },
            right: { color: 'white', fontSize: fontSize(14), fontFamily: interSemiBold },
          }}
        />

      // </View>
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
        {/* <Time {...props} timeTextStyle={{ left: { color: colors.darkOpecity }, right: { color: colors.darkOpecity } }} containerStyle={{ left: { marginTop: 2 }, right: { marginTop: 2 } }} /> */}
        {/* {props?.currentMessage?.isMine ?
          <FastImage source={noccce} resizeMode='contain' style={{
            height: metrics.hp2, width: metrics.hp2_3, position: 'absolute',
            bottom: -metrics.hp0_29,
            right: -metrics.hp3_7,
          }} tintColor={"#EDE0FF"} /> :
          <FastImage
            source={noccce} tintColor={"#7A4E40"} resizeMode='contain' style={{
              height: metrics.hp2, width: metrics.hp2_3, position: 'absolute',
              bottom: -metrics.hp0_29,
              left: -metrics.hp1,
              alignItems: 'center',
              justifyContent: 'center',
            }} />
        } */}
      </View>
    );
  };

  const renderCustomInput = () => (
    <></>
  );

  return (
    <AppSafeAreaView color={newColor.blackNew}>
      <ImageBackground source={HeaderHomeBack} resizeMode="stretch" style={[styles.bottomLayer]}>

        <TouchableOpacityView style={{
          flexDirection: "row", alignItems: "center", paddingHorizontal: metrics.hp2,
          marginTop: metrics.hp4_5,
        }} onPress={() => NavigationService.goBack()}>
          <FastImage source={backIconNew} resizeMode="contain" style={styles.backIcon} />
          <FastImage source={AppIcon} resizeMode="cover" style={styles.profileImage} />
          <AppText type={TWELVE} color={WHITE} weight={INTER_BOLD}>{"    "}Parpple Team
          </AppText>
        </TouchableOpacityView>
      </ImageBackground>
      {/* <View style={{ flex: 1 }}> */}
        <View style={styles.containerChat}>
          <Chat
            messages={ChatMessage}
            user={{ _id: USER_ID, name: 'Gurrent User', avatar: profileImage }}
            renderAvatar={renderAvatar}
            renderBubble={renderBubble}
            renderDay={renderDay}
            renderTime={renderTime}
            renderInputToolbar={renderCustomInput}
            theme={{
              colors: {
                  background: newColor.blackNew,
              }
          }}
            darkTheme={{
              colors:{
                  background: newColor.blackNew,
              }
          }}
          />
        </View>
      {/* </View> */}
    </AppSafeAreaView>
  );
};

export default BotChatScreen;

const styles = StyleSheet.create({
  bottomLayer: {
    height: metrics.hp13,
    width: "100%",
    paddingVertical: metrics.hp2,
  },  backIcon: {
    height: metrics.hp4,
    width: metrics.hp4
  },
  profileImage: {
    height: metrics.hp4,
    width: metrics.hp4,
    borderRadius: metrics.hp50,
    marginLeft: metrics.hp2_5
  },containerChat: { flex: 1, backgroundColor: newColor.blackNew, /* paddingHorizontal: metrics.hp2, paddingVertical: metrics.hp5 */ },});
