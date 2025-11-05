// components/CreateStackModal.tsx
import React, { useState } from "react";
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    StyleSheet,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import MomentInfo from "./momentInfo";

type CreateStackModalProps = {
    visible: boolean;
    onClose: () => void;
    existingMoments: MomentInfo[];
    refreshStacks: () => void;
};

export default function CreateStackModal({
    visible,
    onClose,
    existingMoments,
    refreshStacks,
}: CreateStackModalProps) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [selectedMoments, setSelectedMoments] = useState<string[]>([]); // array of moment ids
    const [loading, setLoading] = useState(false);

    const toggleMomentSelection = (id: string) => {
        if (selectedMoments.includes(id)) {
            setSelectedMoments(selectedMoments.filter((m) => m !== id));
        } else {
            if (selectedMoments.length >= 5) {
                Alert.alert("Limit reached", "You can only select up to 5 moments");
                return;
            }
            setSelectedMoments([...selectedMoments, id]);
        }
    };

    const handleSubmit = async () => {
        if (!title.trim()) {
            Alert.alert("Missing title", "Please enter a title for the stack");
            return;
        }
        if (selectedMoments.length === 0) {
            Alert.alert("No moments selected", "Please select at least one moment");
            return;
        }

        setLoading(true);
        try {
            // 1️⃣ Create the stack
            const stackRes = await fetch("YOUR_API_ENDPOINT/stacks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title,
                    description,
                    // include user_id if required
                }),
            });
            const newStack = await stackRes.json();

            // 2️⃣ Add moments to the stack
            await Promise.all(
                selectedMoments.map((momentId) =>
                    fetch("YOUR_API_ENDPOINT/moments_in_stacks", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            stack_id: newStack.id,
                            moment_id: momentId,
                            // include user_id if required
                        }),
                    })
                )
            );

            setLoading(false);
            Alert.alert("Stack created", `Stack "${title}" created successfully!`);
            refreshStacks(); // refresh UI in parent
            setTitle("");
            setDescription("");
            setSelectedMoments([]);
            onClose();
        } catch (error) {
            console.error(error);
            setLoading(false);
            Alert.alert("Error", "Failed to create stack");
        }
    };

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    <View style={styles.header}>
                        <Text style={styles.headerText}>Create New Stack</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Feather name="x" size={24} color="#333C42" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.content}>
                        <TextInput
                            style={styles.input}
                            placeholder="Stack Title"
                            value={title}
                            onChangeText={setTitle}
                        />
                        <TextInput
                            style={[styles.input, { height: 80 }]}
                            placeholder="Description (optional)"
                            value={description}
                            onChangeText={setDescription}
                            multiline
                        />

                        <Text style={styles.selectLabel}>Select Moments (max 5):</Text>
                        <ScrollView style={{ maxHeight: 200 }}>
                            {existingMoments.map((m) => (
                                <TouchableOpacity
                                    key={m.moment.id}
                                    style={[
                                        styles.momentItem,
                                        selectedMoments.includes(m.moment.id) && styles.momentSelected,
                                    ]}
                                    onPress={() => toggleMomentSelection(m.moment.id)}
                                >
                                    <Text>{m.moment.title}</Text>
                                    {selectedMoments.includes(m.moment.id) && (
                                        <Feather name="check" size={18} color="#fff" />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    <TouchableOpacity
                        style={[styles.submitButton, loading && { opacity: 0.6 }]}
                        onPress={handleSubmit}
                        disabled={loading}
                    >
                        <Text style={styles.submitText}>{loading ? "Creating..." : "Create Stack"}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "#00000066",
        justifyContent: "center",
        alignItems: "center",
    },
    modal: {
        width: "90%",
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 20,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 15,
    },
    headerText: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333C42",
    },
    content: {
        marginBottom: 15,
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 10,
        marginBottom: 10,
    },
    selectLabel: {
        fontWeight: "bold",
        marginBottom: 5,
        color: "#333C42",
    },
    momentItem: {
        padding: 10,
        borderRadius: 6,
        marginBottom: 5,
        borderWidth: 1,
        borderColor: "#ccc",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    momentSelected: {
        backgroundColor: "#333C42",
        borderColor: "#333C42",
    },
    submitButton: {
        backgroundColor: "#333C42",
        padding: 12,
        borderRadius: 8,
        alignItems: "center",
    },
    submitText: {
        color: "#fff",
        fontWeight: "bold",
    },
});
