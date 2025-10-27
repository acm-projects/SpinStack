import React, { useEffect, useState } from "react";
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
} from "react-native";
import Feather from "react-native-vector-icons/Feather";
import { useRouter, useLocalSearchParams, RelativePathString } from "expo-router";
import { supabase } from "@/constants/supabase";

const POLAROID_WIDTH = 150;
const POLAROID_HEIGHT = 200;

export default function FriendProfile() {
    const router = useRouter();
    const { width } = Dimensions.get("window");
    const IMAGE_SIZE = width * 0.2;

    const [profile, setProfile] = useState<any>(null);
    const [moments, setMoments] = useState<any[]>([]);
    const [stacks, setStacks] = useState<any[]>([]);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [loadingMoments, setLoadingMoments] = useState(true);
    const [loadingStacks, setLoadingStacks] = useState(true);
    const [viewMode, setViewMode] = useState<"moments" | "stacks">("moments");
    const { id, fromProfile } = useLocalSearchParams<{ id: string; fromProfile?: string }>();
    const cameFromProfile = fromProfile === 'true'; // convert back to boolean


    const POLAROID_URL = require("@/assets/images/polaroidFrame.webp");


    const [friendsModalVisible, setFriendsModalVisible] = useState(false);
    const [friendsList, setFriendsList] = useState<any[]>([]);
    const [loadingFriends, setLoadingFriends] = useState(false);
    const [numFriends, setNumFriends] = useState(0);

    useEffect(() => {
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
                        `https://cayson-mouthiest-kieran.ngrok-free.dev/api/upload/download-url/${data.pfp_url}`
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

        fetchProfile();
    }, [id]);

    useEffect(() => {
        if (!id) return;

        const fetchMoments = async () => {
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

        fetchMoments();
    }, [id]);

    useEffect(() => {
        if (!id) return;

        const fetchStacks = async () => {
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

        fetchStacks();
    }, [id]);

    const fetchFriendsList = async () => {
        if (!id) return;
        try {
            setLoadingFriends(true);
            const { data, error } = await supabase
                .from("friends")
                .select("friend_id(id, username, bio, pfp_url)")
                .eq("user_id", id);
            if (error) throw error;

            const friends = data?.map((f: any) => f.friend_id) || [];
            setFriendsList(friends);
            setNumFriends(friends.length);
        } catch (err) {
            console.error("Failed to fetch friends list", err);
        } finally {
            setLoadingFriends(false);
        }
    };

    if (loadingProfile || !profile) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#333C42" />
            </View>
        );
    }

    const { username, bio, pfp_url } = profile;

    return (
        <View style={styles.container}>
            {/* Profile Row */}
            <View style={{ flexDirection: "row", alignItems: "center", marginTop: 5, paddingHorizontal: 20 }}>
                <Pressable onPress={() => {
                    if (cameFromProfile) {
                        router.push('/profile'); // main user profile
                    } else {
                        router.back();
                    }
                }}>
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
                    <Pressable
                        onPress={async () => {
                            await fetchFriendsList();
                            setFriendsModalVisible(true);
                        }}
                    >
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
                                renderItem={({ item }) => (
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
                                )}
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
                                renderItem={({ item }) => (
                                    <View style={styles.momentContainer}>
                                        <Image
                                            source={{ uri: item.cover_url }}
                                            style={styles.coverImage}
                                            resizeMode="cover"
                                        />
                                        <Image
                                            source={POLAROID_URL} // same polaroid overlay as main profile
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
                                )}
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
                                renderItem={({ item }) => (
                                    <Pressable
                                        style={styles.friendRow}
                                        onPress={() => {
                                            setFriendsModalVisible(false);
                                            router.push(`/profile/${item.id}` as RelativePathString);
                                        }}
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
                                )}
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
