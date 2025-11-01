import React from "react"
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  Pressable,
  Dimensions,
  ActivityIndicator,
  Modal,
  TouchableOpacity,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Font from "expo-font";
import { supabase } from "@/constants/supabase";
import { useRouter, RelativePathString } from "expo-router";

interface AddToStackPopupProps {
  addToStackVisible: boolean;
  setAddToStackVisible: (value: boolean) => void;
  addMomentToStack: (stackId: string) => Promise<void>;
  userStacks: any[];
}

export const AddToStackPopup: React.FC<AddToStackPopupProps> = (props) => {
  const { 
    addToStackVisible, 
    setAddToStackVisible, 
    addMomentToStack, 
    userStacks 
  } = props;

  if (!addToStackVisible) return null;
    return (
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
            <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
            <ScrollView style={{ width: "100%" }}>
                {userStacks.length === 0 ? (
                <Text style={{ textAlign: "center", color: "#333C42", fontFamily: "Jacques Francois" }}>
                    No stacks yet
                </Text>
                ) : (
                userStacks.map((stack) => (
                    <TouchableOpacity
                    key={stack.id}
                    style={styles.stackOption}
                    onPress={() => addMomentToStack(stack.id)}
                    >
                    <Feather name="folder" size={20} color="#333C42" />
                    <Text style={styles.stackText}>{stack.title}</Text>
                    </TouchableOpacity>
                ))
                )}
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