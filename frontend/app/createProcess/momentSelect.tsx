import React, { useState } from "react";
import { View, Text, TextInput, Pressable, Image, FlatList, StyleSheet,} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import {moments} from '../../components/demoMoment'
import { useMomentStore } from "../stores/useMomentStore";


export default function SearchPage() {
  const [activeFilter, setActiveFilter] = useState("Songs");
  const setSelectedMoment = useMomentStore((s) => s.setSelectedMoment);
  const [search, setSearch] = useState("");

  const filteredData = moments.filter(item => {
      if (!search.trim()) return true;//show all if empty
      const lowerQuery = search.toLowerCase();
      return (
          item.title.toLowerCase().includes(lowerQuery)
      );
  });

  return (
    <SafeAreaView style={styles.container} edges = {['top']}>
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

      {/* Section Title */}
      <Text style={styles.sectionTitle}>Select a Song</Text>

      {/* Song List */}
      <FlatList
        data={filteredData}
        contentContainerStyle={{ backgroundColor: '#272727', borderRadius: 15, paddingVertical: 5 }}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <Pressable onPress={() => {
            setSelectedMoment(item); 
            router.push({pathname: "/createProcess/momentProcess"})}}>
            <View style={styles.songRow}>
            <Text style={styles.rank}>{index + 1}</Text>
            <View style={styles.songInfo}>
              <Text style={styles.songTitle}>{item.title}</Text>
              <Text style={styles.songArtist}>{item.artist}</Text>
            </View>
            <Image source={item.album} style={styles.albumArt} />
          </View>
          </Pressable>
        )}
        ListEmptyComponent={
                        <View style={{ alignItems: 'center', marginTop: 20 }}>
                        <Text style={{ fontSize: 16, color: '#333C42' }}>No moments found.</Text>
                        </View>
                    }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    paddingHorizontal: 16,
    paddingTop: 20,
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
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
    marginTop: 15,
    marginBottom: 15,
    textAlign: "center",
  },
  songRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    paddingHorizontal: 15,
    width: '100%',
    borderRadius: 15
  },
  rank: {
    color: "white",
    fontSize: 20,
    width: 25,
    textAlign: 'center'
    
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

