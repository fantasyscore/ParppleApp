import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import Svg, { Path } from 'react-native-svg'
import metrics from '../assets/Metrics'
import { AppText, PURPLE, SCHEHERAZADE_BOLD, TWENTY_FOUR } from './AppText'

const SemiCircularProgressBar = ({
  size = metrics.hp16,
  strokeWidth = 20,
  progress = 0,
  trackColor = '#E0E0E0',
  progressColor = '#7B41E0'
}) => {
  const radius = (size - strokeWidth) / 2
  const circumference = Math.PI * radius
  const progressOffset = circumference * (1 - progress / 100)
  const arcPath = `M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${
    size - strokeWidth / 2
  } ${size / 2}`

  return (
    <View style={styles.container}>
      <Svg width={size} height={size / 2 + strokeWidth / 2} viewBox={`0 0 ${size} ${size / 2 + strokeWidth / 2}`}>
        <Path
          d={arcPath}
          stroke={trackColor}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        <Path
          d={arcPath}
          stroke={progressColor}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={progressOffset}
        />
      </Svg>
      <View style={styles.textContainer}>
        <AppText weight={SCHEHERAZADE_BOLD} type={TWENTY_FOUR} color={PURPLE}>
          {`${progress}%`}
        </AppText>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    position: 'absolute',
    bottom: -metrics.hp2,
    transform: [{ translateY: -15 }],
  },
  progressText: {
    fontSize: 40,
    fontWeight: 'bold',
    // You can add shadow styles here for Android and iOS
  },
})

export default SemiCircularProgressBar