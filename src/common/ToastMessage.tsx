
import React from 'react'
import { View, Text } from 'react-native'
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message'
import { colors } from '../theme/colors';
import metrics from '../assets/Metrics';
import { fontSize } from './AppText';
import { ScheherazadeNewBold } from '../theme/typography';


interface Props { }

const toastConfig = {
    success: (props: any) => {
        return props.isVisible ?
            <BaseToast
                {...props}
                style={{ borderLeftColor: "#E6B7A8", height: metrics.hp6, backgroundColor:"#555359" }}
            /> : null
    },


    error: (props: any) => {
        return props.isVisible ?
            <ErrorToast
                {...props}
                style={{ borderLeftColor: colors.red, height: metrics.hp6,  backgroundColor:"#555359" }}
            /> : null
    },
    tomatoToast: ({ text1, props }: any) => (
        <View style={{ height: metrics.hp6, width: '100%', backgroundColor: 'tomato' }}>
            <Text style={{fontSize:fontSize(14), fontWeight:"600", fontFamily:ScheherazadeNewBold}}>{text1}</Text>
            <Text style={{fontSize:fontSize(14), fontWeight:"600", fontFamily:ScheherazadeNewBold}}>{props.uuid}</Text>
        </View>
    )
};

const ToastMessage: React.FC<Props> = props => {

    return (
        <Toast visibilityTime={1500} topOffset={50} config={toastConfig} />
    )
}

export default ToastMessage;
