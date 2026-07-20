const fs = require('fs');

const homePath = './src/screens/HomeScreens/HomeScreen.tsx';
const likesPath = './src/screens/LikesYouScreens/LikesYouScreen.tsx';

const homeContent = fs.readFileSync(homePath, 'utf8');

// We want to extract PulsingCircle and ProfileListCard from HomeScreen
const pulsingCircleRegex = /const PulsingCircle = memo\(\(\{[^]*?\}\);/m;
const profileListCardPropsRegex = /type ProfileListCardProps = \{[^]*?\};/m;
const profileListCardRegex = /\/\/ Memoized row[^]*?const ProfileListCard = memo\([^]*?\}\);/m;
const homeStylesRegex = /const styles = StyleSheet\.create\(\{([^]*)\}\);/m;

const pulsingCircle = homeContent.match(pulsingCircleRegex)[0];
const profileListCardProps = homeContent.match(profileListCardPropsRegex)[0];
const profileListCard = homeContent.match(profileListCardRegex)[0];
const homeStyles = homeContent.match(homeStylesRegex)[1];

const targetCode = `import React, { memo, useCallback, useEffect, useRef, useState, useMemo } from 'react';
import {
    Animated,
    FlatList,
    Image,
    ImageBackground,
    InteractionManager,
    Modal,
    Platform,
    StyleSheet,
    View,
} from 'react-native';
import { AppText, INTER_MEDIUM, INTER_SEMI_BOLD, SCHEHERAZADE_BOLD, SIXTEEN, TWELVE, WHITE, BLACK } from '../../common/AppText';
import { directChatIcon, locIcon, lockIconWhite, newCloseIcon, newIcon, newLikeIcon, newProfileBackground, straightenIcon, tabViewForLikes, likedYouNewIcon, youLikedNewIcon } from '../../helper/ImageAssets';
import metrics from '../../assets/Metrics';
import FastImage from 'react-native-fast-image';
import { colors, newColor } from '../../theme/colors';
import { TouchableOpacityView } from '../../common/TouchableOpacityView';
import { useDispatch, useSelector } from 'react-redux';
import { AppSafeAreaView } from '../../common/AppSafeAreaView';
import { likeByOther, likeYou, viewProfileByOther, youView, swipeLikeDisLike } from '../../actions/authActions';
import { useIsFocused } from '@react-navigation/native';
import NewHeaderAndroid from '../../common/NewHeaderAndroid';
import { useLikeDislikeAnimation } from '../../hooks/useLikeDislikeAnimation';
import { LikeDislikeOverlays } from '../../common/LikeDislikeOverlays';
import ViewProfileAndroid from '../HomeScreens/ViewProfileAndroid';

const CARD_HEIGHT = metrics.hp44;
const CARD_MARGIN_BOTTOM = metrics.hp6;
const ITEM_HEIGHT = CARD_HEIGHT + CARD_MARGIN_BOTTOM;
const LIST_TOP_PADDING = metrics.hp3;

${pulsingCircle}

${profileListCardProps}

${profileListCard}

const LikesYouScreen = () => {
    const dispatch = useDispatch();
    const IsFocused = useIsFocused();

    const [tabSelect, setTabSelect] = useState('Likes');
    const [likeYoue, setlikeYou] = useState('Likes You');
    const [ViewYoue, setViewYou] = useState('Viewed You');

    const likeByOtherData = useSelector((state: any) => state.auth.likeByOtherData);
    const likeYouData = useSelector((state: any) => state.auth.likeYouData);
    const viewByOtherData = useSelector((state: any) => state.auth.viewByOtherData);
    const viewYouData = useSelector((state: any) => state.auth.viewYouData);
    const userData = useSelector((state: any) => state.auth.userData);

    const [modalVisible, setModalVisible] = useState(false);
    const [currentProfileData, setCurrentProfileData] = useState({});
    const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());

    const {
        runLikeAnimation,
        runDislikeAnimation,
        likeOverlayStyle,
        likeIconAnimatedStyle,
        dislikeOverlayStyle,
        dislikeIconAnimatedStyle,
        isSwipeAnimatingRef,
    } = useLikeDislikeAnimation();

    useEffect(() => {
        dispatch(likeByOther());
        dispatch(likeYou());
        dispatch(viewProfileByOther());
        dispatch(youView());
    }, [IsFocused]);

    const dataCorrect = useCallback(() => {
        const { subscription } = userData || {};
        const { perks = {}, plan } = subscription || {};

        const canSeeLikes = perks?.canSeeLikes || plan !== "FREE";
        const canSeeViews = perks?.canSeeViews || plan !== "FREE";

        let data: any[] = [];

        if (tabSelect === "Likes" && likeYoue === "Likes You") {
            data = likeByOtherData?.length ? likeByOtherData : [];
            return data.map((item: any) => ({ ...item, see: canSeeLikes }));
        }

        if (tabSelect === "Likes" && likeYoue === "You Liked") {
            data = likeYouData?.length ? likeYouData : [];
            return data.map((item: any) => ({ ...item, see: true }));
        }

        if (tabSelect === "Views" && ViewYoue === "Viewed You") {
            data = viewYouData?.length ? viewYouData : [];
            return data.map((item: any) => ({ ...item, see: canSeeViews }));
        }

        if (tabSelect === "Views" && ViewYoue === "You Viewed") {
            data = viewByOtherData?.length ? viewByOtherData : [];
            return data.map((item: any) => ({ ...item, see: true }));
        }

        return [];
    }, [tabSelect, likeYoue, ViewYoue, likeByOtherData, likeYouData, viewByOtherData, viewYouData, userData]);

    const filteredData = useMemo(() => {
        return dataCorrect().filter((item: any) => !hiddenIds.has(item._id));
    }, [dataCorrect, hiddenIds]);

    const handleListSwipe = useCallback((item: any, type: "like" | "dislike") => {
        if (!item?._id) return;
        dispatch(swipeLikeDisLike({ swipedId: item._id, type }));
        setHiddenIds((prev) => new Set(prev).add(item._id));
    }, [dispatch]);

    const handleDislikePress = useCallback((item: any) => {
        setModalVisible(false);
        if (isSwipeAnimatingRef.current) return;
        runDislikeAnimation(() => {
            handleListSwipe(item, "dislike");
        });
    }, [handleListSwipe, isSwipeAnimatingRef, runDislikeAnimation]);

    const handleLikePress = useCallback((item: any) => {
        setModalVisible(false);
        if (isSwipeAnimatingRef.current) return;
        runLikeAnimation(() => {
            handleListSwipe(item, "like");
        });
    }, [handleListSwipe, isSwipeAnimatingRef, runLikeAnimation]);

    const handleOpenPreview = useCallback((item: any) => {
        setCurrentProfileData(item)
        setModalVisible(true);
    }, []);

    const renderItem = useCallback(({ item }: any) => (
        <ProfileListCard item={item} onLike={handleLikePress} onDislike={handleDislikePress} onOpenPreview={handleOpenPreview} />
    ), [handleLikePress, handleDislikePress, handleOpenPreview]);

    const keyExtractor = useCallback((item: any, index: number) => item?._id ?? \`profile-\${index}\`, []);

    const getItemLayout = useCallback((_: any, index: number) => ({
        length: ITEM_HEIGHT,
        offset: LIST_TOP_PADDING + ITEM_HEIGHT * index,
        index,
    }), []);

    const listEmptyComponent = useCallback(() => (
        <View style={styles.emptyContainer}>
            <PulsingCircle size={metrics.hp15} />
            <View style={styles.emptyAvatarRing}>
                <FastImage resizeMode='cover' style={styles.emptyImage} source={{ uri: userData?.gallery?.[0]?.url }} />
            </View>
            <AppText style={styles.emptyText} type={TWELVE} color={WHITE} weight={INTER_MEDIUM}>
                Searching people near you...
            </AppText>
        </View>
    ), [userData?.gallery]);

    return (
        <AppSafeAreaView style={{ flexGrow: 1 }} color={newColor.blackNew}>
            <View style={{ flex: 1, zIndex: 1 }}>
                <View
                    style={{
                        position: "absolute",
                        top: metrics.hp11,
                        alignSelf: "center",
                        flexDirection: "row",
                        zIndex: 0,
                    }}>
                    <TouchableOpacityView
                        onPress={() => setlikeYou("Likes You")}
                        activeOpacity={1}
                        style={{
                            zIndex: likeYoue === "Likes You" ? 2 : 1,
                            elevation: likeYoue === "Likes You" ? 2 : 1,
                        }}>
                        <ImageBackground
                            source={tabViewForLikes}
                            resizeMode="stretch"
                            style={{
                                height: metrics.hp6,
                                width: metrics.hp22,
                                justifyContent: "center",
                                alignItems: "center",
                            }}
                            imageStyle={{
                                tintColor: likeYoue === "Likes You" ? "#E6B7A8" : "#555359",
                            }}>
                            <View style={{ flexDirection: "row", alignItems: "center", marginTop: metrics.hp1 }}>
                                <FastImage
                                    source={likedYouNewIcon}
                                    tintColor={likeYoue === "Likes You" ? "black" : "#FAFAFA66"}
                                    resizeMode="contain"
                                    style={{
                                        width: metrics.hp3,
                                        height: metrics.hp3,
                                    }}
                                />
                                <AppText style={{ marginTop: -metrics.hp0_5, color: likeYoue === "Likes You" ? "black" : "#FAFAFA66" }} weight={SCHEHERAZADE_BOLD} type={SIXTEEN}>
                                    {" "}Liked You
                                </AppText>
                            </View>
                        </ImageBackground>
                    </TouchableOpacityView>

                    <TouchableOpacityView
                        onPress={() => setlikeYou("You Liked")}
                        activeOpacity={1}
                        style={{
                            marginLeft: -metrics.hp4,
                            zIndex: likeYoue === "You Liked" ? 2 : 1,
                            elevation: likeYoue === "You Liked" ? 2 : 1,
                        }}>
                        <ImageBackground
                            source={tabViewForLikes}
                            resizeMode="contain"
                            style={{
                                height: metrics.hp6,
                                width: metrics.hp22,
                                justifyContent: "center",
                                alignItems: "center",
                            }}
                            imageStyle={{
                                tintColor: likeYoue === "You Liked" ? "#E6B7A8" : "#555359",
                            }}>
                            <View style={{ flexDirection: "row", alignItems: "center", marginTop: metrics.hp1 }}>
                                <FastImage tintColor={likeYoue === "You Liked" ? "black" : "#FAFAFA66"} source={youLikedNewIcon} resizeMode="contain" style={{ height: metrics.hp3, width: metrics.hp3 }} />
                                <AppText style={{ marginTop: -metrics.hp0_5, color: likeYoue === "You Liked" ? "black" : "#FAFAFA66" }} weight={SCHEHERAZADE_BOLD} type={SIXTEEN}>
                                    {" "}You Liked
                                </AppText>
                            </View>
                        </ImageBackground>
                    </TouchableOpacityView>
                </View>
                <View style={{ zIndex: 1 }}>
                    <NewHeaderAndroid style={{
                        zIndex: 10,
                        elevation: 10,
                    }} />
                </View>
            </View>

            <FlatList
                data={filteredData}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                getItemLayout={getItemLayout}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={listEmptyComponent}
                initialNumToRender={4}
                maxToRenderPerBatch={6}
                windowSize={7}
                updateCellsBatchingPeriod={50}
                removeClippedSubviews={Platform.OS === 'android'}
                showsVerticalScrollIndicator={false}
            />
            <LikeDislikeOverlays
                likeOverlayStyle={likeOverlayStyle}
                likeIconAnimatedStyle={likeIconAnimatedStyle}
                dislikeOverlayStyle={dislikeOverlayStyle}
                dislikeIconAnimatedStyle={dislikeIconAnimatedStyle}
            />
            <Modal
                animationType="fade"
                visible={modalVisible}
                statusBarTranslucent
                onRequestClose={() => setModalVisible(false)}>
                <ViewProfileAndroid currentProfileData={currentProfileData} setModalVisible={setModalVisible}
                    handleDislikePress={handleDislikePress}
                    handleLikePress={handleLikePress} />
            </Modal>
        </AppSafeAreaView>
    );
};

export default LikesYouScreen;

const styles = StyleSheet.create({
${homeStyles}
});
`;

fs.writeFileSync(likesPath, targetCode);
