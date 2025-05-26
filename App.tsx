import { StatusBar } from 'expo-status-bar';
import { View , StyleSheet } from 'react-native';
import MainNavegator from './src/navigation/MainNavigation'

export default function App() {
  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <MainNavegator />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
