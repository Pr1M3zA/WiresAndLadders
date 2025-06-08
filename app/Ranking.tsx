import { useState } from 'react';
import { Dimensions } from 'react-native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import topWinsRanking from '@/components/TopWinsRanking';
import topPointsRanking from '@/components/TopPointsRanking';


export default function Ranking() {
	const { width, height } = Dimensions.get('window');
	const [index, setIndex] = useState(0);

	const renderScene = SceneMap({
		wins: topWinsRanking,
		points: topPointsRanking,
	});
	const routes = [
		{ key: 'wins', title: 'Top Ganadores' },
		{ key: 'points', title: 'Top mayor puntaje' },
	];

	return (
		<TabView
			style={{ flex: 1, backgroundColor: 'white', marginTop: 50 }}
			navigationState={{ index, routes }}
			renderScene={renderScene}
			onIndexChange={setIndex}
			initialLayout={{ width: width }}
			renderTabBar={props =>
				<TabBar
					{...props}
					activeColor={'steelblue'}
    				inactiveColor={'lightgray'}
					indicatorStyle={{backgroundColor: 'red' }}
					style={{ backgroundColor: 'white' }}
				/>
			}
		/>
	)
}

