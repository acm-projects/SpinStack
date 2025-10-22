import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Keyboard, Pressable, Image, FlatList, StyleSheet, TouchableWithoutFeedback } from "react-native";
import * as Font from "expo-font";
import {moments} from '../../components/demoMoment'

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
        data={moments}
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
            <Image source={item.album} style={styles.albumArt} />
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
