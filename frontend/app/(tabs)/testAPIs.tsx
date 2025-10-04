
"use client";

import { useEffect, useState } from "react";
import { supabase } from '@/constants/supabase';
import { Button, ScrollView, View, Text, StyleSheet, Keyboard, TextInput, TouchableWithoutFeedback, Alert } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useAuth } from '../../_context/AuthContext';
const dotenv = require('dotenv');
dotenv.config();




export default function TestApiScreen() {

    const [title, setTitle] = useState<any>("");
    const [songURL, setSongURL] = useState<any>("");
    const [startTime, setStartTime] = useState<any>("");
    const [duration, setDuration] = useState<any>("");
    const [coverURL, setCoverURL] = useState<any>("");
    const [visibility, setVisibility] = useState<any>(true);
    const [description, setDesc] = useState<any>("");
    const [momentID, setMomentID] = useState<any>("");
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

            const response = await fetch(`${process.env.NGROK_URL}/api/moments`, {
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

    const handleGetMoments = async (id?: string) => {
        try {
            setLoading(true);
            const url = id
                ? `${process.env.NGROK_URL}/moment/${id}`
                : `${process.env.NGROK_URL}'/api/moments`;

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

            const response = await fetch(`${process.env.NGROK_URL}/${id}`, {
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

            const response = await fetch(`${process.env.NGROK_URL}/moment/${id}`, {
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

                    <Button
                        color="#FCFFFD"
                        title={loading ? "Loading..." : "POST Moment"}
                        onPress={handleCreateMoment}
                        disabled={loading}
                    />
                    <Button
                        color="#FCFFFD"
                        title={loading ? "Loading..." : "GET moment(s)"}
                        onPress={() => handleGetMoments(momentID ? momentID : undefined)}
                        disabled={loading} />
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