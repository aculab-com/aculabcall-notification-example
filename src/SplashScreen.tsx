import 'react-native-gesture-handler';
import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { styles } from './styles';

/**
 * Splash screen
 * @returns view
 */
export const SplashScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={[styles.registerContainer]}>
        <Text style={styles.basicText}>Loading ...</Text>
        <Text style={styles.basicText}>Checking out</Text>
      </View>
    </ScrollView>
  );
};
