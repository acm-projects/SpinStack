// // app/TestSpotify.tsx
// import React, { useEffect, useMemo, useRef, useState } from "react";
// import { View, Text, Button, Alert, StyleSheet, Image, Pressable } from "react-native";
// import * as Spotify from "@wwdrew/expo-spotify-sdk";
// import { router } from "expo-router";
// import Feather from "react-native-vector-icons/Feather";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { TextInput, FlatList,} from "react-native";
// import {moments} from '../../components/demoMoment'
// import { useMomentStore } from "../stores/useMomentStore";

// import BottomL from "../../assets/other/Bottom_L.svg";
// import TopL from "../../assets/other/Top_L.svg";
// import BottomM from "../../assets/other/Bottom_M.svg";
// import TopM from "../../assets/other/Top_M.svg";
// import BottomR from "../../assets/other/Bottom_R.svg";
// import MomentPick from "../createProcess/momentPick";
// import MomentSpecify from "../createProcess/momentSpecify";
// import MomentFinalize from "../createProcess/momentFinalize";
// import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
// import Ionicons from "@expo/vector-icons/Ionicons";
// import {
//   Animated,
//   useWindowDimensions,
// } from "react-native";
// import * as SecureStore from 'expo-secure-store';

// const TRACK_URI = "spotify:track:3NM41PVVUr0ceootKAtkAj"
// const API_BASE = "https://api.spotify.com/v1"

// type Device = {
//   id: string;
//   is_active: boolean;
//   name: string;
//   type: string;
//   is_restricted: boolean;
// };

// type PlaybackState = {
//   is_playing: boolean;
//   progress_ms: number;
//   item?: {
//     name: string;
//     duration_ms: number;
//     album: { images: { url: string }[] };
//     artists: { name: string }[];
//   } | null;
// };

// export default function TestSpotify() {
//   const [token, setToken] = useState<string | null>(null)
//   const [playback, setPlayback] = useState<PlaybackState | null>(null)
//   const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)

//   const title = playback?.item?.name ?? "";
//   const artist = useMemo(
//     () => playback?.item?.artists?.map((a) => a.name).join(", ") ?? "",
//     [playback?.item?.artists]
//   );
//   const albumArt = playback?.item?.album?.images?.[0]?.url ?? "";
//   const progressMs = playback?.progress_ms ?? 0;
//   const durationMs = playback?.item?.duration_ms ?? 0;

//   const SNIPPET_START_MS = 37000;
//   const SNIPPET_END_MS = 68000;

//   const authorize = async () => {
//     try {
//       const session = await Spotify.Authenticate.authenticateAsync({
//         scopes: [
//           "user-read-currently-playing",
//           "user-read-playback-state",
//           "user-modify-playback-state",
//           "app-remote-control",
//         ],
//       })

//       console.log("Got session:", session)
//       if (!session?.accessToken) throw new Error("No access token")
//       setToken(session.accessToken)
//       await SecureStore.setItemAsync('spotifyToken', session.accessToken);
//       Alert.alert("Spotify", "Authorized!")
//     } catch (e: any) {
//       Alert.alert("Auth error", String(e?.message ?? e));
//     }
//   };

//   const api = async (path: string, init?: RequestInit) => {
//     if (!token) throw new Error("No token");
//     const res = await fetch(`${API_BASE}${path}`, {
//       ...init,
//       headers: {
//         Accept: "application/json",
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//         ...(init?.headers || {}),
//       },
//     });
//     return res;
//   };

//   const getDevices = async (): Promise<Device[]> => {
//     const res = await api("/me/player/devices");
//     if (!res.ok) throw new Error(`devices: ${res.status}`);
//     const data = await res.json();
//     return data.devices as Device[];
//   };

//   const transferPlayback = async (deviceId: string) => {
//     await api("/me/player", {
//       method: "PUT",
//       body: JSON.stringify({ device_ids: [deviceId], play: true }),
//     });
//   };

//   const seekTo = async (ms: number) => {
//     if (!token) return;
//     await api(`/me/player/seek?position_ms=${ms}`, { method: "PUT" });
//   };

//   const startSnippetLoop = () => {
//     if (!token) return;
//     if (pollingRef.current) clearInterval(pollingRef.current);

//     pollingRef.current = setInterval(async () => {
//       try {
//         const res = await api("/me/player");
//         if (!res.ok) return;
//         const data = (await res.json()) as PlaybackState;
//         const pos = data.progress_ms ?? 0;

//         if (pos > SNIPPET_END_MS) {
//           await seekTo(SNIPPET_START_MS);
//         }

//         setPlayback(data);
//       } catch {
//         // ignore
//       }
//     }, 500);
//   };

//   const playOnActiveDevice = async () => {
//     if (!token) return Alert.alert("Spotify", "Please authorize first.");
//     try {
//       let res = await api("/me/player/play", {
//         method: "PUT",
//         body: JSON.stringify({ uris: [TRACK_URI] }),
//       });

//       if (res.status === 404 || res.status === 403 || res.status === 202) {
//         const devices = await getDevices();
//         const active = devices.find((d) => d.is_active && !d.is_restricted);
//         const iphone =
//           devices.find((d) => d.type === "Smartphone" && !d.is_restricted) ||
//           devices[0];
//         const target = active ?? iphone;
//         if (!target)
//           throw new Error("No available devices. Open Spotify once on your phone.");

//         await transferPlayback(target.id);
//         await new Promise((r) => setTimeout(r, 400));
//         res = await api(
//           `/me/player/play?device_id=${encodeURIComponent(target.id)}`,
//           {
//             method: "PUT",
//             body: JSON.stringify({ uris: [TRACK_URI] }),
//           }
//         );
//       }

//       if (!res.ok && res.status !== 204) {
//         const txt = await res.text();
//         throw new Error(`play error ${res.status}: ${txt}`);
//       }

//       await seekTo(SNIPPET_START_MS);
//       startSnippetLoop();
//       Alert.alert("Playback", "Looping 0:37 to 1:07!");
//     } catch (e: any) {
//       Alert.alert("Playback error", String(e?.message ?? e));
//     }
//   };

//   const fetchPlayback = async () => {
//     if (!token) return;
//     try {
//       const res = await api("/me/player");
//       if (res.status === 204) return;
//       if (!res.ok) return;
//       const data = (await res.json()) as PlaybackState;
//       setPlayback(data);
//     } catch {
//       // ignore
//     }
//   };

//   useEffect(() => {
//     if (!token) {
//       if (pollingRef.current) {
//         clearInterval(pollingRef.current);
//         pollingRef.current = null;
//       }
//       setPlayback(null);
//       return;
//     }
//     fetchPlayback();
//     pollingRef.current = setInterval(fetchPlayback, 1000);
//     return () => {
//       if (pollingRef.current) clearInterval(pollingRef.current);
//       pollingRef.current = null;
//     };
//   }, [token]);

//   const stopSnippet = async () => {
//     if (!token) return;
//     try {
//       await fetch("https://api.spotify.com/v1/me/player/pause", {
//         method: "PUT",
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//       });
//       Alert.alert("Snippet", "Playback paused.");
//     } catch (e: any) {
//       Alert.alert("Pause error", String(e?.message ?? e));
//     }
//   };

//   //should be if(hasSong == null) but sometihng changed in merge and hasSong doesn't exist so i changed it to always be true
//   if (true) {
//     return (
//       <SafeAreaView
//         style={{
//           display: "flex",
//           alignItems: "center",
//           flex: 1,
//           backgroundColor: '#FFF0E2'
//         }}
//       >
//         <Text style={{ color: "black", fontSize: 30, fontWeight: "500", fontFamily: 'luxurious roman'}}>
//           Create Your Moment
//         </Text>

//         <View style = {{width: '100%', flex: 1}}>
//           <SearchPage/>
//         </View>
        
//       </SafeAreaView>
//     );
//   }

//   return <View style={{ flex: 1, backgroundColor: "black" }} />;
// }

// function SearchPage() {
//   const [activeFilter, setActiveFilter] = useState("Songs");
//   const setSelectedMoment = useMomentStore((s) => s.setSelectedMoment);
//   const [search, setSearch] = useState("");

//   const filteredData = moments.filter(item => {
//       if (!search.trim()) return true;//show all if empty
//       const lowerQuery = search.toLowerCase();
//       return (
//           item.title.toLowerCase().includes(lowerQuery)
//       );
//   });

//   return (
//     <SafeAreaView style={styles2.container} edges = {['top']}>
//       {/* Search Bar */}
//       <View style={styles2.searchContainer}>
//         <TextInput
//           style={styles2.searchInput}
//           placeholder="Search..."
//           placeholderTextColor="#333c42"
//           value={search}
//           onChangeText={setSearch}
//         />
//       </View>

//       {/* Section Title */}
//       <Text style={styles2.sectionTitle}>Select a Song</Text>

//       {/* Song List */}
//       <FlatList
//         data={filteredData}
//         contentContainerStyle={{ backgroundColor: '#B7FFF7', borderRadius: 15, paddingVertical: 5 }}
//         keyExtractor={(item) => item.id}
//         renderItem={({ item, index }) => (
//           <Pressable onPress={() => {
//             setSelectedMoment(item); 
//             router.push({pathname: "/createProcess/momentProcess"})}}>
//             <View style={styles2.songRow}>
//             <Text style={styles2.rank}>{index + 1}</Text>
//             <View style={styles2.songInfo}>
//               <Text style={styles2.songTitle}>{item.title}</Text>
//               <Text style={styles2.songArtist}>{item.artist}</Text>
//             </View>
//             <Image source={item.album} style={styles2.albumArt} />
//           </View>
//           </Pressable>
//         )}
//         ListEmptyComponent={
//                         <View style={{ alignItems: 'center', marginTop: 20 }}>
//                         <Text style={{ fontSize: 16, color: '#333C42' }}>No moments found.</Text>
//                         </View>
//                     }
//       />
//     </SafeAreaView>
//   );
// }

// const styles2 = StyleSheet.create({
//   container: {
//     flex: 0.925,
//     backgroundColor: "#FFF0E2",
//     paddingHorizontal: 16,
//     paddingTop: 0,
//   },
//   searchContainer: {
//     backgroundColor: "#f9f2ebff",
//     borderRadius: 25,
//     paddingHorizontal: 15,
//     paddingVertical: 8,
//     borderWidth: 1
//   },
//   searchInput: {
//     color: "black",
//     fontFamily: 'luxurious roman',
//     fontSize: 16,
//   },
//   filterRow: {
//     flexDirection: "row",
//     justifyContent: "center",
//     marginTop: 0,
//   },
//   filterButton: {
//     paddingVertical: 6,
//     paddingHorizontal: 14,
//     borderRadius: 20,
//     marginHorizontal: 5,
//     backgroundColor: "#333c42",
//     borderColor: '#0BFFE3',
//     borderWidth: 2,
//   },
//   filterButtonActive: {
//     backgroundColor: "#0BFFE3",
//     borderColor: '#8DD2CA',
//     borderWidth: 2,
//   },
//   filterText: {
//     color: "#333c42",
//     fontSize: 14,
//   },
//   filterTextActive: {
//     color: "#333c42",
//   },
//   sectionTitle: {
//     fontSize: 16,
//     fontWeight: "600",
//     color: "#333c42",
//     marginTop: 15,
//     marginBottom: 15,
//     textAlign: "center",
//     fontFamily: 'luxurious roman',
//   },
//   songRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingVertical: 13,
//     paddingHorizontal: 15,
//     width: '100%',
//     borderRadius: 15
//   },
//   rank: {
//     color: "#333c42",
//     fontSize: 20,
//     fontFamily: 'luxurious roman',
//     width: 25,
//     textAlign: 'center'
//   },
//   songInfo: {
//     flex: 1,
//     marginLeft: 10,
//   },
//   songTitle: {
//     color: "#333c42",
//     fontFamily: 'jacques francois',
//     fontSize: 16,
//   },
//   songArtist: {
//     color: "#797979ff",
//     fontFamily: 'luxurious roman',
//     fontSize: 13,
//   },
//   albumArt: {
//     width: 40,
//     height: 40,
//     borderRadius: 5,
//   },
// });


