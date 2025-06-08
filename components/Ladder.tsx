import {FC, memo} from 'react';
import { Defs, Use, G, Circle, Rect } from 'react-native-svg'

type Point = { x: number; y: number };
interface ladderProps {
    from: Point; to: Point;
    scale: number,
    color: { rung: string; base: string; }
}

const Ladder: FC<ladderProps> = (props) => {
    function getAngle( from: Point, to: Point  ) {
        return -90-(Math.atan(-(to.y - from.y) / (to.x - from.x)) * (180 / Math.PI)) + ((to.x - from.x) < 0 ? 180 : 0)
    }
    const length = Math.sqrt((props.to.x - props.from.x) ** 2 + (props.to.y - props.from.y) ** 2);
    const virtualTo:Point = { x: props.from.x, y: props.from.y + length };
    
    let ladderRungs = [15]
    for(let i=40; i < length-15; i += 25) {
        ladderRungs.push(i)
    }

    return (
        <G x={props.from.x-27.5} y={props.from.y} rotation={getAngle(props.from, props.to)}  scale={props.scale} originX={27.5}  fillOpacity={0.5}>
            <Circle cx="11.5" cy="5" r="5" fill={props.color.base} />
            <Circle cx="11.5" cy={length-5} r="5" fill={props.color.base} />
            <Rect x="6.5" y="5" width="10" height={length-10}  fill={props.color.base} />

            <Circle cx="43.5" cy="5" r="5" fill={props.color.base} />
            <Circle cx="43.5" cy={length-5} r="5" fill={props.color.base} />
            <Rect x="38.5" y="5" width="10" height={length-10}  fill={props.color.base} />

            <Defs>
                <G id='rung'>
                    <Circle cx="5" cy="5" r="5" fill={props.color.rung} />
                    <Circle cx="50" cy="5" r="5" fill={props.color.rung} />
                    <Rect x="5" y="0" width="45" height="10" fill={props.color.rung} />
                    <Circle cx="11.5" cy="5" r="1.5" fill={props.color.base} />
                    <Circle cx="43.5" cy="5" r="1.5" fill={props.color.base} />
                </G>
            </Defs>
            {ladderRungs.map((point, index) => {
               return (
                  <Use key={index} href="#rung" y={point} />
               );
            })}
        </G>
    );
};

export default memo(Ladder);