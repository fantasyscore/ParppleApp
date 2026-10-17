import React from "react";
import { ImageBackground, Linking, Platform, StyleSheet, View } from "react-native";
import FastImage from "react-native-fast-image";
import { AppSafeAreaView } from "../../common/AppSafeAreaView";
import { AppText, BADSCRIPTREGALUR, INTER_MEDIUM, SCHEHERAZADE_BOLD, SIXTEEN, THIRTEEN, TWELVE, TWENTY, WHITE } from "../../common/AppText";
import { TouchableOpacityView } from "../../common/TouchableOpacityView";
import metrics from "../../assets/Metrics";
import { colors, newColor } from "../../theme/colors";
import { Screen } from "../../theme/dimens";
import { applogo, BottomLayer, googleIcon, homeLandImage } from "../../helper/ImageAssets";
import { useLoginFlow } from "./hooks/useLoginFlow";
import { useReviewLogin } from "./hooks/useReviewLogin";
import ReviewLoginOverlay from "./components/ReviewLoginOverlay";
import LoginLoadingOverlay from "./components/LoginLoadingOverlay";

const TERMS_URL = "https://parpple.com/terms_conditions";

const WelcomeScreen = () => {
  const login = useLoginFlow();
  const reviewLogin = useReviewLogin({ signInWithEmail: login.signInWithEmail, stopLoading: login.stopLoading });

  return (
    <AppSafeAreaView color={newColor.blackNew}>
      <TouchableOpacityView activeOpacity={1} onPress={reviewLogin.onLogoPress}>
        <FastImage source={applogo} resizeMode="contain" style={styles.logo} />
      </TouchableOpacityView>
      <AppText style={styles.tagline} weight={BADSCRIPTREGALUR} type={SIXTEEN} color={WHITE}>
        Where Secrets Spark Love
      </AppText>
      <FastImage source={homeLandImage} resizeMode="contain" style={styles.homeLandImage} />

      <View style={styles.bottomContainer}>
        <ImageBackground source={BottomLayer} resizeMode="stretch" style={styles.bottomLayer}>
          <TouchableOpacityView onPress={login.signInWithGoogle} disabled={login.loading} style={styles.googleButton}>
            <FastImage source={googleIcon} resizeMode="contain" style={styles.googleIcon} />
            <AppText weight={SCHEHERAZADE_BOLD} color={WHITE} type={TWENTY}>
              Continue with Google
            </AppText>
          </TouchableOpacityView>
          <AppText type={THIRTEEN} weight={INTER_MEDIUM} style={styles.adultsText}>
            For adults aged 18+ only
          </AppText>
          <AppText type={TWELVE} style={styles.termsText} color={WHITE}>
            By tapping Create Account or Sign In, you agree to our {"\n"}
            <AppText type={TWELVE} onPress={() => Linking.openURL(TERMS_URL)} color={WHITE} style={styles.termsLink}>
              Terms & Services{"\n"}
            </AppText>
          </AppText>
        </ImageBackground>
      </View>

      <ReviewLoginOverlay form={reviewLogin.form} />
      <LoginLoadingOverlay visible={login.loading} />
    </AppSafeAreaView>
  );
};

export default WelcomeScreen;

const styles = StyleSheet.create({
  logo: {
    height: metrics.hp7,
    width: metrics.hp20,
    alignSelf: "center",
    marginTop: metrics.hp8,
  },
  tagline: {
    textAlign: "center",
  },
  homeLandImage: {
    height: metrics.hp45,
    width: metrics.hp45,
    alignSelf: "center",
    marginTop: metrics.hp8,
  },
  bottomContainer: {
    height: metrics.hp30,
    width: Screen.Width,
    position: "absolute",
    bottom: Platform.OS === "ios" ? metrics.hp5 : metrics.hp0,
    paddingVertical: metrics.hp3,
  },
  bottomLayer: {
    height: metrics.hp30,
    width: "100%",
    paddingVertical: metrics.hp2,
  },
  googleButton: {
    height: metrics.hp7,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: metrics.hp0_1,
    borderColor: colors.white,
    marginHorizontal: metrics.hp2,
    marginTop: metrics.hp4,
  },
  googleIcon: {
    height: metrics.hp3,
    width: metrics.hp3,
    marginRight: metrics.hp1,
  },
  adultsText: {
    color: "#E6B7A8",
    textAlign: "center",
    marginTop: metrics.hp2_5,
  },
  termsText: {
    textAlign: "center",
    marginTop: metrics.hp0_5,
  },
  termsLink: {
    textDecorationLine: "underline",
  },
});
