import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import FastImage from "react-native-fast-image";
import metrics from "../../../assets/Metrics";
import { colors } from "../../../theme/colors";
import { fontSize } from "../../../common/AppText";
import { interMedium } from "../../../theme/typography";
import { TouchableOpacityView } from "../../../common/TouchableOpacityView";
import { addPhotoIcon, sendMessageNewIcon } from "../../../helper/ImageAssets";

// One line when empty, then it grows line by line up to three lines and scrolls inside the box after that. Equal-ish top and
// bottom padding plus an explicit line height keep the placeholder / text vertically centred on both platforms; a little
// more padding below than above lifts the text slightly.
const INPUT_LINE_HEIGHT = fontSize(16);
const INPUT_PADDING_TOP = metrics.hp0_5;
const INPUT_PADDING_BOTTOM = metrics.hp1_1;
/** After this long without typing, the other user stops seeing "typing..." */
const TYPING_IDLE_MS = 2000;

interface ChatInputBarProps {
  /** Called with the trimmed text when the user taps send */
  onSendText: (text: string) => void;
  /** Called only when typing starts or stops (not on every key) */
  onTypingChange: (isTyping: boolean) => void;
  onPhotoPress: () => void;
}

/**
 * The message box. It owns the text being typed, so a key press re-renders only this small component and never the
 * message list above it (that re-render of the whole chat on every key was the typing lag).
 */
const ChatInputBar = ({ onSendText, onTypingChange, onPhotoPress }: ChatInputBarProps) => {
  const [text, setText] = useState("");
  const isTypingRef = useRef(false);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setTyping = useCallback(
    (typing: boolean) => {
      if (isTypingRef.current === typing) return;
      isTypingRef.current = typing;
      onTypingChange(typing);
    },
    [onTypingChange]
  );

  const clearIdleTimer = () => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }
  };

  const onChangeText = useCallback(
    (value: string) => {
      setText(value);
      clearIdleTimer();
      if (value.length === 0) {
        setTyping(false);
        return;
      }
      setTyping(true);
      idleTimerRef.current = setTimeout(() => setTyping(false), TYPING_IDLE_MS);
    },
    [setTyping]
  );

  const stopTyping = useCallback(() => {
    clearIdleTimer();
    setTyping(false);
  }, [setTyping]);

  const send = useCallback(() => {
    const trimmed = text.trim();
    if (trimmed.length === 0) return;
    stopTyping();
    setText("");
    onSendText(trimmed);
  }, [text, stopTyping, onSendText]);

  // Leaving the chat must not leave "typing..." showing on the other side
  useEffect(
    () => () => {
      clearIdleTimer();
      if (isTypingRef.current) onTypingChange(false);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <View style={styles.inputContainer}>
      <View style={styles.inputContainerType}>
        <TextInput
          style={styles.textInput}
          value={text}
          onChangeText={onChangeText}
          onBlur={stopTyping}
          placeholder="Type a message..."
          placeholderTextColor={colors.white}
          multiline
        />
        {/* View-once photo: pick, upload, send */}
        <TouchableOpacityView activeOpacity={0.7} onPress={onPhotoPress} style={styles.photoButton}>
          <FastImage source={addPhotoIcon} resizeMode="contain" style={styles.photoIcon} />
        </TouchableOpacityView>
      </View>
      <TouchableOpacityView style={styles.sendButton} onPress={send}>
        <FastImage source={sendMessageNewIcon} resizeMode="contain" style={styles.sendIcon} />
      </TouchableOpacityView>
    </View>
  );
};

export default memo(ChatInputBar);

const styles = StyleSheet.create({
  // flex-end: when the text grows to several lines, the send button stays at the bottom next to the last line
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: metrics.hp2,
    backgroundColor: colors.transparent,
    paddingVertical: metrics.hp3,
  },
  // A smaller radius than a full pill: still a pill for one line, and a rounded box (not clipped) for several
  inputContainerType: {
    borderRadius: metrics.hp3,
    paddingHorizontal: metrics.hp1,
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
    minHeight: metrics.hp5_5,
    paddingVertical: metrics.hp0_5,
    backgroundColor: "#1F272A",
    marginBottom: metrics.hp2,
    width: "85%",
  },
  textInput: {
    lineHeight: INPUT_LINE_HEIGHT,
    maxHeight: INPUT_LINE_HEIGHT * 3 + INPUT_PADDING_TOP + INPUT_PADDING_BOTTOM,
    paddingTop: INPUT_PADDING_TOP,
    paddingBottom: INPUT_PADDING_BOTTOM,
    fontSize: fontSize(12),
    flex: 1,
    fontFamily: interMedium,
    marginLeft: metrics.hp1,
    textAlignVertical: "center",
    color: colors.white,
  },
  photoButton: {
    height: metrics.hp4,
    width: metrics.hp4,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  photoIcon: {
    height: metrics.hp3,
    width: metrics.hp3,
    tintColor: colors.white,
  },
  sendButton: {
    marginLeft: 6,
    height: metrics.hp5_5,
    width: metrics.hp5_5,
    marginBottom: metrics.hp2,
  },
  sendIcon: {
    height: metrics.hp5_5,
    width: metrics.hp5_5,
  },
});
