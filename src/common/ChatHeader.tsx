import React from "react";
import { StyleSheet, View } from "react-native";
import metrics from "../assets/Metrics";
import FastImage from "react-native-fast-image";
import { backIcon, blueTikeIcon, profileImage, threeIconDating, treeDotIcon } from "../helper/ImageAssets";
import { colors } from "../theme/colors";
import { AppText, EIGHTEEN, INTER_BOLD, INTER_MEDIUM, TWELVE } from "./AppText";
import { TouchableOpacityView } from "./TouchableOpacityView";
import NavigationService from "../navigation/NavigationService";
import { useSelector } from "react-redux";

const ChatHeader = ({ onPress }: any) => {
    const matchChatUserDetails = useSelector((state: any) => state.auth.matchChatUserDetails);

    return (
        <View style={styles.container}>
            <TouchableOpacityView onPress={() => NavigationService.goBack()} style={{ flexDirection: "row", alignItems: "center" }}>
                <FastImage source={backIcon} resizeMode="contain" style={styles.backIcon} />
                <FastImage source={matchChatUserDetails?.profilePicture[0]?.url ? { uri: matchChatUserDetails?.profilePicture[0]?.url } : profileImage} resizeMode="cover" style={styles.profileImage} />
                <AppText type={TWELVE} weight={INTER_BOLD}>{"  "}{matchChatUserDetails?.name},<AppText type={TWELVE} weight={INTER_MEDIUM}> {/* 21{"  "} */}</AppText>
                </AppText>
                <FastImage source={blueTikeIcon} resizeMode="contain" style={styles.blueTickIcon} />
            </TouchableOpacityView>
            <TouchableOpacityView style={{ padding: metrics.hp1 }} onPress={onPress}>
                <FastImage source={treeDotIcon} resizeMode="contain" style={styles.threeDots} />
            </TouchableOpacityView>
        </View>
    )
};
export default ChatHeader;
const styles = StyleSheet.create({
    container: {
        paddingHorizontal: metrics.hp2, flexDirection: "row", alignItems: "center", justifyContent: "space-between",
        backgroundColor: colors.white,
        marginTop: metrics.hp5
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
        marginTop: metrics.hp0_5
    },
    threeDots: {
        height: metrics.hp2_5,
        width: metrics.hp2_5
    }
})