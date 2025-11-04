import React from 'react'
import { StyleSheet, Text, View, Image, Easing, Animated, TouchableOpacity} from 'react-native';
import {useRef, useEffect, useState} from 'react';
import {SafeAreaView} from "react-native-safe-area-context";
import {useWindowDimensions} from 'react-native';
import Waveform from './waveform';
import {Moment} from './momentInfo';
import {User} from './momentInfo';
import Background from '@/assets/other/Moment Background(1).svg';
import GroupProfile from './groupProfile';
import RatingButton from './ui/ratingButton';
import { useNavigation } from '@react-navigation/native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
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

    const vinylSize = width * 0.98;

    const vinylStyle = {
        width: vinylSize,
        height: vinylSize,
        top: 0.46*height - vinylSize / 2,
        left: width / 2 - vinylSize / 2,
    };


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
                    <View style = {{width: '100%'}}>
                        <RNSVGSvgIOS><Background/></RNSVGSvgIOS>
                    </View>
                    
                </View>
            </View>
                
            
            
            <SafeAreaView style = {[StyleSheet.absoluteFill, {justifyContent: 'space-between', marginBottom: '15%'}]} edges = {['top', 'left', 'right', 'bottom']}>
                <View style = {{justifyContent: 'flex-start'}}>
                    <View style = {{marginLeft: 0.0465116279*width, marginHorizontal: 0.023255814*width, flexDirection: 'row', alignItems: 'flex-start', marginTop: -0.0107*height}}>
                        <GroupProfile pics = {users.slice(0, 3).map(user => (typeof user.profilePic === "string"
                                        ? { uri: user.profilePic }
                                        : user.profilePic))} scale={0.6} 
                                        />
                        <View style = {{marginLeft: 0.023255814*width, marginRight: 0.0930232558*width, flexDirection: 'row', flex: 1}}>
                            <View style = {[{width: '100%', justifyContent: "center"}]}>
                                <View style = {[{width: '100%', height: 0.00536480687*height, borderRadius: 50, backgroundColor: '#333c42', marginTop: 0.00751072961*height}]}/>
                                <View style = {{marginTop: 0.0321888*height}}><Waveform data = {data.waveform} height = {0.058 * width} start = {data.songStart / data.length} end = {(data.songStart + data.songDuration)/(data.length)} baseColor="#333C42"
                    regionColor = "#6d976aff"
                    selectedColor='#84DA7F' duration = {daily.moment.songDuration} anim = {true}/></View>
                        
                            </View>
                        </View>
                    </View>
                    <View style = {{marginLeft: '2.3255814%'}}>
                        <Text style={[styles.texxt, {fontFamily: 'Luxurious Roman'}]}>{data.title}</Text>
                        <Text style={[styles.texxt, {fontSize: 15, fontFamily: 'Jacques Francois'}]}>{data.artist} </Text>
                    </View>
                </View>
                
                {/* Absolutely centered spinning vinyl */}
                <View style={[{position: 'absolute',
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
                <View style = {[{flexDirection: 'row', alignItems: "flex-start", justifyContent: "flex-end", marginRight: '3%'}]}>
                    {[1,2,3,4,5].map((num) => (<RatingButton key = {num} value = {num} selected = {rating === num} onPress = {setRating}/>))}
                    <View style = {{position: 'absolute', marginTop: '20%', marginRight: '15%'}}>
                        <TouchableOpacity onPress={handlePress}>
                            <FontAwesome
                                name={'send'}
                                size={width/8.6}
                                color={sent ? '#5eb0d9ff' : 'gray'}
                            />
                        </TouchableOpacity>
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

})