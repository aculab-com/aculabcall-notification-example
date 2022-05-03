import 'react-native-gesture-handler';
import React, {useState} from 'react';
import {View, Text, TextInput, ScrollView, Platform} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {styles, COLOURS} from './styles';
import type {AuthStackParam} from './types';
import {MenuButton} from './components/MenuButton';
import {deleteSpaces, showAlert} from 'react-native-aculab-client';
import {DEV_CONSTANTS} from '../devConstants';

import type {NativeStackNavigationProp} from '@react-navigation/native-stack';

type Props = NativeStackNavigationProp<AuthStackParam, 'AculabCall'>;

const platform = Platform.OS;

export const registerUser = async (username: string): Promise<any> => {
  // IP addresses white list in android/app/src/main/res/network_security_config
  const url = 'http://192.168.1.152:3500/users/';
  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
  const body = JSON.stringify({
    username: username,
    deviceToken: '',
    platform: platform,
  });

  const response = fetch(url, {
    method: 'POST',
    body: body,
    headers: headers,
  })
    .then(promise => {
      var blob = promise.json();
      return blob;
    })
    .then(res => {
      return res;
    })
    .catch(error => {
      console.log(error);
    });

  return response;
};

export const RegisterScreen = () => {
  const [registerClientId, setRegisterClientId] = useState(
    DEV_CONSTANTS.registerClientId,
  );
  const navigation = useNavigation<Props>();

  const registrationHandler = async () => {
    try {
      let serverResponse = await registerUser(registerClientId);
      console.log('55555', serverResponse);
      if (serverResponse.webrtc_token) {
        navigation.navigate('AculabCall', {
          registerClientId: serverResponse.username,
          webRTCAccessKey: serverResponse.webrtc_access_key,
          webRTCToken: serverResponse.webrtc_token,
          cloudRegionId: serverResponse.cloud_region_id,
          logLevel: serverResponse.log_level,
        });
      } else {
        showAlert('', serverResponse.message);
      }
    } catch (err) {
      console.error('regHandler', err);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={[styles.registerContainer]}>
        <Text style={styles.basicText}>Register Client ID</Text>
        <TextInput
          style={styles.input}
          placeholder={'example: anna123'}
          placeholderTextColor={COLOURS.INPUT_PLACEHOLDER}
          onChangeText={text => setRegisterClientId(deleteSpaces(text))}
          value={registerClientId}
        />
        <MenuButton title={'Register'} onPress={() => registrationHandler()} />
      </View>
    </ScrollView>
  );
};
