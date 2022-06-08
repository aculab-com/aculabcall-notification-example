import 'react-native-gesture-handler';
import React, { useState, useContext } from 'react';
import { View, Text, TextInput, ScrollView } from 'react-native';
import { styles, COLOURS } from './styles';
import { MenuButton } from './components/MenuButton';
import { deleteSpaces } from 'react-native-aculab-client';
import { AuthContext } from './App';

/**
 * Registration screen
 * @returns view
 */
export const RegisterScreen = () => {
  const [registerClientId, setRegisterClientId] = useState('');

  const { signUp } = useContext(AuthContext);

  return (
    <ScrollView style={styles.container}>
      <View style={[styles.registerContainer]}>
        <Text style={styles.basicText}>Register Client ID</Text>
        <TextInput
          style={styles.input}
          placeholder={'example: anna123'}
          placeholderTextColor={COLOURS.INPUT_PLACEHOLDER}
          onChangeText={(text) => setRegisterClientId(deleteSpaces(text))}
          value={registerClientId}
        />
        <MenuButton
          title={'Register'}
          onPress={() => signUp(registerClientId)}
        />
      </View>
    </ScrollView>
  );
};
