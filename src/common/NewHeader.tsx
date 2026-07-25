import React from "react";
import { ImageBackground, StyleSheet, TouchableOpacity, View } from "react-native";
import FastImage from "react-native-fast-image";
import { backIconNew, HeaderHomeBack, previewImageIBackground, settingIconNew, verifiedButton } from "../helper/ImageAssets";
import metrics from "../assets/Metrics";
import { AppText, EIGHTEEN, INTER_SEMI_BOLD, SCHEHERAZADE_BOLD, SIXTEEN, WHITE } from "./AppText";
import { useSelector } from "react-redux";

const NewHeader = ({ title, onPress, onPressTwo, preview, onPreview, profile, onVerificationPress, isPublishButton }: any) => {
    const userData = useSelector((state: any) => state.auth.userData);
    return (
        <ImageBackground source={HeaderHomeBack} resizeMode="stretch" style={styles.container}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", flex: 1 }}>
                <TouchableOpacity onPress={onPress} activeOpacity={1} style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginTop: metrics.hp3,
                }}>
                    <FastImage source={backIconNew} resizeMode="contain" style={styles.backIcon} />
                    <AppText type={EIGHTEEN} weight={SCHEHERAZADE_BOLD} color={WHITE}>
                        {"     "}{profile ? profile : title}
                    </AppText>
                </TouchableOpacity>
                {title ? <></> :
                    <View style={{ flexDirection: "row", alignItems: "center", marginTop: metrics.hp3, }}>
                        {userData?.faceVerified === true ? <></> : isPublishButton ? <></> :
                            <TouchableOpacity activeOpacity={1} onPress={onVerificationPress}>
                                <FastImage source={verifiedButton} resizeMode="contain" style={{ height: metrics.hp6, width: metrics.hp12, marginRight: metrics.hp2 }} />
                            </TouchableOpacity>
                        }
                        <TouchableOpacity onPress={onPressTwo}>
                            <FastImage source={settingIconNew} resizeMode="contain" style={{ height: metrics.hp4, width: metrics.hp4, }} />
                        </TouchableOpacity>
                    </View>
                }
                {preview ?
                    <TouchableOpacity onPress={onPreview}>
                        <FastImage source={previewImageIBackground} resizeMode="contain" style={{ height: metrics.hp5, width: metrics.hp15, marginTop: metrics.hp3 }} />
                    </TouchableOpacity> : <></>}
            </View>
        </ImageBackground>
    )
};
export default NewHeader;
const styles = StyleSheet.create({
    container: {
        flexDirection: "row", alignItems: "center",
        paddingHorizontal: metrics.hp2,
        paddingVertical: metrics.hp2,
        height: metrics.hp13,
    },
    backIcon: {
        height: metrics.hp4,
        width: metrics.hp4
    }
})