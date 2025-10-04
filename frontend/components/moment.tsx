import { StyleSheet, Text, View, Image, Dimensions, Animated} from 'react-native';
import {useRef, useEffect} from 'react';
import {SafeAreaView} from "react-native-safe-area-context";
import { Ionicons } from '@expo/vector-icons';
import TextCorner from '../assets/other/TextCorner.svg';
import Waveform from './waveform';
import MomentInfo from './momentInfo';
import LikeButton from './likeButton';

export default function MomentView({data} : {data: MomentInfo}) {
    const value = Dimensions.get('window').width;
    const spinAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
    Animated.loop(
        Animated.timing(spinAnim, {
        toValue: 1,
        duration: 2000, //2kms = 2s
        useNativeDriver: true,
        isInteraction: false,
        })
    ).start();
    }, [spinAnim]);

    const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
    });

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style = {[styles.header, {flexDirection: 'row', alignItems: "center"}]}>
            <Image 
                    source = {data.user.profilePic}
                    style = {{marginLeft: 10, width: 60, height: 60, borderRadius: 50, overflow: 'hidden'}}
                />
            <View style = {{marginLeft: 10, flexDirection: 'row', flex: 1}}>
                <View style = {[{width: '100%', justifyContent: "center"}]}>
                    <View style = {{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4}}>
                        <Text style={styles.texxt}>{data.user.name}</Text>
                        <Text style={styles.texxt}>{data.moment.songName} - {data.moment.artist} </Text>
                    </View>
                    
                    <View style = {[{width: '100%', height: 12, borderRadius: 50, backgroundColor: 'hsl(0, 100%, 100%)'}]}/>
                    <View style = {{marginTop: 30}}><Waveform data = {data.moment.waveform} height = {25} start = {data.moment.start} end = {data.moment.end}/></View>
                    
                </View>
                
            </View>
            
        </View>
        <View style = {[styles.moment, {alignContent: "center"}]}>
            <View style = {[styles.test, {flex: 1, justifyContent: "center", alignItems: "center"}]}>
                <Animated.View style = {{transform: [{rotate: spin}]}}> 
                    <View style = {[{justifyContent: "center", alignItems: "center"}]}>
                        <Image 
                            source = {data.moment.album}
                            style = {{aspectRatio: 1, height: undefined, resizeMode: "contain"}}
                        />
                        <Image 
                            source = {data.moment.vinyl}
                            style = {{width: value, aspectRatio: 1, position: "absolute", resizeMode: "contain"}}>
                        </Image>
                    </View>
                </Animated.View>
            </View>
            
            
            <View style = {[styles.foot, {flexDirection: 'row', alignItems: "center", justifyContent: "space-between"}]}>
                <View style={{ 
                marginLeft: 30,
                backgroundColor: '#616161',
                padding: 12,
                borderRadius: 10,}}
                >
                    <Text style={[styles.texxt]}> W Atura ❤️‍🩹</Text>
                    <TextCorner 
                        width={40} 
                        height={30} 
                        style={{ position: 'absolute', bottom: -10, left: -3 }}
                    />
                </View>
                
                <View style = {{marginRight: 15}}>
                    <LikeButton/>
                </View>
            </View>
        </View>
    </SafeAreaView>
    
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
    header: {
        flex: 0.15,
    },
    moment: {
        flex: 0.85, borderWidth: 0, borderColor: 'hsl(0,100%,100%)'
    },
    foot: {
        flex: 0.12,
    },
    test: {
        /*borderWidth: 3*/
    },
    texxt: {
        fontSize: 20,
        color: 'hsl(0, 100%, 100%)'
    }
})