import React from 'react';
import { Defs, Use, Path, G, Circle, Mask, Rect, Text } from 'react-native-svg';

interface logoProps {
   x: number;
   y: number; 
   scale: number;
}  

const UABCS: React.FC<logoProps> = (props) => {
   return (
      <G x={props.x} y={props.y} scale={props.scale} >
         <Defs>
            <Path id="sky" d="M 1005 505 A 500 500 0 0 0 5 505" stroke="none" />
            <G id="sunset" >
               <Circle r="80" cx="430" cy="180" stroke="black" strokeWidth="8" />
               <Path d="M 1005 505 A 500 500 0 0 0 994.8, 405 H 15.2 A 500 500 0 0 0 5 505 Z" stroke="black" strokeWidth="8" />
            </G>
            <G id="book" >
               <Path d="M335 505 L445 195 H897 L920 227 L787 505 Z" fill="white" stroke="black" strokeWidth="2" />
               <Path d="M335 505 L468 227 H920 L787 505 Z" fill="white" stroke="black" strokeWidth="2" />
               <Path d="M335 505 L454 206 H906 L913 216 H 461 Z" fill="none" stroke="black" strokeWidth="2" />
               <Path d="M445 195 L468 227" fill="none" stroke="black" strokeWidth="2" />
            </G>
            <G id="desert" >
               <Path d="M145 505 H185 V380 A53 59 0 0 0 232 363 V302 A19 19 0 0 0 200 302 V337 A8 8 0 0 1 184 337 V270 A50 55 0 0 0 235 245 V84.2 L200 108.8 V230 A8 8 0 0 1 184 230 V121.6 L145 156 V325 A8 8 0 0 1 130 325 V175 L97 216 V345 A42 51 0 0 0 145 370 Z" />
               <Path d="M 325, 505 L 450 380 L 500 465 L 670 350 L 730 460 L 785 390 L 830 475 L 900 360 L 960 470 H 1003.77 L 1005 505 Z" />
               <Text x="560" y="300" fontFamily="Arial, Helvetica, sans-serif" fontSize="35" textLength="400" lengthAdjust="spacingAndGlyphs" transform="skewX(-20)">
                  SABIDURIA COMO META
               </Text>
               <Text x="555" y="345" fontFamily="Arial, Helvetica, sans-serif" fontSize="35" textLength="400" lengthAdjust="spacingAndGlyphs" transform="skewX(-20)">
                  PATRIA COMO DESTINO
               </Text>
            </G>
         </Defs>
         <Use href="#sky" fill="#9ed3d5" />
         <Use href="#sky" fill="#24A6CC" scale="1, -1" origin={"505, 505"}/>
         <Use href="#sunset" fill="#fdf403" />
         <Use href="#sunset" fill="#FDF989" scale="1, -1" origin={"505, 505"} />
         <Use href="#book" />
         <Use href="#book" scale="1, -1"  origin={"505, 505"}/>
         <Use href="#desert" fill="black" />
         <Use href="#desert" fill="#C3C3C0" scale="1, -1" origin={"505, 505"} />

         <Circle r="500" cx="505" cy="505" fill="none" stroke="black" strokeWidth="10" />
         <Mask id="insideLetter">
            <Rect x="535" y="930" width="535" height="155" fill="white" />
            <Path d="M714 1008 L707 1002 L698 1002 L711 975 A7 7 0 0 1 722 982 Z" fill="black" stroke="none"/>
            <Circle cx="805" cy="1040" r="18" fill="black" stroke="none" />
            <Circle cx="826" cy="971" r="17" fill="black" stroke="none" />
         </Mask>         
         <Path 
            d="M570 930 A 6 21 0 0 1 570 950 L535 1050 A24 34 12 0 0 550 1085 H660 A12 12 0 0 0 671 1077 L683 1046 A18 13 0 0 0 698 1050 A4 7 0 0 1 699 1057 L695 1075 A12 12 0 0 0 702 1085 H1000 A57 55 0 0 0 1025 999 A33 18 0 0 1 1052 969 A25 21 0 0 0 1040 930 A64 69 0 0 0 988 1023 A16 16 0 0 1 974 1049 H946 A61 36 35 0 1 939 979 A36 32 0 0 0 968 930 A98 121 0 0 0 870 1047 A15 12 0 0 1 855 1049 A27 29 0 0 0 846 1012 V1007 A45 41 0 0 0 828 930 A45 41 0 0 0 788 950 L763 1050 A10 10 0 1 1 744 1042 L764 962 A45 44 0 0 0 679 956 L645 1051 A8.5 8.5 0 0 1 628 1046 L661 947 A6 21 0 0 0 666 930 H625 A6 21 0 0 0 626 939 L590 1040 A8 8 0 0 1 574 1040 L605 945 A6 21 0 0 0 610 930 Z" 
            fill="red" stroke="none" mask="url(#insideLetter)" 
         />
      </G>  
   );
}
export default UABCS;
