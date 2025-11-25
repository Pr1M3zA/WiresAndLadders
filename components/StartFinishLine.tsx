import {FC} from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, {G, Rect, Text as SvgText, ForeignObject} from "react-native-svg";
import { useContextProvider } from '@/utils/ContextProvider';

type StartFinishLineProps = {
   pos: {x: number; y: number;};
   size: {width: number; height: number;}
   tileType: number;
   titleText: string;
}

const StartFinishLine: FC<StartFinishLineProps> = (props) => {
   const { tileTypes } = useContextProvider();
   const squareSide = props.size.height / 3;
   const numSquareInLine = ~~(props.size.width / squareSide)+1;
   const adjustedWidth = numSquareInLine * squareSide;


   return (
      <G stye={{elevation: 0, zIndex: 0}} width={adjustedWidth} height={props.size.height}>
         <Rect x={props.pos.x} y={props.pos.y} width={adjustedWidth} height={props.size.height} stroke={tileTypes[props.tileType].color_border} strokeWidth={2} fill="none" />
         {/* Arreglo de numeros para pintar los cuadritos */}
         {Array.from({ length: numSquareInLine }, (_, i) => i).map(col => {
            return ( 
               <G key={col}>
                  <Rect x={props.pos.x + col * squareSide} y={props.pos.y} width={squareSide} height={squareSide} fill={col % 2 === 0 ?  tileTypes[props.tileType].color_fill : 'white'} />
                  <Rect x={props.pos.x + col * squareSide} y={props.pos.y+squareSide} width={squareSide} height={squareSide} fill={col % 2 !== 0 ?  tileTypes[props.tileType].color_fill : 'white'} />
                  <Rect x={props.pos.x + col * squareSide} y={props.pos.y+squareSide*2} width={squareSide} height={squareSide} fill={col % 2 === 0 ?  tileTypes[props.tileType].color_fill : 'white'} />
               </G>
            );
         }) }
         {/*
         <SvgText x={props.pos.x + adjustedWidth / 2} y={props.pos.y + squareSide*2} textAnchor="middle" fontSize={60} fill={tileTypes[props.tileType].color_border} fontFamily="Jomhuria_400Regular" letterSpacing={20}>
            {props.titleText}
         </SvgText>
         */}
      </G>
   )
};

const styles = StyleSheet.create({
   titleContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#6599C3',
      width: '100%',
      height: '100%',
   },
   title: {
      fontFamily: 'Jomhuria_400Regular',
      fontSize: 25,
      includeFontPadding: false,
      textAlignVertical: 'center',
      textAlign: 'center',
      color: 'red',
      letterSpacing: 10,
   }
})

export default StartFinishLine;