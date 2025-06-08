import { Path, G, Defs, Use, Rect, Pattern } from 'react-native-svg';
import React, {FC, memo} from 'react';

interface BackgroundProps {  
   width: number; height: number;
   colors: {color1: string; color2: string; color3: string;}
}

const Background: FC<BackgroundProps> = props => {
    let path1 = "M20 0 v12 L30 18 V0 Z m20 0 v12 l 10 6 v 12 L60 36 V 12 Z m -30 18 v 12 l 10 6 H30 v-6 z"
    //let path1 = "M20.001 0v11.998L30 18.046V0Zm19.998 0v11.998l10.002 6.051v11.995L60 36.043V11.998Zm-30 18.046v11.998l10.002 5.999H30v-5.999z"
    //let path2 = "M0 0v11.998L20.001 0Zm39.999 0L60 11.998V0ZM20.001 11.998 9.999 18.046 30 30.044l20.001-11.998-10.002-6.048L30 18.046ZM9.999 30.044 0 36.043h20.001zm40.002 0-10.002 5.999H60z"
    let path2 = "M0 0 v12 L20 0 Z m40 0 L60 12 V0 Z M 20 12 10 18 30 30 l20 -12 -10 -6 L30 18 Z M10 30 0 36 h20 z m40 0 -10 6 H60 z"
    
    return (
        <G>
            <Defs>
                <Pattern id={"background"} patternUnits="userSpaceOnUse" width = "60" height="36">
                    <Rect width="60" height="36" fill={props.colors.color1}/>
                    <Path d={path1} fill= {props.colors.color2} />
                    <Path d={path2} fill= {props.colors.color3}/>
                </Pattern>
            </Defs>
            <Rect fill="url(#background)" x="0" y="0" width={props.width} height={props.height}/>
        </G>
    )
}

export default memo(Background);
