import { FC, useState, useCallback, useRef, useEffect } from 'react'
import { View, Text, Modal, StyleSheet, TouchableOpacity, Dimensions } from 'react-native'
import Animated from 'react-native-reanimated';
import Svg from 'react-native-svg';
import Icon from '@expo/vector-icons/Feather';
import Slider from '@react-native-community/slider';
import Dice from '@/components/Dice';
import type { DiceType } from '@/utils/types';

interface modalCfgProps {
	isModalVisible: boolean,
   currVolEffects: number,
   currVolMusic: number,
	currIdxDice: number,
	dices: DiceType[],
	handleModalClose: (volEffects: number, volMusic: number, idxDice: number) => void,
}

const ModalConfig: FC<modalCfgProps> = (props) => {
   const [volEffects, setVolEffects] = useState(props.currVolEffects);
   const [volMusic, setVolMusic] = useState(props.currVolMusic);
	const [idxDice, setIdxDice] = useState(props.currIdxDice);
	const handleDiceSpinComplete = useCallback((diceValue: number) => { }, [])

	const prevDice = () => {
		setIdxDice(idxDice === 0 ? props.dices.length-1 : idxDice-1);
	}

	const nextDice = () => {
		setIdxDice((idxDice + 1) % props.dices.length)
	}

	return (
      <View>
         <Modal animationType="slide" transparent={true} visible={props.isModalVisible} onRequestClose={() => props.handleModalClose(volEffects, volMusic, idxDice)}>
            <View style={styles.modalCenteredView}>
               <View style={styles.modalView}>
                  <Text>Volumen de la música:</Text>
                  <Slider
                     style={{ width: 200, height: 40 }}
                     minimumValue={0} maximumValue={1} step={0.01} 
                     value={volMusic} 
                     onValueChange={(value) => setVolMusic(value)} 
                     minimumTrackTintColor="#FFFFFF" maximumTrackTintColor="#000000"
                  />
                  <Text>Volumen de los efectos:</Text>
                  <Slider
                     style={{ width: 200, height: 40 }}
                     minimumValue={0} maximumValue={1} step={0.01} 
                     value={volEffects} 
                     onValueChange={(value) => setVolEffects(value)} 
                     minimumTrackTintColor="#FFFFFF" maximumTrackTintColor="#000000"
                  />
						<Text>Selecciona tu estilo de dado:</Text>
						<View style={styles.diceSelContainer}>
							<View style={{alignItems: 'flex-end', justifyContent: 'center'}}>
								<TouchableOpacity onPress={prevDice}>
									<Icon name='arrow-left-circle' size={40} color={'#6599C3'} />
								</TouchableOpacity>
							</View>
							<View style={{width: '40%', height: '100%'}}>
								<Text style={{textAlign: 'center'}}>{props.dices[idxDice].dice_name}</Text>
								<Animated.View>
									<Svg width="100%" height={100}>
										<Dice 
											initialValue={1} 
											onSpinComplete={handleDiceSpinComplete} 
											position={{ x: 20, y: 0 }}
											scale={props.dices[idxDice].scale} lineWidth={props.dices[idxDice].border_width}
											colors={{ faceUpColor: props.dices[idxDice].color_faceup, faceLeftColor: props.dices[idxDice].color_faceleft, faceRightColor: props.dices[idxDice].color_faceright, line: props.dices[idxDice].color_border, dots: props.dices[idxDice].color_dots }}
											isAnimated={true}
										/>
									</Svg>
								</Animated.View>
							</View>
							<View style={{alignItems: 'flex-start', justifyContent: 'center'}}>
								<TouchableOpacity onPress={nextDice}>
									<Icon name='arrow-right-circle' size={40} color={'#6599C3'} />
								</TouchableOpacity>
							</View>
						</View>
                  <TouchableOpacity style={styles.closeButton} onPress={() => props.handleModalClose(volEffects, volMusic, idxDice)}>
                     <Text style={styles.closeButtonText}>Aplicar</Text>
                  </TouchableOpacity>
               </View>
            </View> 
         </Modal>
      </View>
   )
}

const styles = StyleSheet.create({
	modalCenteredView: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: 'rgba(0,0,0,0.5)',
	},
	modalView: {
		margin: 20,
		backgroundColor: "lightsteelblue",
		borderRadius: 20,
		padding: 15,
		alignItems: "center",
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2
		},
		shadowOpacity: 0.25,
		shadowRadius: 4,
		elevation: 5,
		width: '90%', 
	},
	closeButton: {
		backgroundColor: '#6599C3',
		borderRadius: 10,
		paddingVertical: 12, // Más padding
		paddingHorizontal: 25, // Más padding
		elevation: 2,
		marginTop: 25, // Más espacio
	},
	closeButtonText: {
		color: 'white',
		fontWeight: 'bold',
		textAlign: 'center',
		fontSize: 16,
	},
	diceSelContainer: {
		flexDirection: 'row'
	}
 })

 export default ModalConfig;
