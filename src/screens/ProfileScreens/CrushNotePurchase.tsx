import React from "react";
import { FlatList, ImageBackground, Platform, StyleSheet } from "react-native";
import FastImage from "react-native-fast-image";
import LinearGradient from "react-native-linear-gradient";
import { AppSafeAreaView } from "../../common/AppSafeAreaView";
import { AppText, BLACK, EIGHTEEN, FORTEEN, INTER_BOLD, INTER_MEDIUM, INTER_REGULAR, OPECITY, SCHEHERAZADE_BOLD, TEN, THIRTEEN, TWELVE, TWENTY, TWENTY_FOUR, WHITE } from "../../common/AppText";
import { TouchableOpacityView } from "../../common/TouchableOpacityView";
import metrics from "../../assets/Metrics";
import { newColor } from "../../theme/colors";
import { BottomLayer, chatAmountBackgroungNew, chatPurchaseBlack, chatPurchaseColour, chatsPurchesNewBackground, closeNewWhiteIcon, popularBackground, timeShowNewBackground } from "../../helper/ImageAssets";
import NavigationService from "../../navigation/NavigationService";
import PaymentStatusModal from "../../components/Payment/PaymentStatusModal";
import { useCrushNotePurchase } from "./crushNote/useCrushNotePurchase";

/** Store screen for chat packs (crush notes): pick a pack, pay, and see the verification result. */
const CrushNotePurchase = () => {
  const { products, select, setSelect, processing, startPurchase, verify } = useCrushNotePurchase();
  const selectedPack = products[select];

  const renderPack = ({ item, index }: { item: any; index: number }) => {
    const isSelected = select === index;
    return (
      <TouchableOpacityView activeOpacity={1} onPress={() => setSelect(index)}>
        <ImageBackground source={isSelected ? chatPurchaseColour : chatPurchaseBlack} resizeMode="stretch" style={styles.pack}>
          <AppText style={{ color: isSelected ? "black" : "#E6B7A8" }} type={TWENTY} weight={SCHEHERAZADE_BOLD}>
            {item.count}
          </AppText>
          <AppText style={styles.packUnit} type={THIRTEEN} weight={INTER_REGULAR} color={isSelected ? BLACK : WHITE}>
            Chats
          </AppText>
          {isSelected ? (
            <ImageBackground source={chatAmountBackgroungNew} resizeMode="stretch" style={styles.priceTag}>
              <AppText type={TEN} color={WHITE} weight={INTER_BOLD}>
                {item.perItemPrice} / Chat
              </AppText>
            </ImageBackground>
          ) : (
            <ImageBackground source={timeShowNewBackground} tintColor="#E6B7A8" resizeMode="stretch" style={styles.priceTag}>
              <AppText type={TEN} weight={INTER_BOLD}>
                {item.perItemPrice} / Chat
              </AppText>
            </ImageBackground>
          )}
          {index === 1 ? (
            <ImageBackground source={popularBackground} resizeMode="stretch" style={styles.popularTag}>
              <AppText style={styles.popularText} type={TWELVE} weight={SCHEHERAZADE_BOLD} color={BLACK}>
                {"   Popular"}
              </AppText>
            </ImageBackground>
          ) : null}
        </ImageBackground>
      </TouchableOpacityView>
    );
  };

  return (
    <AppSafeAreaView color={newColor.blackNew}>
      <ImageBackground source={chatsPurchesNewBackground} resizeMode="stretch" style={styles.hero}>
        <TouchableOpacityView onPress={() => NavigationService.goBack()} style={styles.closeButton}>
          <FastImage source={closeNewWhiteIcon} resizeMode="contain" style={styles.closeIcon} />
        </TouchableOpacityView>
      </ImageBackground>
      <LinearGradient colors={["#21212350", "#212123"]} style={styles.headline}>
        <AppText style={styles.centered} weight={SCHEHERAZADE_BOLD} type={TWENTY_FOUR} color={WHITE}>
          Let Your First Message
        </AppText>
        <AppText style={[styles.centered, styles.headlineSecond]} weight={SCHEHERAZADE_BOLD} type={TWENTY_FOUR} color={WHITE}>
          Create the Magic.
        </AppText>
        <AppText style={[styles.centered, styles.headlineSub]} type={FORTEEN} weight={INTER_MEDIUM} color={OPECITY}>
          Where Every Conversation Begins with{"\n"} Mystery.
        </AppText>
      </LinearGradient>
      <FlatList
        data={products}
        keyExtractor={(item: any) => (item.productId || item.id).toString()}
        showsVerticalScrollIndicator={false}
        renderItem={renderPack}
        horizontal
        contentContainerStyle={styles.packList}
      />
      <ImageBackground source={BottomLayer} resizeMode="stretch" style={styles.bottomLayer}>
        <TouchableOpacityView style={styles.buyTouchable} onPress={startPurchase} disabled={!!processing || products.length === 0}>
          <LinearGradient colors={["#D08FA9", "#FDD2C1"]} style={styles.buyButton}>
            <AppText type={EIGHTEEN} weight={SCHEHERAZADE_BOLD} color={BLACK}>
              Get {selectedPack?.count || ""} chats for {selectedPack?.displayPrice || ""}
            </AppText>
          </LinearGradient>
        </TouchableOpacityView>
      </ImageBackground>

      <PaymentStatusModal
        visible={verify.visible}
        stage={verify.stage}
        error={verify.error}
        transactionId={verify.transactionId}
        successMessage="Your payment has been completed successfully. Crush Notes have been added to your account."
        errorFallback="We couldn't verify your purchase right now. Please try again."
        onClose={(stage) => {
          verify.close();
          if (stage === "success") NavigationService.goBack();
        }}
      />
    </AppSafeAreaView>
  );
};

export default CrushNotePurchase;

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
    paddingHorizontal: Platform.OS === "ios" ? metrics.hp0 : metrics.hp0,
    marginTop: -metrics.hp3,
    alignSelf:"center"
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
  packList: {
    paddingHorizontal: metrics.hp2,
    marginTop: metrics.hp2,
    gap: metrics.hp1,
  },
  pack: {
    height: metrics.hp17,
    width: metrics.hp13,
    alignItems: "center",
    justifyContent: "center",
  },
  packUnit: {
    marginTop: -metrics.hp1_5,
  },
  priceTag: {
    height: metrics.hp4_6,
    width: metrics.hp12,
    bottom: -metrics.hp2,
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  popularTag: {
    height: metrics.hp3_5,
    width: metrics.hp9,
    position: "absolute",
    right: -metrics.hp0_4,
    top: metrics.hp1,
    alignItems: "center",
    justifyContent: "center",
  },
  popularText: {
    marginTop: -metrics.hp1,
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
