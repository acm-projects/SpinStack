import React, { useState } from 'react';
import { Alert, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
const NGROK_URL = process.env.EXPO_PUBLIC_NGROK_URL;
import { supabase } from '@/constants/supabase';

type LikeButtonProps = {
  momentId: string; // pass the ID of the moment to like
};

export default function LikeButton({ momentId }: LikeButtonProps) {
  const [liked, setLiked] = useState(false);


  const handlePress = async () => {
    setLiked(!liked);

    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      if (!token) return;

      console.log(NGROK_URL);
      console.log(momentId);

      const res = await fetch(`${NGROK_URL}/api/likes_moments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ moment_id: momentId }),
      });

      if (res.status === 201) {
        // success! notification is handled server-side
      } else if (res.status === 409) {
        Alert.alert("You've already liked this moment!");
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
