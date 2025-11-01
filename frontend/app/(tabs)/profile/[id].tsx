import React, { useEffect, useState, useCallback } from "react";
import {
    View,
    Text,
    Image,
    Pressable,
    StyleSheet,
    Dimensions,
    FlatList,
    ActivityIndicator,
    Modal,
    Alert,
} from "react-native";
import Feather from "react-native-vector-icons/Feather";
import { useRouter, useLocalSearchParams, RelativePathString } from "expo-router";
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from "@/constants/supabase";
import { useMomentInfoStore } from "../../stores/useMomentInfoStore";

const POLAROID_WIDTH = 150;
const POLAROID_HEIGHT = 200;
const POLAROID_URL = require("@/assets/images/polaroidFrame.webp");
const NGROK_URL = process.env.EXPO_PUBLIC_NGROK_URL;

interface Profile {
    id: string;
    username: string;
    bio: string;
    pfp_url: string | null;
}

interface ContentItem {
    id: string;
    cover_url: string;
    title: string;
    description: string;
    created_at: string;
    song_url?: string;
    start_time?: number;
    duration?: number;
}

export default function FriendProfile() {
    const router = useRouter();
    const { width } = Dimensions.get("window");
    const IMAGE_SIZE = width * 0.2;
    const setSelectedMomentInfo = useMomentInfoStore((s) => s.setSelectedMomentInfo);

    const { id, fromProfile, originId } = useLocalSearchParams<{ id: string; fromProfile?: string; originId?: string }>();
    const cameFromProfile = fromProfile === 'true';
    const originalProfileId = originId || (cameFromProfile ? 'main' : null);

    const [profile, setProfile] = useState<Profile | null>(null);
    const [moments, setMoments] = useState<ContentItem[]>([]);
    const [stacks, setStacks] = useState<ContentItem[]>([]);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [loadingMoments, setLoadingMoments] = useState(true);
    const [loadingStacks, setLoadingStacks] = useState(true);
    const [viewMode, setViewMode] = useState<"moments" | "stacks">("moments");

    const POLAROID_URL = require("@/assets/images/polaroidFrame.webp");


    const [friendsModalVisible, setFriendsModalVisible] = useState(false);
    const [friendsList, setFriendsList] = useState<Profile[]>([]);
    const [loadingFriends, setLoadingFriends] = useState(false);
    const [numFriends, setNumFriends] = useState(0);
    const [isFriend, setIsFriend] = useState(false);

    const nUrl = process.env.EXPO_PUBLIC_NGROK_URL;

    // Helper function to extract Spotify track ID
    const extractTrackId = (songUrl: string): string | null => {
        if (!songUrl) return null;
        const match = songUrl.match(/track\/([a-zA-Z0-9]+)/);
        return match ? match[1] : null;
    };

    const fetchProfilePictureUrl = async (pfpPath: string | null): Promise<string | null> => {
        if (!pfpPath) return null;

        try {
            const res = await fetch(`${NGROK_URL}/api/upload/download-url/${pfpPath}`);
            if (res.ok) {
                const { downloadURL } = await res.json();
                return downloadURL;
            }
        } catch (err) {
            console.error("Failed to fetch profile picture URL:", err);
        }
        return null;
    };

    const fetchProfile = async () => {
        if (!id) return;

        try {
            setLoadingProfile(true);
            const { data, error } = await supabase
                .from("users")
                .select("id, username, bio, pfp_url")
                .eq("id", id)
                .single();

            if (error) throw error;

            let pfp = null;
            if (data.pfp_url) {
                const res = await fetch(
                    `${nUrl}/api/upload/download-url/${data.pfp_url}`
                );
                if (res.ok) {
                    const { downloadURL } = await res.json();
                    pfp = downloadURL;
                }
            }

            setProfile({ ...data, pfp_url: pfp });
        } catch (err) {
            console.error("Failed to load profile", err);
        } finally {
            setLoadingProfile(false);
        }
    };

    const fetchMoments = async () => {
        if (!id) return;

        try {
            setLoadingMoments(true);
            const { data, error } = await supabase
                .from("moments")
                .select("id, cover_url, title, description, created_at, song_url, start_time, duration")
                .eq("user_id", id)
                .order("created_at", { ascending: false });

            if (error) throw error;
            setMoments(data || []);
        } catch (err) {
            console.error("Error fetching moments:", err);
        } finally {
            setLoadingMoments(false);
        }
    };

    const fetchStacks = async () => {
        if (!id) return;

        try {
            setLoadingStacks(true);
            const { data, error } = await supabase
                .from("stacks")
                .select("id, cover_url, title, description, created_at")
                .eq("user_id", id)
                .order("created_at", { ascending: false });

            if (error) throw error;
            setStacks(data || []);
        } catch (err) {
            console.error("Error fetching stacks:", err);
        } finally {
            setLoadingStacks(false);
        }
    };

    const fetchFriendsList = async () => {
        if (!id) return;

        try {
            setLoadingFriends(true);

            const { data: friendRows, error: friendError } = await supabase
                .from("friends")
                .select("user_id, friend_id")
                .or(`user_id.eq.${id},friend_id.eq.${id}`);

            if (friendError) throw friendError;

            const friendIds = friendRows
                ?.map(row => row.user_id === id ? row.friend_id : row.user_id)
                .filter(friendId => friendId !== id) || [];

            let friends: Profile[] = [];
            if (friendIds.length > 0) {
                const { data: userData, error: userError } = await supabase
                    .from("users")
                    .select("id, username, bio, pfp_url")
                    .in("id", friendIds);

                if (userError) throw userError;

                if (userData) {
                    friends = await Promise.all(
                        userData.map(async (user) => {
                            const pfp = await fetchProfilePictureUrl(user.pfp_url);
                            return { ...user, pfp_url: pfp };
                        })
                    );
                }
            }

            setFriendsList(friends);
            setNumFriends(friends.length);

            const { data: currentUserData } = await supabase.auth.getUser();
            const currentUserId = currentUserData?.user?.id;

            if (currentUserId && currentUserId !== id) {
                setIsFriend(friendIds.includes(currentUserId));
            } else if (currentUserId === id) {
                setIsFriend(true);
            }
        } catch (err) {
            console.error("Failed to fetch friends list", err);
        } finally {
            setLoadingFriends(false);
        }
    };

    const sendFriendRequest = async () => {
        try {
            const { data: sessionData } = await supabase.auth.getSession();
            const currentUser = sessionData?.session?.user;
            if (!currentUser) {
                Alert.alert("Error", "You must be logged in to send friend requests.");
                return;
            }

            // Prevent sending to self
            if (currentUser.id === id) {
                Alert.alert("Error", "You can't send a friend request to yourself!");
                return;
            }

            // Check for existing friend request
            const { data: existingRequests, error: existingError } = await supabase
                .from("notifications")
                .select("*")
                .eq("sender_id", currentUser.id)
                .eq("user_id", id) // ✅ FIXED
                .eq("type", "friend_request")
                .maybeSingle();

            if (existingError && existingError.code !== "PGRST116") throw existingError;
            if (existingRequests) {
                Alert.alert("Already Sent", "You’ve already sent a friend request.");
                return;
            }

            // Insert new friend request notification
            const { error } = await supabase.from("notifications").insert([
                {
                    sender_id: currentUser.id,
                    user_id: id, // ✅ FIXED
                    type: "friend_request",
                    content: `${profile?.username || "Someone"} sent you a friend request.`, // ✅ 'content' not 'message'
                },
            ]);

            if (error) throw error;

            Alert.alert("Friend request sent!");
        } catch (err) {
            console.error("Error sending friend request:", err);
            Alert.alert("Error", "Could not send friend request.");
        }
    };


    const addFriend = async () => {
        await sendFriendRequest();
    };

    // Remove friend functionality
    const removeFriend = async () => {
        try {
            const sessionData = await supabase.auth.getSession();
            const currentUser = sessionData?.data?.session?.user;
            const accessToken = sessionData?.data?.session?.access_token;

            if (!currentUser || !accessToken) return;

            // Ask for confirmation before removal
            Alert.alert(
                "Remove Friend",
                "Are you sure you want to remove this friend?",
                [
                    { text: "Cancel", style: "cancel" },
                    {
                        text: "Yes, Remove",
                        style: "destructive",
                        onPress: async () => {
                            const response = await fetch(`${nUrl}/api/friends`, {
                                method: "DELETE",
                                headers: {
                                    "Content-Type": "application/json",
                                    Authorization: `Bearer ${accessToken}`,
                                },
                                body: JSON.stringify({
                                    user_id: currentUser.id,
                                    friend_id: id,
                                }),
                            });

                            if (!response.ok) {
                                const errorData = await response.json();
                                console.error("Failed to remove friend:", errorData);
                                Alert.alert("Error", "Could not remove friend.");
                                return;
                            }

                            Alert.alert("Friend removed");
                            setIsFriend(false);
                            fetchFriendsList();
                        },
                    },
                ]
            );
        } catch (err) {
            console.error("Error removing friend:", err);
        }
    };


    const handleBackPress = () => {
        if (originalProfileId === 'main') {
            router.push('/profile');
        } else if (originalProfileId) {
            router.push(`/profile/${originalProfileId}` as RelativePathString);
        } else {
            if (router.canGoBack()) {
                router.back();
            } else {
                router.push('/');
            }
        }
    };

    const handleFriendPress = (friendId: string) => {
        setFriendsModalVisible(false);
        const origin = originalProfileId || id;
        router.push({
            pathname: `/profile/${friendId}` as RelativePathString,
            params: { originId: origin }
        });
    };

    const handleMomentPress = (moment: ContentItem) => {
        const trackId = extractTrackId(moment.song_url || '');

        setSelectedMomentInfo({
            moment: {
                id: moment.id,           // DB moment ID stays here
                spotifyId: trackId || null, // Spotify track ID separately
                title: moment.title,
                artist: moment.description || "Unknown Artist",
                songStart: moment.start_time || 0,
                songDuration: moment.duration || 30,
                length: 180,
                album: moment.cover_url
                    ? { uri: moment.cover_url }
                    : require("@/assets/images/album1.jpeg"),
                waveform: Array(50).fill(0).map(() => Math.floor(Math.random() * 25)),
            },
            user: {
                name: profile?.username || "Unknown User",
                profilePic: profile?.pfp_url,
            },
            type: "moment",
        });

        router.push('/stack' as RelativePathString);
    };

    useEffect(() => {
        fetchProfile();
        fetchMoments();
        fetchStacks();
    }, [id]);

    useFocusEffect(
        useCallback(() => {
            if (id) {
                fetchFriendsList();
            }
        }, [id])
    );

    if (loadingProfile || !profile) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#333C42" />
            </View>
        );
    }

    const { username, bio, pfp_url } = profile;

    const renderMoment = ({ item }: { item: ContentItem }) => (
        <Pressable
            style={{ flex: 1, margin: 6, alignItems: "center" }}
            onPress={() => handleMomentPress(item)}
        >
            <Image
                source={{ uri: item.cover_url }}
                style={{
                    width: Dimensions.get("window").width / 2 - 24,
                    height: Dimensions.get("window").width / 2 - 24,
                    borderRadius: 20,
                    backgroundColor: "#eaeaea",
                }}
                resizeMode="cover"
            />
            <View style={{ width: Dimensions.get("window").width / 2 - 24, marginTop: 6 }}>
                <Text style={{ fontFamily: "Jacques Francois", fontSize: 15, color: "#333C42" }} numberOfLines={1}>
                    {item.title}
                </Text>
                <Text style={{ fontFamily: "Jacques Francois", fontSize: 13, color: "#555" }} numberOfLines={1}>
                    {item.description}
                </Text>
            </View>
        </Pressable>
    );

    const renderStack = ({ item }: { item: ContentItem }) => (
        <View style={styles.momentContainer}>
            <Image
                source={{ uri: item.cover_url }}
                style={styles.coverImage}
                resizeMode="cover"
            />
            <Image
                source={POLAROID_URL}
                style={{
                    width: POLAROID_WIDTH * 1,
                    height: POLAROID_HEIGHT * 1.5,
                    position: "absolute",
                    resizeMode: "contain",
                }}
            />
            <View style={[styles.textOnTop, { bottom: 10 }]}>
                <Text style={styles.titleText} numberOfLines={1}>
                    {item.title}
                </Text>
                <Text style={styles.captionText} numberOfLines={1}>
                    {item.description}
                </Text>
            </View>
        </View>
    );

    const renderFriend = ({ item }: { item: Profile }) => (
        <Pressable
            style={styles.friendRow}
            onPress={() => handleFriendPress(item.id)}
        >
            <Image
                source={item.pfp_url ? { uri: item.pfp_url } : require("@/assets/images/profile.png")}
                style={styles.friendAvatar}
            />
            <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.friendName}>{item.username}</Text>
                <Text style={styles.friendBio} numberOfLines={1}>
                    "{String(item.bio || "No bio")}"
                </Text>
            </View>
        </Pressable>
    );

    return (
        <View style={styles.container}>
            <View style={{ flexDirection: "row", alignItems: "center", marginTop: 5, paddingHorizontal: 20 }}>
                <Pressable onPress={handleBackPress}>
                    <Feather name="arrow-left" size={28} color="#333C42" />
                </Pressable>
                <Image
                    source={pfp_url ? { uri: pfp_url } : require("@/assets/images/profile.png")}
                    style={{
                        width: IMAGE_SIZE,
                        height: IMAGE_SIZE,
                        borderRadius: IMAGE_SIZE / 2,
                        marginHorizontal: 10,
                    }}
                />
                <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 10 }}>
                    <Text style={{ fontSize: 20, fontFamily: "Jacques Francois", color: "#333C42", fontWeight: "500" }}
                        numberOfLines={1} ellipsizeMode="tail">
                        {username}
                    </Text>
                    <Text style={{ fontSize: 14, fontFamily: "Jacques Francois", color: "#333C42", textAlign: "center", }}
                        numberOfLines={2} ellipsizeMode="tail">
                        "{bio || 'loading...'}"
                    </Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                    <Pressable onPress={() => setFriendsModalVisible(true)}>
                        <Text style={{
                            fontSize: 14,
                            color: "#333C42",
                            textDecorationLine: "underline",
                            fontFamily: "Luxurious Roman",
                            marginBottom: 8,
                        }}>
                            {numFriends} Friends
                        </Text>
                    </Pressable>
                    <Pressable
                        onPress={isFriend ? removeFriend : addFriend}
                        style={{
                            backgroundColor: isFriend ? "#B85C5C" : "#39868F",
                            paddingVertical: 4,
                            paddingHorizontal: 8,
                            borderRadius: 8,
                            marginTop: 4,
                            maxWidth: 90,
                            alignItems: "center",
                        }}
                    >
                        <Text
                            style={{
                                color: "#FFF0E2",
                                fontFamily: "Jacques Francois",
                                textAlign: "center",
                                flexWrap: "wrap",
                                fontSize: 13,
                            }}
                            numberOfLines={2}
                        >
                            {isFriend ? "Remove\nFriend" : "Add\nFriend"}
                        </Text>
                    </Pressable>


                </View>
            </View>

            <View style={styles.content}>
                <View style={{ flexDirection: "row", alignItems: "center", paddingTop: 8, width: "100%", justifyContent: "space-between", paddingHorizontal: 20 }}>
                    <View style={{ width: 28 }}></View>
                    <Text style={{ fontSize: 24, color: "#333C42", fontWeight: "500", fontFamily: "Jacques Francois", flex: 1, textAlign: "center" }}>
                        {viewMode === "moments" ? "Moments" : "Stacks"}
                    </Text>
                    <Pressable onPress={() => setViewMode(prev => (prev === "moments" ? "stacks" : "moments"))}>
                        <Feather name="filter" size={28} color="#333C42" />
                    </Pressable>
                </View>

                <View style={{ flex: 1, width: "100%", paddingHorizontal: 15, paddingTop: 10 }}>
                    <View style={{ display: viewMode === "moments" ? "flex" : "none", flex: 1 }}>
                        {loadingMoments ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="large" color="#333C42" />
                            </View>
                        ) : moments.length === 0 ? (
                            <View style={styles.loadingContainer}>
                                <Text style={{ color: "#333C42", fontFamily: "Jacques Francois" }}>No moments yet 😢</Text>
                            </View>
                        ) : (
                            <FlatList
                                data={moments}
                                numColumns={2}
                                showsVerticalScrollIndicator={false}
                                keyExtractor={(item) => item.id.toString()}
                                contentContainerStyle={{ paddingBottom: 100 }}
                                renderItem={renderMoment}
                            />
                        )}
                    </View>

                    <View style={{ display: viewMode === "stacks" ? "flex" : "none", flex: 1 }}>
                        {loadingStacks ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="large" color="#333C42" />
                            </View>
                        ) : stacks.length === 0 ? (
                            <View style={styles.loadingContainer}>
                                <Text style={{ color: "#333C42", fontFamily: "Jacques Francois" }}>No stacks yet 😢</Text>
                            </View>
                        ) : (
                            <FlatList
                                data={stacks}
                                numColumns={2}
                                showsVerticalScrollIndicator={false}
                                keyExtractor={(item) => item.id.toString()}
                                contentContainerStyle={{ paddingBottom: 100 }}
                                renderItem={renderStack}
                            />
                        )}
                    </View>
                </View>
            </View>

            <Modal
                visible={friendsModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setFriendsModalVisible(false)}
            >
                <View style={styles.modalBackdrop}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Friends</Text>
                            <Pressable onPress={() => setFriendsModalVisible(false)}>
                                <Feather name="x" size={26} color="#333C42" />
                            </Pressable>
                        </View>

                        {loadingFriends ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="large" color="#333C42" />
                            </View>
                        ) : friendsList.length === 0 ? (
                            <View style={styles.loadingContainer}>
                                <Text style={{ color: "#333C42", fontFamily: "Jacques Francois" }}>No friends yet 😢</Text>
                            </View>
                        ) : (
                            <FlatList
                                data={friendsList}
                                keyExtractor={(item) => item.id.toString()}
                                showsVerticalScrollIndicator={false}
                                renderItem={renderFriend}
                            />
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 75,
        justifyContent: "flex-start",
        alignItems: "center",
        backgroundColor: "#FFF0E2",
    },
    centered: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    content: {
        flex: 1,
        marginTop: 20,
        borderRadius: 10,
        width: "97%",
        backgroundColor: "#8DD2CA",
        alignItems: "center",
    },
    momentContainer: {
        width: POLAROID_WIDTH,
        height: POLAROID_HEIGHT,
        position: "relative",
        margin: 10,
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
    },
    coverImage: {
        width: "88%",
        height: "88%",
    },
    textOnTop: {
        position: "absolute",
        width: "90%",
        alignItems: "center",
    },
    titleText: {
        color: "#030303ff",
        fontWeight: "700",
        fontSize: 14,
        textAlign: "center",
        fontFamily: "Jacques Francois",
    },
    captionText: {
        color: "#333C42",
        fontSize: 12,
        textAlign: "center",
        fontFamily: "Jacques Francois",
    },
    loadingContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    modalBackdrop: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContainer: {
        width: "85%",
        height: "60%",
        backgroundColor: "#FFF0E2",
        borderRadius: 20,
        padding: 20,
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 5,
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
    },
    modalTitle: {
        fontSize: 22,
        fontFamily: "Luxurious Roman",
        color: "#333C42",
    },
    friendRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
    },
    friendAvatar: {
        width: 45,
        height: 45,
        borderRadius: 22.5,
    },
    friendName: {
        fontSize: 16,
        color: "#333C42",
        fontFamily: "Jacques Francois",
    },
    friendBio: {
        fontSize: 12,
        color: "#555",
        fontFamily: "Jacques Francois",
    },
});