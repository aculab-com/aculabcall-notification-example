import {Platform} from 'react-native';
import EncryptedStorage from 'react-native-encrypted-storage';
import type {User} from './types';

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
    .then(res => {
      var blob = res.json();
      return blob;
    })
    .then(data => {
      return data;
    })
    .catch(error => {
      console.error('[ registerUser ]', error);
    });
  return response;
};

export const updateUser = async (user: User): Promise<any> => {
  // IP addresses white list in android/app/src/main/res/network_security_config
  const url = 'http://192.168.1.152:3500/users/';
  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
  const body = JSON.stringify({
    id: user.id,
    username: user.username,
    deviceToken: user.deviceToken,
    webrtcToken: user.webrtcToken,
    platform: platform,
  });

  const response = fetch(url, {
    method: 'PUT',
    body: body,
    headers: headers,
  })
    .then(res => {
      var blob = res.json();
      return blob;
    })
    .then(data => {
      return data;
    })
    .catch(error => {
      console.error('[ updateUser ]', error);
    });
  return response;
};

export const deleteUser = async (user: User): Promise<any> => {
  // IP addresses white list in android/app/src/main/res/network_security_config
  const url = 'http://192.168.1.152:3500/users/';
  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
  const body = JSON.stringify({
    username: user.username,
    webrtcToken: user.webrtcToken,
  });

  const response = fetch(url, {
    method: 'DELETE',
    body: body,
    headers: headers,
  })
    .then(res => {
      var blob = res.json();
      return blob;
    })
    .then(data => {
      return data;
    })
    .catch(error => {
      console.error('[ deleteUser ]', error);
    });
  return response;
};

export const storeRegisteredUser = async (
  itemName: string,
  jsonData: object,
) => {
  try {
    await EncryptedStorage.setItem(itemName, JSON.stringify(jsonData));

    // Congrats! You've just stored your first value!
  } catch (error) {
    // There was an error on the native side
  }
};
