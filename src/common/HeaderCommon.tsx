import React from "react";
import { StyleSheet, View } from "react-native";
import FastImage from "react-native-fast-image";
import { backIcon, pencilIcon, previewIcon } from "../helper/ImageAssets";
import metrics from "../assets/Metrics";
import { TouchableOpacityView } from "./TouchableOpacityView";
import NavigationService from "../navigation/NavigationService";
import { AppText, EIGHTEEN, FORTEEN, INTER_BOLD, INTER_MEDIUM, INTER_SEMI_BOLD, OPECITY_DARK, TEN } from "./AppText";
import { colors } from "../theme/colors";

const HeaderCommon = ({ onSkip, skip, title, preview, edit, PreviewOnpress, editOnPress,age }: any) => {
    return (
        <View style={{ paddingHorizontal: metrics.hp2, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <TouchableOpacityView style={{ flexDirection: "row", alignItems: "center", marginTop: metrics.hp6 }} onPress={() => NavigationService.goBack()}>
                <FastImage source={backIcon} resizeMode="contain" style={styles.backIcon} />
                {title &&
                    <>
                        {edit ?
                            <AppText type={FORTEEN} weight={INTER_SEMI_BOLD}>
                                {"     "}{title}
                            </AppText> :
                            <View style={{flexDirection:"row", alignItems:"center"}}>
                            <AppText style={{marginTop:-metrics.hp0_5, textTransform:"capitalize"}} type={EIGHTEEN} weight={INTER_BOLD}>{"     "}{title},</AppText>
                            <AppText  type={EIGHTEEN} weight={INTER_MEDIUM}> {age}</AppText>
                            </View>
                        }
                    </>

                }
            </TouchableOpacityView>
            {skip &&
                <TouchableOpacityView onPress={onSkip}>
                    <AppText style={{ marginTop: metrics.hp5 }} weight={INTER_MEDIUM} color={OPECITY_DARK} type={FORTEEN}>
                        Skip
                    </AppText>
                </TouchableOpacityView>
            }
            {preview &&
                <TouchableOpacityView onPress={PreviewOnpress} style={styles.containerPreview}>
                    <FastImage source={previewIcon} resizeMode="contain" style={styles.previewIcon} />
                    <AppText type={TEN} weight={INTER_SEMI_BOLD} color={OPECITY_DARK}>
                        {"  "}Preview
                    </AppText>
                </TouchableOpacityView>
            }
            {edit && !preview &&
                <TouchableOpacityView onPress={editOnPress} style={styles.containerEdit}>
                    <FastImage source={pencilIcon} resizeMode="contain" style={styles.previewIcon} />
                    <AppText type={TEN} weight={INTER_SEMI_BOLD} color={OPECITY_DARK}>
                        {"  "}Edit
                    </AppText>
                </TouchableOpacityView>}
        </View>
    )
};
export default HeaderCommon;
const styles = StyleSheet.create({
    backIcon: {
        height: metrics.hp2_5,
        width: metrics.hp2_5,
    },
    previewIcon: {
        height: metrics.hp1_6,
        width: metrics.hp1_6
    },
    containerPreview: {
        marginTop: metrics.hp5,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        height: metrics.hp3,
        width: metrics.hp9,
        borderWidth: metrics.hp0_1,
        borderColor: colors.nanoOpecity,
        borderRadius: metrics.hp4
    },
    containerEdit: {
        marginTop: metrics.hp5,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        height: metrics.hp3,
        width: metrics.hp7,
        borderWidth: metrics.hp0_1,
        borderColor: colors.nanoOpecity,
        borderRadius: metrics.hp4,
        
    }
})