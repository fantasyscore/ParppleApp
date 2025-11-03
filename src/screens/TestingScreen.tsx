import React, { useState } from 'react';
import { View, ImageBackground } from 'react-native';
import CardStack, { Card } from 'react-native-card-stack-swiper';
import styles from './styles';
import Demo from './Demo';
import CardItem from './CardItem';
import { matchbackground } from '../helper/ImageAssets';

const TestingScreen = () => {
    const [swipe, setSipw] = useState();
    const [swipeRight, setSipwRight] = useState();
    const [swipeLeft, setSipwLeft] = useState();
    
  return (
    <ImageBackground
      source={matchbackground}
      style={styles.bg}
    >
      <View style={styles.containerHome}>
        <View style={styles.top}>
        </View>

        <CardStack
          loop={true}
          verticalSwipe={false}
          renderNoMoreCards={() => null}
          ref={(swiper: any) => setSipw(swiper)}
        >
          {Demo.map((item, index) => (
            <Card key={index}>
              <CardItem
                image={item.image}
                name={item.name}
                description={item.description}
                matches={item.match}
                actions
                onPressLeft={(right: React.SetStateAction<undefined>) => setSipwRight(right)}
                onPressRight={(left: React.SetStateAction<undefined>) => setSipwRight(left)}
              />
            </Card>
          ))}
        </CardStack>
      </View>
    </ImageBackground>
  );
};

export default TestingScreen;
