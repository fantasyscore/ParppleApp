import React, { useState } from "react";
import { AppSafeAreaView } from "../../common/AppSafeAreaView";
import { ImageBackground, StyleSheet, TouchableOpacity, View } from "react-native";
import metrics from "../../assets/Metrics";
import { BottomLayer, femaleGirl, femaleGirlSelected, malePerson, malePersonSelected } from "../../helper/ImageAssets";
import NavigationService from "../../navigation/NavigationService";
import { NAVIGATION_DOB_SCREEN } from "../../navigation/routes";
import { useDispatch, useSelector } from "react-redux";
import { setAddProfile } from "../../slices/loginServices/authSlice";
import { Screen } from "../../theme/dimens";
import { newColor } from "../../theme/colors";
import { editProfile } from "../../actions/authActions";
import FastImage from "react-native-fast-image";
import OnboardingLogo from "../../components/Onboarding/OnboardingLogo";
import OnboardingButton from "../../components/Onboarding/OnboardingButton";
import { AppText, INTER_REGULAR, INTER_SEMI_BOLD, SCHEHERAZADE_SEMI_BOLD, SIXTEEN, THIRTEEN, TWENTY_FOUR, WHITE } from "../../common/AppText";

const GanderScreen = ({ route }: any) => {
    const dispatch = useDispatch();
    const filter = route?.params?.filter ?? "";
    const dataFilter = route?.params?.data ?? "";
    const fieldVisibility = route?.params?.fieldVisibility ?? "";
    const addProfileData = useSelector((state: any) => state?.auth?.addProfileData);
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
                gender: selectPronoun === "Male" ? "male" : "female",
                fieldVisibility: { gender: showProfile }
            };
            dispatch(setAddProfile(data))
            NavigationService.navigate(NAVIGATION_DOB_SCREEN)
        }
    }

    return (
        <AppSafeAreaView color={newColor.blackNew}>
            <OnboardingLogo />
            <View style={{
                flexDirection: "row", alignItems: "center",
                justifyContent: "space-between",
                marginTop: metrics.hp10,
                paddingHorizontal: metrics.hp4
            }}>
                <TouchableOpacity style={{ width: "50%", alignItems:"center", justifyContent:"center" }} activeOpacity={1} onPress={() => setSelectPronoun("Male")}>
                    <FastImage source={selectPronoun === "Male" ? malePersonSelected : malePerson} resizeMode="contain" style={styles.boyPerson} />
                    <AppText style={{marginTop:-metrics.hp4}} type={SIXTEEN} weight={INTER_SEMI_BOLD} color={WHITE}>
                        Male
                    </AppText>
                </TouchableOpacity>
                <TouchableOpacity style={{ width: "50%",alignItems:"center", justifyContent:"center" }} activeOpacity={1} onPress={() => setSelectPronoun("Female")}>
                    <FastImage source={selectPronoun === "Female" ? femaleGirlSelected : femaleGirl} resizeMode="contain" style={styles.femaleGirl} />
                    <AppText style={{marginTop:-metrics.hp4}} type={SIXTEEN} weight={INTER_SEMI_BOLD} color={WHITE}>
                        Female
                    </AppText>
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
                    <OnboardingButton label="Next" onPress={onSubmit} dimmed={!selectPronoun} fullRow />
                </ImageBackground>
            </View>
        </AppSafeAreaView>
    )
};
export default GanderScreen;
const styles = StyleSheet.create({
    boyPerson: {
        height: metrics.hp35,
        width: metrics.hp20,
    },
    femaleGirl: {
        height: metrics.hp35,
        width: metrics.hp20,
    },bottomLayer: {
        height: metrics.hp15,
        width: "100%",
        paddingVertical: metrics.hp2,
    },
})