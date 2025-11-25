import { FC, memo } from 'react';
import { G, Path, Text as SvgText, ForeignObject, Polygon, Line } from 'react-native-svg';
import Hexagon from "./Hexagon";
import { useContextProvider } from '@/utils/ContextProvider';
import type { TileType } from '@/utils/types';

const HexTile: FC<TileType> = (props) => {
	const { tileTypes } = useContextProvider(); 
	const sqrt = Math.sqrt(3) * props.radius / 2
	return (
		<G x={props.pos_x} y={props.pos_y} >
			<Hexagon
				pos={{ x: 0, y: 0 }}
				radius={props.radius}
				rotation={props.rotation}
				colors={{fill: tileTypes[props.tile_type].color_fill, border: tileTypes[props.tile_type].color_border}}
				borderWidth={props.border_width}
			/>
			<Path 
				d={tileTypes[props.tile_type].path1} 
				fill={tileTypes[props.tile_type].color_path1} fillRule='evenodd' clipRule='evenodd' 
				scale={tileTypes[props.tile_type].paths_scale} x={tileTypes[props.tile_type].paths_x} y={tileTypes[props.tile_type].paths_y} 
			/>
			<Path 
				d={tileTypes[props.tile_type].path2} 
				fill={tileTypes[props.tile_type].color_path2} fillRule='evenodd' clipRule='evenodd' 
				scale={tileTypes[props.tile_type].paths_scale} x={tileTypes[props.tile_type].paths_x} y={tileTypes[props.tile_type].paths_y} 
			/>
			<SvgText x={0} y={-props.radius/3} textAnchor='middle' fontFamily='Jomhuria_400Regular' fontSize={30} fill='white' >{props.num_tile}</SvgText>
			{props.direction !==0 && ( 
				<G rotation={-props.direction}>
					<Polygon
						points={`0 ${-props.radius/4} ${-props.radius/4} 0 ${props.radius/4} 0`}
						fill={tileTypes[props.tile_type].color_border}
						stroke={tileTypes[props.tile_type].color_fill}
						strokeWidth={1}
						x={sqrt-props.border_width}
						rotation={90}
					/>			
				</G>
			)}
		</G>
	);
}

export default memo(HexTile)