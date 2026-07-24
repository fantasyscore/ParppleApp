import React from "react";
import { ImageBackground, Platform, StyleSheet, View } from "react-native";
import metrics from "../assets/Metrics";
import FastImage from "react-native-fast-image";
import { backIconNew, dummyfemaleProfile, dummyMaleProfile, HeaderHomeBack, threeDotNewIcon, } from "../helper/ImageAssets";
import { colors } from "../theme/colors";
import { AppText, BLACK, EIGHTEEN, ELEVEN, INTER_BOLD, INTER_MEDIUM, INTER_SEMI_BOLD, SCHEHERAZADE_BOLD, TEN, THIRTEEN, TWELVE, WHITE } from "./AppText";
import { TouchableOpacityView } from "./TouchableOpacityView";
import NavigationService from "../navigation/NavigationService";
import { useSelector } from "react-redux";

const ChatHeader = ({ onPress, setTabSelect, seeProfileOther }: any) => {
    const matchChatUserDetails = useSelector((state: any) => state.auth.matchChatUserDetails);
    const userData = useSelector((state: any) => state.auth.userData);
    console.log(matchChatUserDetails, "matchChatUserDetails");

    return (
        <ImageBackground source={HeaderHomeBack} resizeMode="stretch" style={[styles.bottomLayer]}>
            <View style={styles.container}>
                <TouchableOpacityView style={{ flexDirection: "row", alignItems: "center" }} onPress={() => NavigationService.goBack()}>
                    <FastImage source={backIconNew} resizeMode="contain" style={styles.backIcon} />
                    <TouchableOpacityView style={{flexDirection:"row", alignItems:'center'}} onPress={seeProfileOther}>
                    <FastImage source={matchChatUserDetails?.profilePicture?.url ? { uri: matchChatUserDetails?.profilePicture?.url } : matchChatUserDetails?.gender == "male" ? dummyMaleProfile : dummyfemaleProfile} resizeMode="cover" style={styles.profileImage} />
                    <View>

                        <AppText type={TWELVE} color={WHITE} weight={INTER_BOLD}>{"    "}{matchChatUserDetails?.username ? matchChatUserDetails?.username : matchChatUserDetails?.name}
                        </AppText>
                        {matchChatUserDetails?.online ? 
                        <AppText type={ELEVEN} weight={INTER_MEDIUM} style={{ color: "#26F600", marginTop: -metrics.hp0 }}>
                            {"    "}Online
                        </AppText>:<></>}
                    </View>
                    </TouchableOpacityView>

                </TouchableOpacityView>
                <TouchableOpacityView onPress={onPress}>
                    <FastImage source={threeDotNewIcon} resizeMode="contain" style={styles.backIcon} />
                </TouchableOpacityView>
            </View>

        </ImageBackground>

    )
};
export default ChatHeader;
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
    backIcon: {
        height: metrics.hp4,
        width: metrics.hp4
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