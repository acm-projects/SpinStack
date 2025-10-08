import React, { useEffect, useRef, useState } from "react";
import { FlatList, Dimensions, View, ViewToken, NativeSyntheticEvent, NativeScrollEvent } from "react-native";
import MomentView from "./moment";
import {demoMoments} from "./demoMoment"; 
import * as Spotify from "@wwdrew/expo-spotify-sdk";
import * as SecureStore from 'expo-secure-store';

export default function StackView({ moments = demoMoments }: { moments?: typeof demoMoments }) {
  const width = Dimensions.get("window").width;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [token, setToken] = useState<string | null>(null);


  useEffect(() => {
    const fetchToken = async () => {
      const storedToken = await SecureStore.getItemAsync('spotifyToken');
      setToken(storedToken);
    };
    fetchToken();
  }, []);
  const onMomentumScrollEnd = async (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    const newIndex = Math.round(x / width);
    if(newIndex != currentIndex){ {
      let res = await spotifyApi(`me/player/play`, {
        method: 'PUT',
        body: JSON.stringify({
          uris: [`spotify:track:${moments[newIndex].moment.id}`],
          position_ms: moments[newIndex].moment.songStart * 1000
        }),
      });
      if(res.status === 204){
        console.log("Playback started");
      } else {
        console.log("Failed to start playback", res.status);
      }
    }
      setCurrentIndex(newIndex);
    }
    console.log("Current index:", newIndex);
  };
  const spotifyApi = async (path: string, init?: RequestInit) => {
    if(!token) throw new Error("No token")
    const res = await fetch(`https://api.spotify.com/v1/${path}`, {
      ...init,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(init?.headers || {}),
      },
    });
    return res;
  }
  return (
    <FlatList
      data={moments}
      keyExtractor={(_, index) => index.toString()}
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      renderItem={({ item }) => (
        <View style={{ width, flex: 1 }}>
          <MomentView data={item} />
        </View>
      )}
      onMomentumScrollEnd={onMomentumScrollEnd}
    />
  );
}
