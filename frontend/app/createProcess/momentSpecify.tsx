import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Image, Text, TouchableOpacity, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Moment } from '../../components/momentInfo';
import Bubble from '../../assets/other/bubble.svg';
import Feather from '@expo/vector-icons/Feather';
import AntDesign from '@expo/vector-icons/AntDesign';
import EvilIcons from '@expo/vector-icons/EvilIcons';

export default function MomentSpecifyView({ moment, scrollFunc }: { moment: Moment, scrollFunc: (page: number) => void }) {
  const src = require('../../assets/images/stack.png');
  const vinylImg = require('../../assets/images/vinyl.png');
  const { width } = useWindowDimensions();

  const bubbleHeight = 0.12533245892 * width;

  return (
    <View style={{ width, justifyContent: 'center', alignItems: 'center' }}>
      <SafeAreaView
        style={[StyleSheet.absoluteFill, { flex: 1, justifyContent: 'flex-start', alignItems: 'center', gap: 0.5*bubbleHeight}]}
        edges={['top', 'left', 'right']}
      >
        <View style={{ alignItems: 'flex-start', height: 2.5 * bubbleHeight, width: '100%', flexDirection: 'row', justifyContent: 'space-between', marginLeft: 1.5 * bubbleHeight, marginTop: 2 * bubbleHeight}}>
          <TouchableOpacity onPress={() => scrollFunc(0)} style={{ alignItems: 'center' }}>
            <View style={{ position: 'absolute', alignItems: 'center'}}>
              <Bubble width={bubbleHeight} height = {bubbleHeight}/>
              <View style={{ marginTop: '-80%' }}> 
                <Feather name="arrow-left" size={0.6 * bubbleHeight} color="black" />
              </View>
            </View>
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', gap: bubbleHeight, height: bubbleHeight, width: 2.75 * bubbleHeight, marginLeft: -2.75* bubbleHeight,}}>
            <TouchableOpacity style={{ alignItems: 'center' }}>
              <View style={{ position: 'absolute', alignItems: 'center' }}>
                <Bubble width={1.5*bubbleHeight} height={1.5*bubbleHeight} />
                <View style={{ marginTop: '-80%' }}>
                  <AntDesign name="comment" size={0.53333* 1.5 * bubbleHeight} color="black" />
                </View>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={{ alignItems: 'center', marginTop: 1.2 * bubbleHeight}}>
              <View style={{ position: 'absolute', alignItems: 'center' }}>
                <Bubble width={2*bubbleHeight} height={2*bubbleHeight} />
                <View style={{ marginTop:'-80%' }}>
                  <EvilIcons name="image" size={0.8 * 2 * bubbleHeight} color="black" />
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Content */}
        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ alignItems: 'center', width: '100%' }}>
              <View style={{ width: '70%', aspectRatio: 1, justifyContent: 'center', alignItems: 'center' }}>
                <View style={[{ justifyContent: 'center', alignItems: 'center' }]}>
                  <Image
                    source={moment.album}
                    style={{ width: '40%', aspectRatio: 1, height: undefined }}
                  />
                  <Image
                    source={vinylImg}
                    style={{ width: '100%', aspectRatio: 1, height: undefined, position: 'absolute' }}
                  />
                </View>
              </View>
              <View style={{ width: 350, justifyContent: 'center', alignItems: 'center', marginTop: 30 }}>
                <View style={{ marginLeft: 10 }}>
                  <Text style={{ fontSize: 30, fontFamily: 'Jacques Francois', color: '#333C42' }}>
                    {moment.title} - {moment.artist}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Next Button */}
        <View style={{ width: '100%', justifyContent: 'flex-start', alignItems: 'center' }}>
          <TouchableOpacity
            style={{
              backgroundColor: '#39868F',
              borderRadius: 10,
              borderWidth: 4,
              borderColor: '#333C42',
              alignItems: 'center',
              width: '60%',
            }}
            onPress={() => scrollFunc(2)}
          >
            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 30, marginVertical: 10, fontFamily: 'Jacques Francois' }}>
              Next
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}