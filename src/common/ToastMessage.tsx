
import React from 'react'
import { View, Text } from 'react-native'
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message'
import { colors } from '../theme/colors';
import metrics from '../assets/Metrics';


interface Props { }

const toastConfig = {
    success: (props: any) => {
        return props.isVisible ?
            <BaseToast
                {...props}
                style={{ borderLeftColor: colors.purple, height: metrics.hp6 }}
            /> : null
    },


    error: (props: any) => {
        return props.isVisible ?
            <ErrorToast
                {...props}
                style={{ borderLeftColor: colors.red, height: metrics.hp6 }}
            /> : null
    },
    tomatoToast: ({ text1, props }: any) => (
        <View style={{ height: metrics.hp6, width: '100%', backgroundColor: 'tomato' }}>
            <Text>{text1}</Text>
            <Text>{props.uuid}</Text>
        </View>
    )
};

const ToastMessage: React.FC<Props> = props => {

    return (
        <Toast topOffset={50} config={toastConfig} />
    )
}

export default ToastMessage;
