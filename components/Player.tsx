import React, { FC, useEffect } from 'react';
import { G, Path, Ellipse } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedProps, withTiming, Easing, runOnJS, cancelAnimation } from 'react-native-reanimated';

interface playerProps {
	playerId: number; // ID del jugador para identificarlo en el callback
	initialTile: number; //Casilla inicial del jugador    
	targetTile: number;
	scale: number;
	color: { fill: string, border: string, eyes: string };
	tilesCoords: { x: number, y: number }[]; // Array con las posiciones de todas las casillas
	onMoveComplete?: (finalIndex: number, playerId: number) => void; // Callback when animation sequence finishes

}
const AnimatedG = Animated.createAnimatedComponent(G);

const Player: FC<playerProps> = (props) => {
	const initialPos = props.tilesCoords[props.initialTile] || { x: 0, y: 0 };
	const animatedX = useSharedValue(initialPos.x);
	const animatedY = useSharedValue(initialPos.y);
	const currentTile = useSharedValue(props.initialTile);
	const isAnimating = useSharedValue(false);

	useEffect(() => {
		cancelAnimation(animatedX);
		cancelAnimation(animatedY);
		const fromTile = currentTile.value;
		const toTile = props.targetTile;


		if (fromTile === toTile) {
			const targetPos = props.tilesCoords[toTile];
			animatedX.value = targetPos.x;
			animatedY.value = targetPos.y;
			//if (props.onMoveComplete) runOnJS(props.onMoveComplete)(toTile);
			return;
		}


		const targetPos = props.tilesCoords[toTile];
		isAnimating.value = true; // Mark as animating

		animatedX.value = withTiming(targetPos.x - 10, { duration: 500, easing: Easing.linear });
		animatedY.value = withTiming(targetPos.y - 10, { duration: 500, easing: Easing.linear },
			(finished) => {
				'worklet';
				isAnimating.value = false; // Mark as not animating once done
				if (finished) {
					currentTile.value = toTile;
					if (props.onMoveComplete) runOnJS(props.onMoveComplete)(toTile, props.playerId);
				}
			}
		);
	}, [props.targetTile, props.onMoveComplete, props.playerId, props.tilesCoords]);

	const animatedGProps = useAnimatedProps(() => {
		return {
			transform: [
				{ translateX: animatedX.value },
				{ translateY: animatedY.value },
				{ scale: props.scale },
			],
		};
	});

	return (
		<AnimatedG animatedProps={animatedGProps}>
			<Path d="M18.7 42.2 C19.5 40.2 22.3 40.1 23.2 42 L23.3 42.2 L38.4 78.8 C39 80.4 37.8 82.2 36 82.2 H5.9 C4.2 82.2 3 80.5 3.6 78.9 L3.6 78.8 L18.7 42.2 Z" fill={props.color.fill} stroke={props.color.border} strokeWidth={5} />
			<Ellipse cx="23" cy="23" rx="21" ry="20" fill={props.color.fill} stroke={props.color.border} strokeWidth={5} strokeLinecap='round' strokeLinejoin='round' />
			<Ellipse rx="3" ry="5" cx="16" cy="16" fill={props.color.eyes} />
			<Ellipse rx="3" ry="5" cx="29" cy="16" fill={props.color.eyes} />
		</AnimatedG>
	);
}

export default Player