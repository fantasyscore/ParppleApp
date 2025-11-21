import React from "react";
import { AppSafeAreaView } from "../../common/AppSafeAreaView";
import { ImageBackground, StyleSheet, View } from "react-native";
import { AppText, fontSize, SCHEHERAZADE_BOLD } from "../../common/AppText";
import metrics from "../../assets/Metrics";
import PurpuleButton from "../../common/PurpuleButton";
import FastImage from "react-native-fast-image";
import { basicDetailsBackground, doc } from "../../helper/ImageAssets";
import NavigationService from "../../navigation/NavigationService";
import { NAVIGATION_ADD_PHOTOS_SCREEN, NAVIGATION_EMAIL_SCREEN, NAVIGATION_NAME_SCREEN, NAVIGATION_RELATION_SCREEN } from "../../navigation/routes";

const ProccedScreen = ({ route }: any) => {
    let comming = route?.params?.comming ?? "";
    const onGo = () => {
        if (comming == "OTP") NavigationService.navigate(NAVIGATION_NAME_SCREEN);
        if (comming == "languages") NavigationService.navigate(NAVIGATION_RELATION_SCREEN);
        if (comming == "About") NavigationService.navigate(NAVIGATION_ADD_PHOTOS_SCREEN)
    };
    const nameTitle = () => {
        if (comming == "OTP") return "Procced for your details";
        if (comming == "languages") return "Procced for more details";
        if (comming == "About") return "Procced to add photos"
    }
    return (
        <AppSafeAreaView>
            <ImageBackground source={basicDetailsBackground} resizeMode="cover" style={styles.container}>
                <FastImage source={doc} resizeMode="contain" style={{ height: metrics.hp17, width: metrics.hp17, marginTop: comming ? metrics.hp10 : metrics.hp0 }} />
                {comming == "languages" &&
                    <View>
                        <AppText style={{ fontSize: fontSize(32), textAlign: "center" }} weight={SCHEHERAZADE_BOLD}>
                            Let’s know more about
                        </AppText>
                        <AppText style={{ fontSize: fontSize(32), marginTop: -metrics.hp4, textAlign: "center" }} weight={SCHEHERAZADE_BOLD}>
                            you
                        </AppText>
                    </View>
                }
                {comming == "About" &&
                    <View>
                        <AppText style={{ fontSize: fontSize(32) }} weight={SCHEHERAZADE_BOLD}>
                            Let’s make your profile
                        </AppText>
                        <AppText style={{ fontSize: fontSize(32), marginTop: -metrics.hp4 }} weight={SCHEHERAZADE_BOLD}>
                            more better visible to
                        </AppText>
                        <AppText style={{ fontSize: fontSize(32), marginTop: -metrics.hp4 }} weight={SCHEHERAZADE_BOLD}>
                            others by uploading
                        </AppText>
                        <AppText style={{ fontSize: fontSize(32), marginTop: -metrics.hp4 }} weight={SCHEHERAZADE_BOLD}>
                            your photos.
                        </AppText>
                    </View>}
                {comming == "OTP" &&
                    <View>
                        <AppText style={{ fontSize: fontSize(32) }} weight={SCHEHERAZADE_BOLD}>
                            One of a kind deserves
                        </AppText>
                        <AppText style={{ fontSize: fontSize(32), marginTop: -metrics.hp4 }} weight={SCHEHERAZADE_BOLD}>
                            a one-of-a-kind profile.
                        </AppText>
                    </View>
                }
            </ImageBackground>
            <PurpuleButton onPress={onGo} title={nameTitle()} />
        </AppSafeAreaView>
    )
};
export default ProccedScreen;
const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: metrics.hp2,
        flex: 1,

    }
})