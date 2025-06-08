import React, {FC, memo} from 'react';
import { Path, Rect, G, Defs, Pattern, Circle } from 'react-native-svg';

type Point = { x: number; y: number };
interface wireProps {
	from: Point; to: Point; 
	width: number;
	scaleColor: { fill: string; border: string; }
}

const Wire: React.FC<wireProps> = (props) => {
	function getAngle(from: Point, to: Point) {
		return -90 - (Math.atan(-(to.y - from.y) / (to.x - from.x)) * (180 / Math.PI)) + ((to.x - from.x) < 0 ? 180 : 0)
	}
	function getSnakePath(head: Point, queue: Point) {
		const snakeLength = queue.y - head.y
		const segments = Math.round(snakeLength / 250)
		const segmentLength = snakeLength / segments;
		let path = `M${head.x},${head.y}`
		for(let segment = 0; segment < segments; segment++) {
			const middle:Point = {x: head.x, y: head.y + segment*segmentLength + segmentLength / 2};
			const curveRef:Point = {x: head.x - (Math.sqrt((segmentLength/2) ** 2 - (segmentLength/4) ** 2)), y: head.y + (segment*segmentLength) + segmentLength / 4}
			path += ` Q${curveRef.x}, ${curveRef.y} ${middle.x},${middle.y} T${middle.x},${head.y + (segment*segmentLength) + segmentLength}`
		}
		//console.log(`segment Lenght: ${segmentLength}, segments: ${segments}`);
		return path;
	}

	const length = Math.sqrt((props.to.x - props.from.x) ** 2 + (props.to.y - props.from.y) ** 2);

	const virtualTo:Point = { x: props.from.x, y: props.from.y + length };


	return (
		<G>
			<G rotation={getAngle(props.from, props.to)} originX={props.from.x} originY={props.from.y}  >
				<Defs>
					<Pattern id="escamas" patternUnits="userSpaceOnUse" width="40" height="30">
						<Rect width="40" height="30" fill={props.scaleColor.fill} fillOpacity="0.4" />
						<Path fill="none" stroke={props.scaleColor.border} stroke-width="1"
							d="M-10-10A10 10 0 0 0-20 0a10 10 0 0 0 10 10A10 10 0 0 1 0 0a10 10 0 0 0-10-10zm20 0A10 10 0 0 0 0 0a10 10 0 0 1 10 10A10 10 0 0 1 20 0a10 10 0 0 0-10-10zm20 0A10 10 0 0 0 20 0a10 10 0 0 1 10 10A10 10 0 0 1 40 0a10 10 0 0 0-10-10zm-40 20a10 10 0 0 0-10 10 10 10 0 0 0 10 10A10 10 0 0 1 0 20a10 10 0 0 0-10-10zm20 0A10 10 0 0 0 0 20a10 10 0 0 1 10 10 10 10 0 0 1 10-10 10 10 0 0 0-10-10zm20 0a10 10 0 0 0-10 10 10 10 0 0 1 10 10 10 10 0 0 1 10-10 10 10 0 0 0-10-10z"
						/>
					</Pattern>
				</Defs>
				<Path d={getSnakePath(props.from, virtualTo)} stroke="url(#escamas)" fill="none"  strokeWidth={props.width} />
				{/* snake head */}
				<G originX={props.from.x} originY={props.from.y} rotation={55}>
					<Rect x={props.from.x - 10} y={props.from.y} width={20} height={10} fill='white' stroke='black' strokeWidth={2} />
					<Rect x={props.from.x - 15} y={props.from.y+10} width={30} height={30} />
				</G>
				{/* snake queue */}
				<G originX={virtualTo.x} originY={virtualTo.y} rotation={55}>
					<Rect x={virtualTo.x - 10} y={virtualTo.y-10} width={20} height={10} fill='white' stroke='black' strokeWidth={2} />
					<Rect x={virtualTo.x - 15} y={virtualTo.y - 40} width={30} height={30} />
				</G>
			</G>
		</G>
	);
};
export default memo(Wire);
