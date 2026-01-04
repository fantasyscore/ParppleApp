import React from "react";
import { AppSafeAreaView } from "../../common/AppSafeAreaView";
import { StyleSheet, View } from "react-native";
import Svg, { Circle } from 'react-native-svg'
import FastImage from "react-native-fast-image";
import { backIcon, bioStatusIcon, careerStatusIcon, closeIcon, interrestStatusIcon, moreAbhoutIcon, personalPhotoIcon, photoStatusIcon } from "../../helper/ImageAssets";
import metrics from "../../assets/Metrics";
import { colors } from "../../theme/colors";
import { TouchableOpacityView } from "../../common/TouchableOpacityView";
import { AppText, ELEVEN, INTER_BOLD, INTER_MEDIUM, INTER_SEMI_BOLD, OPECITY_DARK, SCHEHERAZADE_BOLD, TEN, TWELVE, TWENTY } from "../../common/AppText";
import SemiCircularProgressBar from "../../common/SemiCircularProgressBar";
import NavigationService from "../../navigation/NavigationService";
import { useSelector } from "react-redux";
const ProfileStrength = () => {
    const userData = useSelector((state: any) => state.auth.userData);

    return (
        <AppSafeAreaView>
            <TouchableOpacityView onPress={()=>NavigationService.goBack()} style={{ paddingHorizontal: metrics.hp2 }}>
                <FastImage source={closeIcon} tintColor={colors.black} resizeMode="contain" style={styles.backIcon} />
            </TouchableOpacityView>
            <View style={styles.container}>
                <View>
                    <AppText style={{ marginTop: -metrics.hp2 }} weight={SCHEHERAZADE_BOLD} type={TWENTY}>
                        Profile Status
                    </AppText>
                    <AppText style={{ marginTop: -metrics.hp1_5 }} weight={INTER_MEDIUM} type={TEN} color={OPECITY_DARK}>
                        Yeah, you’re cooking it.
                    </AppText>
                    <AppText style={{ marginTop: metrics.hp1 }} weight={INTER_SEMI_BOLD} type={ELEVEN} color={OPECITY_DARK}>
                        Let’s make your profile more{'\n'}
                        <AppText weight={INTER_BOLD} type={ELEVEN} color={OPECITY_DARK}>GOT</AppText> than ever before
                    </AppText>
                </View>
                <SemiCircularProgressBar progress={userData?.profileCompletion} />
            </View>
            <View style={styles.containerBoxs}>
                <View style={styles.inContainer}>
                    <FastImage source={photoStatusIcon} resizeMode="contain" style={styles.onePhoto} />
                    <AppText type={TWELVE} weight={INTER_BOLD}>
                        Photos
                    </AppText>
                    <AppText type={TEN} weight={INTER_MEDIUM} color={OPECITY_DARK}>
                        {userData?.gallery?.length === 6 ? `${userData?.gallery?.length} Photos` : `${userData?.gallery?.length} of 6 Photos`}
                    </AppText>
                </View>
                <View style={styles.inContainer}>
                    <FastImage source={bioStatusIcon} resizeMode="contain" style={styles.twoPhoto} />
                    <AppText type={TWELVE} weight={INTER_BOLD}>
                        Bio
                    </AppText>
                    <AppText type={TEN} weight={INTER_MEDIUM} color={OPECITY_DARK}>
                        Not written
                    </AppText>
                </View>
            </View>
            <View style={[styles.containerBoxs, { marginTop: metrics.hp1_6, }]}>
                <View style={styles.inContainer}>
                    <FastImage source={personalPhotoIcon} resizeMode="contain" style={styles.threePhoto} />
                    <AppText type={TWELVE} weight={INTER_BOLD}>
                        Personal info
                    </AppText>
                    <AppText type={TEN} weight={INTER_MEDIUM} color={OPECITY_DARK}>
                        0 of 6 info
                    </AppText>
                </View>
                <View style={styles.inContainer}>
                    <FastImage source={moreAbhoutIcon} resizeMode="contain" style={styles.threePhoto} />
                    <AppText type={TWELVE} weight={INTER_BOLD}>
                        More about you
                    </AppText>
                    <AppText type={TEN} weight={INTER_MEDIUM} color={OPECITY_DARK}>
                        0 of 3 added
                    </AppText>
                </View>
            </View>
            <View style={[styles.containerBoxs, { marginTop: metrics.hp1_6, }]}>
                <View style={styles.inContainer}>
                    <FastImage source={interrestStatusIcon} resizeMode="contain" style={styles.fourPhoto} />
                    <AppText type={TWELVE} weight={INTER_BOLD}>
                        Interests
                    </AppText>
                    <AppText type={TEN} weight={INTER_MEDIUM} color={OPECITY_DARK}>
                        0 of 5 added
                    </AppText>
                </View>
                <View style={styles.inContainer}>
                    <FastImage source={careerStatusIcon} resizeMode="contain" style={styles.fourPhoto} />
                    <AppText type={TWELVE} weight={INTER_BOLD}>
                        Career call
                    </AppText>
                    <AppText type={TEN} weight={INTER_MEDIUM} color={OPECITY_DARK}>
                        0 of 3 added
                    </AppText>
                </View>
            </View>
        </AppSafeAreaView>
    )
};
export default ProfileStrength;
const styles = StyleSheet.create({
    backIcon: {
        height: metrics.hp4,
        width: metrics.hp4,
        marginTop: metrics.hp5,
        alignSelf: "flex-end"
    },
    container: {
        height: metrics.hp12,
        borderWidth: metrics.hp0_1,
        borderColor: colors.singleButtonGreen,
        marginHorizontal: metrics.hp2,
        paddingHorizontal: metrics.hp1_5,
        paddingVertical: metrics.hp1_5,
        backgroundColor: colors.lightTenGreen,
        borderRadius: metrics.hp1_5,
        marginTop: metrics.hp2,
        flexDirection: "row",
        justifyContent: "space-between"
    },
    containerBoxs: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: metrics.hp2,
        marginTop: metrics.hp3,
        justifyContent: "space-between"
    },
    inContainer: {
        height: metrics.hp18,
        width: "48%",
        backgroundColor: colors.lightBack,
        borderWidth: metrics.hp0_1,
        borderColor: colors.nanoOpecity,
        borderRadius: metrics.hp1_5,
        alignItems: "center",
        justifyContent: "center"
    },
    onePhoto: {
        height: metrics.hp8,
        width: metrics.hp8,
        marginLeft: metrics.hp2,
        marginBottom: metrics.hp1_5
    },
    twoPhoto: {
        height: metrics.hp8,
        width: metrics.hp8,
        marginBottom: metrics.hp1_5
    },
    threePhoto: {
        height: metrics.hp8,
        width: metrics.hp8,
        marginLeft: metrics.hp3,
        marginBottom: metrics.hp1_5
    },
    fourPhoto: {
        height: metrics.hp10,
        width: metrics.hp8,
        marginBottom: metrics.hp1_5
    },
})