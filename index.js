/**
 * @format
 */
import React from 'react';
import { AppRegistry, Linking, Platform } from 'react-native';
import App from './src/App';
import { name as appName } from './app.json';
import messaging from '@react-native-firebase/messaging';
import {
  cancelIncomingCallNotification,
  incomingCallNotification,
} from 'react-native-aculab-client';
import { aculabClientEvent } from 'react-native-aculab-client/src/AculabClientModule';
import { sendNotification } from './src/middleware';
import RNCallKeep from 'react-native-callkeep';

let call;
let fullScreenCall;

/**
 * Receive background notification via FCM
 */
messaging().setBackgroundMessageHandler(async (remoteNotification) => {
  // console.log('background notification arrived', remoteNotification.data);

  if (Platform.OS === 'android') {
    if (remoteNotification.data.title === 'Incoming Call') {
      incomingCallNotification(
        remoteNotification.data.uuid,
        remoteNotification.data.channel_id,
        remoteNotification.data.title,
        'channel used to display incoming call notification',
        remoteNotification.data.body,
        1986
      );
      const androidListenerA = aculabClientEvent.addListener(
        'rejectedCallAndroid',
        (_payload) => {
          sendNotification({
            uuid: _payload.uuid,
            caller: _payload.caller,
            callee: 'N/A',
            call_rejected: !_payload.callAccepted,
          });
          if (fullScreenCall) {
            Linking.openURL('app://testApp');
          }
          androidListenerA.remove();
          androidListenerB.remove();
        }
      );
      const androidListenerB = aculabClientEvent.addListener(
        'answeredCallAndroid',
        (_payload) => {
          call = {
            uuid: remoteNotification.data.uuid,
            caller: remoteNotification.data.body,
            callee: '',
            answered: _payload.callAccepted,
          };
          Linking.openURL('app://testApp');
          androidListenerA.remove();
          androidListenerB.remove();
        }
      );
      const androidListenerC = aculabClientEvent.addListener(
        'fullScreenCall',
        (_payload) => {
          fullScreenCall = true;
          androidListenerC.remove();
        }
      );
    } else if (remoteNotification.data.call_cancelled) {
      cancelIncomingCallNotification();
    }
  } else if (Platform.OS === 'ios' && remoteNotification.data.call_cancelled) {
    RNCallKeep.endCall(remoteNotification.data.uuid);
  }
});

const ExampleNotificationApp = () => {
  return <App call={call} />;
};

AppRegistry.registerComponent(appName, () => ExampleNotificationApp);
