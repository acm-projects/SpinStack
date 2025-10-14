import { Text, View, Pressable } from "react-native";
import { useState } from "react";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";

export default function CreateScreen() {

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
                    paddingTop: 100,
                }}>
                    <Text style={{ color: "white", fontSize: 20, fontFamily: "Intern", fontWeight: 500 }}>
                        Select a Song
                    </Text>
                </View>

                <View style={{ width: "48%", height: "29%", backgroundColor: "#272727", borderRadius: 30, marginTop: 30,
                    justifyContent: "center", alignContent: "center", alignItems: "center"
                 }}> 
                <Pressable
                          onPress={() => router.push("/createProcess/momentSelect")}
                          style={{ }}
                        >
                          <Feather name="plus" size={120} color="white" />
                        </Pressable>

                </View>
            </View>




        )
    }

}