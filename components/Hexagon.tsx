import { Polygon, G } from 'react-native-svg';
import React from 'react';

interface HexagonProps {
   pos: {x: number; y: number;};
   radius: number; 
   rotation: number;
   colors: {fill: string; border: string; };
   borderWidth: number;
}

const Hexagon:React.FC <HexagonProps> = (props) => {
      const sqrt = Math.sqrt(3) * props.radius / 2
      let points = `${props.radius},0 ${props.radius/2},${sqrt} ${-props.radius/2},${sqrt} ${-props.radius},0 ${-props.radius/2},${-sqrt} ${props.radius/2},${-sqrt}`

      return (
         <G x={props.pos.x} y={props.pos.y} rotation={props.rotation} >
            <Polygon points={points} fill={props.colors.fill} stroke={props.colors.border} strokeWidth={props.borderWidth} />
         </G>
      )
}

export default Hexagon;