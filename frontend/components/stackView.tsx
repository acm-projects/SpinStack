import React, { useEffect, useRef, useState } from "react";
import { FlatList, Dimensions, View, ViewToken, NativeSyntheticEvent, NativeScrollEvent } from "react-native";
import MomentView from "./newMoment";
import {demoMoments} from "./demoMoment";
import { demoMoment } from "./demoMoment";
import * as SecureStore from 'expo-secure-store';

type Device = {
  id: string
  is_active: boolean
  name: string
  type: string
  is_restricted: boolean
}

type PlaybackState = {
  is_playing: boolean
  progress_ms: number // current position
  item?: {
    name: string // title
    duration_ms: number
    album: { images: { url: string }[] }
    artists: { name: string }[]
  } | null
}

export default function StackView({ moments = demoMoments }: { moments?: typeof demoMoments }) {
  const width = Dimensions.get("window").width;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [token, setToken] = useState<string | null>(null);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

  const spotifyApi = async (path: string, init?: RequestInit) => {
    console.log("Making Spotify API call to:", path);
    console.log(token)
    if(!token) throw new Error("No token")
    let res = await fetch(`https://api.spotify.com/v1${path}`, {
      ...init,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(init?.headers || {}),
      },
    });
    // if (res.status === 404 || res.status === 403 || res.status === 202) {
    //     const devices = await getDevices()
    //     console.log("Available devices:", devices);
    //     const active = devices.find((d) => d.is_active && !d.is_restricted)
    //     const iphone =
    //       devices.find((d) => d.type === "Smartphone" && !d.is_restricted) ||
    //       devices[0]
    //     const target = active ?? iphone
    //     if (!target)
    //       throw new Error(
    //         "No available devices. Open Spotify once on your phone."
    //       )

    //     await transferPlayback(target.id)
    //     await new Promise((r) => setTimeout(r, 400))
        
    //     res = await spotifyApi(
    //       `/me/player/play?device_id=${encodeURIComponent(target.id)}`,
    //       {
    //         method: "PUT",
    //        body: JSON.stringify({
    //         uris: [`spotify:track:${moments[currentIndex].moment.id}`],
    //         position_ms: moments[currentIndex].moment.songStart * 1000
    //        }),
    //       }
    //     )
    //   }

      if (!res.ok && res.status !== 204) {
        const txt = await res.text()
        throw new Error(`play error ${res.status}: ${txt}`)
      }
    return res;
  }
  
  useEffect(() => {
    if(token != null && moments.length > 0){ 
      const playMoment = async () => {
        let res = await spotifyApi(`/me/player/play`, {
        method: 'PUT',
        body: JSON.stringify({
          uris: [`spotify:track:${moments[currentIndex].moment.id}`],
          position_ms: moments[currentIndex].moment.songStart * 1000
        }),
      });
      if(res.status === 204){
        console.log("Playback started");
      } else {
        console.log(res);
        console.log(token);
        console.log("Failed to start playback", res.status);
      }
      setIntervalId(setInterval(async () => {
        if (!token) {
          return;
        }
        await spotifyApi(`/me/player/seek?position_ms=${moments[currentIndex].moment.songStart * 1000}`, {method: 'PUT'})
      }, moments[currentIndex].moment.songDuration * 1000));
    }
      playMoment();
    } 
  }, [currentIndex, token]);

  useEffect(() => {
    const fetchToken = async () => {
      const storedToken = await SecureStore.getItemAsync('spotifyToken');
      console.log("WE ARE FETCHING STORED TOKEN:", storedToken);
      setToken(storedToken);
    };
    fetchToken();
  }, []);
  const onMomentumScrollEnd = async (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    const newIndex = Math.round(x / width);
    if(newIndex != currentIndex){ 
      if(intervalId) {
        clearInterval(intervalId);
        setIntervalId(null);
      }
      setCurrentIndex(newIndex);
    }
    console.log("Current index:", newIndex);
  };
  
  const getDevices = async (): Promise<Device[]> => {
    const res = await spotifyApi("/me/player/devices")
    if (!res.ok) throw new Error(`devices: ${res.status}`)
    const data = await res.json()
    return data.devices as Device[]
  }

  const transferPlayback = async (deviceId: string) => {
    await spotifyApi("/me/player", {
      method: "PUT",
      body: JSON.stringify({ device_ids: [deviceId], play: true }),
    })
  }

  return (
    <FlatList
      data={demoMoments}
      keyExtractor={(_, index) => index.toString()}
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      onMomentumScrollEnd={onMomentumScrollEnd}
      renderItem={({ item }) => (
        <View style={{ width, flex: 1 }}>
          <MomentView data = {item}/>
        </View>
      )}
    />
  );
}
