import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
  Animated,
  Easing,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "@/constants/supabase";
import { useSelectedUsersStore } from "../stores/selectedUsersStore";

const nUrl = process.env.EXPO_PUBLIC_NGROK_URL;
const { width, height } = Dimensions.get("window");

export default function GroupCreationPage() {
  const router = useRouter();
  const selectedUsers = useSelectedUsersStore((state) => state.selectedUsers);
  const clearSelectedUsers = useSelectedUsersStore((state) => state.clearSelectedUsers);
  const [groupName, setGroupName] = useState("");
  const [dailyPrompt, setDailyPrompt] = useState("");
  const [loading, setLoading] = useState(false);

  // Create bubble animation refs
  const bubbleCount = 15;
  const bubbles = Array.from({ length: bubbleCount }).map(() => ({
    anim: useRef(new Animated.Value(height)).current,
    left: Math.random() * width,
    size: Math.random() * 12 + 8,
    delay: Math.random() * 4000,
  }));

  useEffect(() => {
    bubbles.forEach((bubble) => {
      const animateBubble = () => {
        bubble.anim.setValue(height + bubble.size);
        Animated.timing(bubble.anim, {
          toValue: -bubble.size,
          duration: 6000 + Math.random() * 4000,
          delay: bubble.delay,
          easing: Easing.linear,
          useNativeDriver: true,
        }).start(() => animateBubble());
      };
      animateBubble();
    });
  }, []);

  if (!selectedUsers) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No selected users</Text>
      </View>
    );
  }

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      Alert.alert("Error", "Please enter a group name");
      return;
    }

    if (!dailyPrompt.trim()) {
      Alert.alert("Error", "Please enter a daily prompt");
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

      const max_members = selectedUsers.length + 1;
      const member_ids = selectedUsers.map((user) => user.id);

      // Create the group
      const groupRes = await fetch(`${nUrl}/api/groups`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: groupName,
          max_members,
          member_ids,
        }),
      });

      const dailyResult = await dailyRes.json();

      if (!res.ok) {
        throw new Error(result.error || "Failed to create group");
      }

      clearSelectedUsers();

      Alert.alert("Success", `Group "${result.group.name}" created successfully!`, [
        {
          text: "OK",
          onPress: () => {
            router.dismissAll();
            router.replace("/(tabs)/dGroup");
          },
        },
      ]);
    } catch (err: any) {
      console.error("Create group error:", err);
      Alert.alert("Error", err.message || "Failed to create group");
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        {/* Bubbles in background */}
        {bubbles.map((bubble, index) => (
          <Animated.View
            key={index}
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

        <Text style={styles.title}>Create a New Group</Text>

        <TextInput
          style={styles.input}
          placeholder="Group Name"
          placeholderTextColor="#333C42"
          value={groupName}
          onChangeText={setGroupName}
        />

        <TextInput
          style={[styles.input, styles.promptInput]}
          placeholder="First Daily Prompt (e.g., 'A song that makes you feel nostalgic')"
          placeholderTextColor="#333C42"
          value={dailyPrompt}
          onChangeText={setDailyPrompt}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />

        <Text style={styles.selectedUsersTitle}>
          Selected Users ({selectedUsers.length}):
        </Text>
        <View style={styles.tagContainer}>
          {selectedUsers.map((user) => (
            <View key={user.id} style={styles.tag}>
              <Text style={styles.tagText}>@{user.username}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.createButton, loading && styles.createButtonDisabled]}
          onPress={handleCreateGroup}
          disabled={loading}
        >
          <Text style={styles.createButtonText}>{loading ? "Creating..." : "Create Group"}</Text>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF0E2",
    width: "100%",
    paddingHorizontal: 18,
    paddingTop: 70,
    justifyContent: "flex-start",
    overflow: "hidden", // Important to keep bubbles within screen
  },
  bubble: {
    position: "absolute",
    backgroundColor: "#a3d9ff",
    borderRadius: 50,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 20,
    color: "#333C42",
    fontFamily: "Lato",
  },
  input: {
    borderWidth: 1.5,
    borderColor: "#333C42",
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 8,
    fontSize: 16,
    color: "#333C42",
    marginBottom: 20,
    fontFamily: "Lato",
    backgroundColor: "#FFF0E2",
  },
  promptInput: {
    minHeight: 80,
    paddingTop: 12,
    borderRadius: 15,
  },
  selectedUsersTitle: {
    fontSize: 16,
    marginBottom: 8,
    color: "#b18430ff",
    fontFamily: "Lato",
  },
  tagContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 30,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#333C42",
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginRight: 6,
    marginBottom: 6,
  },
  tagText: {
    color: "#FFF0E2",
    fontSize: 14,
    fontFamily: "Lato",
  },
  createButton: {
    backgroundColor: "#333C42",
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#333C42",
    alignItems: "center",
    paddingVertical: 4,
    width: "60%",
    alignSelf: "center",
  },
  createButtonDisabled: {
    opacity: 0.6,
  },
  createButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
    paddingVertical: 6,
    fontFamily: "Lato",
  },
  errorText: {
    color: "#333C42",
    fontSize: 18,
    fontFamily: "Lato",
    textAlign: "center",
  },
});
