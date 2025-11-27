import { FC, use } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, TextInput } from 'react-native'
import { useContextProvider } from '@/utils/ContextProvider';

interface modalCfgApiProps  {
	isModalVisible: boolean,
	handleModalClose: () => void,
}

const ModalConfigAPI: FC<modalCfgApiProps> = (props) => {
	const {apiURL, socketURL, setApiURL, setSocketURL } = useContextProvider()
   return (
      <View>
         <Modal animationType="slide" transparent={true} visible={props.isModalVisible} onRequestClose={() => props.handleModalClose()}>
            <View style={styles.modalCenteredView}>
               <View style={styles.modalView}>
						<Text>API Base de Datos:</Text>
						<TextInput style={styles.fieldInput} value={apiURL} onChangeText={setApiURL} />
						<Text>API sockets:</Text>
						<TextInput style={styles.fieldInput} value={socketURL} onChangeText={setSocketURL}></TextInput>
						<TouchableOpacity style={styles.closeButton} onPress={() => props.handleModalClose()}>
							<Text style={styles.closeButtonText}>Sync DB</Text>
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
	fieldInput: {
		backgroundColor: '#FFFFFF',
		borderWidth: 1.3,
		borderStyle: 'solid',
		borderRadius: 10,
		paddingHorizontal: 10,
		fontFamily: 'Manrope_600SemiBold',
		color: '#365C80',
	},
 })


export default ModalConfigAPI;

