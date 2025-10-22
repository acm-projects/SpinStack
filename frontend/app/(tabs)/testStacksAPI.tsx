"use client";

import { useEffect, useState } from "react";
import { supabase } from '@/constants/supabase';
import { Button, ScrollView, View, Text, StyleSheet, Keyboard, TextInput, TouchableWithoutFeedback, Alert } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useAuth } from '../../_context/AuthContext';


export default function TestStacksApiScreen() {
    const nUrl = process.env.EXPO_PUBLIC_NGROK_URL;
    
    const [title, setTitle] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [coverURL, setCoverURL] = useState<string>("");
    const [visibility, setVisibility] = useState<any>(true);
    const [firstMomentId, setFirstMomentId] = useState<string>("");
    
    const [stackId, setStackId] = useState<string>("");
    const [momentId, setMomentId] = useState<string>("");
    
    const [loading, setLoading] = useState(false);
    const { session, user } = useAuth();

    const handleCreateStack = async () => {
        if (!title || !firstMomentId) {
            Alert.alert("Error", "Title and First Moment ID are required");
            return;
        }

        try {
            const { data: sessionData } = await supabase.auth.getSession();
            const token = sessionData?.session?.access_token;

            if (!token) {
                return Alert.alert("Error", "You are not signed in");
            }

            setLoading(true);

            const boolVisibility = visibility === true || visibility === "true" || visibility === "True";

            const response = await fetch(nUrl + "/api/stacks", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    title,
                    description,
                    cover_url: coverURL,
                    visibility: boolVisibility,
                    firstMomentId
                }),
            });

            const resp = await response.json();

            if (!response.ok) {
                Alert.alert("Error", resp.error || "Something went wrong");
                console.log("Backend error:", resp);
                return;
            }

            Alert.alert("Success", "Stack created successfully!");
            console.log("Created stack:", resp);
        } catch (err) {
            console.error(err);
            Alert.alert("Error", "Failed to create stack");
        } finally {
            setLoading(false);
        }
    };

    const handleAddMomentToStack = async () => {
        if (!stackId || !momentId) {
            Alert.alert("Error", "Stack ID and Moment ID are required");
            return;
        }

        try {
            const { data: sessionData } = await supabase.auth.getSession();
            const token = sessionData?.session?.access_token;

            if (!token) return Alert.alert("Error", "You are not signed in");

            setLoading(true);

            const response = await fetch(nUrl + `/api/stacks/${stackId}/moments`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    momentId
                }),
            });

            const resp = await response.json();

            if (!response.ok) {
                Alert.alert("Error", resp.error || "Something went wrong");
                console.log("Backend error:", resp);
                return;
            }

            Alert.alert("Success", `Moment added at position ${resp.position}!`);
            console.log("Response:", resp);
        } catch (err) {
            console.error(err);
            Alert.alert("Error", "Failed to add moment to stack");
        } finally {
            setLoading(false);
        }
    };

    const handleGetStacks = async () => {
        try {
            const { data: sessionData } = await supabase.auth.getSession();
            const token = sessionData?.session?.access_token;

            if (!token) return Alert.alert("Error", "You are not signed in");

            setLoading(true);

            const response = await fetch(nUrl + "/api/stacks", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const resp = await response.json();

            if (!response.ok) {
                Alert.alert("Error", resp.error || "Something went wrong");
                return;
            }

            console.log("User's stacks:", resp);
            Alert.alert("Success", "Fetched stacks, check console");
        } catch (err) {
            console.error(err);
            Alert.alert("Error", "Failed to fetch stacks");
        } finally {
            setLoading(false);
        }
    };

    const handleGetStackById = async () => {
        if (!stackId) return Alert.alert("Error", "Please provide a Stack ID");

        try {
            const { data: sessionData } = await supabase.auth.getSession();
            const token = sessionData?.session?.access_token;

            if (!token) return Alert.alert("Error", "You are not signed in");

            setLoading(true);

            const response = await fetch(nUrl + `/api/stacks/${stackId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const resp = await response.json();

            if (!response.ok) {
                Alert.alert("Error", resp.error || "Something went wrong");
                return;
            }

            console.log("Stack with moments:", resp);
            Alert.alert("Success", "Fetched stack, check console");
        } catch (err) {
            console.error(err);
            Alert.alert("Error", "Failed to fetch stack");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStack = async () => {
        if (!stackId) return Alert.alert("Error", "Please provide a Stack ID");

        try {
            const { data: sessionData } = await supabase.auth.getSession();
            const token = sessionData?.session?.access_token;

            if (!token) return Alert.alert("Error", "You are not signed in");

            setLoading(true);

            const boolVisibility = visibility === true || visibility === "true" || visibility === "True";

            const response = await fetch(nUrl + `/api/stacks/${stackId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    title,
                    description,
                    cover_url: coverURL,
                    visibility: boolVisibility,
                }),
            });

            const resp = await response.json();

            if (!response.ok) {
                Alert.alert("Error", resp.error || "Something went wrong");
                return;
            }

            Alert.alert("Success", "Stack updated successfully!");
            console.log("Updated stack:", resp);
        } catch (err) {
            console.error(err);
            Alert.alert("Error", "Failed to update stack");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteStack = async () => {
        if (!stackId) return Alert.alert("Error", "Please provide a Stack ID");

        try {
            const { data: sessionData } = await supabase.auth.getSession();
            const token = sessionData?.session?.access_token;

            if (!token) return Alert.alert("Error", "You are not signed in");

            setLoading(true);

            const response = await fetch(nUrl + `/api/stacks/${stackId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const resp = await response.json();

            if (!response.ok) {
                Alert.alert("Error", resp.error || "Something went wrong");
                return;
            }

            Alert.alert("Success", "Stack deleted successfully!");
            console.log("Deleted stack:", resp);
        } catch (err) {
            console.error(err);
            Alert.alert("Error", "Failed to delete stack");
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAwareScrollView>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.container}>
                    <Text style={styles.titleText}>Stack API Testing</Text>
                    <Text style={styles.baseText}>
                        Dummy Test for Stacks
                    </Text>

                    <Text style={styles.sectionTitle}>Create New Stack</Text>
                    <TextInput
                        style={[styles.input, { color: "white" }]}
                        placeholderTextColor="#D2D4C8"
                        placeholder="Enter stack title*"
                        value={title}
                        onChangeText={setTitle}
                    />
                    <TextInput
                        style={[styles.input, { color: "white" }]}
                        placeholderTextColor="#D2D4C8"
                        placeholder="Enter description"
                        value={description}
                        onChangeText={setDescription}
                    />
                    <TextInput
                        style={[styles.input, { color: "white" }]}
                        placeholderTextColor="#D2D4C8"
                        placeholder="Enter cover URL"
                        value={coverURL}
                        onChangeText={setCoverURL}
                    />
                    <TextInput
                        style={[styles.input, { color: "white" }]}
                        placeholderTextColor="#D2D4C8"
                        placeholder="Visibility (true/false)"
                        value={visibility}
                        onChangeText={setVisibility}
                    />
                    <TextInput
                        style={[styles.input, { color: "white" }]}
                        placeholderTextColor="#D2D4C8"
                        placeholder="First moment ID* (required)"
                        value={firstMomentId}
                        onChangeText={setFirstMomentId}
                    />
                    <Button
                        color="#0BFFE3"
                        title={loading ? "Loading..." : "CREATE Stack"}
                        onPress={handleCreateStack}
                        disabled={loading}
                    />

                    <Text style={styles.sectionTitle}>Add Moment to Stack</Text>
                    <TextInput
                        style={[styles.input, { color: "white" }]}
                        placeholderTextColor="#D2D4C8"
                        placeholder="Stack ID"
                        value={stackId}
                        onChangeText={setStackId}
                    />
                    <TextInput
                        style={[styles.input, { color: "white" }]}
                        placeholderTextColor="#D2D4C8"
                        placeholder="Moment ID to add"
                        value={momentId}
                        onChangeText={setMomentId}
                    />
                    <Button
                        color="#0BFFE3"
                        title={loading ? "Loading..." : "ADD Moment to Stack"}
                        onPress={handleAddMomentToStack}
                        disabled={loading}
                    />

                    <Text style={styles.sectionTitle}>Manage Stacks</Text>
                    <Button
                        color="#FCFFFD"
                        title={loading ? "Loading..." : "GET All My Stacks"}
                        onPress={handleGetStacks}
                        disabled={loading}
                    />
                    <Button
                        color="#FCFFFD"
                        title={loading ? "Loading..." : "GET Stack by ID"}
                        onPress={handleGetStackById}
                        disabled={loading}
                    />
                    <Button
                        color="#FCFFFD"
                        title={loading ? "Loading..." : "UPDATE Stack"}
                        onPress={handleUpdateStack}
                        disabled={loading}
                    />
                    <Button
                        color="#FF6B6B"
                        title={loading ? "Loading..." : "DELETE Stack"}
                        onPress={handleDeleteStack}
                        disabled={loading}
                    />
                </View>
            </TouchableWithoutFeedback>
        </KeyboardAwareScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    baseText: {
        fontFamily: "Inter",
        color: "white",
        padding: 10,
        textAlign: "center",
    },
    titleText: {
        fontSize: 40,
        fontFamily: "Inter",
        fontWeight: "bold",
        color: "#C0FDFB",
        padding: 20,
    },
    sectionTitle: {
        fontSize: 24,
        fontFamily: "Inter",
        fontWeight: "600",
        color: "#0BFFE3",
        marginTop: 20,
        marginBottom: 10,
    },
    input: {
        width: "100%",
        borderWidth: 1,
        borderColor: "gray",
        padding: 10,
        marginBottom: 10,
        borderRadius: 5,
    },
});