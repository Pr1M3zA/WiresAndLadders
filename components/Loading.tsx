import { ActivityIndicator, View, Text, StyleSheet, Dimensions } from "react-native"
import Svg from "react-native-svg"
import UABCS from "@/components/UABCS"

const Loading = () => {
   const canvas_width = Dimensions.get('window').width;
	const canvas_height = Dimensions.get('window').height;

   return (
      <View style={styles.container}>
         <View style={styles.centeredLoading}>
            <ActivityIndicator style={{marginTop: 30}} size="large" color="#6599C3" />
            <Text style={styles.loadingText}>Cargando partida...</Text>
         </View>
			<View style={[styles.logo]}>
				<Svg width="100%" height="100%">
					<UABCS x = { (canvas_width - 210) / 2 } y = { (canvas_height - 250) /2 } scale={0.2}/>
				</Svg>
			</View>
      </View>
   )
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		//width: Platform.OS === "web" ? 400 : "100%",
		backgroundColor: 'white',
		alignItems: "center",
		justifyContent: "center",
		width: '100%',
		height: '100%',
	},
	logo: {
		width: Dimensions.get('window').width,
		height: Dimensions.get('window').height,
		top: 0,
		left: 0,
		position: 'absolute',
	},
	centeredLoading: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: 'white',
	},
	loadingText: {
		//marginTop: 10,
		paddingTop: 120,
		fontSize: 16,
		color: 'white',
		fontFamily: 'Manrope_600SemiBold',
	},
})

export default Loading;
