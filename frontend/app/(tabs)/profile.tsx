import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';
import "../../app.css";

import { supabase } from '@/constants/supabase';
import { useAuth } from './AuthContext';

import React, { useState } from 'react';
import { Alert, Button, Keyboard, StyleSheet, Text, TextInput, TouchableWithoutFeedback, View, Image } from "react-native";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import { globalStyles } from '@/constants/style-sheet';
import { Dimensions } from "react-native";





export default function SignUpPage() {
    //State values for email/password

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const { user } = useAuth();

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

        if (!data.user) {
            // No user was created, probably email already exists
            return Alert.alert(
                "Email Already Registered",
                "An account with this email already exists. Please try signing in."
            );
        }

        // Success

        Alert.alert(
            "Success!",
            "Please check your email to confirm your account.",
            [
                {
                    text: "OK",
                },
            ]
        );
    };

    const handleSignIn = async () => {
        Keyboard.dismiss();

        // validate email & password again
        if (!isValidEmail(email)) {
            return Alert.alert("Invalid Email", "Please enter a valid email address.");
        }

        if (!isValidPassword(password)) {
            return Alert.alert(
                "Invalid Password",
                "Password must be at least 6 characters, 1 uppercase letter, and 1 number."
            );
        }

        // call Supabase sign-in
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            return Alert.alert("Sign In Error", error.message);
        }

        // success!
        Alert.alert("Welcome back!", `Signed in as ${data.user.email}`);
        // navigation.replace("Profile") // optional navigation to Profile screen
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


    if (!user) {
        return (
            <KeyboardAwareScrollView
                style={{ flex: 1, backgroundColor: "#121212" }}
                contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 0 }}
                enableOnAndroid={true}
                extraScrollHeight={90} // small space between input and keyboard
            >
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

                        <Text style={styles.baseText}> or </Text>

                        <Button color="#FCFFFD" title="Sign In with existing account" onPress={() => handleSignIn()} />
                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAwareScrollView>
        );

    } else if (user) {
        const { width } = Dimensions.get("window");
        const IMAGE_SIZE = width * 0.2; // 30% of screen width
        const numFriends = 7
        return (
            <View style={styles.container}>
                <Text style={globalStyles.mainText}>Profile </Text>
                <View style={
                    {
                        display: "flex",
                        flexDirection: 'row',
                        width: "100%",
                        
                    }
                    }>
                    <Image
                        source={require("../../assets/images/profile.png")}
                        style={{
                            width: IMAGE_SIZE,
                            height: IMAGE_SIZE,
                            borderRadius: IMAGE_SIZE / 2,
                        }}
                    />
                    <View style={{ 
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            paddingLeft: 18

                     }}>
                        <Text style={{ fontSize: 20, color: "white", fontFamily: "Intern", fontWeight: "500", }}>
                            Haden Hicks
                        </Text>
                         <Text style={{ fontSize: 14, color: "white", fontFamily: "Intern", fontWeight: "400", }}>
                            {"life is so short :("}
                        </Text>
                   
                    </View>

                    <View style={{ 
                            flexDirection: "column",
                            justifyContent: "center",
                            paddingLeft: 30
                     }}>
                        <Text style={{ fontSize: 14, color: "white", fontFamily: "Intern", fontWeight: "400", textDecorationLine: "underline" }}>
                            {numFriends} Friends
                        </Text>
                    </View>
                </View>
                        <View style={{
                            flexDirection: "column",
                            justifyContent: "center",
                            width: "95%",
                            height: "80%",
                            marginTop: 20,
                            borderRadius: 10,
                            padding: 10,
                            backgroundColor: "#0C0C0C",
                        }}>
                            
                            <Button title="Sign Out" onPress={async () => await supabase.auth.signOut()} />
                            
                        </View>
                
            </View>




        );
    }

}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "flex-start",
        alignItems: "center",
        padding: 20,
        paddingTop: 75
    },
    baseText: {
        fontFamily: "Inter",
        color: "white",
        padding: 10,
    },
    titleText: {
        fontSize: 25,
        fontFamily: "Inter",
        fontWeight: "bold",
        color: "#0BFFE3",
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
    border: {
        borderColor: "red",
        borderWidth: 1,

    }

});

