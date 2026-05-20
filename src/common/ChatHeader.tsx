import React from "react";
import { StyleSheet, View } from "react-native";
import metrics from "../assets/Metrics";
import FastImage from "react-native-fast-image";
import { backIcon, blueTikeIcon, profileImage, threeIconDating, treeDotIcon } from "../helper/ImageAssets";
import { colors } from "../theme/colors";
import { AppText, BLACK, EIGHTEEN, INTER_BOLD, INTER_MEDIUM, INTER_SEMI_BOLD, TEN, TWELVE, WHITE } from "./AppText";
import { TouchableOpacityView } from "./TouchableOpacityView";
import NavigationService from "../navigation/NavigationService";
import { useSelector } from "react-redux";

const ChatHeader = ({ onPress, setTabSelect }: any) => {
    const matchChatUserDetails = useSelector((state: any) => state.auth.matchChatUserDetails);
    const userData = useSelector((state: any) => state.auth.userData);
    return (
        <View style={styles.container}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
                <TouchableOpacityView onPress={() => NavigationService.goBack()}>
                    <FastImage source={backIcon} resizeMode="contain" style={styles.backIcon} />
                </TouchableOpacityView>
                <TouchableOpacityView style={{ flexDirection: "row", alignItems: "center" }} onPress={() => setTabSelect('Profile')}>
                    <FastImage source={matchChatUserDetails?.profilePicture?.url ? { uri: matchChatUserDetails?.profilePicture?.url } : profileImage} resizeMode="cover" style={styles.profileImage} />
                    <View>
                        <View style={{flexDirection:"row", alignItems:"center"}}>
                        <AppText type={TWELVE} weight={INTER_BOLD}>{"  "}{matchChatUserDetails?.name},
                        </AppText>
                        {userData?.faceVerified == true ?  <FastImage source={blueTikeIcon} resizeMode="contain" style={styles.blueTickIcon} />:<></>}
                        </View>
                        {matchChatUserDetails?.online&&
                        <AppText type={TEN} style={{ color: "green" }} weight={INTER_SEMI_BOLD}>
                        {"  "}Online
                        </AppText> }
                    </View>
                </TouchableOpacityView>
            </View>
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
    },
    threeDots: {
        height: metrics.hp2_5,
        width: metrics.hp2_5
    },
    activeBackground: { height: metrics.hp1_2, width: metrics.hp1_2, borderWidth: metrics.hp0_1, borderColor: "#28EC594D", backgroundColor: "#28EC591A", borderRadius: metrics.hp20, alignItems: "center", justifyContent: "center", marginRight: metrics.hp0_3 },
    activeDot: { height: metrics.hp0_8, width: metrics.hp0_8, backgroundColor: "#28EC59", borderRadius: metrics.hp50 },
    activeContainer: { height: metrics.hp2, paddingHorizontal: metrics.hp1, flexDirection: "row", alignItems: "center", borderRadius: metrics.hp5, backgroundColor: "#00000033", marginTop: metrics.hp0_5 },
})