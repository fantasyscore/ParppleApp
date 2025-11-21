import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { AppSafeAreaView } from "../../common/AppSafeAreaView";
import HeaderCommon from "../../common/HeaderCommon";
import metrics from "../../assets/Metrics";
import {
  AppText,
  INTER_MEDIUM,
  LIGHT_BLACK,
  TWELVE,
} from "../../common/AppText";
import DubleTextLine from "../../common/DubleTextLine";
import InputCommon from "../../common/InputCommon";
import PurpuleButton from "../../common/PurpuleButton";
import { useDispatch } from "react-redux";
import { setAddProfile } from "../../slices/loginServices/authSlice";
import NavigationService from "../../navigation/NavigationService";
import { NAVIGATION_EMAIL_OTP_SCREEN } from "../../navigation/routes";
import { toastAlert } from "../../actions/UploadImageActions";
import { colors } from "../../theme/colors";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { GoogleAuthProvider, getAuth, signInWithCredential } from '@react-native-firebase/auth';
// ✅ Strict Gmail validation regex
const gmailStrictRegex =
  /^(?!.*\.\.)(?!\.)(?!.*\.$)[A-Za-z0-9._%+-]{1,64}@(gmail|googlemail)\.com$/i;

const EmailScreen = () => {
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [userEmailData, setUserEmailData] = useState("")

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: '955105716636-4pf49jso1bitv7ohduq37vb23ujf46cs.apps.googleusercontent.com',
    });
  }, [])


  const onGoogleButtonPress = async () => {
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const signInResult: any = await GoogleSignin.signIn();
      console.log(signInResult, "signInResult");

      let idToken = signInResult.data?.idToken;
      if (!idToken) {
        idToken = signInResult.idToken;
      }
      if (!idToken) {
        throw new Error('No ID token found');
      }
      setUserEmailData(signInResult?.data?.user)
      const googleCredential = GoogleAuthProvider.credential(signInResult.data.idToken);
      return signInWithCredential(getAuth(), googleCredential);
    } catch (error) {
      console.log(error)
    }
  }
  const onSubmit = () => {
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      toastAlert.showToastError("Please enter your email");
      return;
    }
    if (!gmailStrictRegex.test(trimmedEmail)) {
      toastAlert.showToastError("Please enter a valid Gmail address");
      return;
    }
    const data = { email: trimmedEmail };
    dispatch(setAddProfile(data));
    NavigationService.navigate(NAVIGATION_EMAIL_OTP_SCREEN);
  };

  return (
    <AppSafeAreaView>
      <KeyboardAwareScrollView
        showsVerticalScrollIndicator={false}
        enableOnAndroid={true}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1 }}>
        <HeaderCommon />
        <View style={styles.container}>
          <DubleTextLine firstText={"Enter your email?"} />
          <InputCommon
            value={email}
            onChangeText={setEmail}
            placeholder={"example@gmail.com"}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <AppText
            style={{ marginTop: metrics.hp1 }}
            color={LIGHT_BLACK}
            weight={INTER_MEDIUM}
            type={TWELVE}
          >
            Email is required to keep your account secure.{"\n"}Verify your email.
          </AppText>
        </View>
        <PurpuleButton title={"Next"} gmail={true} onPress={onSubmit} onPressGoogle={onGoogleButtonPress} />
      </KeyboardAwareScrollView>
    </AppSafeAreaView>
  );
};

export default EmailScreen;

const styles = StyleSheet.create({
  container: {
    marginTop: metrics.hp3,
    paddingHorizontal: metrics.hp2,
    flex: 1,
  },
});
