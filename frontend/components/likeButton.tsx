import React, { useState } from 'react';
import { TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

export default function LikeButton() {
  const [liked, setLiked] = useState(false);


  const handlePress = () => setLiked(!liked);

  return (
    <TouchableOpacity onPress={handlePress}>
      <FontAwesome
        name={liked ? 'heart' : 'heart-o'}
        size={60}
        color={liked ? 'red' : 'gray'}
      />
    </TouchableOpacity>
  );
}
