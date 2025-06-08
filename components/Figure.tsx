import React from 'react';
import { G, Path, Circle, Ellipse } from 'react-native-svg';

interface FigureProps {
   x: number;
   y: number;
   scale: number;
   colors: {
      headColor: string;
      bodyColor: string;
      lineColor: string;
   };
   eyes: {
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      eyeColor: string;
   }
}

const Figure:React.FC<FigureProps> = (props) => {
   return (
      <G x={props.x} y={props.y} scale={props.scale}>
         <Path 
            d="M15.8 32.1 C17.3 28.3 22.7 28.3 24.2 32.1 L34.2 57.6 C35.3 60.6 33.2 63.7 30 63.7 H10 C6.8 63.7 4.7 60.6 5.8 57.6 L15.8 32.1Z"
            fill={props.colors.bodyColor}
            stroke={props.colors.lineColor}
            strokeWidth={1}
         />
         <Circle 
            cx={20} 
            cy={16} 
            r={15.5} 
            fill={props.colors.headColor} 
            stroke={props.colors.lineColor} 
            strokeWidth={1}
         />
         <Ellipse 
            cx={props.eyes.x1} 
            cy={props.eyes.y1} 
            rx={2} 
            ry={4} 
            fill={props.eyes.eyeColor}
         />
         <Ellipse 
            cx={props.eyes.x2} 
            cy={props.eyes.y2} 
            rx={2} 
            ry={4} 
            fill={props.eyes.eyeColor}
         />
      </G>
   )
}

export default Figure;