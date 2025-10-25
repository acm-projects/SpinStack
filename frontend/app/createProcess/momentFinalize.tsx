import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Image, Text, TouchableOpacity, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Moment } from '../../components/momentInfo';
import Feather from '@expo/vector-icons/Feather';
import Bubble from '../../assets/other/bubble.svg';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

export default function MomentFinalizeView({ moment, scrollFunc, height }: { moment: Moment, scrollFunc: (page: number) => void, height: number }) {
  const src = require('../../assets/images/stack.png');
  const vinylImg = require('../../assets/images/vinyl.png');
  const { width } = useWindowDimensions();

  return (
    <View style={{ width, justifyContent: 'center', alignItems: 'center' }}>
      <SafeAreaView
        style={[StyleSheet.absoluteFill, { justifyContent: 'flex-start', alignItems: 'center', marginTop: 120, gap: 50 }]}
        edges={['top', 'left', 'right']}
      >
        {/* Back Button & Action Row */}
        <View style={{ alignItems: 'flex-start', width: '100%', height: 75, flexDirection: 'row', justifyContent: 'space-between', paddingLeft: 20 }}>
          <TouchableOpacity onPress={() => scrollFunc(1)} style={{ alignItems: 'center', marginTop: -30 }}>
            <View style={{ position: 'absolute', alignItems: 'center' }}>
              <Bubble width={50} height={50} />
              <View style={{ marginTop: -40 }}>
                <Feather name="arrow-left" size={30} color="black" />
              </View>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={{ alignItems: 'center', marginLeft: 0, marginTop: -10 }}>
            <View style={{ position: 'absolute', alignItems: 'center' }}>
              <Bubble width={80} height={80} />
              <View style={{ marginTop: -70 }}>
                <MaterialCommunityIcons name="polaroid" size={60} color="black" />
              </View>
            </View>
          </TouchableOpacity>
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
                  <Text style={{ fontSize: 30, fontFamily: 'Jacques Francois', fontWeight: 'bold', color: '#333C42' }}>
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
            onPress={() => scrollFunc(0)}
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