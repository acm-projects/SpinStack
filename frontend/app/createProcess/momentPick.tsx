import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Image, Text, Animated, PanResponder, Easing, useWindowDimensions, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Waveform from '../../components/waveform';
import { Moment } from '../../components/momentInfo';
import Feather from '@expo/vector-icons/Feather';
import Bubble from '../../assets/other/bubble.svg';

const MAX_DURATION_SECONDS = 30;

export default function MomentPickView({ moment, scrollFunc }: { moment: Moment, scrollFunc: (page: number) => void }) {
  const src = require('../../assets/images/stack.png');
  const { width } = useWindowDimensions();
  const [waveWidth, setWaveWidth] = useState(0);

  // Progress bar animation
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(progress, {
          toValue: 1,
          duration: 3000,
          easing: Easing.linear,
          useNativeDriver: false,
        }),
        Animated.timing(progress, {
          toValue: 0,
          duration: 0,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, []);

  // Restart animation
  const restartAnimation = () => {
    progress.stopAnimation(() => {
      progress.setValue(0);
      Animated.timing(progress, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: false,
      }).start(({ finished }) => {
        if (finished) restartAnimation();
      });
    });
  };

  // Slider positions in pixels
  const startX = useRef(new Animated.Value(0)).current;
  const endX = useRef(new Animated.Value(0)).current;

  // Slider positions as percentages (0-1)
  const [mStart, setStart] = useState(0);
  const [mEnd, setEnd] = useState(Math.min(MAX_DURATION_SECONDS / moment.length, 1));
  const [currentDuration, setCurrentDuration] = useState((mEnd - mStart) * moment.length);

  // Update start position4+
  startX.addListener(({ value }) => {
    updateStartPosition(value);
  });
  
  // Update end position
  endX.addListener(({ value }) => {
    updateEndPosition(value);
  });
  
  const updateStartPosition = (value: number) => {
    if (waveWidth > 0) {
      const newStart = Math.max(0, Math.min(value / waveWidth, 1));
      
      
      // Ensure we don't exceed max duration or overlap with mEnd
      if (newStart >= mEnd) {
        setStart(Math.max(0, mEnd - 0.01));
      } else {
        setStart(newStart);
      }

      setCurrentDuration((mEnd - newStart) * moment.length);
    }
  };

  // Update end position
  const updateEndPosition = (value: number) => {
    if (waveWidth > 0) {
      const newEnd = Math.min(1, Math.max(value / waveWidth, 0));
      
      
      // Ensure we don't exceed max duration or overlap with start
      if (newEnd <= mStart) {
        setEnd(Math.min(1, mStart + 0.01));
      } else {
        setEnd(newEnd);
      }

      setCurrentDuration((newEnd - mStart) * moment.length);
    }
  };

  // Handle waveform layout
  const onWaveLayout = (e: any) => {
    const w = e.nativeEvent.layout.width;
    setWaveWidth(w);
    startX.setValue(mStart * w);
    endX.setValue(mEnd * w);
  };

  // Pan responder for start slider
  const panStart = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        startX.setOffset(startX.__getValue());
        startX.setValue(0);
      },
      onPanResponderMove: (_, gesture) => {
        startX.setValue(gesture.dx);
      },
      onPanResponderRelease: () => {
        startX.flattenOffset();
        updateStartPosition(startX.__getValue());
        restartAnimation();
      },
    })
  ).current;

  // Pan responder for end slider
  const panEnd = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        endX.setOffset(endX.__getValue());
        endX.setValue(0);
      },
      onPanResponderMove: (_, gesture) => {
        endX.setValue(gesture.dx);
      },
      onPanResponderRelease: () => {
        endX.flattenOffset();
        updateEndPosition(endX.__getValue());
        restartAnimation();
      },
    })
  ).current;

  // Sync Animated values with state
  useEffect(() => {
    if (waveWidth > 0) {
      Animated.timing(startX, {
        toValue: mStart * waveWidth,
        duration: 100,
        useNativeDriver: false,
      }).start();
    }
  }, [mStart, waveWidth]);

  useEffect(() => {
    if (waveWidth > 0) {
      Animated.timing(endX, {
        toValue: mEnd * waveWidth,
        duration: 100,
        useNativeDriver: false,
      }).start();
    }
  }, [mEnd, waveWidth]);

  // Handle select button
  const handleSelect = () => {
    if (!(currentDuration <= MAX_DURATION_SECONDS)) {
      Alert.alert('Duration Too Long', `Please select a moment that is ${MAX_DURATION_SECONDS} seconds or less.`);
      return;
    }
    
    // Update moment with new values
    moment.songStart = mStart * moment.length;
    moment.songDuration = (mEnd - mStart) * moment.length;
    scrollFunc(1);
  };

  return (
    <View style={{ width, justifyContent: 'center', alignItems: 'center' }}>
      <SafeAreaView
        style={[StyleSheet.absoluteFill, { justifyContent: 'flex-start', alignItems: 'center', marginTop: 90, gap: 50 }]}
        edges={['top', 'left', 'right']}
      >

        {/* Title */}
        <View style={{ width: '80%'}}>
          <Text style={{ fontSize: 30, fontFamily: 'Luxurious Roman', fontWeight: 'bold', textAlign: 'center', color: '#333C42' }}>
            Pick Your Moment
          </Text>
        </View>

        {/* Content */}
        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ marginLeft: 10, marginTop: -20, marginBottom: 30 }}>
              <Text style={{ fontSize: 16, fontFamily: 'Jacques Francois', color: '#333C42' }}>
                {moment.title} - {moment.artist}
              </Text>
            </View>
            <View style={{ alignItems: 'center', width: '100%' }}>
              <Image
                source={moment.album}
                style={{ width: '70%', aspectRatio: 1, borderRadius: 10, borderWidth: 2 }}
              />
              <View style={{ width: 350, justifyContent: 'center', alignItems: 'center', marginTop: 30 }}>
                <View style={{ width: '100%', height: 8, borderRadius: 50, backgroundColor: '#333C42' }} />
                <View style={{ width: '100%', marginTop: 30 }} onLayout={onWaveLayout}>
                  <Waveform
                    data={moment.waveform}
                    height={25}
                    start={mStart}
                    end={mEnd}
                    baseColor="#333C42"
                    anim={false}
                    selectedColor={(currentDuration <= MAX_DURATION_SECONDS) ? '#B7FFF7' : 'red'}
                  />
                  <View
                    style={{
                      position: 'absolute',
                      top: 0,
                      height: '100%',
                      width: '100%',
                      justifyContent: 'center',
                    }}
                  >
                    {/* Start Slider */}
                    <Animated.View
                      {...panStart.panHandlers}
                      style={{
                        position: 'absolute',
                        left: Animated.add(startX, new Animated.Value(-10)),
                        width: 20,
                        height: 60,
                        marginBottom: 30,
                        backgroundColor: '#8DD2CA',
                        borderRadius: 5,
                        borderWidth: 2,
                        borderColor: '#333C42',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <Feather name="chevrons-left" size={15} color="black" />
                    </Animated.View>

                    {/* End Slider */}
                    <Animated.View
                      {...panEnd.panHandlers}
                      style={{
                        position: 'absolute',
                        left: Animated.add(endX, new Animated.Value(-10)),
                        width: 20,
                        height: 60,
                        marginBottom: 30,
                        backgroundColor: '#8DD2CA',
                        borderRadius: 5,
                        borderWidth: 2,
                        borderColor: '#333C42',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <Feather name="chevrons-right" size={15} color="black" />
                    </Animated.View>
                  </View>
                </View>

                {/* Duration Display */}
                <View style={{ marginTop: 15 }}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontFamily: 'Jacques Francois',
                      color: (currentDuration <= MAX_DURATION_SECONDS) ? '#333C42' : 'red',
                      fontWeight: 'bold',
                    }}
                  >
                    Duration: {currentDuration.toFixed(1)}s {!(currentDuration <= MAX_DURATION_SECONDS) && '(Max 30s)'}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Progress Bar */}
        <View
          style={{
            backgroundColor: '#E4D7CB',
            borderRadius: 50,
            borderWidth: 4,
            borderColor: '#333C42',
            alignItems: 'flex-start',
            justifyContent: 'center',
            width: '60%',
            height: 40,
            overflow: 'hidden',
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '90%',
              height: '80%',
              position: 'absolute',
              zIndex: 0,
              marginLeft: 12,
            }}
          >
            {Array.from({ length: 10 }).map((_, i) => (
              <View
                key={i}
                style={{
                  width: 4,
                  height: '50%',
                  borderRadius: 10,
                  backgroundColor: '#333C42',
                }}
              />
            ))}
          </View>

          <Animated.View
            style={{
              position: 'absolute',
              top: 4,
              bottom: 0,
              height: '75%',
              backgroundColor: '#39868F',
              width: 6,
              borderRadius: 80,
              transform: [
                {
                  translateX: progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-30, waveWidth - 100],
                  }),
                },
              ],
            }}
          />
        </View>

        {/* Select Button */}
        <TouchableOpacity
          style={{
            backgroundColor: ((currentDuration) <= MAX_DURATION_SECONDS) ? '#39868F' : '#999',
            borderRadius: 10,
            borderWidth: 4,
            borderColor: '#333C42',
            alignItems: 'center',
            marginTop: 10,
            width: '60%',
          }}
          onPress={handleSelect}
        >
          <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 30, marginVertical: 10, fontFamily: 'Jacques Francois' }}>
            Select
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}