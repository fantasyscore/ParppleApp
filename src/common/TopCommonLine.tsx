import React from "react";
import { StyleSheet, View } from "react-native";
import metrics from "../assets/Metrics";
import { colors } from "../theme/colors";
import FastImage from "react-native-fast-image";

const TopCommonLine = ({icon, datalist}:any) => {
    return (
        <View style={styles.contaoner}>
            {datalist?.map((item:any, index:any) =>
                <View key={index}>
                    {index == 0 ?
                        <View style={{alignItems:"center", justifyContent:"center"}}>
                            <FastImage source={icon} resizeMode="contain" style={styles.Icon}/>
                            <View style={styles.colourDot} />
                        </View>
                        :
                        <View style={styles.normalDot} />
                    }
                </View>
            )}
        </View>
    )
};
export default TopCommonLine;
const styles = StyleSheet.create({
    contaoner: {
        flexDirection: "row",
        alignItems: "flex-end",
        paddingHorizontal: metrics.hp2,
    },
    normalDot: {
        width: metrics.hp0_5, height: metrics.hp0_5, backgroundColor: colors.nanoOpecity, borderRadius: metrics.hp20,
        marginLeft:metrics.hp1
    },
    colourDot: {
        width: metrics.hp3, height: metrics.hp0_7, backgroundColor: colors.green, borderRadius: metrics.hp20
    },
    Icon:{
        height:metrics.hp2_5,
        width:metrics.hp2_5,
        marginBottom:metrics.hp1
    }
})