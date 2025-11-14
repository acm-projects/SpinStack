import React, { useRef, useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  Animated,
  Easing,
  TouchableOpacity,
  PanResponder,
} from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { useWindowDimensions } from 'react-native';
import Waveform from '../../components/waveform';
import { Moment } from '../../components/momentInfo';
import { User } from '../../components/momentInfo';
import Background from '@/assets/other/Moment Background(1).svg';
import GroupProfile from '../../components/groupProfile';
import { useNavigation } from '@react-navigation/native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { RNSVGSvgIOS, Svg, Path } from 'react-native-svg';
import { DailyInfo } from '../../components/groupInfo';

export default function DailyView({ daily, users }: { daily: DailyInfo, users: User[] }) {
  if (!daily) {
    return (<View style={{ flex: 1, backgroundColor: 'red' }}><Text>you're cooked buddy the daily doesn't even exist</Text></View>);
  }
  const data = daily.moment;
  const { height, width } = useWindowDimensions();
  const vinylImg = require('../../assets/images/vinyl.png');
  const spinAnim = useRef(new Animated.Value(0)).current;
  const [rating, setRating] = useState<number>(3);

  const vinylSize = width * 0.98;
  const vinylStyle = {
    width: vinylSize,
    height: vinylSize,
    top: 0.46 * height - vinylSize / 2.5,
    left: width / 2 - vinylSize / 2,
  };

  useEffect(() => {
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
        isInteraction: false,
      })
    ).start();
  }, [spinAnim]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['360deg', '0deg'],
  });

  const [sent, setSent] = useState(false);
  const navigation = useNavigation();

  const handlePress = () => {
    setSent(!sent);
  };

  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    if (sent) {
      timer = setTimeout(() => {
        navigation.goBack();
        if (daily.rating === rating) daily.rating = rating;
      }, 750);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [sent, navigation]);

  // === Wave slider interaction ===
  const SLIDER_WIDTH = width * 0.7;
  const STEP_WIDTH = SLIDER_WIDTH / 5;

  const pan = useRef(new Animated.Value(rating - 1)).current;
  const startValue = useRef(0);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        // Capture the current pan value when the user starts dragging
        pan.stopAnimation((currentValue) => {
          startValue.current = currentValue;
        });
      },
      onPanResponderMove: (_, gesture) => {
        const newRaw = Math.min(Math.max(startValue.current + gesture.dx / STEP_WIDTH, 0), 4);
        pan.setValue(newRaw);
      },
      onPanResponderRelease: (_, gesture) => {
        const newRaw = Math.min(Math.max(startValue.current + gesture.dx / STEP_WIDTH, 0), 4);
        const newRating = Math.round(newRaw) + 1;
        setRating(newRating);
        Animated.timing(pan, {
          toValue: newRating - 1,
          duration: 200,
          useNativeDriver: false,
        }).start();
      },
    })
  ).current;

  const translateX = pan.interpolate({
    inputRange: [0, 4],
    outputRange: [0, SLIDER_WIDTH - STEP_WIDTH],
  });

  return (
    <View style={{ flex: 1, backgroundColor: '#FFF0E2' }}>
      <View style={StyleSheet.absoluteFill}>
        <View style={{ height: '100%', alignItems: 'center', justifyContent: "flex-start" }}>
          <View style={{ width: '100%' }}>
            <RNSVGSvgIOS><Background /></RNSVGSvgIOS>
          </View>
        </View>
      </View>

      <SafeAreaView style={[StyleSheet.absoluteFill, { justifyContent: 'space-between', marginBottom: '15%' }]} edges={['top', 'left', 'right', 'bottom']}>
        <View style={{ justifyContent: 'flex-start' }}>
          <View style={{ marginLeft: 0.0465 * width, marginHorizontal: 0.0232 * width, flexDirection: 'row', alignItems: 'flex-start', marginTop: -0.0107 * height }}>
            <GroupProfile
              pics={users.slice(0, 3).map(user => (typeof user.profilePic === "string"
                ? { uri: user.profilePic }
                : user.profilePic))}
              scale={0.6}
            />
            <View style={{ marginLeft: 0.0232 * width, marginRight: 0.0930 * width, flexDirection: 'row', flex: 1 }}>
              <View style={[{ width: '100%', justifyContent: "center" }]}>
                <View style={[{ width: '100%', height: 0.00536 * height, borderRadius: 50, backgroundColor: '#333c42', marginTop: 0.0075 * height }]} />
                <View style={{ marginTop: 0.03218 * height }}>
                  <Waveform
                    data={data.waveform}
                    height={0.058 * width}
                    start={data.songStart / data.length}
                    end={(data.songStart + data.songDuration) / (data.length)}
                    baseColor="#333C42"
                    regionColor="#6d976aff"
                    selectedColor='#84DA7F'
                    duration={daily.moment.songDuration}
                    anim={true}
                  />
                </View>
              </View>
            </View>
          </View>
          <View style={{ marginLeft: '2.3%' }}>
            <Text style={[styles.texxt, { fontFamily: 'Luxurious Roman' }]}>{data.title}</Text>
            <Text style={[styles.texxt, { fontSize: 15, fontFamily: 'Jacques Francois' }]}>{data.artist}</Text>
          </View>
        </View>

        {/* Absolutely centered spinning vinyl */}
        <View style={[{
          position: 'absolute',
          width: vinylSize,
          height: vinylSize,
          justifyContent: 'center',
          alignItems: 'center',
        }, vinylStyle]}>
          <Animated.View style={[styles.vinylWrapper, { transform: [{ rotate: spin }] }]}>
            <View style={styles.vinylContent}>
              <Image
                source={typeof data.album === "string" ? { uri: data.album } : data.album}
                style={styles.albumImage}
              />
            </View>
            <Image source={vinylImg} style={styles.vinylImage} />
          </Animated.View>
        </View>

        {/* === SEGMENTED WAVE SLIDER === */}
        <View style={{ alignItems: 'center', marginTop: height * 0.68, marginBottom: -10 }}>
          <View {...panResponder.panHandlers}>
            <Svg width={SLIDER_WIDTH} height={80}>
              {[0, 1, 2, 3, 4].map((i) => {
                const segmentStart = (i * SLIDER_WIDTH) / 5;
                const segmentEnd = ((i + 1) * SLIDER_WIDTH) / 5;
                const segmentOpacity = i < rating ? 1 : 0.2;

                return (
                  <Path
                    key={i}
                    d={`M${segmentStart} 40 Q ${(segmentStart + segmentEnd) / 2} ${i % 2 === 0 ? 0 : 80
                      }, ${segmentEnd} 40`}
                    fill="none"
                    stroke="#5eb0d9"
                    strokeWidth={6}
                    opacity={segmentOpacity}
                  />
                );
              })}
            </Svg>

            <Animated.View
              style={{
                position: 'absolute',
                top: 20,
                left: translateX,
                width: STEP_WIDTH,
                height: 40,
                justifyContent: 'center',
                alignItems: 'center',
                paddingTop: 60
              }}
            >
              <View
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 15,
                  backgroundColor: '#5eb0d9',
                }}
              />
            </Animated.View>
          </View>
        </View>

        <View style={{ alignItems: 'center', marginLeft: 295 }}>
          <TouchableOpacity onPress={handlePress}>
            <FontAwesome
              name={'send'}
              size={width / 8.6}
              color={sent ? '#5eb0d9ff' : 'gray'}
            />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

export const options = {
  headerShown: false,
};

const styles = StyleSheet.create({
  texxt: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333C42'
  },
  vinylWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  vinylContent: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    width: '100%',
    height: '100%',
    resizeMode: 'none'
  },
  albumImage: {
    width: '40%',
    aspectRatio: 1,
    zIndex: 1,
    height: undefined,
  },
  vinylImage: {
    position: 'absolute',
    width: '100%',
    aspectRatio: 1,
    height: undefined,
    zIndex: 2,
  },
});
