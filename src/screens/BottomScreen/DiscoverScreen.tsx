import React, { useEffect, useRef, useState } from "react";
import {
    Animated,
    ImageBackground,
    StyleSheet,
    View,
    Dimensions,
    FlatList,
    ScrollView,
    Modal,
} from "react-native";
import { AppSafeAreaView } from "../../common/AppSafeAreaView";
import PeopleHeader from "../../common/PeopleHeader";
import {
    AppText,
    ELEVEN,
    FORTEEN,
    INTER_BOLD,
    INTER_MEDIUM,
    INTER_REGULAR,
    INTER_SEMI_BOLD,
    LIGHT_BLACK,
    OPECITY_DARK,
    SCHEHERAZADE_BOLD,
    TWELVE,
    TWENTY,
    TWENTY_FOUR,
    WHITE,
} from "../../common/AppText";
import metrics from "../../assets/Metrics";
import FastImage from "react-native-fast-image";
import { accountcircleIcon, blueTikeIcon, bussnisIcon, closeIcon, filterIcon, heartRed, locationCIon, moonIcon, recommonedICon } from "../../helper/ImageAssets";
import { datapersonal, editDiscover, editProfileData, profileDataDiscover, similarProfileFilter } from "../../common/UiltData";
import { colors } from "../../theme/colors";
import { TouchableOpacityView } from "../../common/TouchableOpacityView";
import RBSheet from "react-native-raw-bottom-sheet";
import ListCheckBox from "../../common/ListCheckbox";
import PurpuleButton from "../../common/PurpuleButton";
import { useDispatch, useSelector } from "react-redux";
import { discoverProfile, getOtherProfile } from "../../actions/authActions";
import PreviewDetails from "./PreviewDetails";
import { SwiperCardRefType } from "rn-swiper-list";

const { width } = Dimensions.get("window");
const ITEM_WIDTH = metrics.hp34;
const SPACING = metrics.hp1;
const DiscoverScreen = () => {
    const discoverProfileData = useSelector((state: any) => state.auth.discoverProfileData);
    const dispatch = useDispatch();
    const ref = useRef<SwiperCardRefType>();
    const refFilter: any = useRef(null);
    const scrollX = useRef(new Animated.Value(0)).current;
    const [selectPronoun, setSelectPronoun] = useState(0);
    const [modalVisible, setModalVisible] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = React.useState(0);
    const [swipeUp, setSwipeUp] = useState(false);
    const [profileData, setProfileData] = useState();
    console.log(profileData, "profileData");

    const datalist = [
        {
            id: "1",
            title: "Similar Interests",
        },
        {
            id: "2",
            title: "Similar Lifestyle",
        },
        {
            id: "3",
            title: "Dating Goals",
        },
        {
            id: "4",
            title: "Communities in Common",
        },
    ];
    const viewProfile = (item: any) => {
        let data = {
            "userId": item?._id
        };
        let isNavigate = true
        dispatch(getOtherProfile(data, isNavigate, setProfileData));
        setModalVisible(true)
    }
    const discoverRender = ({ item, index }: any) => {
        const inputRange = [
            (index - 1) * (ITEM_WIDTH + SPACING),
            index * (ITEM_WIDTH + SPACING),
            (index + 1) * (ITEM_WIDTH + SPACING),
        ];

        const scale = scrollX.interpolate({
            inputRange,
            outputRange: [0.95, 1, 0.95],
            extrapolate: "clamp",
        });

        const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.9, 1, 0.9],
            extrapolate: "clamp",
        });

        return (
            <TouchableOpacityView key={item?._id} onPress={() => viewProfile(item)} activeOpacity={1}>
                <Animated.View
                    style={{
                        transform: [{ scale }],
                        opacity,
                        marginLeft: index === 0 ? metrics.hp2_5 : 0,
                        marginRight: SPACING,
                    }}>
                 <ImageBackground
                        resizeMode="cover"
                        imageStyle={{ borderRadius: metrics.hp1_5 }}
                        style={styles.discoverImage}
                        source={{ uri: item?.profilePicture[0]?.url }}>
                        <View style={{ flex: 1 }} />
                        <View style={styles.bottomDetails}>
                            <View>
                                <View style={{ flexDirection: "row", alignItems: "center" }}>
                                    <AppText type={TWENTY} color={WHITE} weight={INTER_BOLD}>
                                        {item.firstName}, {item.age}{" "}
                                    </AppText>
                                    <FastImage
                                        source={blueTikeIcon}
                                        resizeMode="contain"
                                        style={styles.blueTikIcon}
                                    />
                                </View>
                                <View style={{ flexDirection: "row", alignItems: "center", marginTop: metrics.hp1 }}>
                                    <FastImage
                                        source={bussnisIcon}
                                        tintColor={colors.white}
                                        resizeMode="contain"
                                        style={styles.loctionIcon}
                                    />
                                    <AppText type={ELEVEN} color={WHITE} weight={INTER_MEDIUM}>
                                        {" "}
                                        {item.jobTitle}
                                    </AppText>
                                </View>
                                 <View style={{ flexDirection: "row", alignItems: "center", marginTop: metrics.hp1 }}>
                                    <FastImage source={locationCIon} resizeMode="contain" style={styles.loctionIcon} />
                                    <AppText type={ELEVEN} color={WHITE} weight={INTER_MEDIUM}>
                                        {" "}
                                        5 Km away
                                    </AppText>
                                </View>
                                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", width: ITEM_WIDTH - metrics.hp4, marginBottom: -metrics.hp1 }}>
                                     <View style={styles.wrapContainer}>
                                        <View style={styles.listContainer}>
                                            <FastImage
                                                tintColor={colors.white}
                                                source={moonIcon}
                                                resizeMode="contain"
                                                style={styles.icons}
                                            />
                                            <AppText color={WHITE} weight={INTER_MEDIUM} type={ELEVEN}>
                                                {"  "}
                                                {item.zodiaSign}
                                            </AppText>
                                        </View>
                                         <View  style={styles.listContainer} >
                                            <FastImage
                                                tintColor={colors.white}
                                                source={locationCIon}
                                                resizeMode="contain"
                                                style={styles.icons}
                                            />
                                            <AppText color={WHITE} weight={INTER_MEDIUM} type={ELEVEN}>
                                                {"  "}
                                                {item.city}
                                            </AppText>
                                        </View> 
                                    </View>
                                    <View style={[styles.flasContaier]}>
                                        <FastImage source={heartRed} resizeMode="contain" style={styles.flasIcon} />
                                    </View>
                                </View> 
                                </View>
                        </View>

                    </ImageBackground> 
                </Animated.View>
            </TouchableOpacityView>
        );
    };
    const SimilarRender = ({ item, index }: any) => {
        return (
            <TouchableOpacityView key={item?._id} onPress={() => viewProfile(item)} activeOpacity={1}>
                <Animated.View
                    style={{
                        marginLeft: index === 0 ? metrics.hp2_5 : 0,
                        marginRight: SPACING,
                    }}>
                    <ImageBackground
                        resizeMode="cover"
                        imageStyle={{ borderRadius: metrics.hp1_5 }}
                        style={styles.simlierImage}
                        source={{ uri: item?.profilePicture[0]?.url }}>
                        <View style={{ flex: 1 }} />
                        <View style={[styles.bottomDetails, { marginLeft: metrics.hp1, marginBottom: metrics.hp1 }]}>
                            <View style={{ flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between" }}>
                                <View style={{ flexDirection: "row", alignItems: "center" }}>
                                    <AppText type={FORTEEN} color={WHITE} weight={INTER_BOLD}>
                                        {item.firstName}, {item.age}{" "}
                                    </AppText>
                                    <FastImage
                                        source={blueTikeIcon}
                                        resizeMode="contain"
                                        style={[styles.blueTikIcon, {
                                            height: metrics.hp2,
                                            width: metrics.hp2,
                                        }]}
                                    />
                                </View>
                                <View style={[styles.flasContaier, { marginLeft: metrics.hp1 }]}>
                                    <FastImage source={heartRed} resizeMode="contain" style={styles.flasIcon} />
                                </View>
                            </View>
                        </View>
                    </ImageBackground>
                </Animated.View>
            </TouchableOpacityView>
        )
    }
    return (
        <AppSafeAreaView>
            <PeopleHeader profile={true} filter={true} />
            <Animated.ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
                <View style={{ paddingHorizontal: metrics.hp2 }}>
                    <AppText
                        type={TWENTY_FOUR}
                        weight={SCHEHERAZADE_BOLD}
                        color={LIGHT_BLACK}>
                        Discover New Souls
                    </AppText>
                    <AppText
                        style={{ marginTop: -metrics.hp1_7 }}
                        type={ELEVEN}
                        weight={INTER_REGULAR}
                        color={OPECITY_DARK}>
                        Get matched with your similar vibe Souls, refreshed every 24{"\n"}
                        hours.
                    </AppText>

                    <View
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            marginTop: metrics.hp2,
                        }}>
                        <FastImage
                            source={recommonedICon}
                            resizeMode="contain"
                            style={styles.recommonedIcon}
                        />
                        <AppText type={TWELVE} weight={INTER_SEMI_BOLD} color={LIGHT_BLACK}>
                            {"  "}Recommended for you
                        </AppText>
                    </View>
                </View>
                <View>
                    <Animated.FlatList
                        data={discoverProfileData}
                        renderItem={discoverRender}
                        keyExtractor={(item) => item?._id}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        snapToInterval={ITEM_WIDTH + SPACING}
                        decelerationRate="fast"
                        bounces={false}
                        onScroll={Animated.event(
                            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                            { useNativeDriver: true }
                        )}
                        scrollEventThrottle={16}
                        contentContainerStyle={{ paddingVertical: metrics.hp2 }}
                    />
                </View>
                <View style={styles.containerBottom}>
                    <View
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            paddingHorizontal: metrics.hp2,
                            marginTop: metrics.hp2
                        }}>
                        <FastImage
                            source={accountcircleIcon}
                            resizeMode="contain"
                            style={styles.recommonedIcon}
                            tintColor={colors.lightBlack}
                        />
                        <AppText type={TWELVE} weight={INTER_SEMI_BOLD} color={LIGHT_BLACK}>
                            {"  "}Similar Soulmates Profiles
                        </AppText>
                    </View>
                    {/* <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} style={styles.wrapContainerTwo}>
                            {similarProfileFilter?.map((item: any, index: any) => {
                                return (
                                    <View key={index} style={[styles.containerSelect, {
                                        backgroundColor: index == 0 ? colors.green : colors.white,
                                        marginRight: SPACING,
                                    }]}>
                                        <AppText style={{ marginTop: -metrics.hp0_3 }} type={TWELVE} weight={INTER_MEDIUM}>
                                            {item.title}
                                        </AppText>
                                        {index == 0 ?
                                            <FastImage source={closeIcon} tintColor={colors.lightBlack} resizeMode="contain" style={styles.closeIcon} /> : <></>
                                        }
                                    </View>
                                )
                            })}
                        </ScrollView>
                        <TouchableOpacityView onPress={() => refFilter?.current?.open()} style={styles.filterButton}>
                            <FastImage source={filterIcon} resizeMode="contain" style={styles.filterIcon} />
                        </TouchableOpacityView>
                    </View> */}
                    <FlatList
                        data={discoverProfileData}
                        renderItem={SimilarRender}
                        keyExtractor={(item) => String(item?._id)}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingVertical: metrics.hp2 }}
                    />
                </View>
            </Animated.ScrollView>
            <RBSheet ref={refFilter} openDuration={100}
                height={Dimensions.get('window').height / 2.20}
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
                <View style={styles.headerRB}>
                    <FastImage source={closeIcon} tintColor={colors.transparent} resizeMode="contain" style={styles.closeIconTwo} />

                    <AppText type={FORTEEN} weight={INTER_BOLD}>
                        Filter
                    </AppText>
                    <TouchableOpacityView onPress={() => refFilter?.current?.close()}>
                        <FastImage source={closeIcon} tintColor={colors.lightBlack} resizeMode="contain" style={styles.closeIconTwo} />
                    </TouchableOpacityView>
                </View>
                <FlatList data={datalist}
                    renderItem={({ item, index }: any) => <ListCheckBox item={item} round={true} index={index} selectPronoun={selectPronoun} setSelectPronoun={setSelectPronoun} />}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ marginTop: metrics.hp2, paddingBottom: metrics.hp20, paddingHorizontal: metrics.hp2 }}
                    showsVerticalScrollIndicator={false}
                />
                <PurpuleButton title={"Apply"} />
            </RBSheet>
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}>
                <PreviewDetails data={profileData} setModalVisible={setModalVisible}
                    setSwipeUp={setSwipeUp} modalVisible={modalVisible} 
                    setProfileData={setProfileData}
                    discover={true}/>
            </Modal>
        </AppSafeAreaView>
    );
};

export default DiscoverScreen;

const styles = StyleSheet.create({
    recommonedIcon: {
        height: metrics.hp2,
        width: metrics.hp2,
    },
    discoverImage: {
        height: metrics.hp38,
        width: ITEM_WIDTH,
        borderRadius: metrics.hp1_5,
    },
    bottomDetails: {
        marginLeft: metrics.hp2,
        marginBottom: metrics.hp3,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    blueTikIcon: {
        height: metrics.hp2_5,
        width: metrics.hp2_5,
        marginTop: metrics.hp0_5,
    },
    loctionIcon: {
        height: metrics.hp2,
        width: metrics.hp2,
    },
    wrapContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: metrics.hp1,
        marginTop: metrics.hp1,
        marginBottom: -metrics.hp1
    },
    listContainer: {
        height: metrics.hp3,
        paddingHorizontal: metrics.hp1_6,
        borderRadius: metrics.hp4,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.brownBack,
        flexDirection: "row",
    },
    icons: {
        height: metrics.hp1_6,
        width: metrics.hp1_6,
    },
    flasContaier: {
        height: metrics.hp5,
        width: metrics.hp5,
        backgroundColor: colors.white,
        borderRadius: metrics.hp50,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 5 },
        shadowRadius: metrics.hp1,
        elevation: metrics.hp0_5,
    },
    flasIcon: {
        height: metrics.hp3_5,
        width: metrics.hp3_5,
    },
    containerBottom: {
        backgroundColor: colors.darkWhite,
    },
    simlierImage: {
        height: metrics.hp25,
        width: metrics.hp20,
        borderRadius: metrics.hp1_5,
    },
    wrapContainerTwo: {
        marginTop: metrics.hp1,
        paddingHorizontal: metrics.hp2,
        marginBottom: metrics.hp2
    },
    containerSelect: {
        height: metrics.hp3,
        paddingHorizontal: metrics.hp1_6,
        borderRadius: metrics.hp4,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.green,
        flexDirection: "row",
    },
    closeIcon: {
        height: metrics.hp2_5,
        width: metrics.hp2_5,
    },
    filterIcon: {
        height: metrics.hp2_5,
        width: metrics.hp2_5
    },
    filterButton: {
        height: metrics.hp3,
        width: metrics.hp3,
        borderRadius: metrics.hp50,
        backgroundColor: colors.white,
        alignItems: "center",
        justifyContent: "center",
        marginTop: -metrics.hp1,
        marginLeft: metrics.hp2,
        marginRight: metrics.hp2,
        padding: metrics.hp1
    },
    closeIconTwo: {
        height: metrics.hp4,
        width: metrics.hp4,
    },
    headerRB: {
        height: metrics.hp5_5,
        backgroundColor: colors.nanoOpecity,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: metrics.hp2,
        justifyContent: "space-between"
    }
});
