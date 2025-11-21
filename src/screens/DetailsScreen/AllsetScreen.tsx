import React from "react";
import { AppSafeAreaView } from "../../common/AppSafeAreaView";
import { ImageBackground, StyleSheet } from "react-native";
import { allSetback } from "../../helper/ImageAssets";
import { TouchableOpacityView } from "../../common/TouchableOpacityView";
import metrics from "../../assets/Metrics";
import NavigationService from "../../navigation/NavigationService";
import { NAVIGATION_BOTTOMTAB_SCREEN } from "../../navigation/routes";
import { useDispatch } from "react-redux";
import { discoverProfile, listProfiles } from "../../actions/authActions";

const AllsetScreen = () => {
    const dispatch = useDispatch();
    const onSubmit = () =>{
        dispatch(listProfiles())
        dispatch(discoverProfile())
    }
    return (
        <AppSafeAreaView>
            <ImageBackground source={allSetback} resizeMode="cover" style={{ height: "100%", width: "100%" }}>
                <TouchableOpacityView onPress={()=> onSubmit()} style={styles.closeback}/>
                <TouchableOpacityView onPress={()=> onSubmit()} style={styles.goHome}/>
            </ImageBackground>
        </AppSafeAreaView>
    )
};
export default AllsetScreen;
const styles = StyleSheet.create({
    closeback:{
        height:metrics.hp5,
        width:metrics.hp5,
        alignSelf:"flex-end",
        marginRight:metrics.hp1,
        marginTop:metrics.hp5_5,
    },
    goHome:{
        height:metrics.hp5,
        width:metrics.hp20,
        position:"absolute",
        alignSelf:"center",
        bottom:metrics.hp5_5
    }
})