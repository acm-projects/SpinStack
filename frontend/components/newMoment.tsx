import { StyleSheet, Text, View, Image, Easing, Animated} from 'react-native';
import {useRef, useEffect} from 'react';
import {SafeAreaView} from "react-native-safe-area-context";
import {useWindowDimensions} from 'react-native';
import TextCorner from '../assets/other/TextCorner.svg';
import Waveform from './waveform';
import MomentInfo from './momentInfo';
import LikeButton from './likeButton';
import Top from '@/assets/other/Group 7.svg';
import Upper from '@/assets/other/Group 5.svg';
import Lower from '@/assets/other/Group 8.svg';

import { RNSVGSvgIOS } from 'react-native-svg';


export default function MomentView({data} : {data: MomentInfo}) {
    const {height, width, scale, fontScale} = useWindowDimensions();
    const spinAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
    Animated.loop(
        Animated.timing(spinAnim, {
        toValue: 1,
        duration: 2000, //2kms = 2s
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

  return (
        <View style = {{flex: 1, backgroundColor: '#FFF0E2'}}>
            <View style = {StyleSheet.absoluteFill}>
                <View style = {{height: '100%', alignItems: 'center', justifyContent: "flex-start"}}>
                    <View style = {{width: '100%', height: 170}}>
                        <RNSVGSvgIOS><Top/></RNSVGSvgIOS>
                    </View>
                    <View style={{marginLeft: 0 ,height:298}}>
                            <RNSVGSvgIOS><Upper/></RNSVGSvgIOS>
                        </View>
                        <View style = {{marginLeft: 0, marginTop: -40, height: 298}}>
                            <RNSVGSvgIOS><Lower/></RNSVGSvgIOS>
                        </View>
                    
                </View>
            </View>
            
                
            
            
            <SafeAreaView style = {[StyleSheet.absoluteFill]} edges = {['top', 'left', 'right']}>
                <View style = {{justifyContent: 'flex-start'}}>
                    <View style = {{marginHorizontal: 10, flexDirection: 'row', alignItems: 'flex-start'}}>
                        <Image 
                                source = {data.user.profilePic}
                                style = {{width: 40, height: 40, borderRadius: 50, overflow: 'hidden'}}
                            />
                        <View style = {{marginLeft: 10, marginRight: 40, flexDirection: 'row', flex: 1}}>
                            <View style = {[{width: '100%', justifyContent: "center"}]}>
                                <View style = {[{width: '100%', height: 12, borderRadius: 50, backgroundColor: 'hsl(0, 100%, 100%)'}]}/>
                                <View style = {{marginTop: 30}}><Waveform data = {data.moment.waveform} height = {25} start = {data.moment.start} end = {data.moment.end}/></View>
                        
                            </View>
                        </View>
                    </View>
                    <View style = {{marginLeft: 10}}>
                        <Text style={[styles.texxt]}>{data.moment.songName}</Text>
                        <Text style={styles.texxt}>{data.moment.artist} </Text>
                    </View>
                    
                </View>
                
                
                <View style = {{flex: 0.87, alignContent: "center"}}>
                    <View style = {[{flex: 1, justifyContent: "center", alignItems: "center"}]}>
                        <Animated.View style = {{transform: [{rotate: spin}], position: 'relative', width: '100%'}}> 
                            <View style = {[{justifyContent: "center", alignItems: "center"}]}>
                                <Image 
                                    source = {data.moment.album}
                                    style = {{width: '40%', aspectRatio: 1, height: undefined}}
                                />
                                <Image 
                                    source = {data.moment.vinyl}
                                    style = {{width: '100%', aspectRatio: 1, height: undefined, position: "absolute"}}>
                                </Image>
                                
                            </View>
                        </Animated.View>
                    </View>
                    
                    
                    <View style = {[{flexDirection: 'row', alignItems: "center", justifyContent: "flex-end", marginBottom: 20, marginRight: 15}]}>
                        <LikeButton/>
                    </View>
                </View>
                
  
            </SafeAreaView>
        </View>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'stretch',
        /*backgroundColor: '#fffefe69',*/
        borderColor: 'hsl(0,100%,100%)',
    },
    texxt: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'hsl(0, 100%, 100%)'
    }
})