import React, { useState } from "react";
import { AppSafeAreaView } from "../../common/AppSafeAreaView";
import { StyleSheet, View } from "react-native";
import HeaderCommon from "../../common/HeaderCommon";
import { AppText, INTER_MEDIUM, OPECITY, TWELVE } from "../../common/AppText";
import metrics from "../../assets/Metrics";
import { Screen } from "../../theme/dimens";
import { colors } from "../../theme/colors";
import { FlatList } from "react-native-gesture-handler";
import ListCheckBox from "../../common/ListCheckbox";
import SearchContainer from "../../common/SearchContainer";
import LinearGradient from "react-native-linear-gradient";
import GoButton from "../../common/GoButton";
import { useDispatch, useSelector } from "react-redux";
import { editProfile } from "../../actions/authActions";
import { setfilterData } from "../../slices/loginServices/authSlice";
import NavigationService from "../../navigation/NavigationService";

const CommonSelectPage = ({ route }: any) => {
    const dispatch = useDispatch();
    const headLine = route?.params?.headline ?? "";
    const listData = route?.params?.data ?? "";
    const title = route?.params?.title ?? "";
    const select = route?.params?.select ?? "";
    const secondHeadline = route?.params?.secondHeadline ?? "";
    const filterData = useSelector((state: any) => state.auth.filterData);
    const [selectPronoun, setSelectPronoun] = useState(select? select: "");
    const [search, setSearch] = useState("");
    const onSubmit = () => {
        if (title === "gender") {
            const dataToSave = {
                ...filterData,
                preferredGender: selectPronoun,
            };
            dispatch(setfilterData(dataToSave));
            NavigationService.goBack()
        }else if(title === "relationsShipStatus"){
            const dataToSave = {
                ...filterData,
                relationshipPreference: selectPronoun,
            };
            dispatch(setfilterData(dataToSave));
            NavigationService.goBack()
        }
    };
    console.log(select,"selectselectselect");
    
    return (
        <AppSafeAreaView>
            <HeaderCommon title={headLine} />
            <View style={styles.singleLine} />
            <View style={{ flex: 1, paddingHorizontal: metrics.hp2 }}>
                {secondHeadline ?
                    <AppText style={{ marginTop: metrics.hp2 }} type={TWELVE} weight={INTER_MEDIUM} color={OPECITY}>
                        {secondHeadline}
                    </AppText>
                    : <></>}
                {headLine == "Language they speak" &&
                    <View style={{ marginTop: metrics.hp2 }}>
                        <SearchContainer onChangeText={setSearch} value={search} placeholder={"Search language"} />
                    </View>
                }
                <FlatList data={listData}
                    renderItem={({ item, index }: any) => <ListCheckBox item={item} index={index} round={headLine == "Language they speak" ? false : true} selectPronoun={selectPronoun} setSelectPronoun={setSelectPronoun} />}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ marginTop: metrics.hp2, paddingBottom: metrics.hp20 }}
                    showsVerticalScrollIndicator={false}
                />
            </View>
            <LinearGradient start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }} colors={["#FFFFFF00", colors.white, colors.white]}>
                <GoButton colortrue={selectPronoun?.length} onPress={() => onSubmit()} />
            </LinearGradient>
        </AppSafeAreaView>
    )
};
export default CommonSelectPage;
const styles = StyleSheet.create({
    singleLine: {
        height: metrics.hp0_1,
        width: Screen.Width,
        backgroundColor: colors.nanoOpecity,
        marginTop: metrics.hp1_5
    }
})