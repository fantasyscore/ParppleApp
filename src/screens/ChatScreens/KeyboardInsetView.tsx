import React from 'react';
import { StyleSheet } from 'react-native';
import { useReanimatedKeyboardAnimation } from 'react-native-keyboard-controller';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

/**
 * Lifts its children above the soft keyboard using the real IME inset reported by the OS, so it does not
 * depend on status-bar / navigation-bar / window-height quirks.
 *
 * Only a transform is ever animated (UI thread, no layout), in both directions. Any layout change tied
 * to the keyboard (padding / height) is applied on a different path than the transform, so it lands a
 * frame late and forces the whole message list to re-measure at the start of the close animation, which
 * is what showed up as a jerk when the keyboard was dismissed.
 * The parent must clip (overflow: 'hidden') so the lifted content cannot draw over the header.
 */
const KeyboardInsetView = ({ children }: { children: React.ReactNode }) => {
    const { height } = useReanimatedKeyboardAnimation();
    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: Math.min(height.value, 0) }],
    }));
    return <Animated.View style={[styles.fill, animatedStyle]}>{children}</Animated.View>;
};

const styles = StyleSheet.create({ fill: { flex: 1 } });

export default KeyboardInsetView;
