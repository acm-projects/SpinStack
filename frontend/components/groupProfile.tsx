import React from "react";
import { View, Image, StyleSheet, ImageSourcePropType } from "react-native";

const GroupProfile = ({pics, scale=1}: {pics: (ImageSourcePropType | null)[], scale: number}) => {
  //limit to 3 bc why not
  const displayedPics = pics.slice(0, 3);

  const arrangementRadius = scale * 16;
  const center = scale * 30; //offset of center

  const size = scale * ((pics.length == 1) ? (60) : ((pics.length == 2) ? (50) : (40)));

  const rand = 0;

  return (
    <View style={[styles.container, { width: center * 2, height: center * 2 }]}>
      {displayedPics.map((pic, index) => {
        const angle = (Math.PI/180) * ((360 / displayedPics.length) * index + rand);

        //x,y offsets
        const x = center + arrangementRadius * Math.cos(angle) - 20;
        const y = center + arrangementRadius * Math.sin(angle) - 20;

        return (
          <Image
            key={index}
            source={
                typeof pic === "string"
                ? { uri: pic }
                : pic
            }
            style={[styles.image, { 
    borderRadius: size/2, width: size, height: size, left: x, top: y }]}
          />
        );
      })}
    </View>
  );
};

export default GroupProfile;

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  image: {
    position: "absolute",
    borderWidth: 1,
    borderColor: "#333C42",
  },
});
