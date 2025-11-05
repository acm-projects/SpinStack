import React, { useState } from 'react';
import { Alert, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
const NGROK_URL = process.env.EXPO_PUBLIC_NGROK_URL;
import { supabase } from '@/constants/supabase';

type LikeStoryButtonProps = {
    storyId: string; // pass the ID of the story to like
};

export default function LikeStoryButton({ storyId }: LikeStoryButtonProps) {
    const [liked, setLiked] = useState(false);

    const handlePress = async () => {
        setLiked(!liked);

        try {
            const token = (await supabase.auth.getSession()).data.session?.access_token;
            if (!token) return;

            const res = await fetch(`${NGROK_URL}/api/likes_stories`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ story_id: storyId }),
            });

            if (res.status === 201) {
                console.log("✅ Story liked successfully");
            } else if (res.status === 409) {
                Alert.alert("You've already liked this story!");
            } else {
                const error = await res.json();
                console.error(error);
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <TouchableOpacity onPress={handlePress}>
            <FontAwesome
                name={liked ? "heart" : "heart-o"}
                size={50}
                color={liked ? "red" : "white"}
            />
        </TouchableOpacity>
    );
}
