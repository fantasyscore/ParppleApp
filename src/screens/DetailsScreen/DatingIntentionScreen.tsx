import React, { useState } from "react";
import { AppSafeAreaView } from "../../common/AppSafeAreaView";
import { FlatList, StyleSheet, View } from "react-native";
import HeaderCommon from "../../common/HeaderCommon";
import TopCommonLine from "../../common/TopCommonLine";
import DubleTextLine from "../../common/DubleTextLine";
import metrics from "../../assets/Metrics";
import { fiveIconDating, fourIconDating, oneIconDating, searchIcon, sixIconDating, threeIconDating, twoIconDating } from "../../helper/ImageAssets";
import { colors } from "../../theme/colors";
import { AppText, FORTEEN, INTER_SEMI_BOLD, TWELVE } from "../../common/AppText";
import FastImage from "react-native-fast-image";
import { TouchableOpacityView } from "../../common/TouchableOpacityView";
import GoButton from "../../common/GoButton";
import NavigationService from "../../navigation/NavigationService";
import { NAVIGATION_CHILDERN_SCREEN } from "../../navigation/routes";
import { Screen } from "../../theme/dimens";
import { useDispatch, useSelector } from "react-redux";
import { setAddProfile } from "../../slices/loginServices/authSlice";
import { editProfile } from "../../actions/authActions";

const DatingIntentionScreen = ({ route }: any) => {
    const dispatch = useDispatch();
    const filter = route?.params?.filter ?? "";
    const dataFilter = route?.params?.data ?? "";
    const datalistnew = new Array(10).fill(null).map((_, index) => ({ id: String(index), }))
    const addProfileData = useSelector((state: any) => state?.auth?.addProfileData);
    const [selectDating, setSelectDating] = useState(dataFilter ? dataFilter : 'longTermPartner');
    const [showProfile, setShowProfile] = useState(true);
    const data = [
        {
            id: "1",
            icon: oneIconDating,
            title: "Long-term partner",
            sendTitle: "longTermPartner",
        },
        {
            id: "2",
            icon: twoIconDating,
            title: "Long-term ,\nOpen to short",
            sendTitle: "longTermAndOpenToShort",
        },
        {
            id: "3",
            icon: threeIconDating,
            title: "Short-term,\nopen to long",
            sendTitle: "OpenToShortAndlongTerm",
        },
        {
            id: "4",
            icon: fourIconDating,
            title: "Short-term fun",
            sendTitle: "openToShort",
        },
        {
            id: "5",
            icon: fiveIconDating,
            title: "New friends",
            sendTitle: "friends",
        },
        {
            id: "6",
            icon: sixIconDating,
            title: "Still figuring it out",
            sendTitle: "notSure",
        },
    ];
    const renderitem = ({ item }: any) => {
        return (
            <TouchableOpacityView onPress={() => setSelectDating(item.sendTitle)} style={[styles.box, { backgroundColor: selectDating == item.sendTitle ? colors.green : colors.lightBack }]}>
                <FastImage resizeMode="contain" style={styles.Icon} source={item.icon} />
                <AppText style={{ textAlign: 'center' }} type={TWELVE} weight={INTER_SEMI_BOLD}>
                    {item.title}
                </AppText>
            </TouchableOpacityView>
        )
    }
    const onSubmit = () => {
        if (filter) {
            const dataToSave = {
                relationshipPreference: selectDating,
            };
            dispatch(editProfile(dataToSave))
        } else {
            const data = {
                ...addProfileData,
                relationshipPreference: selectDating,
                fieldVisibility: { ...addProfileData?.fieldVisibility, relationshipPreference: showProfile }
            };
            dispatch(setAddProfile(data))
            NavigationService.navigate(NAVIGATION_CHILDERN_SCREEN)
        }
    }
    return (
        <AppSafeAreaView>
            <HeaderCommon title={filter} skip={false} />
            {filter ?
                <View style={styles.singleLine} /> : <></>}
            <View style={styles.container}>
                {filter ? <></> :
                    <TopCommonLine icon={searchIcon} datalist={datalistnew} />}
                <View style={{ paddingHorizontal: metrics.hp2 }}>
                    {filter ? <></> :
                        <DubleTextLine firstText={"What’s your intention in"} secondText={"dating?"} />}
                    <FlatList data={data}
                        numColumns={2}
                        renderItem={renderitem}
                        keyExtractor={(item) => item.id}
                        columnWrapperStyle={{
                            justifyContent: "flex-start", gap: metrics.hp1
                        }} />
                </View>
            </View>
            <GoButton visiBleProfile={true} onPress={() => onSubmit()} colortrue={true} visible={showProfile} setShowProfile={setShowProfile} />
        </AppSafeAreaView>
    )
};
export default DatingIntentionScreen;
const styles = StyleSheet.create({
    container: {
        marginTop: metrics.hp3,
        flex: 1,
    },
    box: {
        height: metrics.hp13,
        backgroundColor: colors.lightBack,
        width: "48%",
        marginBottom: metrics.hp1,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: metrics.hp1_5
    },
    Icon: {
        height: metrics.hp8,
        width: metrics.hp8
    },
    singleLine: {
        height: metrics.hp0_2,
        width: Screen.Width,
        backgroundColor: colors.nanoOpecity,
        marginTop: metrics.hp2
    },
})