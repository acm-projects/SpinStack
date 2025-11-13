// components/StackViewer.tsx
import React, { useState } from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import MomentView from "./newMoment";
import MomentInfo from "./momentInfo";
import { useRouter } from "expo-router";


type MomentData = {
    moment: {
        id: string;
        spotifyId: string | null;
        title: string;
        artist: string;
        songStart: number;
        songDuration: number;
        length: number;
        album: any;
        waveform: number[];
    };
    user: {
        name: string;
        profilePic: string | null;
    };
    type: 'moment' | 'story';
};

type StackViewerProps = {
    moments: MomentData[];
};

export default function StackViewer({ moments }: StackViewerProps) {
    const [index, setIndex] = useState(0);
    const router = useRouter();


    const goNext = () => setIndex(Math.min(index + 1, moments.length - 1));
    const goPrev = () => setIndex(Math.max(index - 1, 0));

    if (!moments || moments.length === 0) {
        return (
            <View style={styles.empty}>
                <Text>No moments in this stack.</Text>
            </View>
        );
    }

    return (
        <View style={{ flex: 1 }}>

            {/* Display the current moment */}
            <MomentView data={moments[index]} />

            {/* Navigation arrows */}
            {moments.length > 1 && (
                <View style={styles.navContainer}>
                    <TouchableOpacity
                        onPress={goPrev}
                        disabled={index === 0}
                        style={styles.navButton}
                    >
                        <Feather
                            name="chevron-left"
                            size={32}
                            color={index === 0 ? "#ccc" : "#333C42"}
                        />
                    </TouchableOpacity>

                    <Text style={styles.counter}>
                        {index + 1} / {moments.length}
                    </Text>

                    <TouchableOpacity
                        onPress={goNext}
                        disabled={index === moments.length - 1}
                        style={styles.navButton}
                    >
                        <Feather
                            name="chevron-right"
                            size={32}
                            color={index === moments.length - 1 ? "#ccc" : "#333C42"}
                        />
                    </TouchableOpacity>
                </View>
            )}
        </View>

    );
}

const styles = StyleSheet.create({
    navContainer: {
        position: "absolute",
        bottom: 100,
        left: 0,
        right: 0,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 30,
        gap: 25,
    },
    navButton: {
        padding: 10,
    },
    counter: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#333C42",
    },
    empty: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    backButton: {
        position: "absolute",
        top: 150,
        left: 20,
        zIndex: 10,
        backgroundColor: "rgba(255,255,255,0.8)",
        borderRadius: 30,
        padding: 6,
    },

});
