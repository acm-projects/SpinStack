import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Keyboard, Pressable, Image, FlatList, StyleSheet, TouchableWithoutFeedback } from "react-native";
import * as Font from "expo-font";

const mockData = [
  { id: "1", title: "Golden", artist: "HUNTR/X: EJAE, Audrey Nuna & REI AMI", image: require("@/assets/images/album1.jpeg") },
  { id: "2", title: "back to friends", artist: "sombr", image: require("@/assets/images/album2.jpeg") },
  { id: "3", title: "Ordinary", artist: "Alex Warren", image: require("@/assets/images/album3.jpeg") },
  { id: "4", title: "Man I Need", artist: "Olivia Dean", image: require("@/assets/images/album4.jpg") },
  { id: "5", title: "TIT FOR TAT", artist: "Tate McRae", image: require("@/assets/images/album5.jpg") },
  { id: "6", title: "Don't Say You Love Me", artist: "Jin", image: require("@/assets/images/album6.jpg") },
  { id: "7", title: "Soda Pop", artist: "Saja Boys: Andrew Choi, Neckwav, Danny Chung, Kevin Woo & samUIL Lee", image: require("@/assets/images/album7.jpg") },
  { id: "8", title: "Die With A Smile", artist: "Morgan Wallen Featuring Tate McRae", image: require("@/assets/images/album8.jpg") },
  { id: "9", title: "BIRDS OF A FEATHER", artist: "Billie Eillish", image: require("@/assets/images/album9.jpg") },
  { id: "10", title: "Gabriela", artist: "KATSEYE", image: require("@/assets/images/album10.jpg") },
];

export default function SearchPage() {
  const [activeFilter, setActiveFilter] = useState("Songs");
  const [search, setSearch] = useState("");

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>


    <View style={styles.container}>
      {/* Search Bar */}
      
        <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search..."
          placeholderTextColor="#333C42"
          value={search}
          onChangeText={setSearch}
        />
      </View>

  
      

      {/* Filter Buttons */}
      <View style={styles.filterRow}>
        {["Songs", "Stacks", "Users"].map((filter) => (
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

      {/* Section Title */}
      <Text style={styles.sectionTitle}>Top Hits This Week</Text>

      {/* Song List */}
      <FlatList
        style = {{marginBottom: 92}}
        data={mockData}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item, index }) => (
          <View style={[styles.songRow]}>
            <Text style={styles.rank}>{index + 1}</Text>
            <View style={styles.songInfo}>
              <Text style={styles.songTitle}>{item.title}</Text>
              <Text numberOfLines={1}
                ellipsizeMode="tail" style={styles.songArtist}>{item.artist}</Text>
            </View>
            <Image source={item.image} style={styles.albumArt} />
          </View>
        )}
      />
    </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF0E2",
    paddingHorizontal: 18,
    paddingTop: 70,
  },
  searchContainer: {
    backgroundColor: "#8DD2CA",
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#333C42",
  },
  searchInput: {
    color: "#333C42",
    fontSize: 16,
    fontFamily: "Jacques Francois",
  },
  filterRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
    gap: 10,
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: "#8DD2CA",
    borderWidth: 1.5,
    borderColor: "#333C42",
  },
  filterButtonActive: {
    backgroundColor: "#333C42",
    borderColor: "#333C42",
  },
  filterText: {
    color: "#333C42",
    fontSize: 14,
    fontFamily: "Jacques Francois",
  },
  filterTextActive: {
    color: "#FFF0E2",
  },
  sectionTitle: {
    fontSize: 25,
    fontFamily: "Luxurious Roman",
    color: "#333C42",
    marginTop: 15,
    marginBottom: 15,
    textAlign: "center",
  },
  listContainer: {
    backgroundColor: "#8DD2CA",
    borderRadius: 15,
    paddingVertical: 8,
    borderWidth: 1.5,
    borderColor: "#333C42",
  },
  songRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 15,

  },
  rank: {
    color: "#333C42",
    fontSize: 20,
    width: 25,
    textAlign: "center",
    fontFamily: "Jacques Francois",
  },
  songInfo: {
    flex: 1,
    marginLeft: 10,
  },
  songTitle: {
    color: "#333C42",
    fontSize: 18,
    fontFamily: "Jacques Francois",
  },
  songArtist: {
    color: "#39868F",
    fontSize: 13,
    fontFamily: "Jacques Francois",
  },
  albumArt: {
    width: 45,
    height: 45,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#333C42",
  },
});
