import React, { useState, useEffect } from 'react';
import { Alert, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { supabase } from '@/constants/supabase';

const NGROK_URL = process.env.EXPO_PUBLIC_NGROK_URL;

type LikeButtonProps = {
  contentId: string; // ID of the moment or story
  type: 'moment' | 'story';
};

export default function LikeButton({ contentId, type }: LikeButtonProps) {
  const [liked, setLiked] = useState(false);

  // Check if already liked on mount
  useEffect(() => {
    const fetchLikeStatus = async () => {
      try {
        const token = (await supabase.auth.getSession()).data.session?.access_token;
        if (!token) return;

        const endpoint = type === 'story' ? 'likes_stories' : 'likes_moments';
        const res = await fetch(`${NGROK_URL}/api/${endpoint}/check/${contentId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          setLiked(data.liked); // set initial liked state
        } else {
          console.error(`Failed to fetch like status: ${res.status}`);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchLikeStatus();
  }, [contentId, type]);

  const handlePress = async () => {
    setLiked(!liked); // optimistic update

    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      if (!token) return;

      const endpoint = type === 'story' ? 'likes_stories' : 'likes_moments';
      const bodyPayload = { moment_id: contentId }; // backend expects moment_id even for stories

      const res = await fetch(`${NGROK_URL}/api/${endpoint}`, {
        method: liked ? 'DELETE' : 'POST', // delete if unliking
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: liked ? undefined : JSON.stringify(bodyPayload),
      });

      if (res.status === 201 || res.status === 200) {
        console.log(`${type} liked/unliked successfully!`);
      } else if (res.status === 409) {
        Alert.alert(`You've already liked this ${type}!`);
      } else if (!res.ok) {
        const error = await res.json();
        console.error(error);
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Something went wrong while liking.');
    }
  };

  return (
    <TouchableOpacity onPress={handlePress}>
      <FontAwesome
        name={liked ? 'heart' : 'heart-o'}
        size={50}
        color={liked ? 'red' : '#333C42'}
      />
    </TouchableOpacity>
  );
}
