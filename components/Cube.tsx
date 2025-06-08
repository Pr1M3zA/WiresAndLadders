import {G, Polygon} from 'react-native-svg';
import React from 'react';

interface CubeProps {
   x: number;
   y: number;
   scale: number;
   lineWidth: number;
   colors: {
      faceUp: string;
      faceLeft: string;
      faceRight: string;
      line: string;
   };
}

const Cube:React.FC <CubeProps> = props => {
   return(
      <G x={props.x} y={props.y} scale={props.scale} stroke={props.colors.line} strokeWidth={props.lineWidth}>
         <Polygon points="88,192 1,144 1,49 88,96" fill={props.colors.faceLeft} />
         <Polygon points="88,192 176,144 176,49 88,96" fill={props.colors.faceRight} />
         <Polygon points="176,49 88,1 1,49 88,96" fill={props.colors.faceUp} />
      </G>
   )
}

export default Cube;