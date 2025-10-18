import React, { useEffect, useState } from "react";
import { View, Text, Image, ScrollView, StyleSheet, Pressable } from "react-native";
import MasonryList from "react-native-masonry-list";
import { Feather } from "@expo/vector-icons";
import * as Font from "expo-font";
const profiles = Array.from({ length: 10 }).map((_, i) => ({ id: i.toString() }));

const albums = [
    { id: "1", src: require("../../assets/images/album1.jpeg") },
    { id: "2", src: require("../../assets/images/album2.jpeg") },
    { id: "3", src: require("../../assets/images/album3.jpeg") },
    { id: "4", src: require("../../assets/images/album4.jpg") },
    { id: "5", src: require("../../assets/images/album5.jpg") },
    { id: "6", src: require("../../assets/images/album6.jpg") },
];

export default function HomeScreen() {
    const [fontsLoaded, setFontsLoaded] = useState(false);
    const [activeFilter, setActiveFilter] = useState("Songs");
    const loadFonts = async () => {
        await Font.loadAsync({
            "Luxurious Roman": require("@/fonts/LuxuriousRoman-Regular.ttf"),
            "Jacques Francois": require("@/fonts/JacquesFrancois-Regular.ttf"),
        });
        setFontsLoaded(true);
    };

    useEffect(() => {
        loadFonts();
    }, []);

    return (

        <View style={{ flex: 1, backgroundColor: "#FFF0E2"}}>

            <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
                <Text style={{ fontFamily: "Luxurious Roman", fontSize: 34, paddingTop: 60, marginLeft: 97, alignSelf: "center", color: "#333C42" }}>
                    SpinStack

                </Text>
    
                <Pressable style={{ alignSelf: "center", paddingTop: 64, marginLeft: 78}}>
                    <Feather name="bell" size={28} color="#333C42" />

                </Pressable>

            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ paddingVertical: 10, paddingHorizontal: 15, marginTop: 10, paddingBottom: 20, backgroundColor: "#FFF0E2" }}
            >
                {profiles.map((p) => (
                    <View
                        key={p.id}
                        style={{
                            width: 60,
                            height: 60,
                            borderRadius: 30,
                            backgroundColor: "#ddd",
                            marginRight: 12,
                        }}
                    />
                ))}
            </ScrollView>

            <View style={{ flexDirection: "row", justifyContent: "center", backgroundColor: "#FFF0E2", marginBottom: 20, marginTop: -600 }}>
                {["Following", "For You"].map((filter) => (
                    <Pressable
                        key={filter}
                        style={[
                            styles.filterButton,
                            activeFilter === filter && styles.filterButtonActive,
                        ]}
                        onPress={() => setActiveFilter(filter)}
                    >
                        <Text
                            style={[
                                styles.filterText,
                                activeFilter === filter && styles.filterTextActive,
                            ]}
                        >
                            {filter}
                        </Text>
                    </Pressable>
                ))}
            </View>


            <View style={{ flex: 1, display: 'flex', ...styles.test}}>
                <MasonryList
                    images={albums.map((a) => ({
                        source: a.src,
                        id: a.id,
                        dimensions: { height: Math.random() * 150 + 200 },
                    }))}
                    columns={2}
                    spacing={3}
                    bounces={false}
                    alwaysBounceVertical={false}
                    overScrollMode="never"
                    onMomentumScrollBegin={() => {} }
                    columnWrapperStyle={{backgroundColor: "#000000", ...styles.test}}
                    style={{ flex: 1, ...styles.test, marginTop: 0, backgroundColor: "#1d1003ff", padding: 0, margin: 0, alignSelf: "stretch" }}
                    contentContainerStyle={{ marginHorizontal: 24, alignSelf: "stretch", backgroundColor: "#FFF0E2", flex: 1, }}
                    imageContainerStyle={{
                        borderRadius: 16,
                        overflow: "hidden",
                        backgroundColor: "#FFF0E2",
                        alignSelf: "stretch",
                        paddingHorizontal: 0,
                    }}
                    
                    customImageComponent={({ source, style }: { source: any; style: any }) => (
                        <View style={{ backgroundColor: "#FFF0E2", }}>
                            <Image source={source} style={[style, { borderRadius: 16 }]} resizeMode="cover" />
                            <View
                                style={{
                                    position: "absolute",
                                    top: "45%",
                                    left: "45%",
                                    transform: [{ translateX: -10 }, { translateY: -10 }],
                                }}
                            >
                                <Feather name="play" size={28} color="white" />
                            </View>
                        </View>
                    )}
                />


            </View>

        </View>

    );
}

const styles = StyleSheet.create({
    filterButton: {
        paddingVertical: 6,
        paddingHorizontal: 14,




    },
    filterButtonActive: {

    },
    filterText: {
        color: "#afb2b3ff",
        fontSize: 18,
        fontFamily: "Jacques Francois",
    },
    filterTextActive: {
        color: "#333C42",
    },

    test: {
        borderRadius: 1,
        borderWidth: 1,
        borderColor: 'red'
    }
});
