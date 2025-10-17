import React, { useState, useRef, useEffect} from 'react';
import { StyleSheet, View, Image, Text, TouchableOpacity, useWindowDimensions} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { demoMoment } from '../../components/demoMoment';
import BottomL from '../assets/other/Bottom_L.svg';
import TopL from '../assets/other/Top_L.svg';
import { RNSVGSvgIOS } from 'react-native-svg';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Ionicons from '@expo/vector-icons/Ionicons';

// seconds
const momentLength = 30;

export default function MomentFinalizeView({ moment = demoMoment.moment, scrollFunc}: { moment?: typeof demoMoment.moment, scrollFunc: (page: number) => void}) {
  const src = require('../../assets/images/stack.png');
  const { width } = useWindowDimensions();
  return (
    <View style={{ width, justifyContent: 'center', alignItems: 'center' }}>
        <SafeAreaView
        style={[StyleSheet.absoluteFill, { justifyContent: 'flex-start', alignItems: 'center', marginTop: 120, gap: 50}]}
        edges={['top', 'left', 'right']}
      >    

        <View style={{ justifyContent: 'center', alignItems: 'center'}}>
            <Text style={{ fontSize: 40, fontWeight: 'bold' }}>placeholder 2</Text>
        </View>

            

        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                <View style={{ alignItems: 'center', width: '100%'}}>
                    <View style = {{width: '70%', aspectRatio: 1, justifyContent: "center", alignItems: "center"}}>
                        <View style = {[{justifyContent: "center", alignItems: "center"}]}>
                            <Image 
                                source = {moment.album}
                                style = {{width: '40%', aspectRatio: 1, height: undefined}}
                            />
                            <Image 
                                source = {moment.vinyl}
                                style = {{width: '100%', aspectRatio: 1, height: undefined, position: "absolute"}}>
                            </Image>
                            
                        </View>
                    </View>
                    <View style={{ width: 350, justifyContent: 'center', alignItems: 'center', marginTop: 30 }}>
                        <View style={{ marginLeft: 10}}>
                            <Text style={{ fontSize: 30, fontFamily: 'Jacques Francois', fontWeight: 'bold' }}>
                            {moment.songName} - {moment.artist}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>
        </View>
          
        
        <View style = {{width: '100%',justifyContent: 'flex-start', alignItems: 'center'}}>
            <TouchableOpacity style={{
                        backgroundColor: '#39868F',
                        borderRadius: 10,
                        borderWidth: 4,
                        borderColor: '#333C42',
                        alignItems: 'center',
                        width: '60%',
                      }}
                      onPress={() => scrollFunc(0)}>
                        <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 30, marginVertical: 10 }}>Next</Text>
                    </TouchableOpacity>
        </View>
        
      </SafeAreaView>

    </View>
    
  );
}
