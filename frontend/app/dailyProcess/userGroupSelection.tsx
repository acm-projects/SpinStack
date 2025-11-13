import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  Keyboard,
  Pressable,
  Image,
  FlatList,
  StyleSheet,
  TouchableWithoutFeedback,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Animated,
  Easing,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,   // ← added
} from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "@/constants/supabase";
import { useSelectedUsersStore } from "../stores/selectedUsersStore";
import { useAuth } from "@/_context/AuthContext";
import Bubble from '@/assets/other/bubble.svg';
import Feather from 'react-native-vector-icons/Feather';

const background = require("../../assets/images/groupBackground.png"); // ← added

const nUrl = process.env.EXPO_PUBLIC_NGROK_URL;
const { width, height } = Dimensions.get("window");

type SearchType = "Stacks" | "Users";

interface Stack {
  id: string;
  title: string;
  description: string;
  cover_url: string;
  visibility: boolean;
  created_at: string;
  user_id: string;
  users?: {
    username: string;
    pfp_url: string;
  };
}

interface User {
  id: string;
  username: string;
  email: string;
  pfp_url: string;
  bio: string;
  first_name: string;
  last_name: string;
}

export default function SearchGroupPage() {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const selectedUsers = useSelectedUsersStore((s) => s.selectedUsers) || [];
  const setSelectedUsersStore = useSelectedUsersStore((s) => s.setUsersSelected);
  const clearSelectedUsers = useSelectedUsersStore((s) => s.clearSelectedUsers);

  const [activeFilter, setActiveFilter] = useState<SearchType>("Users");
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<{ stacks?: Stack[]; users?: User[] }>({});
  const [loading, setLoading] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  const [groupName, setGroupName] = useState("");

  const bubbleCount = 25;
  const bubbles = useRef(
    Array.from({ length: bubbleCount }).map(() => ({
      anim: new Animated.Value(Math.random() * height),
      left: Math.random() * width,
      size: Math.random() * 12 + 8,
      delay: Math.random() * 4000,
      speed: 6000 + Math.random() * 4000,
    }))
  ).current;

  useEffect(() => {
    bubbles.forEach((bubble) => {
      const animateBubble = () => {
        bubble.anim.setValue(height + bubble.size);
        Animated.timing(bubble.anim, {
          toValue: -bubble.size,
          duration: bubble.speed,
          delay: bubble.delay,
          easing: Easing.linear,
          useNativeDriver: true,
        }).start(() => animateBubble());
      };
      animateBubble();
    });
  }, []);

  const handleSelectUser = (user: User) => {
    if (!selectedUsers.find((u) => u.id === user.id)) {
      const newSelection = [...selectedUsers, user];
      setSelectedUsersStore(newSelection);
    }
  };

  const handleRemoveUser = (id: string) => {
    const newSelection = selectedUsers.filter((u) => u.id !== id);
    setSelectedUsersStore(newSelection);
  };

  const handleSearch = async () => {
    if (!search.trim()) return;

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      if (!token) {
        Alert.alert("Error", "You are not signed in");
        return;
      }

      setLoading(true);

      if (activeFilter === "Stacks") {
        const { data: stacks, error } = await supabase
          .from("stacks")
          .select("*, users(username, pfp_url)")
          .eq("visibility", true)
          .ilike("title", `%${search}%`)
          .limit(20);

        if (error) throw error;

        setResults({ stacks: stacks || [] });
      } else {
        const { data: users, error } = await supabase
          .from("users")
          .select("*")
          .or(
            `username.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%`
          )
          .neq("id", currentUser?.id || "")
          .limit(20);

        if (error) throw error;

        const usersWithPfp = await Promise.all(
          (users || []).map(async (user) => {
            let pfp = null;
            if (user.pfp_url) {
              try {
                const res = await fetch(`${nUrl}/api/upload/download-url/${user.pfp_url}`);
                if (res.ok) {
                  const { downloadURL } = await res.json();
                  pfp = downloadURL;
                }
              } catch {}
            }
            return { ...user, pfp_url: pfp };
          })
        );

        setResults({ users: usersWithPfp });
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to search");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchTimeout) clearTimeout(searchTimeout);
    if (!search.trim()) {
      setResults({});
      return;
    }

    const timeout = setTimeout(() => handleSearch(), 500);
    setSearchTimeout(timeout);

    return () => clearTimeout(timeout);
  }, [search, activeFilter]);

  const getCurrentResults = () =>
    activeFilter === "Stacks" ? results.stacks || [] : results.users || [];

  const showSearchResults = search.trim() && getCurrentResults().length > 0;

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      Alert.alert("Error", "Please enter a group name");
      return;
    }
    if (selectedUsers.length === 0) {
      Alert.alert("Error", "Select at least one user to create a group with");
      return;
    }

    try {
      setLoading(true);

      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      if (!token) {
        Alert.alert("Error", "You must be signed in to create a group");
        return;
      }

      const res = await fetch(`${nUrl}/api/groups`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: groupName,
          max_members: selectedUsers.length + 1,
          member_ids: selectedUsers.map((u) => u.id),
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to create group");

      clearSelectedUsers();

      Alert.alert("Success", `Group "${result.group.name}" created successfully!`, [
        { text: "OK", onPress: () => { router.dismissAll(); router.replace("/(tabs)/dGroup"); } },
      ]);
    } catch (err: any) {
      console.error(err);
      Alert.alert("Error", err.message || "Failed to create group");
    } finally {
      setLoading(false);
    }
  };

  const renderUser = ({ item, index }: { item: User; index: number }) => {
    const displayName = item.first_name && item.last_name ? `${item.first_name} ${item.last_name}` : item.username;
    return (
      <Pressable style={styles.row} onPress={() => handleSelectUser(item)}>
        <View style={styles.info}>
          <Text style={styles.titleText}>{displayName}</Text>
          <Text style={styles.subtitleText}>@{item.username}</Text>
          {item.bio && <Text style={styles.stackDesc}>{item.bio}</Text>}
        </View>
        {item.pfp_url ? (
          <Image source={{ uri: item.pfp_url }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.placeholder]}>
            <Text style={styles.placeholderText}>{item.username.charAt(0).toUpperCase()}</Text>
          </View>
        )}
      </Pressable>
    );
  };

  const backScaleAnim = useRef(new Animated.Value(1)).current;
  const handleBackPress = () => {
    Animated.sequence([
      Animated.timing(backScaleAnim, { toValue: 0.9, duration: 100, useNativeDriver: true }),
      Animated.spring(backScaleAnim, { toValue: 1, friction: 3, tension: 80, useNativeDriver: true }),
    ]).start(() => router.back());
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >

        {/* 🌄 Background wrapper */}
        <ImageBackground source={background} style={{ flex: 1 }}>

          <View style={[styles.container, { backgroundColor: "transparent" }]}>
            
            {/* Background bubbles */}
            {bubbles.map((bubble, i) => (
              <Animated.View
                key={i}
                style={[
                  styles.bubble,
                  {
                    width: bubble.size,
                    height: bubble.size,
                    left: bubble.left,
                    transform: [{ translateY: bubble.anim }],
                    opacity: 0.4 + Math.random() * 0.6,
                  },
                ]}
              />
            ))}

            {/* Header with back button */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 40 }}>
              <Pressable onPress={handleBackPress} style={{ position: 'absolute', left: 0 }}>
                <Animated.View style={{ transform: [{ scale: backScaleAnim }] }}>
                  <View style={{ width: 50, height: 50 }}>
                    <Bubble width={50} height={50} />
                    <Feather
                      name="arrow-left"
                      size={24}
                      color="black"
                      style={{ position: 'absolute', top: 12, left: 12 }}
                    />
                  </View>
                </Animated.View>
              </Pressable>
              <Text style={{ fontSize: 35, fontWeight: '800', color: '#333C42', fontFamily: 'Lato' }}>
                Groups
              </Text>
            </View>

            <View style={styles.searchContainer}>
              {selectedUsers.length > 0 && (
                <View style={styles.tagContainer}>
                  {selectedUsers.map((user) => (
                    <Pressable key={user.id} style={styles.tag} onPress={() => handleRemoveUser(user.id)}>
                      {user.pfp_url ? (
                        <Image source={{ uri: user.pfp_url }} style={styles.tagPfp} />
                      ) : (
                        <View style={[styles.tagPfp, styles.tagPlaceholder]}>
                          <Text style={styles.tagPlaceholderText}>{user.username.charAt(0).toUpperCase()}</Text>
                        </View>
                      )}
                      <Text style={styles.tagText}>@{user.username}</Text>
                      <Text style={styles.tagRemove}>✕</Text>
                    </Pressable>
                  ))}
                </View>
              )}
              <TextInput
                style={styles.searchInput}
                placeholder="Search users..."
                placeholderTextColor="#333C42"
                value={search}
                onChangeText={setSearch}
                returnKeyType="search"
              />
            </View>

            {loading ? (
              <ActivityIndicator size="large" color="#39868F" style={{ marginTop: 40 }} />
            ) : showSearchResults ? (
              <FlatList
                data={getCurrentResults()}
                keyExtractor={(item) => item.id}
                renderItem={renderUser}
                contentContainerStyle={styles.listContainer}
              />
            ) : null}

            <View style={{ paddingVertical: 10 }}>
              <TextInput
                style={styles.groupInput}
                placeholder="Group Name"
                placeholderTextColor="#333C42"
                value={groupName}
                onChangeText={setGroupName}
              />
              <TouchableOpacity style={styles.createButton} onPress={handleCreateGroup} disabled={loading}>
                <Text style={styles.createButtonText}>{loading ? "Creating..." : "Create Group"}</Text>
              </TouchableOpacity>
            </View>

          </View>

        </ImageBackground>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF0E2", paddingHorizontal: 18, paddingTop: 70,  },
  bubble: { position: "absolute", backgroundColor: "#a3d9ff", borderRadius: 50 },
  searchContainer: { backgroundColor: "#8DD2CA", borderRadius: 25, paddingHorizontal: 15, paddingVertical: 8, borderWidth: 1, borderColor: "#333C42", marginBottom: 15 },
  searchInput: { color: "#333C42", fontSize: 16, fontFamily: "Lato" },
  listContainer: { backgroundColor: "#8DD2CA", borderRadius: 15, paddingVertical: 8, borderWidth: 1.5, borderColor: "#333C42", marginTop: 15 },
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 12, paddingHorizontal: 15 },
  rank: { color: "#333C42", fontSize: 20, width: 25, textAlign: "center", fontFamily: "Lato" },
  info: { flex: 1, marginLeft: 10 },
  titleText: { color: "#333C42", fontSize: 18, fontFamily: "Lato" },
  subtitleText: { color: "#39868F", fontSize: 13, fontFamily: "Lato" },
  stackDesc: { color: "#39868F", fontSize: 11, fontFamily: "Lato", marginTop: 2 },
  avatar: { width: 45, height: 45, borderRadius: 22.5, borderWidth: 1, borderColor: "#333C42" },
  placeholder: { backgroundColor: "#39868F", justifyContent: "center", alignItems: "center" },
  placeholderText: { color: "#FFF0E2", fontSize: 18, fontWeight: "600" },
  tagContainer: { flexDirection: "row", flexWrap: "wrap", marginBottom: 8 },
  tag: { flexDirection: "row", alignItems: "center", backgroundColor: "#333C42", borderRadius: 20, paddingVertical: 4, paddingHorizontal: 8, marginRight: 6, marginBottom: 6 },
  tagPfp: { width: 20, height: 20, borderRadius: 10, marginRight: 6, borderWidth: 1, borderColor: "#FFF0E2" },
  tagPlaceholder: { backgroundColor: "#39868F", justifyContent: "center", alignItems: "center" },
  tagPlaceholderText: { color: "#FFF0E2", fontSize: 12, fontWeight: "bold" },
  tagText: { color: "#FFF0E2", fontSize: 14, fontFamily: "Lato" },
  tagRemove: { color: "#FFF0E2", fontSize: 14, marginLeft: 4, fontWeight: "bold",  },
  groupInput: { borderWidth: 1.5, borderColor: "#333C42", borderRadius: 25, paddingHorizontal: 15, paddingVertical: 8, fontSize: 16, color: "#333C42", marginBottom: 25, fontFamily: "Lato", backgroundColor: "#FFF0E2", overflow: "hidden", },
  createButton: { backgroundColor: "#333C42", borderRadius: 10, borderWidth: 2, borderColor: "#333C42", alignItems: "center", paddingVertical: 6, width: "60%", alignSelf: "center" },
  createButtonText: { color: "white", fontWeight: "bold", fontSize: 18, fontFamily: "Lato" },
});
