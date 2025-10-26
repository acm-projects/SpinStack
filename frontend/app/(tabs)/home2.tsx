import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  Pressable,
  Dimensions,
  Modal,
  TouchableOpacity,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Font from "expo-font";

const { width } = Dimensions.get("window");

const profiles = Array.from({ length: 10 }).map((_, i) => ({ id: i.toString() }));

const albums = [
  {
    id: "1",
    src: require("../../assets/images/album1.jpeg"),
    user: "Helena Vance",
    profilePic: require("../../assets/images/profile.png"),
    time: "3 mins ago",
    caption:
      "oh yea its happeing alright. BOOYA!, this with a side of Mushoku Tensei",
  },
  {
    id: "2",
    src: require("../../assets/images/album2.jpeg"),
    user: "Jordan Peterson",
    profilePic: require("../../assets/images/profile2.png"),
    time: "5 hours ago",
    caption: "This song makes me happy",
  },
  {
    id: "3",
    src: require("../../assets/images/album3.jpeg"),
    user: "Jordan Peterson",
    profilePic: require("../../assets/images/profile2.png"),
    time: "18 hours ago",
    caption: "Add this to your playlist.. NOW!",
  },
  {
    id: "4",
    src: require("../../assets/images/album4.jpg"),
    user: "Helena Vance",
    profilePic: require("../../assets/images/profile.png"),
    time: "4 hours ago",
    caption: "feeling sad might delete later >.<",
  },
  {
    id: "5",
    src: require("../../assets/images/album5.jpg"),
    user: "Jordan Peterson",
    profilePic: require("../../assets/images/profile3.png"),
    time: "6 hours ago",
    caption: "Great mix, vibes immaculate.",
  },
  {
    id: "6",
    src: require("../../assets/images/album6.jpg"),
    user: "Helena Vance",
    profilePic: require("../../assets/images/profile.png"),
    time: "8 hours ago",
    caption: "",
  },
];

function Masonry({ data, spacing = 8, columns = 2, onPressMore }: any) {
  const [cols, setCols] = useState<any[][]>([]);

  useEffect(() => {
    const withHeights = data.map((item: any) => ({
      ...item,
      height: Math.random() * 50 + 180,
    }));

    const nextCols: any[][] = Array.from({ length: columns }, () => []);
    const colHeights = new Array(columns).fill(0);

    for (const item of withHeights) {
      const minCol = colHeights.indexOf(Math.min(...colHeights));
      nextCols[minCol].push(item);
      colHeights[minCol] += item.height!;
    }

    setCols(nextCols);
  }, [data, columns]);

  const colWidth = (width - spacing * (columns + 1)) / columns;

  const renderItem = (item: any) => (
    <View
      key={item.id}
      style={{
        marginBottom: spacing,
        borderRadius: 16,
        backgroundColor: "#FFF0E2",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <View style={styles.cardHeader}>
        <Image source={item.profilePic} style={styles.avatar} />
        <View style={{ flex: 1 }}>
          <Text style={styles.username}>{item.user}</Text>
          <Text style={styles.time}>{item.time}</Text>
        </View>
        <Pressable onPress={() => onPressMore(item)}>
          <Feather name="more-horizontal" size={20} color="#555" />
        </Pressable>
      </View>

      {/* Image */}
      <View>
        <Image
          source={item.src}
          style={{
            width: "100%",
            height: item.height,
            borderRadius: 16,
          }}
          resizeMode="cover"
        />
        <View
          style={{
            position: "absolute",
            top: "47%",
            left: "49%",
            transform: [{ translateX: -10 }, { translateY: -10 }],
          }}
        >
          <Feather name="play" size={28} color="white" />
        </View>
      </View>

      {item.caption ? (
        <Text style={styles.caption}>{item.caption}</Text>
      ) : null}
    </View>
  );

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: spacing,
        backgroundColor: "#FFF0E2",
      }}
    >
      {cols.map((column, colIndex) => (
        <View key={colIndex} style={{ width: colWidth }}>
          {column.map(renderItem)}
        </View>
      ))}
    </ScrollView>
  );
}

export default function HomeScreen() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [activeFilter, setActiveFilter] = useState("For You");
  const [notificationsVisible, setNotificationsVisible] = useState(false);
  const [addToStackVisible, setAddToStackVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

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

  if (!fontsLoaded) return null;

  const handleMorePress = (item: any) => {
    setSelectedItem(item);
    setAddToStackVisible(true);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#FFF0E2", marginBottom: 100 }}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>SpinStack</Text>
        <Pressable
          onPress={() => setNotificationsVisible(true)}
          style={styles.bellIcon}
        >
          <Feather name="bell" size={28} color="#333C42" />
        </Pressable>
      </View>

      {/* Profiles */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.profileScroll}
      >
        {profiles.map((p) => (
          <View key={p.id} style={styles.profileCircle} />
        ))}
      </ScrollView>

      {/* Filters */}
      <View style={styles.filterContainer}>
        {["Friends", "For You"].map((filter) => (
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

      {/* Feed */}
      <Masonry data={albums} spacing={10} columns={2} onPressMore={handleMorePress} />

      {/* Notifications Popup */}
      <Modal
        visible={notificationsVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setNotificationsVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.friendsPopup}>
            <View style={styles.popupHeader}>
              <Text style={styles.popupTitle}>Notifications</Text>
              <Pressable onPress={() => setNotificationsVisible(false)}>
                <Feather name="x" size={26} color="#333C42" />
              </Pressable>
            </View>
            <View style={styles.popupContent}>
              <Text style={{ color: "#333C42", fontFamily: "Jacques Francois" }}>
                No notifications yet 📭
              </Text>
            </View>
          </View>
        </View>
      </Modal>

      {/* ➕ Add to Stack Popup */}
      <Modal
        visible={addToStackVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAddToStackVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.friendsPopup}>
            <View style={styles.popupHeader}>
              <Text style={styles.popupTitle}>Add to Stack</Text>
              <Pressable onPress={() => setAddToStackVisible(false)}>
                <Feather name="x" size={26} color="#333C42" />
              </Pressable>
            </View>

            <View style={styles.popupContent}>
                
            <View style={{ flexDirection: "row", alignItems: "flex-start",}} >

            
             <ScrollView>
                
                  
              {["Workout Mixxxxxxxxxxxx", "Chill Vibes", "Anime OSTs", "Favorites"].map((stack) => (
                <TouchableOpacity
                  key={stack}
                  style={styles.stackOption}
                  onPress={() => setAddToStackVisible(false)}
                >
                  <Feather name="folder" size={20} color="#333C42" />
                  <Text style={styles.stackText}>{stack}</Text>
                </TouchableOpacity>
                
                
              ))}
            </ScrollView> 
            </View>
              <TouchableOpacity style={styles.newStackButton}>
                <Feather name="plus" size={18} color="#333C42" />
                <Text style={styles.newStackText}>Create New Stack</Text>
              </TouchableOpacity>
              
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontFamily: "Luxurious Roman",
    fontSize: 34,
    paddingTop: 60,
    marginLeft: 97,
    alignSelf: "center",
    color: "#333C42",
  },
  bellIcon: {
    alignSelf: "center",
    paddingTop: 64,
    marginLeft: 78,
  },
  profileScroll: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginTop: 10,
    paddingBottom: 60,
    backgroundColor: "#FFF0E2",
  },
  profileCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#ddd",
    marginRight: 12,
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "center",
    backgroundColor: "#FFF0E2",
    marginBottom: 10,
    paddingTop: 10,
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  filterButtonActive: {},
  filterText: {
    color: "#afb2b3ff",
    fontSize: 18,
    fontFamily: "Jacques Francois",
  },
  filterTextActive: {
    color: "#333C42",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 6,
    paddingTop: -19,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 30,
    marginRight: 8,
  },
  username: {
    fontWeight: "800",
    color: "#333C42",
    fontSize: 14,
    fontFamily: "Jacques Francois",
  },
  time: {
    fontSize: 11,
    color: "#777",
    fontFamily: "Jacques Francois",
  },
  caption: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 12,
    color: "#333C42",
    fontFamily: "Jacques Francois",
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  friendsPopup: {
    width: "85%",
    backgroundColor: "#FFF0E2",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 200,
  },
  popupHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  popupTitle: {
    fontFamily: "Luxurious Roman",
    fontSize: 22,
    color: "#333C42",
  },
  popupContent: {
    justifyContent: "center",
    alignItems: "center",
    minHeight: 100,
  },
  // ➕ Add-to-Stack styles
  stackOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomColor: "#ddd",
    borderBottomWidth: 1,
    width: "200%",
  },
  stackText: {
    marginLeft: 10,
    fontFamily: "Jacques Francois",
    color: "#333C42",
    fontSize: 16,
  },
  newStackButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
  },
  newStackText: {
    marginLeft: 6,
    color: "#333C42",
    fontFamily: "Jacques Francois",
    fontSize: 15,
  },
});
