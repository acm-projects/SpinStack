import React from "react";
import { FlatList, Dimensions, View } from "react-native";
import MomentView from "./newMoment";
import {demoMoments} from "./demoMoment"; 

export default function StackView({ moments = demoMoments }: { moments?: typeof demoMoments }) {
  const width = Dimensions.get("window").width;

  return (
    <FlatList
      data={moments}
      keyExtractor={(_, index) => index.toString()}
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      renderItem={({ item }) => (
        <View style={{ width, flex: 1 }}>
          <MomentView data={item} />
        </View>
      )}
    />
  );
}
