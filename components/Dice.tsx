import React, { FC, useState, useEffect } from 'react';
import Svg, { G, Polygon, Circle } from 'react-native-svg';
import Animated, {
    useSharedValue,
    useAnimatedProps,
    withTiming,
    withRepeat,
    cancelAnimation,
    Easing,
    runOnJS,
    useDerivedValue
} from 'react-native-reanimated';
import * as gameItems from '@/utils/gameitems.json';

type Point = { x: number; y: number };
interface diceProps {
    initialValue: number;
    onSpinComplete: (finalValue: number) => void;
    position: Point;
    scale: number;
    colors: { faceUpColor: string, faceLeftColor: string, faceRightColor: string, line: string, dots: string };
    lineWidth: number;
}

const AnimatedG = Animated.createAnimatedComponent(G);

const Dice: FC<diceProps> = (props) => {
    const [diceValue, setDiceValue] = useState(props.initialValue);
    const [diceRolling, setDiceRolling] = useState(false);
    const rotation = useSharedValue(0);
    const [diceDots, setDiceDots] = useState(gameItems.diceValues[diceValue - 1])

    useEffect(() => {
        setDiceDots(gameItems.diceValues[diceValue - 1])
    }, [diceValue]);

    const diceClicked = () => {
        if (!diceRolling) {
            setDiceRolling(true);
            rotation.value = withRepeat(
                withTiming(360, { duration: 500, easing: Easing.linear }),
                -1,
                false
            );
        } else {
            cancelAnimation(rotation);
            setDiceRolling(false);
            const newDiceValue = Math.floor(Math.random() * 6) + 1;
            setDiceValue(newDiceValue)
            rotation.value = 0;
            props.onSpinComplete(newDiceValue)
        }
    };

    const faceUp = "39,44, 0,22 39,0 78,22";
    const faceLeft = "39,44 0,22 0,70 39,92";
    const faceRight = "39,44 78,22 78,70 39,92";
    const centerX = 39;
    const centerY = 46;

    const animatedProps = useAnimatedProps(() => {
        return {
            transform: [
                { translateX: props.position.x + centerX },
                { translateY: props.position.y + centerY },
                { rotate: `${rotation.value}deg` },
                { translateX: -centerX },
                { translateY: -centerY },
                { scale: props.scale }
            ],
        };
    });

    useEffect(() => {
        return () => {
            cancelAnimation(rotation);
        };
    }, [rotation]);

    return (
        <AnimatedG animatedProps={animatedProps} onPressIn={diceClicked} >
            <Polygon points={faceUp} fill={props.colors.faceUpColor} stroke={props.colors.line} strokeWidth={props.lineWidth} />
            <Polygon points={faceLeft} fill={props.colors.faceLeftColor} stroke={props.colors.line} strokeWidth={props.lineWidth} />
            <Polygon points={faceRight} fill={props.colors.faceRightColor} stroke={props.colors.line} strokeWidth={props.lineWidth} />
            {diceDots.map((point, index) => (
                <Circle key={index} cx={point.x} cy={point.y} r={5} fill={diceRolling ? 'transparent' : props.colors.dots} />
            ))}
        </AnimatedG>
    );
}

export default Dice;