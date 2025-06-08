import { FC } from 'react'
import { View, Text, Modal, StyleSheet, TouchableOpacity, Dimensions } from 'react-native'


interface modalProps {
	educationItem: {
		Generation: number;
		Theme: string;
		Information: string;
		Question: string;
		Answer_1: string;
		Answer_2: string;
		Answer_3: string;
		Answer_4: string;
		Answer_Ok: number;
	} | null,
	modalType: 'Informativo' | 'Pregunta' | null,
	isModalVisible: boolean,
	handleModalClose: () => void,
	handleAnswer: (selectedAnswer: number) => void,
}

const ModalEducation: FC<modalProps> = (props) => {
	return (
		<View>
			<Modal animationType="slide" transparent={true} visible={props.isModalVisible} onRequestClose={props.handleModalClose}>
				<View style={styles.modalCenteredView}>
					<View style={styles.modalView}>
						{props.educationItem && (
							<>
								<Text style={styles.modalTextStrong}>Generación: {props.educationItem.Generation}</Text>
								<Text style={styles.modalTextStrong}>Tema: {props.educationItem.Theme}</Text>
								<View style={styles.separator} />

								{props.modalType === 'Informativo' && (
									<Text style={styles.modalText}>{props.educationItem.Information}</Text>
								)}

								{props.modalType === 'Pregunta' && (
									<>
										<Text style={styles.modalTextQuestion}>{props.educationItem.Question}</Text>
										<View style={styles.modalButtonContainer}>
											<TouchableOpacity style={[styles.modalButton, styles.modalButtonOption]} onPress={() => props.handleAnswer(1)} >
												<Text style={styles.modalButtonText}>{props.educationItem.Answer_1}</Text>
											</TouchableOpacity>
											<TouchableOpacity style={[styles.modalButton, styles.modalButtonOption]} onPress={() => props.handleAnswer(2)} >
												<Text style={styles.modalButtonText}>{props.educationItem.Answer_2}</Text>
											</TouchableOpacity>
										</View>
										<View style={styles.modalButtonContainer}>
											<TouchableOpacity style={[styles.modalButton, styles.modalButtonOption]} onPress={() => props.handleAnswer(3)} >
												<Text style={styles.modalButtonText}>{props.educationItem.Answer_3}</Text>
											</TouchableOpacity>
											<TouchableOpacity style={[styles.modalButton, styles.modalButtonOption]} onPress={() => props.handleAnswer(4)} >
												<Text style={styles.modalButtonText}>{props.educationItem.Answer_4}</Text>
											</TouchableOpacity>
										</View>
									</>
								)}
							</>
						)}
						{/* Common close button if not a question (question is handled by answer buttons) */}
						{props.modalType === 'Informativo' && (
							<TouchableOpacity style={[styles.modalButton, styles.modalButtonClose]} onPress={props.handleModalClose} >
								<Text style={styles.modalButtonText}>Cerrar</Text>
							</TouchableOpacity>
						)}
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
		//borderColor: 'red',
		//borderWidth: 5,
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
		//borderColor: 'blue',
		//borderWidth: 4,

	},
	modalText: {
		marginBottom: 15,
		textAlign: "center",
		fontFamily: 'Manrope_400Regular',
		fontSize: 16,
	},
	modalTextStrong: {
		marginBottom: 5,
		textAlign: "center",
		fontFamily: 'Manrope_700Bold',
		fontSize: 18,
		color: '#365C80',
	},
	modalTextQuestion: {
		marginBottom: 20,
		textAlign: "center",
		fontFamily: 'Manrope_600SemiBold',
		fontSize: 17,
		color: '#333',
	},
	separator: {
		height: 1,
		width: '80%',
		backgroundColor: '#ccc',
		marginVertical: 15,
	},
	modalButtonContainer: {
		flexDirection: 'row',
		justifyContent: 'space-around',
		width: '100%',
		marginTop: 10,
	},
	modalButton: {
		borderRadius: 10,
		padding: 10,
		//paddingHorizontal: 10,
		elevation: 2,
		minWidth: 100, 
		width: Dimensions.get('window').width * 0.4,
		maxWidth: Dimensions.get('window').width * 0.4,
		alignItems: 'center',
		justifyContent: 'center',
		//marginHorizontal: 5, // Added margin
	},
	modalButtonOption: { 
		backgroundColor: "#007bff", 
	},
	modalButtonClose: {
		backgroundColor: "#6c757d",
		marginTop: 20, // Increased margin
	},
	modalButtonText: {
		color: "white",
		fontWeight: "bold",
		textAlign: "center",
		fontFamily: 'Manrope_700Bold',
		fontSize: 16, // Increased font size
	},
})

export default ModalEducation;