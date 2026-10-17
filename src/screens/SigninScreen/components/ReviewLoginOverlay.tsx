import React, { useRef } from "react";
import { ScrollView, StyleSheet, TextInput, View } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import LinearGradient from "react-native-linear-gradient";
import FastImage from "react-native-fast-image";
import metrics from "../../../assets/Metrics";
import { colors, newColor } from "../../../theme/colors";
import { closeNewWhiteIcon } from "../../../helper/ImageAssets";
import { AppText, BLACK, SCHEHERAZADE_BOLD, SIXTEEN, TWELVE, TWENTY, WHITE } from "../../../common/AppText";
import { TouchableOpacityView } from "../../../common/TouchableOpacityView";
import { ReviewLoginForm } from "../hooks/useReviewLogin";

/**
 * Sign-in form drawn over the Welcome screen. Not a RN Modal on purpose: the app uses
 * keyboard-controller with translucent bars, where a Modal doesn't resize for the keyboard.
 */
const ReviewLoginOverlay = ({ form }: { form: ReviewLoginForm }) => {
  const passwordInputRef = useRef<TextInput>(null);

  if (!form.visible) return null;

  return (
    <View style={styles.overlay}>
      <KeyboardAvoidingView behavior="padding" style={styles.keyboardView} pointerEvents="box-none">
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.card}>
            <TouchableOpacityView
              onPress={form.close}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={styles.closeButton}
            >
              <FastImage source={closeNewWhiteIcon} resizeMode="contain" style={styles.closeIcon} />
            </TouchableOpacityView>
            <AppText style={styles.title} weight={SCHEHERAZADE_BOLD} type={TWENTY} color={WHITE}>
              Sign In
            </AppText>
            <TextInput
              value={form.email}
              onChangeText={form.setEmail}
              placeholder="Email"
              placeholderTextColor="#FFFFFF80"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
              onSubmitEditing={() => passwordInputRef.current?.focus()}
              style={[styles.input, styles.emailInput]}
            />
            <TextInput
              ref={passwordInputRef}
              value={form.password}
              onChangeText={form.setPassword}
              placeholder="Password"
              placeholderTextColor="#FFFFFF80"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={form.submit}
              style={[styles.input, styles.passwordInput]}
            />
            {form.error ? (
              <AppText style={styles.error} type={TWELVE} color={WHITE}>
                {form.error}
              </AppText>
            ) : null}
            <TouchableOpacityView onPress={form.submit} style={styles.submit}>
              <LinearGradient colors={["#D08FA9", "#FDD2C1"]} style={styles.submitGradient}>
                <AppText type={SIXTEEN} weight={SCHEHERAZADE_BOLD} color={BLACK}>
                  Continue
                </AppText>
              </LinearGradient>
            </TouchableOpacityView>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default ReviewLoginOverlay;

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000000B3",
    zIndex: 10,
    elevation: 10,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: metrics.hp2,
  },
  card: {
    backgroundColor: newColor.blackNew,
    borderWidth: metrics.hp0_1,
    borderColor: colors.white,
    padding: metrics.hp2,
  },
  closeButton: {
    alignSelf: "flex-end",
    marginBottom: -metrics.hp1,
    zIndex: 1,
  },
  closeIcon: {
    height: metrics.hp3,
    width: metrics.hp3,
  },
  title: {
    textAlign: "center",
  },
  input: {
    height: metrics.hp7,
    borderWidth: metrics.hp0_1,
    borderColor: "#524440",
    color: colors.white,
    paddingHorizontal: metrics.hp2,
    fontSize: 15,
  },
  emailInput: {
    marginTop: metrics.hp2,
  },
  passwordInput: {
    marginTop: metrics.hp1_5,
  },
  error: {
    textAlign: "center",
    marginTop: metrics.hp1,
  },
  submit: {
    marginTop: metrics.hp2,
  },
  submitGradient: {
    height: metrics.hp7,
    alignItems: "center",
    justifyContent: "center",
  },
});
