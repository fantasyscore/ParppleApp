import React, { useState } from "react";
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

// ✅ Strict Gmail validation regex
const gmailStrictRegex =
  /^(?!.*\.\.)(?!\.)(?!.*\.$)[A-Za-z0-9._%+-]{1,64}@(gmail|googlemail)\.com$/i;

const EmailScreen = () => {
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");

  const onSubmit = () => {
    const trimmedEmail = email.trim().toLowerCase();

    // ✅ Check empty
    if (!trimmedEmail) {
      toastAlert.showToastError("Please enter your email");
      return;
    }

    // ✅ Check Gmail validity
    if (!gmailStrictRegex.test(trimmedEmail)) {
      toastAlert.showToastError("Please enter a valid Gmail address");
      return;
    }

    // ✅ Proceed if valid
    const data = { email: trimmedEmail };
    dispatch(setAddProfile(data));
    NavigationService.navigate(NAVIGATION_EMAIL_OTP_SCREEN);
  };

  return (
    <AppSafeAreaView>
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
      <PurpuleButton title={"Next"} gmail={true} onPress={onSubmit} />
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
