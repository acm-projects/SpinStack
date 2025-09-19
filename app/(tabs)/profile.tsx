import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rbkupzbrtrwaajuqpybc.supabase.co'
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJia3VwemJydHJ3YWFqdXFweWJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3OTQ4NTEsImV4cCI6MjA3MzM3MDg1MX0.xbeUAXN0Wnb4PsaxmjD0TCx_DDn1p1m-Rb2pTJQtL_M"
export const supabase = createClient(supabaseUrl, supabaseKey)

import { useState } from 'react';
import { Alert, Button, Keyboard, StyleSheet, Text, TextInput, TouchableWithoutFeedback, View } from "react-native";

export default function ProfilePage() {
    //State values for email/password
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");


    const handleSignUp = async () => {

        Keyboard.dismiss();

        // Validate email

        if (!isValidEmail(email)) {
            return Alert.alert("Invalid Email", "Please enter a valid email address.");
        }

        // Validate password

        if (!isValidPassword(password)) {
            return Alert.alert(
                "Invalid Password",
                "Password must be at least 6 characters, 1 uppercase letter, and 1 number and special character."
            );
        }

        // Call Supabase signup

        const { data, error } = await supabase.auth.signUp({ email, password });

        if (error) {
            return Alert.alert("Signup Error", error.message);
        }

        // Success

        Alert.alert(
            "Success!",
            "User created! Please check your email to confirm your account.",
            [
                {
                    text: "OK",
                    //onPress: () => navigation.replace("Profile"), // navigate to Profile screen
                },
            ]
        );
    };


    const isValidEmail = (email: string) => {

        const regex = /^\S+@\S+\.\S+$/;
        return regex.test(email);

    };

    const isValidPassword = (password: string) => {

        const regex = /^(?=.*[0-9])(?=.*[A-Z]).{6,}$/;
        return regex.test(password);
        //At least 6 characters, 1 uppercase letter and number
    };



    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>

                <Text style={styles.titleText}>SpinStack</Text>
                <Text style={styles.baseText}>
                    Create account with email and password below
                </Text>
                <TextInput
                    style={[styles.input, { color: "white" }]}
                    placeholderTextColor="#D2D4C8"
                    placeholder="Enter email"
                    value={email}
                    onChangeText={setEmail}
                />
                <TextInput
                    style={[styles.input, { color: "white" }]}
                    placeholderTextColor="#D2D4C8"
                    placeholder="Enter password"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                />

                <Button color="#FCFFFD" title="Sign Up" onPress={() => handleSignUp()} />
            </View>
        </TouchableWithoutFeedback>
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
        fontFamily: "Clear-Sans",
        color: "white",
        padding: 20,
    },
    titleText: {
        fontSize: 50,
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
