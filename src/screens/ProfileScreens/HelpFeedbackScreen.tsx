import React, { useCallback, useState } from "react";
import { ScrollView, StyleSheet, TextInput, View } from "react-native";
import { useSelector } from "react-redux";
import Toast from "react-native-toast-message";
import { AppSafeAreaView } from "../../common/AppSafeAreaView";
import NewHeader from "../../common/NewHeader";
import { AppText, BLACK, ELEVEN, fontSize, FORTEEN, INTER_BOLD, INTER_MEDIUM, INTER_REGULAR, INTER_SEMI_BOLD, OPECITY, SCHEHERAZADE_BOLD, TWELVE, TWENTY, WHITE } from "../../common/AppText";
import { TouchableOpacityView } from "../../common/TouchableOpacityView";
import metrics from "../../assets/Metrics";
import { colors, newColor } from "../../theme/colors";
import { interMedium } from "../../theme/typography";
import NavigationService from "../../navigation/NavigationService";
import { appOperation } from "../../appOperation";
import { NAVIGATION_SUCCES_REPORTING_SCREEN } from "../../navigation/routes";

/**
 * Settings → Help & Feedback: users send feedback, report a problem or raise a child safety concern without leaving
 * the app (Google Play's Child Safety Standards policy requires an in-app mechanism for this).
 */
const CATEGORIES = [
  { id: "child_safety", label: "Child safety concern" },
  { id: "safety", label: "Safety or abuse" },
  { id: "problem", label: "Report a problem" },
  { id: "feedback", label: "Feedback" },
  { id: "other", label: "Other" },
] as const;

type CategoryId = (typeof CATEGORIES)[number]["id"];

const MIN_MESSAGE_LENGTH = 10;
const MAX_MESSAGE_LENGTH = 1000;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const HelpFeedbackScreen = () => {
  const userData = useSelector((state: any) => state.auth.userData);
  const [category, setCategory] = useState<CategoryId | null>(null);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState<string>(userData?.email ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = useCallback(async () => {
    if (isSubmitting) return;
    const body = message.trim();
    const contactEmail = email.trim();
    if (!category) {
      Toast.show({ type: "error", text2: "Please choose what this is about." });
      return;
    }
    if (body.length < MIN_MESSAGE_LENGTH) {
      Toast.show({ type: "error", text2: `Please describe the issue in at least ${MIN_MESSAGE_LENGTH} characters.` });
      return;
    }
    if (contactEmail && !EMAIL_PATTERN.test(contactEmail)) {
      Toast.show({ type: "error", text2: "Please enter a valid email address or leave it empty." });
      return;
    }

    setIsSubmitting(true);
    try {
      const res: any = await appOperation.customer.submitFeedbackAPI({
        category,
        message: body,
        email: contactEmail || undefined,
      });
      if (res?.statusCode == 200 || res?.success) {
        // Same confirmation screen as a profile report; replacing this form so Done/back return to Settings
        NavigationService.replace(NAVIGATION_SUCCES_REPORTING_SCREEN, {
          backOnDone: true,
          title: "Thank you for your message.",
          message:
            category === "child_safety"
              ? "Our Trust & Safety team reviews child safety\nreports with the highest priority and will\ntake action as soon as possible."
              : "Our team will review it as soon as possible\nand get back to you if needed.",
        });
      } else {
        Toast.show({ type: "error", text2: res?.message || "Couldn't send your message. Please try again." });
      }
    } catch (error: any) {
      Toast.show({ type: "error", text2: error?.message || "Couldn't send your message. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  }, [category, email, isSubmitting, message]);

  return (
    <AppSafeAreaView color={newColor.blackNew}>
      <NewHeader title={"Help & Feedback"} onPress={() => NavigationService.goBack()} />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <AppText type={FORTEEN} weight={INTER_SEMI_BOLD} color={WHITE}>
          How can we help?
        </AppText>
        <AppText style={styles.subText} type={ELEVEN} weight={INTER_REGULAR}>
          Send us feedback, report a problem, or tell us about a safety concern. You don't need to leave the app.
        </AppText>

        <AppText style={styles.label} type={TWELVE} weight={INTER_BOLD} color={WHITE}>
          What is this about?
        </AppText>
        <View style={styles.chips}>
          {CATEGORIES.map((item) => {
            const active = category === item.id;
            return (
              <TouchableOpacityView
                key={item.id}
                onPress={() => setCategory(item.id)}
                style={[styles.chip, active && styles.chipActive]}
              >
                <AppText type={TWELVE} weight={INTER_MEDIUM} color={active ? BLACK : WHITE}>
                  {item.label}
                </AppText>
              </TouchableOpacityView>
            );
          })}
        </View>

        {category === "child_safety" && (
          <AppText style={styles.notice} type={ELEVEN} weight={INTER_MEDIUM}>
            Parpple is for adults 18+ only and has zero tolerance for child sexual abuse and exploitation. Tell us the
            username or what you saw.
          </AppText>
        )}

        <AppText style={styles.label} type={TWELVE} weight={INTER_BOLD} color={WHITE}>
          Your message
        </AppText>
        <View style={styles.inputContainer}>
          <TextInput
            allowFontScaling={false}
            placeholder="Describe the issue or share your feedback..."
            placeholderTextColor={colors.opecity}
            multiline
            maxLength={MAX_MESSAGE_LENGTH}
            value={message}
            onChangeText={setMessage}
            textAlignVertical="top"
            style={[styles.input, styles.messageInput]}
          />
        </View>
        <AppText style={styles.counter} type={ELEVEN} weight={INTER_REGULAR} color={OPECITY}>
          {message.length}/{MAX_MESSAGE_LENGTH}
        </AppText>

        <AppText style={[styles.label,{marginTop:metrics.hp0}]} type={TWELVE} weight={INTER_BOLD} color={WHITE}>
          Email for our reply (optional)
        </AppText>
        <View style={styles.inputContainer}>
          <TextInput
            allowFontScaling={false}
            placeholder="you@example.com"
            placeholderTextColor={colors.opecity}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={email}
            onChangeText={setEmail}
            style={styles.input}
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacityView
          onPress={onSubmit}
          disabled={isSubmitting}
          style={[styles.button, { opacity: isSubmitting ? 0.7 : 1 }]}
        >
          <AppText type={TWENTY} weight={SCHEHERAZADE_BOLD} color={WHITE}>
            {isSubmitting ? "Sending..." : "Send"}
          </AppText>
        </TouchableOpacityView>
      </View>
    </AppSafeAreaView>
  );
};

export default HelpFeedbackScreen;

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: metrics.hp2,
    paddingTop: metrics.hp2,
    paddingBottom: metrics.hp4,
  },
  subText: {
    marginTop: metrics.hp1,
    color: "#E6B7A8",
  },
  label: {
    marginTop: metrics.hp3,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: metrics.hp1,
    marginTop: metrics.hp1_5,
  },
  chip: {
    paddingHorizontal: metrics.hp1_5,
    paddingVertical: metrics.hp1,
    borderWidth: metrics.hp0_1,
    borderColor: "#524440",
  },
  chipActive: {
    backgroundColor: "#E6B7A8",
    borderColor: "#E6B7A8",
  },
  notice: {
    marginTop: metrics.hp2,
    color: "#E6B7A8",
    lineHeight: metrics.hp2,
  },
  inputContainer: {
    backgroundColor: "#555359",
    marginTop: metrics.hp1_5,
    paddingHorizontal: metrics.hp1,
  },
  input: {
    fontSize: fontSize(12),
    fontFamily: interMedium,
    fontWeight: "500",
    color: colors.white,
    minHeight: metrics.hp6,
  },
  messageInput: {
    height: metrics.hp18,
    paddingTop: metrics.hp1,
  },
  counter: {
    alignSelf: "flex-end",
    marginTop: metrics.hp0_5,
  },
  footer: {
    paddingHorizontal: metrics.hp2,
    paddingVertical: metrics.hp2,
  },
  button: {
    height: metrics.hp6,
    alignItems: "center",
    justifyContent: "center",
    borderColor: "#FAFAFA",
    borderWidth: metrics.hp0_1,
  },
});
