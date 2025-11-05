import React from "react";
import { Text, StyleSheet, TouchableOpacity } from "react-native";
import { Svg, Text as SvgText } from "react-native-svg";
import {useWindowDimensions} from 'react-native';

interface RatingButtonProps {
  value: number;
  selected: boolean;
  onPress: (value: number) => void;
}

export default function RatingButton({ value, selected, onPress }: RatingButtonProps) {
    const {height, width, scale, fontScale} = useWindowDimensions();
    const sscale = width /430;
    const fontSize = 45;
    const text = value.toString();
    
    let strokeWidth = sscale* 2

    const alpha = 0.2 * value;

    const color = selected ? `hsla(215, 100%, 50%, ${alpha})` : `hsla(177, 100%, 52%, ${alpha})`;

    let wwidth = 100 + 100 * value + (selected ? 250/value : 0);
    wwidth *= sscale;

  return (
    <TouchableOpacity onPress={() => onPress(value)} style={[styles.button, selected && styles.selected]}>
      <Text style={[styles.text, selected && styles.textSelected, {borderWidth: 0, justifyContent: 'center', alignItems: 'center'}]}>

        <Svg height={fontSize * 1.2} width={fontSize * text.length}>
            <SvgText
                fill={selected ? '#0bfff3' : 'white'}
                stroke={color}
                strokeWidth={strokeWidth}
                fontSize={fontSize}
                fontWeight={wwidth}
                x={fontSize/4}
                y={fontSize-1}
            >
                {text}
            </SvgText>
        </Svg>

      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 70,
    height: 70,
    borderRadius: 4,
    borderWidth: 5,
    borderColor: "#747474",
    backgroundColor: "#23323B",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 5,
  },
  selected: {
    borderRadius: 10,
    borderWidth: 5,
  },
  text: {
    color: "white",
    fontSize: 32,
    fontWeight: "600",
  },
  textSelected: {
    color: "white",
  },
});
