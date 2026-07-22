import React, { useState } from "react";
import { AppSafeAreaView } from "../../common/AppSafeAreaView";
import { FlatList, ImageBackground, StyleSheet, TouchableOpacity, View } from "react-native";
import metrics from "../../assets/Metrics";
import { applogo, BottomLayer, femaleGirl, femaleGirlSelected, malePerson, malePersonSelected } from "../../helper/ImageAssets";
import ListCheckBox from "../../common/ListCheckbox";
import GoButton from "../../common/GoButton";
import NavigationService from "../../navigation/NavigationService";
import { NAVIGATION_DOB_SCREEN, NAVIGATION_SEXUALITY_SCREEN } from "../../navigation/routes";
import { useDispatch, useSelector } from "react-redux";
import { setAddProfile } from "../../slices/loginServices/authSlice";
import { ganderDATA } from "../../common/UiltData";
import { toastAlert } from "../../actions/UploadImageActions";
import { Screen } from "../../theme/dimens";
import { colors, newColor } from "../../theme/colors";
import { editProfile } from "../../actions/authActions";
import LinearGradient from "react-native-linear-gradient";
import FastImage from "react-native-fast-image";
import { AppText, EIGHTEEN, INTER_REGULAR, INTER_SEMI_BOLD, SCHEHERAZADE_BOLD, SCHEHERAZADE_SEMI_BOLD, THIRTEEN, TWENTY, TWENTY_FOUR, WHITE } from "../../common/AppText";
import { TouchableOpacityView } from "../../common/TouchableOpacityView";

const GanderScreen = ({ route }: any) => {
    const dispatch = useDispatch();
    const filter = route?.params?.filter ?? "";
    const dataFilter = route?.params?.data ?? "";
    const fieldVisibility = route?.params?.fieldVisibility ?? "";
    const addProfileData = useSelector((state: any) => state?.auth?.addProfileData);
    const datalistnew = new Array(9).fill(null).map((_, index) => ({ id: String(index), }))
    const [selectPronoun, setSelectPronoun] = useState('');
    const [showProfile, setShowProfile] = useState(fieldVisibility ? fieldVisibility?.gender : true);

    const onSubmit = () => {
        if (!selectPronoun) return 
        if (filter) {
            const dataToSave = {
                gender: selectPronoun,
                fieldVisibility: { gender: showProfile }
            };
            dispatch(editProfile(dataToSave))
        } else {
            const data = {
                ...addProfileData,
                gender: selectPronoun==="Male" ? "male": "female",
                fieldVisibility: { gender: showProfile }
            };
            dispatch(setAddProfile(data))
            NavigationService.navigate(NAVIGATION_DOB_SCREEN)
        }
    }

    return (
        <AppSafeAreaView color={newColor.blackNew}>
            <FastImage source={applogo} resizeMode="contain" style={styles.logo} />
            <View style={{
                flexDirection: "row", alignItems: "center",
                justifyContent: "space-between",
                marginTop: metrics.hp10,
                paddingHorizontal: metrics.hp4
            }}>
                <TouchableOpacity style={{ width: "50%" }} activeOpacity={1} onPress={() => setSelectPronoun("Male")}>
                    <FastImage source={selectPronoun === "Male" ? malePersonSelected : malePerson} resizeMode="contain" style={styles.boyPerson} />
                </TouchableOpacity>
                <TouchableOpacity style={{ width: "50%" }} activeOpacity={1} onPress={() => setSelectPronoun("Female")}>
                    <FastImage source={selectPronoun === "Female" ? femaleGirlSelected : femaleGirl} resizeMode="contain" style={styles.femaleGirl} />
                </TouchableOpacity>
            </View>

            <View style={{ position: "absolute", bottom: metrics.hp0, width: Screen.Width, }}>
                <View style={{
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: metrics.hp5

                }}>
                    <AppText style={{ textAlign: "center" }} weight={SCHEHERAZADE_SEMI_BOLD} type={TWENTY_FOUR} color={WHITE}>
                        Tell us about your gender?
                    </AppText>
                    <AppText style={{ textAlign: "center" }} type={THIRTEEN} weight={INTER_REGULAR} color={WHITE}>
                        Select your gender correctly.{'\n'} You won’t be able to change it later
                    </AppText>
                </View>
                <ImageBackground source={BottomLayer} resizeMode="stretch" style={styles.bottomLayer}>
                    <TouchableOpacity activeOpacity={0.5} onPress={onSubmit} style={[styles.phoneContainer, { opacity: selectPronoun ? 1 : 0.5 }]}>
                        <AppText weight={SCHEHERAZADE_BOLD} color={WHITE} type={TWENTY}>
                            Next
                        </AppText>
                    </TouchableOpacity>
                </ImageBackground>
            </View>
        </AppSafeAreaView>
    )
};
export default GanderScreen;
const styles = StyleSheet.create({
    logo: {
        height: metrics.hp7,
        width: metrics.hp25,
        alignSelf: "center",
        marginTop: metrics.hp8,

    },
    boyPerson: {
        height: metrics.hp35,
        width: metrics.hp20,
    },
    femaleGirl: {
        height: metrics.hp35,
        width: metrics.hp20,
    },
    container: {
        marginTop: metrics.hp3,
        flex: 1,
    },
    singleLine: {
        height: metrics.hp0_2,
        width: Screen.Width,
        backgroundColor: colors.nanoOpecity,
        marginTop: metrics.hp2,
    },
    bottomLayer: {
        height: metrics.hp15,
        width: "100%",
        paddingVertical: metrics.hp2,
    },
    phoneContainer: {
        height: metrics.hp7,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: metrics.hp0_1,
        borderColor: colors.white,
        marginHorizontal: metrics.hp2,
        marginTop: metrics.hp2
    },
})