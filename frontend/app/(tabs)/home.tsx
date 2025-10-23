import React from "react";
import { View, Text, Image, ScrollView } from "react-native";
import MasonryList from "react-native-masonry-list";
import { Feather } from "@expo/vector-icons";

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
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#FFF0E2" }}
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
     
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ paddingVertical: 10, paddingHorizontal: 15, marginTop: 50, backgroundColor: "#FFF0E2" }}
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

      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          marginBottom: 10,
          marginTop: 10,
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: "600", marginHorizontal: 15, color: "#000" }}>
          Following
        </Text>
        <Text style={{ fontSize: 18, fontWeight: "400", marginHorizontal: 15, color: "#999" }}>
          For You
        </Text>
      </View>

      <View style={{ paddingHorizontal: 10, backgroundColor: "#FFF0E2", borderColor: "#FFF0E2" }}>
        <MasonryList
          images={albums.map((a) => ({
            source: a.src,
            id: a.id,
            dimensions: { width: 200, height: Math.random() * 150 + 200 },
          }))}
          columns={2}
          spacing={3}
          style={{ marginTop: 0, backgroundColor: "#FFF0E2",  }}
          imageContainerStyle={{
            borderRadius: 16,
            overflow: "hidden",
            backgroundColor: "#FFF0E2",
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
    </ScrollView>
  );
}
