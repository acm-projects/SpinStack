
"use client";

import { useEffect, useState } from "react";
import { supabase } from '@/constants/supabase';
import { Button, ScrollView, View, Text, StyleSheet, Keyboard, TextInput, TouchableWithoutFeedback, Alert } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useAuth } from '../../_context/AuthContext';



export default function TestApiScreen() {

    const nUrl = process.env.EXPO_PUBLIC_NGROK_URL;
    const [title, setTitle] = useState<any>("");
    const [songURL, setSongURL] = useState<any>("");
    const [startTime, setStartTime] = useState<any>("");
    const [duration, setDuration] = useState<any>("");
    const [coverURL, setCoverURL] = useState<any>("");
    const [visibility, setVisibility] = useState<any>(true);
    const [description, setDesc] = useState<any>("");
    const [momentID, setMomentID] = useState<any>("");
    const [userID, setUserID] = useState<any>("");
    const [loading, setLoading] = useState(false); // disable button while waiting
    const { session, user } = useAuth();

    // Frontend CRUD functions for moments
    const handleCreateMoment = async () => {
        if (!title || !songURL || !startTime || !duration) {
            Alert.alert("Error", "Please fill in all required fields: title, song URL, start time, duration");
            return; // stop further execution
        }

        try {
            const { data: sessionData } = await supabase.auth.getSession();
            const token = sessionData?.session?.access_token;

            if (!token) {
                return Alert.alert("Error", "You are not signed in");
            }

            setLoading(true);

            const boolVisibility = visibility === true || visibility === "true" || visibility === "True";

            const response = await fetch(nUrl + "/api/moments", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    title,
                    song_url: songURL,
                    start_time: startTime,
                    duration,
                    cover_url: coverURL,
                    visibility: boolVisibility,
                    description
                }),
            });

            const resp = await response.json();

            if (!response.ok) {
                Alert.alert("Error", resp.error || "Something went wrong");
                console.log("Backend error:", resp);
                return;
            }

            Alert.alert("Success", "Moment created successfully!");
            console.log("Response data:", resp);
        } catch (err) {
            console.error(err);
            Alert.alert("Error", "Failed to make request");
        } finally {
            setLoading(false);
        }
    };

    type GetMomentsOptions = {
        momentId?: string;
        userId?: string;
    };

    const handleGetMoments = async (options?: GetMomentsOptions) => {
        try {
            setLoading(true);

            let url = nUrl + "/api/moments";

            if (options?.momentId) {
                url += `/moment/${options.momentId}`;
            } else if (options?.userId) {
                url += `/moment/user/${options.userId}`;
            }
            // else → leave url as /api/moments for "all moments"

            const response = await fetch(url);
            const resp = await response.json();

            if (!response.ok) {
                Alert.alert("Error", resp.error || "Something went wrong");
                console.log("Backend error:", resp);
                return;
            }

            console.log("Fetched moments:", resp);
            Alert.alert("Success", "Fetched moments, check console");
        } catch (err) {
            console.error(err);
            Alert.alert("Error", "Failed to fetch moments");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateMoment = async (id: string) => {
        if (!id) return Alert.alert("Error", "Please provide a Moment ID to update");

        try {
            const { data: sessionData } = await supabase.auth.getSession();
            const token = sessionData?.session?.access_token;

            if (!token) return Alert.alert("Error", "You are not signed in");

            setLoading(true);

            const boolVisibility = visibility === true || visibility === "true" || visibility === "True";

            const response = await fetch(nUrl + `/api/moments/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    title,
                    song_url: songURL,
                    start_time: startTime,
                    duration,
                    cover_url: coverURL,
                    visibility: boolVisibility,
                    description
                }),
            });

            const resp = await response.json();

            if (!response.ok) {
                Alert.alert("Error", resp.error || "Something went wrong");
                console.log("Backend error:", resp);
                return;
            }

            Alert.alert("Success", "Moment updated successfully!");
            console.log("Updated moment:", resp);
        } catch (err) {
            console.error(err);
            Alert.alert("Error", "Failed to update moment");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteMoment = async (id: string) => {
        if (!id) return Alert.alert("Error", "Please provide a Moment ID to delete");

        try {
            const { data: sessionData } = await supabase.auth.getSession();
            const token = sessionData?.session?.access_token;

            if (!token) return Alert.alert("Error", "You are not signed in");

            setLoading(true);

            const response = await fetch(nUrl + `/api/moments/moment/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const resp = await response.json();

            if (!response.ok) {
                Alert.alert("Error", resp.error || "Something went wrong");
                console.log("Backend error:", resp);
                return;
            }

            Alert.alert("Success", "Moment deleted successfully!");
            console.log("Deleted moment:", resp);
        } catch (err) {
            console.error(err);
            Alert.alert("Error", "Failed to delete moment");
        } finally {
            setLoading(false);
        }
    };





    return (
        <KeyboardAwareScrollView>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.container}>

                    <Text style={styles.titleText}>SpinStack</Text>
                    <Text style={styles.baseText}>
                        Dummy API Test Page (moments)
                    </Text>
                    <TextInput
                        style={[styles.input, { color: "white" }]}
                        placeholderTextColor="#D2D4C8"
                        placeholder="Enter title"
                        value={title}
                        onChangeText={setTitle}
                    />
                    <TextInput
                        style={[styles.input, { color: "white" }]}
                        placeholderTextColor="#D2D4C8"
                        placeholder="Enter song URL"
                        value={songURL}
                        onChangeText={setSongURL}
                    />
                    <TextInput
                        style={[styles.input, { color: "white" }]}
                        placeholderTextColor="#D2D4C8"
                        placeholder="Enter start time (ex: 30)"
                        value={startTime}
                        onChangeText={setStartTime}
                    />
                    <TextInput
                        style={[styles.input, { color: "white" }]}
                        placeholderTextColor="#D2D4C8"
                        placeholder="Enter duration in seconds (ex: 20)"
                        value={duration}
                        onChangeText={setDuration}
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
                        placeholder="Enter visibility (true/false)"
                        value={visibility}
                        onChangeText={setVisibility}
                    />
                    <TextInput
                        style={[styles.input, { color: "white" }]}
                        placeholderTextColor="#D2D4C8"
                        placeholder="Enter description"
                        value={description}
                        onChangeText={setDesc}
                    />
                    <TextInput
                        style={[styles.input, { color: "white" }]}
                        placeholderTextColor="#D2D4C8"
                        placeholder="Enter moment ID (if needed)"
                        value={momentID}
                        onChangeText={setMomentID}
                    />
                    <TextInput
                        style={[styles.input, { color: "white" }]}
                        placeholderTextColor="#D2D4C8"
                        placeholder="Enter user ID (if needed)"
                        value={userID}
                        onChangeText={setUserID}
                    />

                    <Button
                        color="#FCFFFD"
                        title={loading ? "Loading..." : "POST Moment"}
                        onPress={handleCreateMoment}
                        disabled={loading}
                    />
                    <Button
                        color="#FCFFFD"
                        title={loading ? "Loading..." : "GET moment(s)"}
                        onPress={() => {
                            if (momentID) {
                                handleGetMoments({ momentId: momentID });
                            } else if (userID) {
                                handleGetMoments({ userId: userID });
                            } else {
                                handleGetMoments(); // fetch all moments
                            }
                        }}
                        disabled={loading}
                    />
                    <Button
                        color="#FCFFFD"
                        title={loading ? "Loading..." : "UPDATE moment"}
                        onPress={() => handleUpdateMoment(momentID)} // <-- pass the ID here
                        disabled={loading} />
                    <Button
                        color="#FCFFFD"
                        title={loading ? "Loading..." : "DELETE moment"}
                        onPress={() => handleDeleteMoment(momentID)} // pass the moment ID
                        disabled={loading} />
                </View>
            </TouchableWithoutFeedback>
        </KeyboardAwareScrollView >
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
    },
    titleText: {
        fontSize: 50,
        fontFamily: "Inter",
        fontWeight: "bold",
        color: "#C0FDFB",
        padding: 20,
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