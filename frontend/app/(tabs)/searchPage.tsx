import React, { useState } from "react";
import { View, Text, TextInput, Pressable, Image, FlatList, StyleSheet, } from "react-native";

const mockData = [
  {
    id: "1",
    title: "Golden",
    artist: "HUNTR/X: EJAE, Audrey Nuna & REI AMI",
    image: require("@/assets/images/album1.jpeg"),
  },
  {
    id: "2",
    title: "Ordinary",
    artist: "Alex Warren",
    image: require("@/assets/images/album2.jpeg"),
  },
  {
    id: "3",
    title: "Manchild",
    artist: "Sabrina Carpenter",
    image: require("@/assets/images/album3.jpeg"),
  },
];

export default function SearchPage() {
  const [activeFilter, setActiveFilter] = useState("Songs");
  const [search, setSearch] = useState("");

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search..."
          placeholderTextColor="#ccc"
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
        data={mockData}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <View style={styles.songRow}>
            <Text style={styles.rank}>{index + 1}</Text>
            <View style={styles.songInfo}>
              <Text style={styles.songTitle}>{item.title}</Text>
              <Text style={styles.songArtist}>{item.artist}</Text>
            </View>
            <Image source={item.image} style={styles.albumArt} />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    paddingHorizontal: 16,
    paddingTop: 70,
  },
  searchContainer: {
    backgroundColor: "#1a1a1a",
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  searchInput: {
    color: "white",
    fontSize: 16,
  },
  filterRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 15,
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginHorizontal: 5,
    backgroundColor: "#272727",
    borderColor: '#0BFFE3',
    borderWidth: 2,
  },
  filterButtonActive: {
    backgroundColor: "#0BFFE3",
    borderColor: '#0BFFE3',
    borderWidth: 2,
  },
  filterText: {
    color: "white",
    fontSize: 14,
  },
  filterTextActive: {
    color: "black",
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
    marginTop: 25,
    marginBottom: 10,
    textAlign: "center",
  },
  songRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    paddingHorizontal: 18,
    backgroundColor: "#272727",
    width: '100%',
    borderRadius: 15
  },
  rank: {
    color: "white",
    fontSize: 20,
    width: 20,
  },
  songInfo: {
    flex: 1,
    marginLeft: 10,
  },
  songTitle: {
    color: "white",
    fontSize: 16,
  },
  songArtist: {
    color: "#aaa",
    fontSize: 13,
  },
  albumArt: {
    width: 40,
    height: 40,
    borderRadius: 5,
  },
});
