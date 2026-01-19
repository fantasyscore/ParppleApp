import React from 'react';
import { View, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';
import metrics from '../assets/Metrics';
import { Screen } from '../theme/dimens';
import { colors } from '../theme/colors';

const Loader = () => {
  return (
    <View style={styles.container}>
      <LottieView
        source={require('../assets/loading.json')}
        autoPlay
        loop
        style={{ width: Screen.Width, height: metrics.hp40 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position:"absolute",
    // backgroundColor:"",
    left:0,
    right:0,
    bottom:0,
    top:0,
    backgroundColor: 'rgba(0,0,0,0.30)',
  },
});

export default Loader;
