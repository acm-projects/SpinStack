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
}

export default function FriendProfile() {
    const router = useRouter();
    const { width } = Dimensions.get("window");
    const IMAGE_SIZE = width * 0.2;

    const { id, fromProfile, originId } = useLocalSearchParams<{ id: string; fromProfile?: string; originId?: string }>();
    const cameFromProfile = fromProfile === 'true';
    // Track the original profile we started from
    const originalProfileId = originId || (cameFromProfile ? 'main' : null);

    const [profile, setProfile] = useState<Profile | null>(null);
    const [moments, setMoments] = useState<ContentItem[]>([]);
    const [stacks, setStacks] = useState<ContentItem[]>([]);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [loadingMoments, setLoadingMoments] = useState(true);
    const [loadingStacks, setLoadingStacks] = useState(true);
    const [viewMode, setViewMode] = useState<"moments" | "stacks">("moments");

    const [friendsModalVisible, setFriendsModalVisible] = useState(false);
    const [friendsList, setFriendsList] = useState<Profile[]>([]);
    const [loadingFriends, setLoadingFriends] = useState(false);
    const [numFriends, setNumFriends] = useState(0);
    const [isFriend, setIsFriend] = useState(false);

    const nUrl = process.env.EXPO_PUBLIC_NGROK_URL;

    // Helper function to fetch profile picture URL
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

    // Fetch profile data
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

            const pfp = await fetchProfilePictureUrl(data.pfp_url);
            setProfile({ ...data, pfp_url: pfp });
        } catch (err) {
            console.error("Failed to load profile", err);
        } finally {
            setLoadingProfile(false);
        }
    };

    // Fetch moments
    const fetchMoments = async () => {
        if (!id) return;

        try {
            setLoadingMoments(true);
            const { data, error } = await supabase
                .from("moments")
                .select("id, cover_url, title, description, created_at")
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

    // Fetch stacks
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

    // Fetch friends list with profile pictures
    const fetchFriendsList = async () => {
        if (!id) return;

        try {
            setLoadingFriends(true);

            // Get friendships in both directions
            const { data: friendRows, error: friendError } = await supabase
                .from("friends")
                .select("user_id, friend_id")
                .or(`user_id.eq.${id},friend_id.eq.${id}`);

            if (friendError) throw friendError;

            // Extract friend IDs (excluding the viewed profile's own ID)
            const friendIds = friendRows
                ?.map(row => row.user_id === id ? row.friend_id : row.user_id)
                .filter(friendId => friendId !== id) || [];

            // Fetch user info for friend IDs
            let friends: Profile[] = [];
            if (friendIds.length > 0) {
                const { data: userData, error: userError } = await supabase
                    .from("users")
                    .select("id, username, bio, pfp_url")
                    .in("id", friendIds);

                if (userError) throw userError;

                // Fetch download URLs for profile pictures
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

            // Check if current user is already friends with this profile
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

    // Add friend functionality
    const addFriend = async () => {
        try {
            const sessionData = await supabase.auth.getSession();
            const currentUser = sessionData?.data?.session?.user;
            const accessToken = sessionData?.data?.session?.access_token;

            if (!currentUser || !accessToken) return;

            const response = await fetch(`${nUrl}/api/friends`, {
                method: "POST",
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
                console.error("Failed to add friend:", errorData);
                return;
            }

            Alert.alert("Friend added!");
            setIsFriend(true);
            fetchFriendsList();
        } catch (err) {
            console.error("Error adding friend:", err);
        }
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


    // Handle back button navigation
    const handleBackPress = () => {
        if (originalProfileId === 'main') {
            // Go back to user's own profile
            router.push('/profile');
        } else if (originalProfileId) {
            // Go back to the original friend profile we started from
            router.push(`/profile/${originalProfileId}` as RelativePathString);
        } else {
            // Default behavior - try to go back or go home
            if (router.canGoBack()) {
                router.back();
            } else {
                router.push('/');
            }
        }
    };

    // Handle friend profile navigation
    const handleFriendPress = (friendId: string) => {
        setFriendsModalVisible(false);
        // Pass along the origin so we can navigate back properly
        const origin = originalProfileId || id;
        router.push({
            pathname: `/profile/${friendId}` as RelativePathString,
            params: { originId: origin }
        });
    };

    // Initial data fetch
    useEffect(() => {
        fetchProfile();
        fetchMoments();
        fetchStacks();
    }, [id]);

    // Refetch friends list when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            if (id) {
                fetchFriendsList();
            }
        }, [id])
    );

    // Render loading state
    if (loadingProfile || !profile) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#333C42" />
            </View>
        );
    }

    const { username, bio, pfp_url } = profile;

    // Render moment item
    const renderMoment = ({ item }: { item: ContentItem }) => (
        <View style={{ flex: 1, margin: 6, alignItems: "center" }}>
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
        </View>
    );

    // Render stack item
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

    // Render friend item
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
            {/* Profile Row */}
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
                            maxWidth: 90, // Limit width
                            alignItems: "center", // Center text
                        }}
                    >
                        <Text
                            style={{
                                color: "#FFF0E2",
                                fontFamily: "Jacques Francois",
                                textAlign: "center",
                                flexWrap: "wrap", // Allow wrapping
                                fontSize: 13,
                            }}
                            numberOfLines={2}
                        >
                            {isFriend ? "Remove\nFriend" : "Add Friend"}
                        </Text>
                    </Pressable>


                </View>
            </View>

            {/* Content Section */}
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

                {/* Main Feed */}
                <View style={{ flex: 1, width: "100%", paddingHorizontal: 15, paddingTop: 10 }}>
                    {/* Moments */}
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

                    {/* Stacks */}
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

            {/* Friends Modal */}
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