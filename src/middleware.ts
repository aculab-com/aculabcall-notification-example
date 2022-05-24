import { Platform } from 'react-native';
import EncryptedStorage from 'react-native-encrypted-storage';
import type { Notification, User } from './types';

const platform = Platform.OS;

const URL_BASE = 'http://192.168.1.152:3500/';

export const registerUser = async (username: string): Promise<any> => {
  // IP addresses white list in android/app/src/main/res/network_security_config
  const url = `${URL_BASE}users/`;
  const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  };
  const body = JSON.stringify({
    username: username,
    fcmDeviceToken: '',
    platform: platform,
  });

  const response = fetch(url, {
    method: 'POST',
    body: body,
    headers: headers,
  })
    .then((res) => {
      var blob = res.json();
      return blob;
    })
    .then((data) => {
      return data;
    })
    .catch((error) => {
      console.error('[ registerUser ]', error);
    });
  return response;
};

export const updateUser = async (user: User): Promise<any> => {
  // IP addresses white list in android/app/src/main/res/network_security_config
  const url = `${URL_BASE}users/`;
  const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  };
  const body = JSON.stringify({
    id: user.id,
    username: user.username,
    fcmDeviceToken: user.fcmDeviceToken,
    iosDeviceToken: user.iosDeviceToken,
    webrtcToken: user.webrtcToken,
    platform: platform,
  });

  const response = fetch(url, {
    method: 'PUT',
    body: body,
    headers: headers,
  })
    .then((res) => {
      var blob = res.json();
      return blob;
    })
    .then((data) => {
      return data;
    })
    .catch((error) => {
      console.error('[ updateUser ]', error);
    });
  return response;
};

export const deleteUser = async (user: User): Promise<any> => {
  // IP addresses white list in android/app/src/main/res/network_security_config
  const url = `${URL_BASE}users/`;
  const headers = {
    'Accept': 'application/json',
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
    .then((res) => {
      var blob = res.json();
      return blob;
    })
    .then((data) => {
      return data;
    })
    .catch((error) => {
      console.error('[ deleteUser ]', error);
    });
  return response;
};

// finish this if needed
export const refreshWebrtcToken = async (user: User): Promise<any> => {
  // IP addresses white list in android/app/src/main/res/network_security_config
  const url = `${URL_BASE}users/get_token/`;
  const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  };
  const body = JSON.stringify({
    username: user.username,
  });

  const response = fetch(url, {
    method: 'POST',
    body: body,
    headers: headers,
  })
    .then((res) => {
      var blob = res.json();
      return blob;
    })
    .then((data) => {
      return data;
    })
    .catch((error) => {
      console.error('[ refreshWebrtcToken ]', error);
    });
  return response;
};

export const sendCallNotification = async (
  notification: Notification
): Promise<any> => {
  // IP addresses white list in android/app/src/main/res/network_security_config
  const url = `${URL_BASE}notifications/call`;
  const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  };
  const body = JSON.stringify({
    uuid: notification.uuid,
    caller: notification.caller,
    callee: notification.callee,
  });

  const response = fetch(url, {
    method: 'POST',
    body: body,
    headers: headers,
  })
    .then((res) => {
      var blob = res.json();
      return blob;
    })
    .then((data) => {
      // console.log('[ sendCallNotification ]', data);
      return data;
    })
    .catch((error) => {
      console.error('[ sendCallNotification ]', error);
    });
  return response;
};

export const sendNotification = async (
  notification: Notification
): Promise<any> => {
  // IP addresses white list in android/app/src/main/res/network_security_config
  const url = `${URL_BASE}notifications/`;
  const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  };
  const body = JSON.stringify({
    uuid: notification.uuid,
    caller: notification.caller,
    callee: notification.callee,
    webrtc_ready: notification.webrtc_ready,
  });

  const response = fetch(url, {
    method: 'POST',
    body: body,
    headers: headers,
  })
    .then((res) => {
      var blob = res.json();
      return blob;
    })
    .then((data) => {
      // console.log('[ sendNotification ]', data);
      return data;
    })
    .catch((error) => {
      console.error('[ sendNotification ]', error);
    });
  return response;
};

export const storeRegisteredUser = async (
  itemName: string,
  jsonData: object
) => {
  try {
    await EncryptedStorage.setItem(itemName, JSON.stringify(jsonData));

    // Congrats! You've just stored your first value!
  } catch (error) {
    // There was an error on the native side
  }
};
