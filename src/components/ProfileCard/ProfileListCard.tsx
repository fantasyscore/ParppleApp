import React, { memo } from "react";
import { Image, ImageBackground, ScrollView, StyleSheet, View } from "react-native";
import FastImage from "react-native-fast-image";
import metrics from "../../assets/Metrics";
import { colors } from "../../theme/colors";
import { AppText, ELEVEN, FORTEEN, INTER_MEDIUM, INTER_SEMI_BOLD, SCHEHERAZADE_BOLD, SIXTEEN, THIRTEEN, TWELVE, WHITE } from "../../common/AppText";
import { TouchableOpacityView } from "../../common/TouchableOpacityView";
import PortraitAvatar from "../../common/PortraitAvatar";
import NavigationService from "../../navigation/NavigationService";
import { NAVIGATION_SUBSCRIPTION_SCREEN } from "../../navigation/routes";
import { PHOTO_ASPECT_RATIO } from "../../helper/Constants";
import {
  blurCountIcon,
  chatPurchaseColour,
  directChatIcon,
  dummyfemaleProfile,
  dummyMaleProfile,
  gallaryICon,
  locIcon,
  lockIconWhite,
  middleOfList,
  newCloseIcon,
  newIcon,
  newLikeIcon,
  rightArrowIcon,
  straightenIcon,
  tranperntThreeDot,
  trunOnIcon,
  trunOnsBack,
  verifedBadge,
} from "../../helper/ImageAssets";
import { capitalizeFirstLetter } from "../../utils/profile";

// FlatList getItemLayout depends on these, so they are exported with the card
export const CARD_HEIGHT = metrics.hp56;
export const CARD_MARGIN_BOTTOM = metrics.hp6;
export const CARD_ITEM_HEIGHT = CARD_HEIGHT + CARD_MARGIN_BOTTOM;

const MAX_VISIBLE_TURN_ONS = 3;
const MAX_NAME_LENGTH = 20;
const MAX_CITY_LENGTH = 25;

const truncate = (text: string, limit: number) => (text.length > limit ? `${text.substring(0, limit)}...` : text);
const goToSubscription = () => NavigationService.navigate(NAVIGATION_SUBSCRIPTION_SCREEN);

/** Which field of the profile holds its photos: discovery uses `gallery`, likes/views use `profilePicture`. */
export type PhotoField = "gallery" | "profilePicture";

export interface ProfileListCardProps {
  item: any;
  photoField?: PhotoField;
  /**
   * Full list of turn-ons. When given, the profile's `turnOns` are ids that are resolved against
   * it (likes/views payloads); otherwise `turnOns` already holds the turn-on objects (discovery).
   */
  turnOnData?: any[];
  /** Hide the dislike / like buttons (e.g. profiles you already liked) */
  showDislike?: boolean;
  showLike?: boolean;
  /** Male users without a publish plan: photos are blurred and most actions open the paywall */
  isLocked: boolean;
  onLike: (item: any) => void;
  onDislike: (item: any) => void;
  onOpenPreview: (item: any) => void;
  onCrushNote: (item: any) => void;
  onOpenGallery: (gallery: any[], index: number) => void;
  /** Shows the three-dot (report / block) button when provided */
  onOpenActions?: (item: any) => void;
}

const photosOf = (item: any, photoField: PhotoField): any[] => item?.[photoField] ?? [];

const CardHeader = ({ item, photoField, onOpenPreview, onOpenActions }: Pick<ProfileListCardProps, "item" | "onOpenPreview" | "onOpenActions"> & { photoField: PhotoField }) => {
  const photos = photosOf(item, photoField);
  const name = truncate(item.username || item.name || "", MAX_NAME_LENGTH);
  const cityName = capitalizeFirstLetter(truncate(item.city ?? "", MAX_CITY_LENGTH));
  const avatarSource = photos.length
    ? { uri: photos[0]?.url, priority: FastImage.priority.normal, cache: FastImage.cacheControl.immutable }
    : item?.gender === "male"
      ? dummyMaleProfile
      : dummyfemaleProfile;

  return (
    <TouchableOpacityView activeOpacity={1} onPress={() => onOpenPreview(item)} style={styles.cardHeaderRow}>
      <View>
        <PortraitAvatar source={avatarSource} style={styles.avatar} />
        {item.online ? <View style={styles.onlineUserDot} /> : null}
      </View>
      <View style={styles.headerInfo}>
        <View style={styles.nameContainer}>
          <View style={styles.rowCentered}>
            <AppText type={SIXTEEN} weight={SCHEHERAZADE_BOLD} style={styles.nameText}>
              {name}, {item.age} y
            </AppText>
            {item?.faceVerified ? (
              <FastImage source={verifedBadge} resizeMode="contain" style={styles.verifiedBadge} />
            ) : null}
          </View>
          {onOpenActions ? (
            <TouchableOpacityView onPress={() => onOpenActions(item)}>
              <FastImage source={tranperntThreeDot} resizeMode="contain" style={styles.threeDot} />
            </TouchableOpacityView>
          ) : null}
        </View>
        <View style={styles.rowCentered}>
          <FastImage source={newIcon} resizeMode="contain" style={styles.newBadge} />
          {cityName ? (
            <>
              <View style={styles.divider} />
              <View style={styles.metaRow}>
                <FastImage source={locIcon} resizeMode="contain" style={styles.metaIcon} />
                <AppText color={WHITE} weight={INTER_SEMI_BOLD}>
                  {" "}{cityName}
                </AppText>
              </View>
            </>
          ) : null}
          <View style={styles.divider} />
          <View style={styles.metaRow}>
            <FastImage source={straightenIcon} resizeMode="contain" style={styles.metaIcon} />
            <AppText color={WHITE} weight={INTER_SEMI_BOLD}>
              {" "}{item.height} ft
            </AppText>
          </View>
        </View>
      </View>
    </TouchableOpacityView>
  );
};

const CardGallery = ({ item, photoField, isLocked, onOpenGallery }: Pick<ProfileListCardProps, "item" | "isLocked" | "onOpenGallery"> & { photoField: PhotoField }) => {
  const photos = photosOf(item, photoField);
  if (!photos.length) {
    return (
      <ImageBackground source={chatPurchaseColour} tintColor="#555359" resizeMode="stretch" style={styles.bioOnlyCard}>
        <AppText style={styles.bioOnlyText} color={WHITE} type={TWELVE} weight={SCHEHERAZADE_BOLD}>
          {item.bio}
        </AppText>
      </ImageBackground>
    );
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.galleryContent}>
      {photos.map((img: any, idx: number) => (
        <TouchableOpacityView
          activeOpacity={1}
          onPress={() => (isLocked ? goToSubscription() : onOpenGallery(photos, idx))}
          key={img?.url ?? idx}
          style={styles.galleryItem}
        >
          {isLocked ? (
            <Image source={{ uri: img.url }} blurRadius={10} style={styles.galleryImage} />
          ) : (
            <FastImage
              source={{ uri: img.url, priority: FastImage.priority.normal, cache: FastImage.cacheControl.immutable }}
              style={styles.galleryImage}
            />
          )}
          {isLocked ? (
            <>
              <View style={styles.galleryDim} />
              <View style={styles.lockOverlay}>
                <FastImage source={lockIconWhite} resizeMode="contain" style={styles.lockIcon} />
              </View>
            </>
          ) : null}
          <ImageBackground source={blurCountIcon} resizeMode="contain" style={styles.photoCounter}>
            <FastImage source={gallaryICon} resizeMode="contain" style={styles.photoCounterIcon} />
            <AppText type={ELEVEN} color={WHITE} weight={INTER_SEMI_BOLD}>
              {" "}{idx + 1} / {photos.length}
            </AppText>
          </ImageBackground>
        </TouchableOpacityView>
      ))}
      <TouchableOpacityView
        activeOpacity={1}
        onPress={isLocked ? goToSubscription : undefined}
        style={[styles.galleryItem, styles.bioTile]}
      >
        <AppText style={styles.bioTileText} color={WHITE} type={TWELVE} weight={SCHEHERAZADE_BOLD}>
          {item.bio}
        </AppText>
      </TouchableOpacityView>
    </ScrollView>
  );
};

const TurnOnChip = ({ label }: { label: string }) => (
  <ImageBackground source={trunOnsBack} resizeMode="stretch" style={styles.turnOnChip}>
    <AppText type={THIRTEEN} weight={INTER_MEDIUM} color={WHITE}>
      {label}
    </AppText>
  </ImageBackground>
);

const CardTurnOns = ({ item, turnOnData, onOpenPreview }: Pick<ProfileListCardProps, "item" | "turnOnData" | "onOpenPreview">) => {
  const profileTurnOns: any[] = item?.turnOns ?? [];
  const turnOns: any[] = turnOnData
    ? turnOnData.filter((turnOn: any) => profileTurnOns.some((own: any) => String(own?._id) === String(turnOn?._id)))
    : profileTurnOns;

  return (
    <>
      <TouchableOpacityView activeOpacity={1} onPress={() => onOpenPreview(item)} style={styles.rowCentered}>
        <FastImage source={trunOnIcon} resizeMode="contain" style={styles.turnOnIcon} />
        <AppText color={WHITE} type={FORTEEN} weight={INTER_SEMI_BOLD}>
          {"  "}{profileTurnOns.length} turn-ons{"    "}
        </AppText>
        <FastImage source={rightArrowIcon} resizeMode="contain" style={styles.turnOnArrow} />
      </TouchableOpacityView>
      <TouchableOpacityView activeOpacity={1} onPress={() => onOpenPreview(item)} style={styles.turnOnChips}>
        {turnOns.slice(0, MAX_VISIBLE_TURN_ONS).map((turnOn: any, index: number) => (
          <TurnOnChip key={turnOn?._id ?? turnOn?.id ?? index} label={turnOn?.value} />
        ))}
        {turnOns.length > MAX_VISIBLE_TURN_ONS ? <TurnOnChip label={`+${turnOns.length - MAX_VISIBLE_TURN_ONS}`} /> : null}
      </TouchableOpacityView>
    </>
  );
};

/**
 * One profile in the discovery feed. Memoized: it re-renders only when its own
 * profile or the (stable) handlers change, not on every list update or swipe elsewhere.
 */
const ProfileListCard = memo(
  ({
    item,
    photoField = "gallery",
    turnOnData,
    showDislike = true,
    showLike = true,
    isLocked,
    onLike,
    onDislike,
    onOpenPreview,
    onCrushNote,
    onOpenGallery,
    onOpenActions,
  }: ProfileListCardProps) => (
    <View style={styles.card}>
      <CardHeader item={item} photoField={photoField} onOpenPreview={onOpenPreview} onOpenActions={onOpenActions} />

      <View style={styles.galleryWrap}>
        <CardGallery item={item} photoField={photoField} isLocked={isLocked} onOpenGallery={onOpenGallery} />
      </View>

      <View style={styles.actionsRow}>
        {showDislike ? (
          <TouchableOpacityView activeOpacity={1} onPress={() => (isLocked ? goToSubscription() : onDislike(item))}>
            <FastImage source={newCloseIcon} resizeMode="contain" style={styles.dislikeButton} />
          </TouchableOpacityView>
        ) : null}
        {showLike ? (
          <TouchableOpacityView activeOpacity={1} onPress={() => onLike(item)}>
            <FastImage source={newLikeIcon} resizeMode="contain" style={styles.likeButton} />
          </TouchableOpacityView>
        ) : null}
        <TouchableOpacityView activeOpacity={1} onPress={() => onCrushNote(item)}>
          <FastImage source={directChatIcon} resizeMode="contain" style={styles.chatButton} />
        </TouchableOpacityView>
      </View>

      <CardTurnOns item={item} turnOnData={turnOnData} onOpenPreview={onOpenPreview} />
      <FastImage source={middleOfList} resizeMode="stretch" style={styles.footerDivider} />
    </View>
  ),
  (prev, next) =>
    prev.item === next.item &&
    prev.photoField === next.photoField &&
    prev.turnOnData === next.turnOnData &&
    prev.showDislike === next.showDislike &&
    prev.showLike === next.showLike &&
    prev.isLocked === next.isLocked &&
    prev.onLike === next.onLike &&
    prev.onDislike === next.onDislike &&
    prev.onOpenPreview === next.onOpenPreview &&
    prev.onCrushNote === next.onCrushNote &&
    prev.onOpenGallery === next.onOpenGallery &&
    prev.onOpenActions === next.onOpenActions
);

export default ProfileListCard;

const styles = StyleSheet.create({
  card: {
    height: CARD_HEIGHT,
    width: "100%",
    marginBottom: CARD_MARGIN_BOTTOM,
  },
  rowCentered: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardHeaderRow: {
    marginTop: metrics.hp2,
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    height: metrics.hp8,
    width: metrics.hp8,
    borderRadius: metrics.hp50,
    marginTop: metrics.hp1,
  },
  onlineUserDot: {
    height: metrics.hp2,
    width: metrics.hp2,
    borderRadius: metrics.hp50,
    backgroundColor: "#39E75F",
    borderWidth: metrics.hp0_5,
    borderColor: "#2A2A2C",
    position: "absolute",
    right: metrics.hp0,
    bottom: metrics.hp0_5,
  },
  headerInfo: {
    marginLeft: metrics.hp2,
  },
  nameContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width:"90%"
  },
  nameText: {
    color: "#E6B7A8",
  },
  verifiedBadge: {
    height: metrics.hp2_4,
    width: metrics.hp2_4,
    marginLeft: metrics.hp1,
  },
  threeDot: {
    height: metrics.hp4,
    width: metrics.hp4,
  },
  newBadge: {
    height: metrics.hp3_7,
    width: metrics.hp4_5,
  },
  divider: {
    height: metrics.hp2,
    width: metrics.hp0_1,
    backgroundColor: colors.white,
    marginRight: metrics.hp1,
    marginLeft: metrics.hp1,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: -metrics.hp0_5,
  },
  metaIcon: {
    height: metrics.hp2,
    width: metrics.hp2,
  },
  galleryWrap: {
    width: "100%",
    alignSelf: "center",
  },
  galleryContent: {
    overflow: "hidden",
    marginTop: metrics.hp2,
    gap: metrics.hp0_5,
  },
  galleryItem: {
    // 3:4 portrait tile, same ratio the photos are cropped to on upload
    width: metrics.hp32 * PHOTO_ASPECT_RATIO,
    height: metrics.hp32,
    overflow: "hidden",
  },
  galleryImage: {
    width: "100%",
    height: "100%",
    borderWidth: metrics.hp0_1,
    borderColor: "#FFFFFF80",
  },
  galleryDim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  lockIcon: {
    height: metrics.hp3,
    width: metrics.hp3,
  },
  photoCounter: {
    height: metrics.hp3_5,
    width: metrics.hp6_5,
    position: "absolute",
    bottom: metrics.hp1,
    left: metrics.hp1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  photoCounterIcon: {
    height: metrics.hp1_8,
    width: metrics.hp1_8,
  },
  bioTile: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: metrics.hp5,
  },
  bioTileText: {
    textAlign: "center",
    lineHeight: metrics.hp2_5,
  },
  bioOnlyCard: {
    width: metrics.hp30,
    height: metrics.hp37,
    marginTop: metrics.hp3,
    paddingHorizontal: metrics.hp2,
    paddingVertical: metrics.hp2,
    alignItems: "center",
    justifyContent: "center",
  },
  bioOnlyText: {
    textAlign: "center",
    lineHeight: metrics.hp2,
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: -metrics.hp3,
  },
  dislikeButton: {
    height: metrics.hp8,
    width: metrics.hp8,
    marginRight: metrics.hp1_5,
  },
  likeButton: {
    height: metrics.hp9,
    width: metrics.hp9,
  },
  chatButton: {
    height: metrics.hp8,
    width: metrics.hp8,
    marginLeft: metrics.hp1_5,
  },
  turnOnIcon: {
    height: metrics.hp3_2,
    width: metrics.hp3_2,
  },
  turnOnArrow: {
    height: metrics.hp1_9,
    width: metrics.hp1_9,
    marginTop: metrics.hp0_5,
  },
  turnOnChips: {
    flexDirection: "row",
    alignItems: "center",
    gap: metrics.hp0_8,
    marginTop: metrics.hp1,
  },
  turnOnChip: {
    paddingHorizontal: metrics.hp2,
    paddingVertical: metrics.hp1,
    alignItems: "center",
    justifyContent: "center",
  },
  footerDivider: {
    height: metrics.hp1_9,
    width: "100%",
    marginTop: metrics.hp2,
  },
});
