import { Text, View, Pressable, Image } from "react-native";
import { useState } from "react";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";

export default function CreateScreen() {

    const handleNext = () => {
        router.push("../createProcess/captions");

    };
    const [hasSong, setHasSong] = useState(null);

    if (hasSong === null) {
        return (

            <View style={{
                display: "flex",
                alignItems: "center",
                paddingTop: 110,
                flex: 1,

            }}>
                <Text style={{ color: "white", fontSize: 30, fontFamily: "Intern", fontWeight: 500 }}>
                    Create Your Moment
                </Text>
                <View style={{
                    alignItems: "center",
                    paddingTop: 50,
                }}>
                    <Text style={{ color: "white", fontSize: 20, fontFamily: "Intern", fontWeight: 500 }}>
                        Select a Song
                    </Text>
                </View>

                <View style={{
                    width: "40%", height: "35%", borderRadius: 30, marginTop: 0,
                    justifyContent: "center", alignContent: "center", alignItems: "center"
                }}>
                    <Pressable
                        onPress={() => router.push("/createProcess/momentSelect")}
                        style={{}}
                    >
                        <Image source={require("../../assets/images/album1.jpeg")}
                            style={{ borderRadius: 15, height: 175, width: 175 }} />

                    </Pressable>

                </View>
                <View style={{ width: "65%", height: "120%", alignItems: "center", paddingTop: 175}}>
                    <Pressable style={{
                        justifyContent: 'center',
                        backgroundColor: '#272727',
                        borderColor: '#0BFFE3',
                        borderWidth: 2,
                        borderRadius: 10,
                        width: '90%',
                        height: '8%',
                    }} onPress={handleNext}>
                        <Text style={{
                            color: '#ffffffff',
                            textAlign: 'center',
                            fontSize: 20,
                            fontWeight: '600',
                        }}>Next</Text>
                    </Pressable>

                </View>
            </View>




        )
    }

}
