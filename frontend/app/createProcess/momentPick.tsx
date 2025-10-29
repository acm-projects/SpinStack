import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Image, Text, Animated, PanResponder, Easing, useWindowDimensions, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Waveform from '../../components/waveform';
import { Moment } from '../../components/momentInfo';
import Feather from '@expo/vector-icons/Feather';
import * as SecureStore from 'expo-secure-store';
import { useProgressAnimation } from "../progressAnimation";
import { useFocusEffect } from '@react-navigation/native';

const MAX_DURATION_SECONDS = 30;

const API_BASE = "https://api.spotify.com/v1";

type Device = {
  id: string;
  is_active: boolean;
  name: string;
  type: string;
  is_restricted: boolean;
};

export default function MomentPickView({
  moment,
  scrollFunc,
}: {
  moment: Moment;
  scrollFunc: (page: number) => void;
}) {
  const src = require('../../assets/images/stack.png');
  const { width } = useWindowDimensions();
  const [waveWidth, setWaveWidth] = useState(0);

  //----------Spotify integration ----------------------
const [token, setToken] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Track current moment to detect changes - use a unique key
  const currentMomentKey = useRef<string | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isActiveRef = useRef(false);
  const cleanupExecutedRef = useRef(false);

  // Generate unique key for moment (includes start time to differentiate same songs)
  const getMomentKey = (momentData: typeof moment) => {
    return `${momentData.id}_${momentData.songStart}_${momentData.songDuration}`;
  };

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
          return;
        }

        console.log("✅ Found Spotify token");
        setToken(storedToken);
      } catch (error) {
        console.error("Error initializing Spotify:", error);
        Alert.alert("Error", "Failed to initialize Spotify playback");
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

    setIsPlaying(false);
  }, []);

  // Detect moment changes and cleanup immediately
  useEffect(() => {
    if (!moment?.id) return;

    const newMomentKey = getMomentKey(moment);
    const momentChanged = currentMomentKey.current !== null && currentMomentKey.current !== newMomentKey;
    
    if (momentChanged) {
      console.log(`🔄 Moment changed from ${currentMomentKey.current} to ${newMomentKey}`);
      console.log(`   Title: ${moment.title}, Start: ${moment.songStart}, Duration: ${moment.songDuration}`);
      
      // IMMEDIATELY stop playback and clear intervals
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
      
      setIsPlaying(false);
      
      // Pause playback asynchronously
      if (token) {
        pausePlayback(token).catch(console.error);
      }
      
      // Reset flags for new moment
      cleanupExecutedRef.current = false;
      isActiveRef.current = false;
    }
    
    // Update current moment key
    currentMomentKey.current = newMomentKey;
  }, [moment?.id, moment?.songStart, moment?.songDuration, token]);

  // Handle focus/unfocus with proper cleanup
  useFocusEffect(
    React.useCallback(() => {
      const momentKey = moment ? getMomentKey(moment) : null;
      console.log("🎧 MomentView focused for:", moment?.title, "Key:", momentKey);
      isActiveRef.current = true;
      
      // Only reset cleanup flag if this is truly a new focus (not just re-render)
      if (cleanupExecutedRef.current) {
        cleanupExecutedRef.current = false;
      }

      let startTimeout: NodeJS.Timeout | null = null;

      if (token && moment?.id) {
        // Wait longer for cleanup and devices to be ready
        startTimeout = setTimeout(async () => {
          if (isActiveRef.current && !cleanupExecutedRef.current) {
            console.log("🎯 Starting playback after delay for:", moment.title);
            console.log("   Start time:", moment.songStart, "Duration:", moment.songDuration);
            await startPlayback(token);
          }
        }, 800);
      }

      return () => {
        console.log("🛑 MomentView unfocused from:", moment?.title);
        
        if (startTimeout) {
          clearTimeout(startTimeout);
        }

        // CRITICAL: Actually call cleanup when losing focus
        cleanup(token);
      };
    }, [token,moment?.id, moment?.songStart, moment?.songDuration, moment?.title, cleanup])
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

  // --- Debounce wrapper ---
  function debounce<T extends (...args: any[]) => void>(func: T, wait: number) {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  // Debounced version of seekTo
  const debouncedSeek = useRef(
    debounce((spotifyToken: string, ms: number) => seekTo(spotifyToken, ms), 600)
  ).current;


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

  // --- Main playback logic ---
  const startPlayback = async (spotifyToken: string) => {
    if (!isActiveRef.current) {
      console.log("⚠️ Component not active, skipping playback");
      return;
    }

    try {
      const trackUri = `spotify:track:${moment.id}`;
      const startMs = Math.floor(moment.songStart * 1000);
      const endMs = Math.floor((moment.songStart + moment.songDuration) * 1000);

      console.log(`🎵 Starting playback for ${moment.title}`);

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

          const startMs = Math.floor(moment.songStart * 1000);
          const endMs = Math.floor((moment.songStart + moment.songDuration) * 1000);

          if (pos > endMs || pos < startMs) {
            console.log(`🔁 Looping back to start`);
            restartAnimation()
            await seekTo(spotifyToken, startMs);
          }
        } catch (error) {
          console.error("Error in playback loop:", error);
        }
      }, 1000);
    } catch (error: any) {
      console.error("Playback error:", error);
      Alert.alert("Playback Error", error.message || "Failed to start playback.");
    }
  };



  // Slider positions in pixels
  const startX = useRef(new Animated.Value(0)).current;
  const endX = useRef(new Animated.Value(0)).current;

  // Slider positions as percentages (0-1)
  const [mStart, setStart] = useState(0);
  const [mEnd, setEnd] = useState(Math.min(MAX_DURATION_SECONDS / moment.length, 1));
  const [currentDuration, setCurrentDuration] = useState((mEnd - mStart) * moment.length);
  const startOffsetRef = useRef(0);
  const endOffsetRef = useRef(0);

    // Progress bar animation

  const { progress, pauseAnimation, restartAnimation } = useProgressAnimation(
    isPlaying,
    moment.songDuration * 1000,
    [moment.id, moment.songStart, moment.songDuration]
  );

  // Update start position4+
  startX.addListener(({ value }) => {
    updateStartPosition(value);
  });
  
  // Update end position
  endX.addListener(({ value }) => {
    updateEndPosition(value);
  });
  
  const updateStartPosition = (value: number) => {
  if (waveWidth > 0) {
    const newStart = Math.max(0, Math.min(value / waveWidth, 1));
    let finalStart = newStart;

    if (newStart >= mEnd) {
      finalStart = Math.max(0, mEnd - 0.01);
      setStart(finalStart);
    } else {
      setStart(finalStart);
    }

      setCurrentDuration((mEnd - newStart) * moment.length);
      moment.songStart = mStart * moment.length;
      moment.songDuration = currentDuration;
      return newStart;
    }

    return -1;

    
  };

const updateEndPosition = (value: number) => {
  if (waveWidth > 0) {
    const newEnd = Math.min(1, Math.max(value / waveWidth, 0));
    let finalEnd = newEnd;

    if (newEnd <= mStart) {
      finalEnd = Math.min(1, mStart + 0.01);
      setEnd(finalEnd);
    } else {
      setEnd(finalEnd);
    }

      setCurrentDuration((newEnd - mStart) * moment.length);
      moment.songDuration = currentDuration;
      return newEnd;
    }

    return -1;
  };

  // Handle waveform layout
  const onWaveLayout = (e: any) => {
    const w = e.nativeEvent.layout.width;
    setWaveWidth(w);
    startX.setValue(mStart * w);
    endX.setValue(mEnd * w);
  };

  // Pan responder for start slider
  const panStart = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        startX.setOffset(startX.__getValue());
        startX.setValue(0);
      },
      onPanResponderMove: (_, gesture) => {
        startX.setValue(gesture.dx);
      },
      onPanResponderRelease: () => {
        startX.flattenOffset();
        const newStart = updateStartPosition(startX.__getValue());
        if (token) debouncedSeek(token, newStart * moment.length * 1000);
        restartAnimation();
        setIsPlaying(true);
      },
    })
  ).current;

  // Pan responder for end slider
  const panEnd = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        endX.setOffset(endX.__getValue());
        endX.setValue(0);
      },
      onPanResponderMove: (_, gesture) => {
        endX.setValue(gesture.dx);
      },
      onPanResponderRelease: () => {
        endX.flattenOffset();
        const newEnd = updateEndPosition(endX.__getValue());
        if (token) debouncedSeek(token, mStart * moment.length * 1000);
        restartAnimation();
        setIsPlaying(true);
      },
    })
  ).current;


  // Sync Animated values with state
  useEffect(() => {
    if (waveWidth > 0) {
      Animated.timing(startX, {
        toValue: mStart * waveWidth,
        duration: 100,
        useNativeDriver: false,
      }).start();
    }
  }, [mStart, waveWidth]);

  useEffect(() => {
    if (waveWidth > 0) {
      Animated.timing(endX, {
        toValue: mEnd * waveWidth,
        duration: 100,
        useNativeDriver: false,
      }).start();
    }
  }, [mEnd, waveWidth]);

  // Handle select button
  const handleSelect = () => {
    if (!(currentDuration <= MAX_DURATION_SECONDS)) {
      Alert.alert('Duration Too Long', `Please select a moment that is ${MAX_DURATION_SECONDS} seconds or less.`);
      return;
    }
    
    // Update moment with new values
    moment.songStart = mStart * moment.length;
    moment.songDuration = (mEnd - mStart) * moment.length;
    scrollFunc(1);
  };

  const [barWidth, setBarWidth] = useState(0);
  const barFactor = 180 / currentDuration;
  console.log(barFactor);

  return (
    <View style={{ width, justifyContent: 'center', alignItems: 'center' }}>
      <SafeAreaView
        style={[StyleSheet.absoluteFill, { justifyContent: 'flex-start', alignItems: 'center', marginTop: 90, gap: 50 }]}
        edges={['top', 'left', 'right']}
      >

        {/* Title */}
        <View style={{ width: '80%'}}>
          <Text style={{ fontSize: 30, fontFamily: 'Luxurious Roman', fontWeight: 'bold', textAlign: 'center', color: '#333C42' }}>
            Pick Your Moment
          </Text>
        </View>

        {/* Content */}
        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ marginLeft: 10, marginTop: -20, marginBottom: 30 }}>
              <Text style={{ fontSize: 16, fontFamily: 'Jacques Francois', color: '#333C42' }}>
                {moment.title} - {moment.artist}
              </Text>
            </View>
            <View style={{ alignItems: 'center', width: '100%' }}>
              <Image
                source={moment.album}
                style={{ width: '70%', aspectRatio: 1, borderRadius: 10, borderWidth: 2 }}
              />
              <View style={{ width: 350, justifyContent: 'center', alignItems: 'center', marginTop: 30 }}>
                <View style={{ width: '100%', height: 8, borderRadius: 50, backgroundColor: '#333C42' }} />
                <View style={{ width: '100%', marginTop: 30 }} onLayout={onWaveLayout}>
                  <Waveform
                    data={moment.waveform}
                    height={25}
                    start={mStart}
                    end={mEnd}
                    baseColor="#333C42"
                    duration = {currentDuration}
                    anim={false}
                    selectedColor={(currentDuration <= MAX_DURATION_SECONDS) ? '#B7FFF7' : 'red'}
                  />
                  <View
                    style={{
                      position: 'absolute',
                      top: 0,
                      height: '100%',
                      width: '100%',
                      justifyContent: 'center',
                    }}
                  >
                    {/* Start Slider */}
                    <Animated.View
                      {...panStart.panHandlers}
                      style={{
                        position: 'absolute',
                        left: Animated.add(startX, new Animated.Value(-10)),
                        width: 20,
                        height: 60,
                        marginBottom: 30,
                        backgroundColor: '#8DD2CA',
                        borderRadius: 5,
                        borderWidth: 2,
                        borderColor: '#333C42',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <Feather name="chevrons-left" size={15} color="black" />
                    </Animated.View>

                    {/* End Slider */}
                    <Animated.View
                      {...panEnd.panHandlers}
                      style={{
                        position: 'absolute',
                        left: Animated.add(endX, new Animated.Value(-10)),
                        width: 20,
                        height: 60,
                        marginBottom: 30,
                        backgroundColor: '#8DD2CA',
                        borderRadius: 5,
                        borderWidth: 2,
                        borderColor: '#333C42',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <Feather name="chevrons-right" size={15} color="black" />
                    </Animated.View>
                  </View>
                </View>

                {/* Duration Display */}
                <View style={{ marginTop: 15 }}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontFamily: 'Jacques Francois',
                      color: (currentDuration <= MAX_DURATION_SECONDS) ? '#333C42' : 'red',
                      fontWeight: 'bold',
                    }}
                  >
                    Duration: {currentDuration.toFixed(1)}s {!(currentDuration <= MAX_DURATION_SECONDS) && '(Max 30s)'}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Progress Bar */}
        <View
          onLayout={(e) => setBarWidth(e.nativeEvent.layout.width)}
          style={{
            backgroundColor: '#E4D7CB',
            borderRadius: 50,
            borderWidth: 4,
            borderColor: '#333C42',
            alignItems: 'flex-start',
            justifyContent: 'center',
            width: '60%',
            height: 40,
            overflow: 'hidden',
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '90%',
              height: '80%',
              position: 'absolute',
              zIndex: 0,
              marginLeft: 12,
            }}
          >
            {Array.from({ length: 10 }).map((_, i) => (
              <View
                key={i}
                style={{
                  width: 4,
                  height: '50%',
                  borderRadius: 10,
                  backgroundColor: '#333C42',
                }}
              />
            ))}
          </View>

          <Animated.View
            style={{
              position: 'absolute',
              top: 4,
              bottom: 0,
              height: '75%',
              backgroundColor: '#39868F',
              width: 6,
              borderRadius: 80,
              transform: [
                {
                  translateX: progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-barFactor, barWidth + barFactor],
                  }),
                },
              ],
            }}
          />
        </View>

        {/* Select Button */}
        <TouchableOpacity
          style={{
            backgroundColor: ((currentDuration) <= MAX_DURATION_SECONDS) ? '#39868F' : '#999',
            borderRadius: 10,
            borderWidth: 4,
            borderColor: '#333C42',
            alignItems: 'center',
            marginTop: 10,
            width: '60%',
          }}
          onPress={handleSelect}
        >
          <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 30, marginVertical: 10, fontFamily: 'Jacques Francois' }}>
            Select
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}