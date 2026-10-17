import React, { useState } from "react";
import { ImageBackground, Platform, ScrollView, StyleSheet, View } from "react-native";
import FastImage from "react-native-fast-image";
import LinearGradient from "react-native-linear-gradient";
import { useSelector } from "react-redux";
import { AppSafeAreaView } from "../../common/AppSafeAreaView";
import { AppText, BLACK, EIGHTEEN, FORTEEN, INTER_MEDIUM, INTER_REGULAR, OPECITY, OPECITY_DARK, SCHEHERAZADE_BOLD, SIXTEEN, THIRTEEN, TWELVE, TWENTY, TWENTY_FOUR, WHITE } from "../../common/AppText";
import { TouchableOpacityView } from "../../common/TouchableOpacityView";
import metrics from "../../assets/Metrics";
import { colors, newColor } from "../../theme/colors";
import { benifitsIconNew, BottomLayer, closeNewWhiteIcon, legalBackgroundSettin, purchaseImageNew, subScriptionBackgroundNew, subscriptionSelectedNew, timeShowNewBackground } from "../../helper/ImageAssets";
import NavigationService from "../../navigation/NavigationService";
import PaymentStatusModal from "../../components/Payment/PaymentStatusModal";
import FaceGateDialogs from "./subscription/components/FaceGateDialogs";
import { useFaceVerificationGate } from "./subscription/useFaceVerificationGate";
import { useSubscriptionPurchase } from "./subscription/useSubscriptionPurchase";

const BENEFITS = [
  { title: "Unlimites Likes", description: "Unlimited freedom to like and connect" },
  { title: "Priority Likes", description: "Your likes are shown first to increase match chances." },
  { title: "Verified Profiles", description: "Get instantly match with the verified profiles with real connections." },
  { title: "See Who Likes You", description: "Instantly view and match with interested\nprofiles." },
  { title: "Who Viewed You", description: "See who’s interested in you." },
];

const POPULAR_PLAN_INDEX = 1;

const SubscriptionScreen = ({ route }: any) => {
  const selectedTier = route?.params?.comming?.title ?? "Silver";
  const userData = useSelector((state: any) => state.auth.userData);
  const [selectedPlanIndex, setSelectedPlanIndex] = useState(0);

  const { plans, loading, processing, startPurchase, verify } = useSubscriptionPurchase();
  const faceGate = useFaceVerificationGate();

  const tierPlans = plans.filter((plan) => plan.tier === selectedTier).sort((a, b) => a.periodOrder - b.periodOrder);
  const selectedPlan = tierPlans[selectedPlanIndex];

  const onBuyPress = () => {
    // iOS: unverified users must pass the face check first
    if (Platform.OS === "ios" && userData?.faceVerified === false) {
      faceGate.open();
      return;
    }
    startPurchase(selectedPlan);
  };

  const hero = (
    <ImageBackground source={purchaseImageNew} resizeMode="stretch" style={styles.hero}>
      <TouchableOpacityView onPress={() => NavigationService.goBack()} style={styles.closeButton}>
        <FastImage source={closeNewWhiteIcon} resizeMode="contain" style={styles.closeIcon} />
      </TouchableOpacityView>
    </ImageBackground>
  );

  if (loading) {
    return <AppSafeAreaView color={newColor.blackNew}>{hero}</AppSafeAreaView>;
  }

  return (
    <AppSafeAreaView color={newColor.blackNew}>
      {hero}
      <LinearGradient colors={["#21212350", "#212123"]} style={styles.headline}>
        <AppText style={styles.centered} weight={SCHEHERAZADE_BOLD} type={TWENTY_FOUR} color={WHITE}>
          Unlock the World Behind
        </AppText>
        <AppText style={[styles.centered, styles.headlineSecond]} weight={SCHEHERAZADE_BOLD} type={TWENTY_FOUR} color={WHITE}>
          the Mask.
        </AppText>
        <AppText style={[styles.centered, styles.headlineSub]} type={FORTEEN} weight={INTER_MEDIUM} color={OPECITY}>
          Your VIP Pass to Anonymous Attraction.
        </AppText>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} style={styles.scroll}>
        {tierPlans.map((plan, index) => {
          const selected = selectedPlanIndex === index;
          const textColor = selected ? BLACK : WHITE;
          return (
            <TouchableOpacityView key={plan.id} activeOpacity={1} onPress={() => setSelectedPlanIndex(index)}>
              <ImageBackground
                source={selected ? subscriptionSelectedNew : subScriptionBackgroundNew}
                resizeMode="stretch"
                style={styles.planCard}
              >
                <View>
                  <AppText style={styles.planPeriod} type={FORTEEN} weight={INTER_MEDIUM} color={textColor}>
                    {plan.planOf}
                  </AppText>
                  <AppText style={styles.planPrice} type={TWENTY} weight={SCHEHERAZADE_BOLD} color={textColor}>
                    {plan.displayPrice}
                  </AppText>
                </View>
                <AppText style={styles.planWeekly} type={THIRTEEN} weight={INTER_MEDIUM} color={textColor}>
                  {plan.amount} {plan.ofPu}{"  "}
                </AppText>
                {index === POPULAR_PLAN_INDEX ? (
                  <ImageBackground
                    source={timeShowNewBackground}
                    tintColor={selected ? colors.black : "#E6B7A8"}
                    resizeMode="contain"
                    style={styles.popularTag}
                  >
                    <AppText style={styles.popularText} type={THIRTEEN} weight={INTER_MEDIUM} color={selected ? WHITE : BLACK}>
                      Most Popular
                    </AppText>
                  </ImageBackground>
                ) : null}
              </ImageBackground>
            </TouchableOpacityView>
          );
        })}

        <View style={styles.benefitsDivider}>
          <ImageBackground source={timeShowNewBackground} resizeMode="contain" style={styles.benefitsTag}>
            <AppText type={THIRTEEN} weight={INTER_MEDIUM} color={WHITE}>
              Benefits
            </AppText>
          </ImageBackground>
        </View>
        {BENEFITS.map((benefit) => (
          <View key={benefit.title} style={styles.benefitRow}>
            <FastImage source={benifitsIconNew} resizeMode="contain" style={styles.benefitIcon} />
            <View style={styles.benefitText}>
              <AppText type={SIXTEEN} weight={SCHEHERAZADE_BOLD} color={WHITE}>
                {benefit.title}
              </AppText>
              <AppText style={styles.benefitDescription} color={OPECITY_DARK} type={TWELVE}>
                {benefit.description}
              </AppText>
            </View>
          </View>
        ))}
        <ImageBackground source={legalBackgroundSettin} resizeMode="stretch" tintColor={colors.black} style={styles.legal}>
          <AppText style={styles.centered} color={WHITE} type={THIRTEEN} weight={INTER_REGULAR}>
            Your membership renews automatically for uninterrupted access. Cancel at least 24 hours before renewal. Manage your membership anytime in Account Settings.
          </AppText>
        </ImageBackground>
      </ScrollView>

      <ImageBackground source={BottomLayer} resizeMode="stretch" style={styles.bottomLayer}>
        <TouchableOpacityView style={styles.buyTouchable} onPress={onBuyPress} disabled={!!processing || tierPlans.length === 0}>
          <LinearGradient colors={["#D08FA9", "#FDD2C1"]} style={styles.buyButton}>
            <AppText type={EIGHTEEN} weight={SCHEHERAZADE_BOLD} color={BLACK}>
              Get {selectedPlan?.planOf || "Plan"} for {selectedPlan?.displayPrice || ""}
            </AppText>
          </LinearGradient>
        </TouchableOpacityView>
      </ImageBackground>

      <PaymentStatusModal
        visible={verify.visible}
        stage={verify.stage}
        error={verify.error}
        transactionId={verify.transactionId}
        successMessage="Your payment has been completed successfully. Enjoy all the premium features without any interruption."
        errorFallback="We couldn’t verify your subscription right now. Please try again."
        onClose={(stage) => {
          verify.close();
          if (stage === "success") NavigationService.goBack();
        }}
      />
      <FaceGateDialogs dialog={faceGate.dialog} onStart={faceGate.start} onClose={faceGate.close} />
    </AppSafeAreaView>
  );
};

export default SubscriptionScreen;

const styles = StyleSheet.create({
  hero: {
    height: metrics.hp30,
    width: "100%",
  },
  closeButton: {
    width: "100%",
    paddingVertical: metrics.hp3,
    marginTop: metrics.hp2,
    alignItems: "flex-end",
    paddingHorizontal: metrics.hp2,
  },
  closeIcon: {
    height: metrics.hp4,
    width: metrics.hp4,
  },
  headline: {
    paddingHorizontal: metrics.hp2,
    marginTop: -metrics.hp5,
  },
  centered: {
    textAlign: "center",
  },
  headlineSecond: {
    marginTop: -metrics.hp3,
  },
  headlineSub: {
    marginTop: -metrics.hp1_5,
  },
  scroll: {
    paddingHorizontal: metrics.hp2,
    marginTop: metrics.hp3,
  },
  scrollContent: {
    paddingBottom: metrics.hp10,
  },
  planCard: {
    height: metrics.hp10,
    marginBottom: metrics.hp2,
    justifyContent: "space-between",
    paddingHorizontal: metrics.hp2,
    flexDirection: "row",
    alignItems: "center",
  },
  planPeriod: {
    marginTop: metrics.hp1,
  },
  planPrice: {
    marginTop: -metrics.hp1,
  },
  planWeekly: {
    marginTop: metrics.hp3,
  },
  popularTag: {
    height: metrics.hp4_6,
    width: metrics.hp15,
    position: "absolute",
    right: metrics.hp0_5,
    top: -metrics.hp2,
  },
  popularText: {
    textAlign: "center",
    marginTop: metrics.hp1,
  },
  benefitsDivider: {
    height: metrics.hp0_1,
    backgroundColor: "#524440",
    marginTop: metrics.hp3,
    justifyContent: "center",
    alignItems: "center",
  },
  benefitsTag: {
    height: metrics.hp4_6,
    width: metrics.hp15,
    alignItems: "center",
    justifyContent: "center",
  },
  benefitRow: {
    marginTop: metrics.hp2,
    flexDirection: "row",
    alignItems: "center",
  },
  benefitIcon: {
    height: metrics.hp3,
    width: metrics.hp3,
    marginTop: -metrics.hp1,
  },
  benefitText: {
    marginHorizontal: metrics.hp2,
  },
  benefitDescription: {
    marginTop: -metrics.hp1,
  },
  legal: {
    height: metrics.hp13,
    paddingHorizontal: metrics.hp2,
    alignItems: "center",
    justifyContent: "center",
    marginTop: metrics.hp2,
  },
  bottomLayer: {
    width: "100%",
    paddingVertical: metrics.hp2,
    alignItems: "center",
    backgroundColor: newColor.blackNew,
  },
  buyTouchable: {
    width: "100%",
    paddingHorizontal: metrics.hp2,
  },
  buyButton: {
    height: metrics.hp7,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
});
