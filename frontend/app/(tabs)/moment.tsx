import { StyleSheet, Text, View, Image, Dimensions, Animated} from 'react-native';
import {useRef, useEffect} from 'react';
import {SafeAreaView} from "react-native-safe-area-context";
import { Ionicons } from '@expo/vector-icons';
import FontAwesome6  from '@expo/vector-icons/FontAwesome6';
import Stack from '@/assets/other/Stack.svg';
import { RNSVGSvgIOS } from 'react-native-svg';


export default function MomentView() {


    const profilePic = require('../../assets/images/profile.png');
    const album = require('../../assets/images/album.png');
    const vinyl = require('../../assets/images/vinyl.png');
    const value = Dimensions.get('window').width;

    //const stack = require('../../assets/other/Stack.svg')

    const info = {
        name: "Helena Vance",
        songName: "Like This",
        artist: "Atura",
    };

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
    <SafeAreaView style={styles.container}>
        <View style = {[styles.header, {flexDirection: 'row', alignItems: "center"}]}>
            <Image 
                    source = {profilePic}
                    style = {{marginLeft: 10, width: 60, height: 60, borderRadius: 50, overflow: 'hidden'}}
                />
            <View style = {{marginLeft: 10, flexDirection: 'row', flex: 1}}>
                <View style = {[{width: '100%', justifyContent: "center"}]}>
                    <View style = {{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4}}>
                        <Text style={styles.texxt}>{info.name}</Text>
                        <Text style={styles.texxt}>{info.songName} - {info.artist} </Text>
                    </View>
                    
                    <View style = {[{width: '100%', height: 12, borderRadius: 50, backgroundColor: 'hsl(0, 100%, 100%)'}]}/>
                    <Text style={[styles.texxt, { color: 'blue' , marginTop: 4}]}>Waveform goes here</Text>
                </View>
                
            </View>
            
        </View>
        <View style = {[styles.moment, {alignContent: "center"}]}>
            <View style = {[styles.test, {flex: 1, justifyContent: "center", alignItems: "center"}]}>
                <Animated.View style = {{transform: [{rotate: spin}]}}>
                    <View style = {[{justifyContent: "center", alignItems: "center"}]}>
                        <Image 
                            source = {album}
                            style = {{aspectRatio: 1, height: undefined, resizeMode: "contain"}}
                        />
                        <Image 
                            source = {vinyl}
                            style = {{width: value, aspectRatio: 1, position: "absolute", resizeMode: "contain"}}>
                        </Image>
                    </View>
                </Animated.View>
            </View>
            
            
            <View style = {[styles.foot, {flexDirection: 'row', alignItems: "center", justifyContent: "space-between"}]}>
                <Text style={[styles.texxt, {marginLeft: '10%'}]}> W Atura ❤️‍🩹</Text>
                <Ionicons name="heart" size={40} color="red" />
            </View>
        </View>
        <View style = {[styles.foot, {backgroundColor: 'hsl(0,100%,100%)'}]}>
            <View style={[styles.test, {flex: .5, flexDirection: 'row'}]}>
                <View style = {{borderWidth: 1, flex: 0.2, alignItems: 'center', justifyContent: "center"}}>
                    <FontAwesome6 name="house" size={24} color="hsla(0, 0%, 67%, 1.00)" />
                </View>
                <View style = {{borderWidth: 1, flex: 0.2, alignItems: 'center', justifyContent: "center"}}>
                    <FontAwesome6 name="magnifying-glass" size={24} color="hsla(0, 0%, 67%, 1.00)" />
                </View>
                <View style = {{borderWidth: 1, flex: 0.2, alignItems: 'center', justifyContent: "center"}}>
                    <RNSVGSvgIOS><Stack width={30} height={30}/></RNSVGSvgIOS>
                </View>
                <View style = {{borderWidth: 1, flex: 0.2, alignItems: 'center', justifyContent: "center"}}>
                    <Ionicons name="people-sharp" size={24} color="hsla(0, 0%, 67%, 1.00)" />
                </View>
                <View style = {{borderWidth: 1, flex: 0.2, alignItems: 'center', justifyContent: "center"}}>
                    <Image 
                        source = {profilePic}
                        style = {[{width: 24, height: 24, borderRadius: 50, overflow: 'hidden'}]}
                    />
                </View>
            </View>
            <View style={[styles.test, {borderWidth: 1, flex: 0.5, alignItems: 'center'}]}>

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
        flex: 0.10,
    },
    moment: {
        flex: 0.8,
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