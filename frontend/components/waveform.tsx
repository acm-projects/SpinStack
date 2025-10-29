import React, {useState, useEffect} from "react";
import { View, ColorValue } from "react-native";
import Svg, { Rect, Ellipse } from "react-native-svg";

//specify types for some dumbahh reason
//start and end are the relative starts and ends of the moments
const Waveform = ({ data, height, start, end, baseColor='#ffffff', regionColor = "#87bd84", selectedColor = '#84DA7F', anim=true, duration}: {data: number[], height: number, start: number, end: number, baseColor: ColorValue, regionColor: ColorValue, selectedColor: ColorValue, anim: boolean, duration: number}) => {
    const [width, setWidth] = useState(0);
    const barWidth = width / data.length;
    const maxVal = Math.max(...data);

    const [progress, setProgress] = useState(0);

    
        //create animation for sliding progress
        useEffect(() => {
            if(!anim) return;
            const start = Date.now();
            const interval = setInterval(() => {
            const elapsed = (Date.now() - start) % (duration * 1000);
            setProgress(elapsed / (duration * 1000));
            }, 30);
            return () => clearInterval(interval);
        }, [(duration * 1000)]);
    

    const sIndex = Math.trunc(start * data.length);
    const fIndex = Math.trunc(end * data.length);

    return (
        <View
        style = {{
            flex: 1, //the waveform will grow to the width of the parent container
            transform: "scaleY(-1)",
        }}
        onLayout = {(event) => {
            const { width: layoutWidth} = event.nativeEvent.layout;
            setWidth(layoutWidth);
        }}
        >
        {/*conditionally only draw the svgs if the width > 0 (can be dranw at all)*/}
        {width > 0 && 
            (<Svg width={width} height={height}>
                {data.map((val, i) => {
                const barHeight = (val / maxVal) * (height);
                const x = i * barWidth + barWidth / 4;
                const y = height - barHeight + 5;

                const pIndex = Math.trunc((start + (end - start) * progress) * data.length);
                let color = (i >= sIndex && i <= fIndex) ? (selectedColor) : (baseColor);
                if(anim && (i >= sIndex && i <= fIndex)) {
                    color = (i < pIndex) ? (selectedColor) : (regionColor);
                }
                return (
                    <React.Fragment key={i}>
                    <Rect
                        x={x}
                        y={y}
                        width={barWidth / 2}
                        height={barHeight}
                        fill = {color}
                    />
                    <Ellipse
                        cx={x + barWidth / 4}
                        cy={y}
                        rx={barWidth / 4}
                        ry={5}
                        fill= {color}
                    />
                    <Ellipse
                        cx={x + barWidth / 4}
                        cy={height}
                        rx={barWidth / 4}
                        ry={5}
                        fill={color}
                    />
                    </React.Fragment>
                );
                })}
            </Svg>
        )}
        </View>
    );
};

export default Waveform;
