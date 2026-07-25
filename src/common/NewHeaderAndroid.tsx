import React from "react";
import { ImageBackground, StyleSheet, TouchableOpacity, View } from "react-native";
import { applogo, BottomLayer, dummyfemaleProfile, dummyMaleProfile, filterNewIcon, HeaderHomeBack, messagesText } from "../helper/ImageAssets";
import metrics from "../assets/Metrics";
import FastImage from "react-native-fast-image";
import { useSelector } from "react-redux";
import NavigationService from "../navigation/NavigationService";
import { NAVIGATION_PROFILE_SCREEN } from "../navigation/routes";

const NewHeaderAndroid = ({ style, onFilterPress, filterShow = true, message }: any) => {
    const userData = useSelector((state: any) => state.auth.userData);

    return (
        <ImageBackground source={HeaderHomeBack} resizeMode="stretch" style={[styles.bottomLayer, style]}>
            <View style={styles.container}>
                <FastImage source={message ? messagesText : applogo} resizeMode="contain" style={styles.headerLogo} />
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                    {filterShow ?
                        <TouchableOpacity activeOpacity={1} onPress={onFilterPress}>
                            <FastImage source={filterNewIcon} resizeMode="contain" style={[styles.filterIcon, { marginRight: metrics.hp2 }]} />
                        </TouchableOpacity> : <></>
                    }
                    <TouchableOpacity activeOpacity={1} onPress={() => NavigationService.navigate(NAVIGATION_PROFILE_SCREEN)}>
                        <FastImage
                            source={userData?.gallery?.length === 0 ? userData?.gender === "male" ? dummyMaleProfile : dummyfemaleProfile : { uri: userData?.gallery?.[0]?.url }}
                            resizeMode="cover"
                            style={[styles.filterIcon, { borderRadius: metrics.hp50 }]}
                        />
                    </TouchableOpacity>
                </View>
            </View>
        </ImageBackground>
    )
};
export default NewHeaderAndroid;
const styles = StyleSheet.create({
    bottomLayer: {
        height: metrics.hp13,
        width: "100%",
        paddingVertical: metrics.hp2,
    },
    container: {
        paddingHorizontal: metrics.hp2,
        marginTop: metrics.hp4_5,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between"
    },
    headerLogo: {
        height: metrics.hp4,
        width: metrics.hp14
    },
    filterIcon: {
        height: metrics.hp3_5,
        width: metrics.hp3_5
    }
})