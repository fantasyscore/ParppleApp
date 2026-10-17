import { useCallback, useRef, useState } from "react";
import { Animated, FlatList } from "react-native";

const SHOW_AFTER_OFFSET = 100;

/** "Back to top" floating button: shows once the list is scrolled past a threshold. */
export function useScrollToTopButton() {
  const listRef = useRef<FlatList>(null);
  const [visible, setVisible] = useState(false);
  const visibleRef = useRef(false);
  const anim = useRef(new Animated.Value(0)).current;

  const onScroll = useCallback(
    (event: any) => {
      const offsetY = event.nativeEvent.contentOffset.y;
      if (offsetY > SHOW_AFTER_OFFSET && !visibleRef.current) {
        visibleRef.current = true;
        setVisible(true);
        Animated.timing(anim, { toValue: 1, duration: 250, useNativeDriver: true }).start();
      } else if (offsetY <= SHOW_AFTER_OFFSET && visibleRef.current) {
        visibleRef.current = false;
        Animated.timing(anim, { toValue: 0, duration: 250, useNativeDriver: true }).start(() => setVisible(false));
      }
    },
    [anim]
  );

  const scrollToTop = useCallback(() => {
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, []);

  return { listRef, visible, anim, onScroll, scrollToTop };
}
