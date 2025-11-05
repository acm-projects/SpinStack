// AddToStackModal.tsx
import React, { useState } from "react";
import {
    Modal,
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Pressable,
    StyleSheet,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import CreateStackModal from "./createStackModal";
import MomentInfo from "./momentInfo";

type AddToStackModalProps = {
    visible: boolean;
    onClose: () => void;
    userStacks: { id: string; title: string }[];
    addMomentToStack: (stackId: string) => void;
    existingMoments: MomentInfo[];
    refreshStacks: () => void;
};

export default function AddToStackModal({
    visible,
    onClose,
    userStacks,
    addMomentToStack,
    existingMoments,
    refreshStacks,
}: AddToStackModalProps) {
    const [showCreateModal, setShowCreateModal] = useState(false);

    return (
        <>
            {/* ➕ Add to Stack Popup */}
            <Modal visible={visible} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.friendsPopup}>
                        {/* Header */}
                        <View style={styles.popupHeader}>
                            <Text style={styles.popupTitle}>Add to Stack</Text>
                            <Pressable onPress={onClose}>
                                <Feather name="x" size={26} color="#333C42" />
                            </Pressable>
                        </View>

                        {/* Content */}
                        <View style={styles.popupContent}>
                            <ScrollView style={{ width: "100%" }}>
                                {userStacks.length === 0 ? (
                                    <Text style={styles.noStacksText}>No stacks yet</Text>
                                ) : (
                                    userStacks.map((stack) => (
                                        <TouchableOpacity
                                            key={stack.id}
                                            style={styles.stackOption}
                                            onPress={() => {
                                                addMomentToStack(stack.id);
                                                onClose();
                                            }}
                                        >
                                            <Feather name="folder" size={20} color="#333C42" />
                                            <Text style={styles.stackText}>{stack.title}</Text>
                                        </TouchableOpacity>
                                    ))
                                )}
                            </ScrollView>

                            {/* Create New Stack */}
                            <TouchableOpacity
                                style={styles.newStackButton}
                                onPress={() => setShowCreateModal(true)}
                            >
                                <Feather name="plus" size={18} color="#333C42" />
                                <Text style={styles.newStackText}>Create New Stack</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Create Stack Modal */}
            <CreateStackModal
                visible={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                existingMoments={existingMoments}
                refreshStacks={refreshStacks}
            />
        </>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: "#00000066",
        justifyContent: "center",
        alignItems: "center",
    },
    friendsPopup: {
        width: "90%",
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 20,
        maxHeight: "80%",
    },
    popupHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 15,
    },
    popupTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333C42",
    },
    popupContent: {
        flex: 1,
    },
    noStacksText: {
        textAlign: "center",
        color: "#333C42",
        fontFamily: "Lato",
    },
    stackOption: {
        flexDirection: "row",
        alignItems: "center",
        padding: 10,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: "#ccc",
        marginBottom: 8,
    },
    stackText: {
        marginLeft: 8,
        color: "#333C42",
    },
    newStackButton: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 10,
        justifyContent: "center",
        padding: 10,
        borderWidth: 1,
        borderColor: "#333C42",
        borderRadius: 6,
    },
    newStackText: {
        marginLeft: 5,
        color: "#333C42",
        fontWeight: "bold",
    },
});
