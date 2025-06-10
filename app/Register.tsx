import type { PutBlobResult } from '@vercel/blob';

import Icon from '@expo/vector-icons/Feather';
import * as FileSystem from 'expo-file-system';
import * as ImgPicker from 'expo-image-picker';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, TextInput, TouchableOpacity, View, Platform } from 'react-native';
import BottomDesign from '@/components/BottomDesign';
import Toast from 'react-native-toast-message';
//import Gato from '@/assets/images/GatoSalvaje.jpg';
import { useContextProvider } from '@/utils/ContextProvider'

const Gato = require('./../assets/images/GatoSalvaje.jpg');
const IMAGE_SIZE_LIMIT = 4500000;

export default function Register() {
	const router = useRouter();
	const params = useLocalSearchParams<{ mode: string }>();
	const editMode = params.mode === 'edit';

	const { apiURL, token } = useContextProvider();
	const [userName, setUserName] = useState('');
	const [firstName, setFirstName] = useState('');
	const [lastName, setLastName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [isPasswordVisible, setIsPasswordVisible] = useState(false);
	const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
	const [image, setImage] = useState(Platform.OS === 'web' ? Gato : Image.resolveAssetSource(Gato).uri);
	const [status, requestPermission] = ImgPicker.useMediaLibraryPermissions();
	const [loading, setLoading] = useState(false);
	const [errUserName, setErrUserName] = useState('');
	const [errFirstName, setErrFirstName] = useState('');
	const [errLastName, setErrLastName] = useState('');
	const [errEmail, setErrEmail] = useState('');
	const [errPassword, setErrPassword] = useState('');
	const [errConfirmPassword, setErrConfirmPassword] = useState('');
	const [activeButton, setActiveButton] = useState(true);

	useEffect(() => {
		if (editMode)   // Leer datos actuales del usuario
			getUserData();
	}, []);

	const getUserData = async () => {
		setLoading(true);
		await fetch(apiURL + '/user', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'authorization': token
			},
		})
			.then(response => response.json())
			.then(data => {
				setUserName(data.userRow[0].username);
				setFirstName(data.userRow[0].first_name)
				setLastName(data.userRow[0].last_name)
				setEmail(data.userRow[0].email)
				if (data.userRow[0].profile_image != null)
					setImage('data:image/png;base64,' + data.userRow[0].profile_image)
			})
			.catch(error => {
				Toast.show({ type: 'error', text1: "Error", text2: error, position: 'top', visibilityTime: 3000 })
			});
		setLoading(false);
	}

	const addUser = async () => {
		setLoading(true);
		let sizeOk = true;
		let base64img = null;
		if (image != (Platform.OS === 'web' ? Gato : Image.resolveAssetSource(Gato).uri)) {
			base64img = await FileSystem.readAsStringAsync(image, { encoding: FileSystem.EncodingType.Base64 });
			sizeOk = base64img.length < IMAGE_SIZE_LIMIT;
		}
		if (sizeOk) {
			await fetch(apiURL + '/user', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					username: userName,
					first_name: firstName,
					last_name: lastName,
					email: email,
					password: password,
					profile_image: base64img,
				}),
			})
				.then(response => response.json())
				.then(data => {
					if (data.hasOwnProperty('affectedRows') && data.affectedRows == 1) {
						Toast.show({ type: 'success', text1: 'Correcto', text2: `Usuario creado con exito`, position: 'top', visibilityTime: 3000 });
						router.back();
					}
					if (data.hasOwnProperty('message'))
						Toast.show({ type: 'error', text1: 'API Error', text2: data.message, position: 'top', visibilityTime: 3000 });
				})
				.catch(error => {
					console.log(error)
					Toast.show({ type: 'error', text1: 'Error', text2: error.message, position: 'top', visibilityTime: 3000 });
				});

		}
		else {
			Toast.show({ type: 'error', text1: 'Imagen no soportada', text2: 'La imagen de perfil es muy grande.. eliga otra', position: 'top', visibilityTime: 3000 });
		}
		setLoading(false);
	}

	const updateUser = async () => {
		console.log("Update user")
		setLoading(true);
		let base64img = null;
		if (image != Image.resolveAssetSource(Gato).uri)
			base64img = await FileSystem.readAsStringAsync(image, { encoding: FileSystem.EncodingType.Base64 });
		await fetch(apiURL + '/user', {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				'authorization': token
			},
			body: JSON.stringify({
				//username: userName,
				first_name: firstName,
				last_name: lastName,
				//email: email,
				password: password,
				profile_image: base64img,
			}),
		})
			.then(response => response.json())
			.then(data => {
				console.log(data)
				if (data.hasOwnProperty('message'))
					Toast.show({ type: 'error', text1: 'Error', text2: data.message, position: 'top', visibilityTime: 3000 });
				if (data.hasOwnProperty('affectedRows') && data.affectedRows == 1)
					Toast.show({ type: 'success', text1: 'Correcto', text2: `Usuario actualizado con éxito`, position: 'top', visibilityTime: 3000 });
			})
			.catch(error => {
				console.log(error)
				Toast.show({ type: 'error', text1: 'Error', text2: `${error}`, position: 'top', visibilityTime: 3000 });
			});
		setLoading(false);
	}
	const validateUserName = () => {
		setUserName(prev => prev.trim())
		if (userName.length === 0)
			setErrUserName('El nombre de usuario es requerido');
		else if (userName.length > 25)
			setErrUserName('El nombre de usuario no puede tener más de 25 caracteres');
		else {
			const regex = /^[a-zA-Z0-9_-]+$/;
			if (!regex.test(userName))
				setErrUserName('El nombre de usuario solo puede contener letras, números, - y _');
			else
				setErrUserName('');
		}
	}

	const validateFirstName = () => {
		setFirstName(prev => prev.trim())
		if (firstName.length === 0)
			setErrFirstName('El nombre es requerido');
		else if (firstName.length > 30)
			setErrFirstName('El nombre no puede tener más de 30 caracteres');
		else {
			const regex = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s]+$/;
			if (!regex.test(firstName))
				setErrFirstName('El nombre solo puede contener letras y espacios');
			else
				setErrFirstName('');
		}
	}

	const validateLastName = () => {
		setLastName(prev => prev.trim())
		if (lastName.length === 0)
			setErrLastName('El apellido es requerido');
		else if (lastName.length > 30)
			setErrLastName('El apellido no puede tener más de 30 caracteres');
		else {
			const regex = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s]+$/;
			if (!regex.test(lastName))
				setErrLastName('El apellido solo puede contener letras y espacios');
			else
				setErrLastName('');
		}
	}

	const validateEmail = () => {
		setEmail(prev => prev.trim())
		if (email.length === 0)
			setErrEmail('El correo electrónico es requerido');
		else if (email.length > 100)
			setErrEmail('El correo electrónico no puede tener más de 50 caracteres');
		else {
			const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
			if (!regex.test(email))
				setErrEmail('El correo electrónico no es válido');
			else
				setErrEmail('');
		}
	}

	const validatePassword = () => {
		setPassword(prev => prev.trim())
		if (password.length === 0)
			setErrPassword('La contraseña es requerida');
		else if (password.length < 8)
			setErrPassword('La contraseña debe tener al menos 8 caracteres');
		else if (password.length > 20)
			setErrPassword('La contraseña no puede tener más de 20 caracteres');
		else {
			const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
			if (!regex.test(password))
				setErrPassword('La contraseña debe contener al menos una letra mayúscula, una letra minúscula y un número');
			else
				setErrPassword('');
		}
	}

	const validateConfirmPassword = () => {
		if (confirmPassword.length === 0)
			setErrConfirmPassword('La confirmación de la contraseña es requerida');
		else if (confirmPassword !== password)
			setErrConfirmPassword('Las contraseñas no coinciden');
		else
			setErrConfirmPassword('');
	}

	useEffect(() => {
		if (status === null) requestPermission();
	}, []);

	const pickImage = async (from: 'gallery' | 'camera') => {
		let result: ImgPicker.ImagePickerResult | undefined;
		if (from === 'gallery') {
			result = await ImgPicker.launchImageLibraryAsync({
				mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 1,
			});
		} else {
			result = await ImgPicker.launchCameraAsync({
				allowsEditing: true, aspect: [1, 1], quality: 1,
			});
		}
		if (!result.canceled)
			setImage(result.assets[0].uri);
	};

	useEffect(() => {
		console.log(`${errUserName} ${errFirstName} ${errLastName} ${errEmail} ${errPassword} ${errConfirmPassword} ${editMode}`)
		if (errUserName.length == 0 && errFirstName.length == 0 && errLastName.length == 0 && errEmail.length == 0 && (editMode || errPassword.length == 0) && (editMode || errConfirmPassword.length == 0)) {
			console.log('Sin errores')
			setActiveButton(true);
		}
		else
			setActiveButton(false);
	}, [errUserName, errFirstName, errLastName, errEmail, errPassword, errConfirmPassword, editMode]);

	return (
		<View style={styles.container}>
			<View style={styles.topBarContainer}></View>
			<View style={styles.topContainer}>
				<View style={styles.backContainer}>
					<TouchableOpacity onPress={() => router.back()} style={{ padding: 10 }}>
						<Icon name='arrow-left' size={40} color={'#6599C3'} />
					</TouchableOpacity>
				</View>
				<View style={styles.profileContainer}>
					<TouchableOpacity onPress={() => pickImage('gallery')} onLongPress={() => pickImage('camera')}>
						{image && <Image source={{ uri: image }} style={styles.profileImage} />}
					</TouchableOpacity>
				</View>
				<View style={styles.emptyContainer}></View>
			</View>
			<View style={styles.fieldsContainer}>
				<View>
					<TextInput placeholder="Nombre de usuario" placeholderTextColor={'#365C80'} value={userName} onChangeText={setUserName} onEndEditing={validateUserName} editable={!editMode}
						style={[styles.fieldInput, userName.length > 0 ? styles.fieldFilled : styles.fieldEmpty, errUserName.length == 0 ? styles.fieldOk : styles.fieldError]} />
					<Text style={styles.errText}>{errUserName}</Text>
				</View>

				<View>
					<TextInput placeholder="Nombre(s)" placeholderTextColor={'#365C80'} value={firstName} onChangeText={setFirstName} onEndEditing={validateFirstName}
						style={[styles.fieldInput, firstName.length > 0 ? styles.fieldFilled : styles.fieldEmpty, errFirstName.length == 0 ? styles.fieldOk : styles.fieldError]} />
					<Text style={styles.errText}>{errFirstName}</Text>
				</View>

				<View>
					<TextInput placeholder="Apellido(s)" placeholderTextColor={'#365C80'} value={lastName} onChangeText={setLastName} onEndEditing={validateLastName}
						style={[styles.fieldInput, lastName.length > 0 ? styles.fieldFilled : styles.fieldEmpty, errLastName.length == 0 ? styles.fieldOk : styles.fieldError]} />
					<Text style={styles.errText}>{errLastName}</Text>
				</View>

				<View>
					<TextInput placeholder="Correo electrónico" placeholderTextColor={'#365C80'} value={email} onChangeText={setEmail} onEndEditing={validateEmail} editable={!editMode}
						style={[styles.fieldInput, email.length > 0 ? styles.fieldFilled : styles.fieldEmpty, errEmail.length == 0 ? styles.fieldOk : styles.fieldError]} />
					<Text style={styles.errText}>{errEmail}</Text>
				</View>

				<View>
					<View style={[styles.fieldInput, styles.fieldPassword, errPassword.length == 0 ? styles.fieldOk : styles.fieldError]}>
						<TextInput secureTextEntry={!isPasswordVisible} placeholder="Contraseña" placeholderTextColor={'#365C80'} value={password} onChangeText={setPassword} onEndEditing={validatePassword}
							style={[{ flex: 1 }, password.length > 0 ? styles.fieldFilled : styles.fieldEmpty]} />
						<TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
							<Icon name={isPasswordVisible ? 'eye-off' : 'eye'} size={24} color={'#6599C3'} />
						</TouchableOpacity>
					</View>
					<Text style={styles.errText}>{errPassword}</Text>
				</View>

				<View>
					<View style={[styles.fieldInput, styles.fieldPassword, errConfirmPassword.length == 0 ? styles.fieldOk : styles.fieldError]}>
						<TextInput secureTextEntry={!isConfirmPasswordVisible} placeholder="Confirma tu contraseña" placeholderTextColor={'#365C80'} value={confirmPassword} onChangeText={setConfirmPassword} onEndEditing={validateConfirmPassword}
							style={[{ flex: 1 }, confirmPassword.length > 0 ? styles.fieldFilled : styles.fieldEmpty]} />
						<TouchableOpacity onPress={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}>
							<Icon name={isConfirmPasswordVisible ? 'eye-off' : 'eye'} size={24} color={'#6599C3'} />
						</TouchableOpacity>
					</View>
					<Text style={styles.errText}>{errConfirmPassword}</Text>
				</View>
			</View>
			<View style={styles.buttonContainer}>
				{loading && (<ActivityIndicator size='large' color="#6599C3" />)}
				{!loading && (<TouchableOpacity style={styles.registerButton} onPress={editMode ? updateUser : addUser} disabled={!activeButton}>
					<Text style={styles.registerText}>{editMode ? 'Actualizar' : 'Crear cuenta'}</Text>
				</TouchableOpacity>)}
			</View>

			<BottomDesign allowRanking={false} />

		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		//alignItems: 'center',
		backgroundColor: '#6599C3'
	},
	topBarContainer: {
		flex: 5,
		backgroundColor: 'white'
	},
	topContainer: {
		flex: 15,
		flexDirection: 'row',
		backgroundColor: '#FFFFFF'
	},
	fieldsContainer: {
		flex: 50,
		paddingHorizontal: '7%',
		justifyContent: 'space-evenly',
		backgroundColor: '#FFFFFF'
	},
	buttonContainer: {
		flex: 5,
		paddingHorizontal: '10%',
		justifyContent: 'flex-start',
		gap: 50,
		backgroundColor: '#FFFFFF'
	},
	backContainer: {
		flex: 15
	},
	profileContainer: {
		flex: 70,
		alignItems: 'center',
	},
	profileImage: {
		width: 100,
		height: 100,
		borderRadius: 50,
		borderWidth: 2,
		borderColor: '#294270',
	},
	emptyContainer: {
		flex: 15
	},
	fieldInput: {
		backgroundColor: '#FFFFFF',
		borderWidth: 1.3,
		borderStyle: 'solid',
		borderRadius: 10,
		paddingHorizontal: 10,
	},
	fieldFilled: {
		fontFamily: 'Manrope_600SemiBold',
		color: '#365C80',
	},
	fieldEmpty: {
		fontFamily: 'Manrope_400Regular'
	},
	fieldPassword: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	fieldOk: {
		borderColor: '#294270',
	},
	fieldError: {
		borderColor: '#B05151'
	},
	registerButton: {
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#6599c3',
		borderRadius: 10,
		paddingBottom: 5,
		borderColor: '#6599C3',
		borderWidth: 2,
	},
	registerText: {
		fontSize: 18,
		color: '#FFFFFF',
		fontFamily: 'Manrope_800ExtraBold'
	},
	errText: {
		fontSize: 11,
		color: '#B05151',
		alignSelf: 'flex-start',
		marginLeft: 10,
		marginTop: 5
	}
})


