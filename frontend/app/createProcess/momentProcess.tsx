import React from 'react';
import BottomL from '../../assets/other/Bottom_L.svg';
import TopL from '../../assets/other/Top_L.svg';
import BottomM from '../../assets/other/Bottom_M.svg';
import TopM from '../../assets/other/Top_M.svg';
import BottomR from '../../assets/other/Bottom_R.svg';
import MomentPick from '../createProcess/momentPick'
import MomentSpecify from '../createProcess/momentSpecify';
import MomentFinalize from '../createProcess/momentFinalize';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRef, useState, useEffect} from 'react';
import { View, Image, Text, Animated, useWindowDimensions} from 'react-native';
import { useMomentStore } from "../stores/useMomentStore";

function bg1(width: number, height: number) {
  return (
    <View style={{width: width, height: height, backgroundColor: "#FFF0E2"}}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', height: 143, width: '100%' }}>
            <TopL />
          </View>
          <View style={{ aspectRatio: 0.78526, width: '101%' }}>
            <BottomL width="100%" height="100%" />
          </View>
        </View>
      </View>
  );
}

function bg2(width: number, height: number) {
  return (
    <View style={{width: width, height: height, backgroundColor: "#FFF0E2"}}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', justifyContent: 'flex-start', height: 162.1, width: '100%' }}>
            <TopM/>
          </View>
          <View style={{aspectRatio: 0.83888, width: '101%', marginTop: 331}}>
            <BottomM width="100%" height="100%" />
          </View>
        </View>
      </View>
  );
}

function bg3(width: number, height: number) {
  return (
    <View style={{width: width, height: height, backgroundColor: "#FFF0E2"}}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', height: '100%', width: '100%'}}>
            <BottomR width = "100%" height = "100%"/>
          </View>
        </View>
      </View>
  );
}

export default function momentProcess() {
  const moment = useMomentStore((s) => s.selectedMoment);
  if(!moment) {
    return (
      <View>
      <Text>moment not found</Text>
      </View>
    );
  }

  const src = require('../../assets/images/stack.png')
  const { width, height} = useWindowDimensions();
  const scrollRef = useRef<Animated.ScrollView>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  //button powered page navigation
  const goToPage = (page: number) => {
    // animate ts manually
    Animated.timing(scrollX, {
      toValue: page * width,
      duration: 400,
      useNativeDriver: false,
    }).start();

    scrollRef.current?.scrollTo({ x: page * width, animated: true });
  };

  //interpolate the transforms for backgrounds
  const translateX = scrollX.interpolate({
    inputRange: [0, width, width * 2],
    outputRange: [0, -width, -width * 2],
    extrapolate: 'clamp',
  });

  const [headerWidth, setHeaderWidth] = useState(0);

  
  const { selectedMoment, clearMoment } = useMomentStore();
  useEffect(() => {
    return () => clearMoment(); // clear when unmounting
  }, []);


  return (
    <View style={{ flex: 1 }}>
      <Animated.View
        style={{
          position: 'absolute',
          flexDirection: 'row',
          width: width*3,
          height: '100%',
          transform: [{ translateX }],
        }}
      >
        {bg1(width, height)}
        {bg2(width, height)}
        {bg3(width, height )}
      </Animated.View>

      <View style={{
        position: 'absolute',
        top: 50,
        left: 20,
        right: 0,
        height: 70,
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center'
      }}>
        <View style={{ justifyContent: 'flex-start'}}> 
          <View style={{width: '90%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}> 
            

            <View
              style={{ width: '80%', marginHorizontal: 30, borderWidth: 3, height: 20, borderRadius: 10, position: 'absolute' }}
              onLayout={(e) => setHeaderWidth(e.nativeEvent.layout.width)}
            >
              {headerWidth > 0 && (
                <Animated.View
                  style={{
                    height: '100%',
                    backgroundColor: 'black',
                    width: scrollX.interpolate({
                      inputRange: [0, width, 2*width],
                      outputRange: [0, headerWidth/2, headerWidth],
                      extrapolate: 'clamp',
                    }),
                    borderRadius: 10,
                  }}
                />
              )}
            </View>


            
            <View style = {{backgroundColor: 'black', width: 60, height: 60, justifyContent: 'center', alignItems: 'center', borderRadius: 100, borderWidth: 3}}> 
              <FontAwesome5 name="music" size={30} color="#8DD2CA" /> 
            </View> 
            <View style = {{backgroundColor: 'white', width: 60, height: 60, justifyContent: 'center', alignItems: 'center', borderRadius: 100, borderWidth: 3}}> 
              <Ionicons name="text" size={40} color="black" /> 
            </View> 
            
            <Image source={src} style={{ width: 60, height: 60 }} /> 
            </View> 
          </View>
        </View>

      <Animated.ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
      >
        <MomentPick moment = {moment} scrollFunc={goToPage} />
        <MomentSpecify moment = {moment} scrollFunc={goToPage} />
        <MomentFinalize moment = {moment} scrollFunc={goToPage} />
      </Animated.ScrollView>
    </View>
  );
}