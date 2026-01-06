import React from "react";
import { Animated, StyleSheet, View } from "react-native";
import metrics from "../assets/Metrics";
import { colors } from "../theme/colors";
import { bottomDetailsOpacity } from "./PanResponder";
import { AppText, EIGHTEEN, INTER_BOLD, INTER_MEDIUM } from "./AppText";
import FastImage from "react-native-fast-image";
import { blueTikeIcon, closeIcon, closeIconBigClear } from "../helper/ImageAssets";
import { TouchableOpacityView } from "./TouchableOpacityView";
import { CrushNotesSimpleRing } from "./CrushNotesSimpleRing";

const CrushNotesHeader = ({ name, age, setModalVisible, remainingCount }: any) => {
    return (
        <View style={styles.container}>
            <TouchableOpacityView onPress={()=>setModalVisible(false)} style={{ flexDirection: "row", alignItems: "center" }}>
                <FastImage source={closeIconBigClear} tintColor={colors.black} resizeMode="contain" style={styles.closeICon}/>
                <Animated.View style={{ opacity: bottomDetailsOpacity, flexDirection:"row",alignItems:"center" }}>
                    <AppText style={{textTransform:"capitalize"}} type={EIGHTEEN} weight={INTER_BOLD}>{"   "}{name},</AppText>
                    <AppText type={EIGHTEEN} weight={INTER_MEDIUM}> {age}{"  "}</AppText>
                </Animated.View>
                <FastImage source={blueTikeIcon} resizeMode="contain" style={styles.blueTickIcon} />
            </TouchableOpacityView>
            <Animated.View style={{ opacity: bottomDetailsOpacity }}>
                <CrushNotesSimpleRing
                    remaining={Number(remainingCount) || 0}
                    size={metrics.hp3_8}
                    strokeWidth={metrics.hp0_3}
                    activeColor={colors.purple}
                    trackColor={"#00000012"}
                />
            </Animated.View>
        </View>
    )
};
export default CrushNotesHeader;
const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: metrics.hp2,
        marginTop: metrics.hp5,
        backgroundColor: colors.white
    },
    blueTickIcon: {
        height: metrics.hp2,
        width: metrics.hp2,
        marginTop: metrics.hp0_5
    },
    closeICon:{
        height:metrics.hp2_5,
        width:metrics.hp2_5
    }
})