// middleware
// IP addresses white list in android/app/src/main/res/xml/network_security_config

import { Platform } from 'react-native';
import EncryptedStorage from 'react-native-encrypted-storage';
import type { Notification, User } from './types';

const platform = Platform.OS;

// Notification server base url
// const URL_BASE = 'http://192.168.1.152:3500/';
const URL_BASE = 'http://192.168.0.17:3500/';

/**
 * create new user on the server
 * @param {string} username new user username
 * @returns server response
 */
export const registerUser = async (username: string): Promise<any> => {
  const url = `${URL_BASE}users/`;
  const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  };
  const body = JSON.stringify({
    username: username,
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
      console.error('[ registerUser ]', error.message);
    });
  return response;
};

/**
 * Update user on the server\
 * use to update fcmDeviceToken and iosDeviceToken
 * @param {User} user user object to be updated
 * @returns server response
 */
export const updateUser = async (user: User): Promise<any> => {
  const url = `${URL_BASE}users/`;
  const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  };
  const body = JSON.stringify({
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
      console.error('[ updateUser ]', error.message);
    });
  return response;
};

/**
 * Delete user from the server
 * @param {string} username user to be deleted
 * @returns server response
 */
export const deleteUser = async (username: string): Promise<any> => {
  const url = `${URL_BASE}users/`;
  const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  };
  const body = JSON.stringify({
    username: username,
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
      console.error('[ deleteUser ]', error.message);
    });
  return response;
};

/**
 * Refresh WebRTC Token
 * @param {string} username user that will get Token refreshed
 * @returns server response
 */
export const refreshWebrtcToken = async (username: string): Promise<any> => {
  const url = `${URL_BASE}users/get_token/`;
  const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  };
  const body = JSON.stringify({
    username: username,
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
      console.error('[ refreshWebrtcToken ]', error.message);
    });
  return response;
};

/**
 * Send incoming call notification
 * @param {Notification} notification notification object with data
 * @returns server response
 */
export const sendCallNotification = async (
  notification: Notification
): Promise<any> => {
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
      return data;
    })
    .catch((error) => {
      console.error('[ sendCallNotification ]', error.message);
    });
  return response;
};

/**
 * Send silent notification
 * @param {Notification} notification notification object with data
 * @returns server response
 */
export const sendNotification = async (
  notification: Notification
): Promise<any> => {
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
    call_rejected: notification.call_rejected,
    call_cancelled: notification.call_cancelled,
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
      console.error('[ sendNotification ]', error.message);
    });
  return response;
};

/**
 * Store item in local storage
 * @param {string} itemName item key value
 * @param {object} jsonData data to be stored and linked to key value
 */
export const storeRegisteredUser = async (
  itemName: string,
  jsonData: object
) => {
  try {
    await EncryptedStorage.setItem(itemName, JSON.stringify(jsonData));

    // Value stored
  } catch (error) {
    // There was an error on the native side
  }
};

/**
 * clear everything from local storage
 */
export const clearStorage = async () => {
  try {
    await EncryptedStorage.clear();
    // Storage cleared
  } catch (err) {
    console.error('[ AcuCall ]', 'clearStorage error', err);
  }
};
