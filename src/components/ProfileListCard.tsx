import React, { memo } from 'react';
import { Dimensions, Image, ImageBackground, ScrollView, StyleSheet, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import { AppText, INTER_SEMI_BOLD, SCHEHERAZADE_BOLD, SIXTEEN, WHITE } from '../common/AppText';
import { TouchableOpacityView } from '../common/TouchableOpacityView';
import { directChatIcon, locIcon, lockIconWhite, newCloseIcon, newIcon, newLikeIcon, newProfileBackground, profileImage, straightenIcon } from '../helper/ImageAssets';
import metrics from '../assets/Metrics';

// Carousel geometry — shared by every screen that renders this card so the
// snap math and the card width always agree.
export const SCREEN_WIDTH = Dimensions.get('window').width;
export const CARD_WIDTH = SCREEN_WIDTH * 0.84;
export const CARD_SPACING = SCREEN_WIDTH * 0.02;
export const ITEM_WIDTH = CARD_WIDTH + CARD_SPACING * 2;
export const SIDE_PADDING = (SCREEN_WIDTH - ITEM_WIDTH) / 2;
export const CARD_HEIGHT = metrics.hp44;

export type ProfileListCardProps = {
    item: any;
    onLike: (item: any) => void;
    onDislike: (item: any) => void;
    onOpenPreview: (item: any) => void;
};

// Memoized card: re-renders only when its own profile or handlers change,
// not on every list update / swipe elsewhere.
const ProfileListCard = memo(({ item, onLike, onDislike, onOpenPreview }: ProfileListCardProps) => {
    const gallery: any[] = Array.isArray(item?.gallery) ? item.gallery : [];

    return (
        <ImageBackground source={newProfileBackground} resizeMode='stretch' style={styles.cardBackground}>
            <TouchableOpacityView activeOpacity={1} onPress={() => onOpenPreview(item)} style={styles.cardHeaderRow}>
                <FastImage
                    source={
                        gallery[0]?.url
                            ? { uri: gallery[0].url, priority: FastImage.priority.normal, cache: FastImage.cacheControl.immutable }
                            : profileImage
                    }
                    resizeMode='cover'
                    style={styles.avatar}
                />
                <View style={styles.headerInfo}>
                    <AppText type={SIXTEEN} weight={SCHEHERAZADE_BOLD} style={styles.nameText}>
                        {item?.name}{item?.age ? `, ${item.age} y` : ''}
                    </AppText>
                    {item?.distanceInKm !== undefined && item?.distanceInKm !== '' ? (
                        <View style={styles.metaRow}>
                            <FastImage source={locIcon} resizeMode='contain' style={styles.metaIcon} />
                            <AppText color={WHITE} weight={INTER_SEMI_BOLD}>
                                {" "}{item.distanceInKm} Km
                            </AppText>
                        </View>
                    ) : null}
                    {item?.height ? (
                        <View style={[styles.metaRow, { marginTop: metrics.hp0_5 }]}>
                            <FastImage source={straightenIcon} resizeMode='contain' style={styles.metaIcon} />
                            <AppText color={WHITE} weight={INTER_SEMI_BOLD}>
                                {" "}{item.height} ft
                            </AppText>
                        </View>
                    ) : null}
                </View>
                <FastImage source={newIcon} resizeMode='contain' style={styles.newBadge} />
            </TouchableOpacityView>

            <View style={styles.galleryWrap}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.galleryContent}>
                    {gallery.length > 0 ? (
                        gallery.map((img: any, idx: number) => (
                            <View key={img?._id ?? img?.url ?? idx} style={styles.galleryItem}>
                                <Image source={{ uri: img.url }} blurRadius={10} style={styles.galleryImage} />
                                <View style={styles.galleryDim} />
                                <View style={styles.lockOverlay}>
                                    <FastImage source={lockIconWhite} resizeMode='contain' style={styles.lockIcon} />
                                </View>
                            </View>
                        ))
                    ) : (
                        <View style={styles.galleryItem}>
                            <Image source={profileImage} blurRadius={10} style={styles.galleryImage} />
                            <View style={styles.galleryDim} />
                            <View style={styles.lockOverlay}>
                                <FastImage source={lockIconWhite} resizeMode='contain' style={styles.lockIcon} />
                            </View>
                        </View>
                    )}
                </ScrollView>
            </View>

            <View style={styles.actionsRow}>
                <TouchableOpacityView activeOpacity={1} onPress={() => onDislike(item)}>
                    <FastImage source={newCloseIcon} resizeMode='contain' style={styles.dislikeButton} />
                </TouchableOpacityView>
                <TouchableOpacityView activeOpacity={1} onPress={() => onLike(item)}>
                    <FastImage source={newLikeIcon} resizeMode='contain' style={styles.likeButton} />
                </TouchableOpacityView>
                <FastImage source={directChatIcon} resizeMode='contain' style={styles.chatButton} />
            </View>
        </ImageBackground>
    );
}, (prev, next) =>
    prev.item === next.item &&
    prev.onLike === next.onLike &&
    prev.onDislike === next.onDislike &&
    prev.onOpenPreview === next.onOpenPreview
);

export default ProfileListCard;

const styles = StyleSheet.create({
    cardBackground: {
        height: CARD_HEIGHT,
        width: CARD_WIDTH,
        marginHorizontal: CARD_SPACING,
    },
    cardHeaderRow: {
        paddingHorizontal: metrics.hp2,
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
    headerInfo: {
        marginLeft: metrics.hp3,
    },
    nameText: {
        color: "#E6B7A8",
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
    newBadge: {
        height: metrics.hp3_7,
        width: metrics.hp4_5,
        position: "absolute",
        right: -metrics.hp0_4,
        top: -metrics.hp0_2,
    },
    galleryWrap: {
        width: "95%",
        paddingHorizontal: metrics.hp1,
        alignSelf: "center",
    },
    galleryContent: {
        overflow: "hidden",
        marginTop: metrics.hp3,
        gap: metrics.hp0_5,
    },
    galleryItem: {
        width: metrics.hp23,
        height: metrics.hp28,
        overflow: "hidden",
    },
    galleryImage: {
        width: "100%",
        height: "100%",
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
});
