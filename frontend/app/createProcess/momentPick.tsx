// app/createProcess/momentPick.tsx - Fixed with Select button
import React, { useState, useRef, useEffect} from 'react';
import { StyleSheet, View, Image, Text, Animated, PanResponder, Easing, useWindowDimensions, TouchableOpacity} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Waveform from '../../components/waveform';
import {Moment} from '../../components/momentInfo'
import Feather from '@expo/vector-icons/Feather';

// seconds
const momentLength = 30;

export default function MomentPickView({ moment, scrollFunc}: { moment: Moment, scrollFunc: (page: number) => void}) {
  const src = require('../../assets/images/stack.png');
  const { width } = useWindowDimensions();
  const [waveWidth, setWaveWidth] = useState(0);

  //progress bar anim
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

  //resetter
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

  //slider positions
  const startX = useRef(new Animated.Value(0)).current;
  const endX = useRef(new Animated.Value(0)).current;

  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(momentLength / moment.length);

  //listener updates
  startX.addListener(({ value }) => {
    if (waveWidth > 0) setStart(Math.max(0, Math.min(value / waveWidth, end - 0.01)));
  });
  endX.addListener(({ value }) => {
    if (waveWidth > 0) setEnd(Math.min(1, Math.max(value / waveWidth, start + 0.01)));
  });

  //repositioning
  const onWaveLayout = (e: any) => {
    const w = e.nativeEvent.layout.width;
    setWaveWidth(w);
    startX.setValue(start * w);
    endX.setValue(end * w);
  };

  //gesture handlers
  const panStart = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event([null, { dx: startX }], { useNativeDriver: false }),
      onPanResponderGrant: () => {
        startX.setOffset(startX.__getValue());
        startX.setValue(0);
      },
      onPanResponderRelease: () => {
        startX.flattenOffset();
        restartAnimation();
        if((end - start) * moment.length < momentLength) {
          moment.start = start;
        }
      },
    })
  ).current;

  const panEnd = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event([null, { dx: endX }], { useNativeDriver: false }),
      onPanResponderGrant: () => {
        endX.setOffset(endX.__getValue());
        endX.setValue(0);
      },
      onPanResponderRelease: () => {
        endX.flattenOffset();
        restartAnimation();
        if((end - start) * moment.length < momentLength) {
          moment.end = end;
        }
      },
    })
  ).current;

  const startNorm = startX.interpolate({
    inputRange: [0, waveWidth],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
  const endNorm = endX.interpolate({
    inputRange: [0, waveWidth],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  moment.start = start;
  moment.end = end;

  return (
    <View style={{ width, justifyContent: 'center', alignItems: 'center' }}>
      <SafeAreaView
        style={[StyleSheet.absoluteFill, { justifyContent: 'flex-start', alignItems: 'center', marginTop: 90, gap: 50}]}
        edges={['top', 'left', 'right']}
      >
        <View style={{ justifyContent: 'center', alignItems: 'center'}}>
          <Text style={{ fontSize: 40, fontFamily: 'Luxurious Roman', fontWeight: 'bold', color: '#333C42' }}>Pick Your Moment</Text>
        </View>

        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ marginLeft: 10, marginTop: -20, marginBottom: 30 }}>
              <Text style={{ fontSize: 30, fontFamily: 'Jacques Francois', color: '#333C42'}}>
                {moment.title} - {moment.artist}
              </Text>
            </View>
            <View style={{ alignItems: 'center', width: '100%'}}>
              <Image
                source={moment.album}
                style={{ width: '80%', aspectRatio: 1, borderRadius: 10, borderWidth: 2 }}
              />
              <View style={{ width: 350, justifyContent: 'center', alignItems: 'center', marginTop: 30 }}>
                <View style={{ width: '100%', height: 8, borderRadius: 50, backgroundColor: '#333C42' }} />
                <View style={{ width: '100%', marginTop: 30 }} onLayout={onWaveLayout}>
                  <Waveform
                    data={moment.waveform}
                    height={25}
                    start={start}
                    end={end}
                    baseColor="#333C42"
                    anim={false}
                    selectedColor={(end - start) * moment.length > momentLength ? 'red' : '#B7FFF7'}
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
                        justifyContent: 'center'
                      }}
                    ><Feather name="arrow-left" size={15} color="black" /></Animated.View>
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
                        justifyContent: 'center'
                      }}
                    ><Feather name="arrow-right" size={15} color="black" /></Animated.View>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>
        
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

        <TouchableOpacity 
          style={{
            backgroundColor: '#39868F',
            borderRadius: 10,
            borderWidth: 4,
            borderColor: '#333C42',
            alignItems: 'center',
            marginTop: 10,
            width: '60%',
          }}
          onPress={() => !((end - start) * moment.length > momentLength) && scrollFunc(1)}
        >
          <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 30, marginVertical: 10, fontFamily: 'Jacques Francois' }}>
            Select
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}