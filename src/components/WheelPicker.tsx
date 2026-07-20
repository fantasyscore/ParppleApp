import React, { memo, useCallback, useEffect, useRef } from "react";
import {
    Animated,
    NativeScrollEvent,
    NativeSyntheticEvent,
    StyleSheet,
    View,
} from "react-native";
import { fontSize } from "../common/AppText";
import { ScheherazadeNewBold, ScheherazadeNewSemiBold } from "../theme/typography";
import metrics from "../assets/Metrics";

export const WHEEL_ITEM_HEIGHT = 42;
export const WHEEL_VISIBLE_ROWS = 5; // must be odd

export interface WheelPickerProps {
    data: string[];
    selectedIndex: number;
    onChange: (index: number) => void;
    width?: number | `${number}%`;
    year?: boolean;
}

interface WheelItemProps {
    label: string;
    index: number;
    scrollY: Animated.Value;
    year?: boolean;
}

/**
 * A single row. Opacity / scale are driven natively from scrollY,
 * so scrolling stays at 60fps with zero JS re-renders.
 */
const WheelItem = memo(({ label, index, scrollY, year }: WheelItemProps) => {
    const inputRange = [
        (index - 2) * WHEEL_ITEM_HEIGHT,
        (index - 1) * WHEEL_ITEM_HEIGHT,
        index * WHEEL_ITEM_HEIGHT,
        (index + 1) * WHEEL_ITEM_HEIGHT,
        (index + 2) * WHEEL_ITEM_HEIGHT,
    ];

    const opacity = scrollY.interpolate({
        inputRange,
        outputRange: [0.25, 0.45, 1, 0.45, 0.25],
        extrapolate: "clamp",
    });

    const scale = scrollY.interpolate({
        inputRange,
        outputRange: [0.80, 0.90, 1, 0.90, 0.80],
        extrapolate: "clamp",
    });

    return (
        <View style={styles.item}>
            <Animated.Text
                numberOfLines={1}
                style={[styles.itemText, { opacity, transform: [{ scale }], marginTop: year ? -metrics.hp1 : 0 }]}
            >
                {label}
            </Animated.Text>
        </View>
    );
});

/**
 * Custom wheel picker built on Animated.FlatList — no native date picker,
 * snaps to each row with fast deceleration like the iOS spinner.
 */
const WheelPicker = ({
    data,
    selectedIndex,
    onChange,
    width = "33%",
    year
}: WheelPickerProps) => {
    const listRef = useRef<Animated.FlatList<string>>(null);
    const scrollY = useRef(new Animated.Value(selectedIndex * WHEEL_ITEM_HEIGHT)).current;
    const lastReported = useRef(selectedIndex);

    const padCount = Math.floor(WHEEL_VISIBLE_ROWS / 2);

    // Keep the wheel in sync when the parent changes selection
    // (e.g. day clamped after switching month, or data length shrank).
    useEffect(() => {
        const clamped = Math.min(selectedIndex, data.length - 1);
        if (clamped !== lastReported.current) {
            lastReported.current = clamped;
            listRef.current?.scrollToOffset({
                offset: clamped * WHEEL_ITEM_HEIGHT,
                animated: false,
            });
        }
    }, [selectedIndex, data.length]);

    const reportIndex = useCallback(
        (offsetY: number) => {
            const index = Math.min(
                Math.max(Math.round(offsetY / WHEEL_ITEM_HEIGHT), 0),
                data.length - 1
            );
            if (index !== lastReported.current) {
                lastReported.current = index;
                onChange(index);
            }
        },
        [data.length, onChange]
    );

    const onMomentumScrollEnd = useCallback(
        (e: NativeSyntheticEvent<NativeScrollEvent>) => {
            reportIndex(e.nativeEvent.contentOffset.y);
        },
        [reportIndex]
    );

    const renderItem = useCallback(
        ({ item, index }: { item: string; index: number }) => (
            <WheelItem label={item} index={index} scrollY={scrollY} year={year} />
        ),
        [scrollY, year]
    );

    const getItemLayout = useCallback(
        (_: ArrayLike<string> | null | undefined, index: number) => ({
            length: WHEEL_ITEM_HEIGHT,
            offset: WHEEL_ITEM_HEIGHT * index,
            index,
        }),
        []
    );

    return (
        <View style={[styles.wheel, { width }]}>
            <Animated.FlatList
                ref={listRef}
                data={data}
                keyExtractor={(item, index) => `${item}-${index}`}
                renderItem={renderItem}
                getItemLayout={getItemLayout}
                showsVerticalScrollIndicator={false}
                snapToInterval={WHEEL_ITEM_HEIGHT}
                snapToAlignment="start"
                decelerationRate="fast"
                bounces={false}
                overScrollMode="never"
                nestedScrollEnabled
                initialScrollIndex={Math.min(selectedIndex, data.length - 1)}
                contentContainerStyle={{
                    paddingVertical: padCount * WHEEL_ITEM_HEIGHT,
                }}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: true }
                )}
                onMomentumScrollEnd={onMomentumScrollEnd}
                scrollEventThrottle={16}
            />
        </View>
    );
};

export default memo(WheelPicker);

const styles = StyleSheet.create({
    wheel: {
        height: WHEEL_ITEM_HEIGHT * WHEEL_VISIBLE_ROWS,
    },
    item: {
        height: WHEEL_ITEM_HEIGHT,
        alignItems: "center",
        justifyContent: "center",
    },
    itemText: {
        fontSize: fontSize(15),
        fontWeight: "700",
        fontFamily: ScheherazadeNewBold,
        color: "#FFFFFF",

    },
});
