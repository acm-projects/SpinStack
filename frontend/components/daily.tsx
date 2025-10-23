import React from 'react'
import { StyleSheet, Text, View, Image, Easing, Animated, TouchableOpacity} from 'react-native';
import {useRef, useEffect, useState} from 'react';
import {SafeAreaView} from "react-native-safe-area-context";
import {useWindowDimensions} from 'react-native';
import Waveform from './waveform';
import {Moment} from './momentInfo';
import {User} from './momentInfo';
import Top from '@/assets/other/Group 7.svg';
import Upper from '@/assets/other/Group 5.svg';
import Lower from '@/assets/other/Group 8.svg';
import GroupProfile from './groupProfile';
import RatingButton from './ui/ratingButton';
import { useNavigation } from '@react-navigation/native';

import { RNSVGSvgIOS } from 'react-native-svg';
import { DailyInfo } from './groupInfo';


export default function DailyView({ daily, users }: { daily: DailyInfo, users: User[] }) {
    if(!daily) {
        return (<View style = {{flex: 1, backgroundColor: 'red'}}><Text>you're cooked buddy the daily doesn't even exist</Text></View>);
    }
    const data = daily.moment;
    


    const {height, width, scale, fontScale} = useWindowDimensions();
    const vinylImg = require('../assets/images/vinyl.png');
    const spinAnim = useRef(new Animated.Value(0)).current;
    const [rating, setRating] = useState<number | null>(4);

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
            //mark this daily rating
            if(daily.rating === rating) daily.rating = rating;
        }, 750);
        }

        return () => {
        if (timer) clearTimeout(timer);
        };
    }, [sent, navigation]);

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
                    <View style = {{marginLeft: 20, marginHorizontal: 10, flexDirection: 'row', alignItems: 'flex-start', marginTop: -10}}>
                        <GroupProfile pics = {users.slice(0, 3).map(user => (typeof user.profilePic === "string"
                                        ? { uri: user.profilePic }
                                        : user.profilePic))} scale={0.6} 
                                        />
                        <View style = {{marginLeft: 10, marginRight: 40, flexDirection: 'row', flex: 1}}>
                            <View style = {[{width: '100%', justifyContent: "center"}]}>
                                <View style = {[{width: '100%', height: 5, borderRadius: 50, backgroundColor: '#333c42', marginTop: 7}]}/>
                                <View style = {{marginTop: 30}}><Waveform data = {data.waveform} height = {25} start = {data.songStart / data.length} end = {(data.songStart + data.songDuration)/(data.length)} baseColor = "#333C42" selectedColor = "#87bd84" anim = {true}/></View>
                        
                            </View>
                        </View>
                    </View>
                    <View style = {{marginLeft: 10}}>
                        <Text style={[styles.texxt, {fontFamily: 'Luxurious Roman'}]}>{data.title}</Text>
                        <Text style={[styles.texxt, {fontSize: 15, fontFamily: 'Jacques Francois'}]}>{data.artist} </Text>
                    </View>
                    
                </View>
                
                
                <View style = {{flex: 0.87, alignContent: "center"}}>
                    <View style = {[{flex: 1, justifyContent: "center", alignItems: "center"}]}>
                        <Animated.View style = {{transform: [{rotate: spin}], position: 'relative', width: '100%'}}> 
                            <View style = {[{justifyContent: "center", alignItems: "center"}]}>
                                <Image 
                                    source = {
                                        typeof data.album === "string"
                                        ? { uri: data.album }
                                        : data.album
                                    }
                                    style = {{width: '40%', aspectRatio: 1, height: undefined}}
                                />
                                <Image 
                                    source = {vinylImg}
                                    style = {{width: '100%', aspectRatio: 1, height: undefined, position: "absolute"}}>
                                </Image>
                                
                            </View>
                        </Animated.View>
                    </View>
                    
                    
                    <View style = {[{flexDirection: 'row', alignItems: "flex-start", justifyContent: "flex-end", marginRight: 15}]}>
                        {[1,2,3,4,5].map((num) => (<RatingButton key = {num} value = {num} selected = {rating === num} onPress = {setRating}/>))}
                        <View style = {{position: 'absolute', marginTop: 90, marginRight: 40}}>
                            <TouchableOpacity onPress={handlePress}>
                                <FontAwesome
                                    name={'send'}
                                    size={50}
                                    color={sent ? '#5eb0d9ff' : 'gray'}
                                />
                            </TouchableOpacity>
                        </View>
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
        borderColor: 'hsl(0,100%,100%)',
    },
    texxt: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333C42'
    }
})