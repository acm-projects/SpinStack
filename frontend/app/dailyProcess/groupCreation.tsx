import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "@/constants/supabase";
import { useSelectedUsersStore } from "../stores/selectedUsersStore";

export default function GroupCreationPage() {
  const router = useRouter();
  const selectedUsers = useSelectedUsersStore((state) => state.selectedUsers);
  const [groupName, setGroupName] = useState("");
  const [loading, setLoading] = useState(false);
  if(!selectedUsers) return (
    <View>
        <Text>No selected users</Text>
    </View>
  );

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

      const max_members = selectedUsers.length + 1; // including current user

      const res = await fetch(`${process.env.EXPO_PUBLIC_NGROK_URL}/api/groups`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: groupName,
          max_members,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Failed to create group");
      }

      Alert.alert("Success", `Group "${result.group.name}" created successfully!`);
      router.dismissAll();
      router.push("../groups");
    } catch (err: any) {
      console.error(err);
      Alert.alert("Error", err.message || "Failed to create group");
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <Text style={styles.title}>Create a New Group</Text>

        <TextInput
          style={styles.input}
          placeholder="Group Name"
          placeholderTextColor="#333C42"
          value={groupName}
          onChangeText={setGroupName}
        />

        <Text style={styles.selectedUsersTitle}>Selected Users ({selectedUsers.length}):</Text>
        <View style={styles.tagContainer}>
          {selectedUsers.map((user) => (
            <View key={user.id} style={styles.tag}>
              <Text style={styles.tagText}>@{user.username}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreateGroup}
          disabled={loading}
        >
          <Text style={styles.createButtonText}>
            {loading ? "Creating..." : "Create Group"}
          </Text>
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
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333C42",
    fontFamily: "Jacques Francois",
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
    fontFamily: "Jacques Francois",
  },
  selectedUsersTitle: {
    fontSize: 16,
    marginBottom: 8,
    color: "#39868F",
    fontFamily: "Jacques Francois",
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
    fontFamily: "Jacques Francois",
  },
  createButton: {
    backgroundColor: "#39868F",
    borderRadius: 10,
    borderWidth: 4,
    borderColor: "#333C42",
    alignItems: "center",
    paddingVertical: 12,
    width: "60%",
    alignSelf: "center",
  },
  createButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 20,
    fontFamily: "Jacques Francois",
  },
});
