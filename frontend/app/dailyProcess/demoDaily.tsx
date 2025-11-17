import React, { useRef, useEffect, useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Image,
    Animated,
    Easing,
    TouchableOpacity,
    PanResponder,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { useWindowDimensions } from 'react-native';
import Waveform from '../../components/waveform';
import { Moment } from '../../components/momentInfo';
import { User } from '../../components/momentInfo';
import Background from '@/assets/other/Moment Background(1).svg';
import GroupProfile from '../../components/groupProfile';
import { useNavigation } from '@react-navigation/native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { RNSVGSvgIOS, Svg, Path } from 'react-native-svg';
import { DailyInfo } from '../../components/groupInfo';
import * as SecureStore from 'expo-secure-store';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';

const API_BASE = "https://api.spotify.com/v1";

type Device = {
    id: string;
    is_active: boolean;
    name: string;
    type: string;
    is_restricted: boolean;
};

export default function DemoDaily({ daily, users }: { daily: DailyInfo, users: User[] }) {

    // Hardcoded preselected song - change these values to your song!
    const data = {
        spotifyId: "7tr2za8SQg2CI8EDgrdtNl",  // Replace with Spotify track ID
        songStart: 55,                          // Start time in seconds
        songDuration: 15,                       // Duration to play in seconds
        title: "Slide",                // Song title
        artist: "Calvin Harris",                  // Artist name
        album: "https://i.scdn.co/image/ab67616d0000b2734d3fa5ce7ba599f4fd7803ef", // Album artwork URL
        waveform: Array(100).fill(0).map(() => Math.random()), // Demo waveform data
        length: 222,                            // Total song length in seconds
    };
    const { height, width } = useWindowDimensions();
    const vinylImg = require('../../assets/images/vinyl.png');
    const spinAnim = useRef(new Animated.Value(0)).current;
    const [rating, setRating] = useState<number>(3);

    // Spotify playback state
    const [token, setToken] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const isActiveRef = useRef(false);
    const cleanupExecutedRef = useRef(false);

    const vinylSize = width * 0.98;
    const vinylStyle = {
        width: vinylSize,
        height: vinylSize,
        top: 0.46 * height - vinylSize / 2.5,
        left: width / 2 - vinylSize / 2,
    };

    // Vinyl animation loop - now controlled by isPlaying state
    useEffect(() => {
        let loop: Animated.CompositeAnimation | null = null;
        if (isPlaying) {
            loop = Animated.loop(
                Animated.timing(spinAnim, {
                    toValue: 1,
                    duration: 2000,
                    easing: Easing.linear,
                    useNativeDriver: true,
                    isInteraction: false,
                })
            );
            loop.start();
        } else {
            spinAnim.stopAnimation();
        }

        return () => {
            loop?.stop?.();
        };
    }, [isPlaying]);

    const spin = spinAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['360deg', '0deg'],
    });

    const [sent, setSent] = useState(false);
    const navigation = useNavigation();

    const handlePress = () => {
        Alert.alert("Rating sent!");
        router.push("/(tabs)/profile");
    };

    useEffect(() => {
        let timer: NodeJS.Timeout | undefined;
        if (sent) {
            timer = setTimeout(() => {
                navigation.goBack();
                if (daily.rating === rating) daily.rating = rating;
            }, 750);
        }
        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [sent, navigation]);

    // Initialize token on mount
    useEffect(() => {
        const initSpotify = async () => {
            try {
                const storedToken = await SecureStore.getItemAsync('spotifyToken');
                if (!storedToken) {
                    Alert.alert(
                        "Spotify Not Connected",
                        "Please connect your Spotify account in Settings to play moments.",
                        [{ text: "OK" }]
                    );
                    setIsLoading(false);
                    return;
                }

                console.log("✅ Found Spotify token");
                setToken(storedToken);
            } catch (error) {
                console.error("Error initializing Spotify:", error);
                Alert.alert("Error", "Failed to initialize Spotify playback");
                setIsLoading(false);
            }
        };

        initSpotify();

        // Cleanup on unmount
        return () => {
            console.log("🗑️ Component unmounting - final cleanup");
            if (pollingRef.current) {
                clearInterval(pollingRef.current);
                pollingRef.current = null;
            }
            spinAnim.stopAnimation();
        };
    }, []);

    // Cleanup function to stop playback
    const cleanup = React.useCallback(async (cleanupToken: string | null) => {
        if (cleanupExecutedRef.current) {
            console.log("🔄 Cleanup already executed, skipping");
            return;
        }

        console.log("🛑 Executing cleanup");
        cleanupExecutedRef.current = true;
        isActiveRef.current = false;

        if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
        }

        if (cleanupToken) {
            await pausePlayback(cleanupToken).catch(console.error);
        }

        spinAnim.stopAnimation();
        setIsPlaying(false);
    }, []);

    // Handle focus/unfocus with proper cleanup
    useFocusEffect(
        React.useCallback(() => {
            console.log("🎧 DemoDaily focused");
            isActiveRef.current = true;

            if (cleanupExecutedRef.current) {
                cleanupExecutedRef.current = false;
            }

            let startTimeout: NodeJS.Timeout | null = null;

            if (token && data?.spotifyId) {
                startTimeout = setTimeout(async () => {
                    if (isActiveRef.current && !cleanupExecutedRef.current) {
                        console.log("🎯 Starting playback after delay");
                        await startPlayback(token);
                    }
                }, 800);
            } else {
                setIsLoading(false);
            }

            return () => {
                console.log("🛑 DemoDaily unfocused");

                if (startTimeout) {
                    clearTimeout(startTimeout);
                }

                cleanup(token);
            };
        }, [token, data?.spotifyId, data?.songStart, data?.songDuration, cleanup])
    );

    // --- Spotify API helpers ---
    const api = async (spotifyToken: string, path: string, init?: RequestInit) => {
        const res = await fetch(`${API_BASE}${path}`, {
            ...init,
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: `Bearer ${spotifyToken}`,
                ...(init?.headers || {}),
            },
        });
        return res;
    };

    const getDevices = async (spotifyToken: string): Promise<Device[]> => {
        const res = await api(spotifyToken, "/me/player/devices");
        if (!res.ok) throw new Error(`devices: ${res.status}`);
        const deviceData = await res.json();
        return deviceData.devices as Device[];
    };

    const transferPlayback = async (spotifyToken: string, deviceId: string) => {
        await api(spotifyToken, "/me/player", {
            method: "PUT",
            body: JSON.stringify({ device_ids: [deviceId], play: false }),
        });
    };

    const seekTo = async (spotifyToken: string, ms: number) => {
        await api(spotifyToken, `/me/player/seek?position_ms=${ms}`, { method: "PUT" });
    };

    const pausePlayback = async (spotifyToken: string) => {
        try {
            await api(spotifyToken, "/me/player/pause", { method: "PUT" });
            console.log("⏸ Playback paused");
        } catch (error) {
            console.error("Error pausing playback:", error);
        }
    };

    const resumePlayback = async (spotifyToken: string) => {
        try {
            await api(spotifyToken, "/me/player/play", { method: "PUT" });
            console.log("▶️ Playback resumed");
        } catch (error) {
            console.error("Error resuming playback:", error);
        }
    };

    const togglePlayPause = async () => {
        if (!token) return;

        if (isPlaying) {
            await pausePlayback(token);
            setIsPlaying(false);
            if (pollingRef.current) {
                clearInterval(pollingRef.current);
                pollingRef.current = null;
            }
        } else {
            await resumePlayback(token);
            setIsPlaying(true);

            // Restart polling loop
            const startMs = Math.floor(data.songStart * 1000);
            const endMs = Math.floor((data.songStart + data.songDuration) * 1000);

            if (pollingRef.current) clearInterval(pollingRef.current);

            pollingRef.current = setInterval(async () => {
                if (!isActiveRef.current) {
                    if (pollingRef.current) {
                        clearInterval(pollingRef.current);
                        pollingRef.current = null;
                    }
                    return;
                }

                try {
                    const playbackRes = await api(token, "/me/player");
                    if (playbackRes.status === 204 || !playbackRes.ok) return;

                    const playbackData = await playbackRes.json();
                    const pos = playbackData.progress_ms ?? 0;

                    if (pos > endMs || pos < startMs) {
                        console.log(`🔁 Looping back to start`);
                        await seekTo(token, startMs);
                    }
                } catch (error) {
                    console.error("Error in playback loop:", error);
                }
            }, 500);
        }
    };

    // --- Main playback logic ---
    const startPlayback = async (spotifyToken: string) => {
        if (!isActiveRef.current) {
            console.log("⚠️ Component not active, skipping playback");
            return;
        }

        try {
            setIsLoading(true);

            const trackUri = `spotify:track:${data.spotifyId}`;
            const startMs = Math.floor(data.songStart * 1000);
            const endMs = Math.floor((data.songStart + data.songDuration) * 1000);

            console.log(`🎵 Starting playback for ${data.title}`);

            let res = await api(spotifyToken, "/me/player/play", {
                method: "PUT",
                body: JSON.stringify({ uris: [trackUri], position_ms: startMs }),
            });

            if (res.status === 404 || res.status === 403 || res.status === 202) {
                console.log("⚠️ No active device, searching...");
                const devices = await getDevices(spotifyToken);

                if (devices.length === 0) throw new Error("No Spotify devices found.");

                const active = devices.find((d) => d.is_active && !d.is_restricted);
                const smartphone = devices.find((d) => d.type === "Smartphone" && !d.is_restricted);
                const any = devices.find((d) => !d.is_restricted);
                const target = active ?? smartphone ?? any;

                if (!target) throw new Error("No available Spotify devices.");

                await transferPlayback(spotifyToken, target.id);
                await new Promise((r) => setTimeout(r, 800));

                res = await api(
                    spotifyToken,
                    `/me/player/play?device_id=${encodeURIComponent(target.id)}`,
                    {
                        method: "PUT",
                        body: JSON.stringify({ uris: [trackUri], position_ms: startMs }),
                    }
                );
            }

            if (!res.ok && res.status !== 204) {
                const txt = await res.text();
                throw new Error(`Play error ${res.status}: ${txt}`);
            }

            if (!isActiveRef.current) {
                console.log("⚠️ Component became inactive during setup");
                await pausePlayback(spotifyToken);
                return;
            }

            console.log("✅ Playback started");
            setIsPlaying(true);
            setIsLoading(false);

            // Polling loop
            if (pollingRef.current) clearInterval(pollingRef.current);

            pollingRef.current = setInterval(async () => {
                if (!isActiveRef.current) {
                    if (pollingRef.current) {
                        clearInterval(pollingRef.current);
                        pollingRef.current = null;
                    }
                    return;
                }

                try {
                    const playbackRes = await api(spotifyToken, "/me/player");
                    if (playbackRes.status === 204 || !playbackRes.ok) return;

                    const playbackData = await playbackRes.json();
                    const pos = playbackData.progress_ms ?? 0;

                    if (pos > endMs || pos < startMs) {
                        console.log(`🔁 Looping back to start`);
                        await seekTo(spotifyToken, startMs);
                    }
                } catch (error) {
                    console.error("Error in playback loop:", error);
                }
            }, 500);
        } catch (error: any) {
            console.error("Playback error:", error);
            setIsLoading(false);
            Alert.alert("Playback Error", error.message || "Failed to start playback.");
        }
    };

    // === Wave slider interaction ===
    const SLIDER_WIDTH = width * 0.7;
    const STEP_WIDTH = SLIDER_WIDTH / 5;

    const pan = useRef(new Animated.Value(rating - 1)).current;
    const startValue = useRef(0);

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: () => {
                pan.stopAnimation((currentValue) => {
                    startValue.current = currentValue;
                });
            },
            onPanResponderMove: (_, gesture) => {
                const newRaw = Math.min(Math.max(startValue.current + gesture.dx / STEP_WIDTH, 0), 4);
                pan.setValue(newRaw);
            },
            onPanResponderRelease: (_, gesture) => {
                const newRaw = Math.min(Math.max(startValue.current + gesture.dx / STEP_WIDTH, 0), 4);
                const newRating = Math.round(newRaw) + 1;
                setRating(newRating);
                Animated.timing(pan, {
                    toValue: newRating - 1,
                    duration: 200,
                    useNativeDriver: false,
                }).start();
            },
        })
    ).current;

    const translateX = pan.interpolate({
        inputRange: [0, 4],
        outputRange: [0, SLIDER_WIDTH - STEP_WIDTH],
    });

    if (isLoading) {
        return (
            <View style={{ flex: 1, backgroundColor: '#FFF0E2', justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#333C42" />
                <Text style={{ fontFamily: 'Jacques Francois', color: '#333C42', marginTop: 20 }}>
                    Loading moment...
                </Text>
                <Text style={{ fontFamily: 'Jacques Francois', color: '#999', marginTop: 10, textAlign: 'center', paddingHorizontal: 40 }}>
                    Make sure Spotify is open and playing
                </Text>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#FFF0E2' }}>
            <View style={StyleSheet.absoluteFill}>
                <View style={{ height: '100%', alignItems: 'center', justifyContent: "flex-start" }}>
                    <View style={{ width: '100%' }}>
                        <RNSVGSvgIOS><Background /></RNSVGSvgIOS>
                    </View>
                </View>
            </View>

            <SafeAreaView style={[StyleSheet.absoluteFill, { justifyContent: 'space-between', marginBottom: '15%' }]} edges={['top', 'left', 'right', 'bottom']}>
                <View style={{ justifyContent: 'flex-start' }}>
                    <View style={{ marginLeft: 0.0465 * width, marginHorizontal: 0.0232 * width, flexDirection: 'row', alignItems: 'flex-start', marginTop: -0.0107 * height }}>
                        {/* <GroupProfile
                            pics={users.profilePic}
                            scale={0.6}
                        /> */}
                        <View style={{ marginLeft: 0.0232 * width, marginRight: 0.0930 * width, flexDirection: 'row', flex: 1 }}>
                            <View style={[{ width: '100%', justifyContent: "center" }]}>
                                <View style={[{ width: '100%', height: 0.00536 * height, borderRadius: 50, backgroundColor: '#333c42', marginTop: 0.0075 * height }]} />
                                <View style={{ marginTop: 0.03218 * height }}>
                                    <Waveform
                                        data={data.waveform}
                                        height={0.058 * width}
                                        start={data.songStart / data.length}
                                        end={(data.songStart + data.songDuration) / data.length}
                                        baseColor="#333C42"
                                        regionColor="#6d976aff"
                                        selectedColor='#84DA7F'
                                        duration={data.songDuration}
                                        anim={true}
                                    />
                                </View>
                            </View>
                        </View>
                    </View>
                    <View style={{ marginLeft: '2.3%' }}>
                        <Text style={[styles.texxt, { fontFamily: 'Luxurious Roman' }]}>{data.title}</Text>
                        <Text style={[styles.texxt, { fontSize: 15, fontFamily: 'Jacques Francois' }]}>{data.artist}</Text>
                    </View>
                </View>

                {/* Large title above vinyl */}
                <View
                    style={{
                        position: 'absolute',
                        top: vinylStyle.top - 100,
                        width: '100%',
                        alignItems: 'center',
                        paddingHorizontal: 20,
                        zIndex: 10,
                        elevation: 10
                    }}
                >
                    {/* Semi-transparent background for better readability */}
                    <View style={{
                        backgroundColor: 'rgba(0, 0, 0, 0.45)',
                        paddingVertical: 10,
                        paddingHorizontal: 20,
                        borderRadius: 15,
                    }}>
                        <Text style={[styles.texxt, {
                            fontFamily: 'Luxurious Roman',
                            fontSize: 28,
                            textAlign: 'center',
                            color: '#FFFFFF',
                            letterSpacing: 1,
                        }]}>Prompt:</Text>

                        <Text style={[styles.texxt, {
                            fontFamily: 'Luxurious Roman',
                            fontSize: 30,
                            textAlign: 'center',
                            color: '#FFFFFF',
                            letterSpacing: 1,
                            marginTop: 5,
                        }]}>Summer Vibes</Text>
                    </View>
                </View>


                {/* Absolutely centered spinning vinyl - now tappable */}
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={togglePlayPause}
                    style={[{
                        position: 'absolute',
                        width: vinylSize,
                        height: vinylSize,
                        justifyContent: 'center',
                        alignItems: 'center',
                    }, vinylStyle]}
                >
                    <Animated.View style={[styles.vinylWrapper, { transform: [{ rotate: spin }] }]}>
                        <View style={styles.vinylContent}>
                            <Image
                                source={{ uri: data.album }}
                                style={styles.albumImage}
                            />
                        </View>
                        <Image source={vinylImg} style={styles.vinylImage} />
                    </Animated.View>
                </TouchableOpacity>

                {/* === SEGMENTED WAVE SLIDER === */}
                <View style={{ alignItems: 'center', marginTop: height * 0.68, marginBottom: -10 }}>
                    <View {...panResponder.panHandlers}>
                        <Svg width={SLIDER_WIDTH} height={80}>
                            {[0, 1, 2, 3, 4].map((i) => {
                                const segmentStart = (i * SLIDER_WIDTH) / 5;
                                const segmentEnd = ((i + 1) * SLIDER_WIDTH) / 5;
                                const segmentOpacity = i < rating ? 1 : 0.2;

                                return (
                                    <Path
                                        key={i}
                                        d={`M${segmentStart} 40 Q ${(segmentStart + segmentEnd) / 2} ${i % 2 === 0 ? 0 : 80
                                            }, ${segmentEnd} 40`}
                                        fill="none"
                                        stroke="#5eb0d9"
                                        strokeWidth={6}
                                        opacity={segmentOpacity}
                                    />
                                );
                            })}
                        </Svg>

                        <Animated.View
                            style={{
                                position: 'absolute',
                                top: 20,
                                left: translateX,
                                width: STEP_WIDTH,
                                height: 40,
                                justifyContent: 'center',
                                alignItems: 'center',
                                paddingTop: 60
                            }}
                        >
                            <View
                                style={{
                                    width: 30,
                                    height: 30,
                                    borderRadius: 15,
                                    backgroundColor: '#5eb0d9',
                                }}
                            />
                        </Animated.View>
                    </View>
                </View>

                <View style={{ alignItems: 'center', marginLeft: 295 }}>
                    <TouchableOpacity onPress={handlePress}>
                        <FontAwesome
                            name={'send'}
                            size={width / 8.6}
                            color={sent ? '#5eb0d9ff' : 'gray'}
                        />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </View>
    );
}

export const options = {
    headerShown: false,
};

const styles = StyleSheet.create({
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
});