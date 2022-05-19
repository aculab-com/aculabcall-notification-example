/**
 * @format
 */
import React from 'react';
import { AppRegistry, Linking, Platform } from 'react-native';
import App from './src/App';
import { name as appName } from './app.json';
import messaging from '@react-native-firebase/messaging';
import { incomingCallNotification } from 'react-native-aculab-client';
import { aculabClientEvent } from 'react-native-aculab-client/src/AculabClientModule';
// import RNCallKeep from 'react-native-callkeep';

let userAction = 'none';

// RNCallKeep.addEventListener('answerCall', () => console.log('11111111111111'));

// Register background handler
messaging().setBackgroundMessageHandler(async (remoteNotification) => {
  console.log('background notification arrived', remoteNotification.data);

  if (Platform.OS === 'android') {
    incomingCallNotification(
      remoteNotification.data.channel_id,
      remoteNotification.data.title,
      'channel used to display incoming call notification',
      remoteNotification.data.body,
      1986
    );
    const androidListenerA = aculabClientEvent.addListener(
      'rejectedCallAndroid',
      (_payload) => {
        console.log('[ AculabCall ]', 'endCallAndroid', _payload);
        // this.endCall();
        androidListenerA.remove();
      }
    );
    // @ts-ignore: aculabClientEvent is not undefined for android
    const androidListenerB = aculabClientEvent.addListener(
      'answeredCallAndroid',
      (_payload) => {
        console.log('[ index listener ]', 'answerCallAndroid', _payload);
        // this.answerCall();
        userAction = 'answered';
        Linking.openURL('app://testApp');
        androidListenerB.remove();
      }
    );
  }
});

const ExampleNotificationApp = () => {
  return <App notificationAction={userAction} />;
};

AppRegistry.registerComponent(appName, () => ExampleNotificationApp);
