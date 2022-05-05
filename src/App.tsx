import 'react-native-gesture-handler';
import React, {createContext, useEffect} from 'react';
import {View, StatusBar} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {styles} from './styles';
import AcuCall from './AcuCall';
import {RegisterScreen} from './RegisterScreen';
import {SplashScreen} from './SplashScreen';
import EncryptedStorage from 'react-native-encrypted-storage';

import type {AuthContextTypes} from './types';
import {registerUser, storeRegisteredUser} from './middleware';
import {showAlert} from 'react-native-aculab-client';

export const AuthContext = createContext<AuthContextTypes>(
  {} as AuthContextTypes,
);

const App = () => {
  const [state, dispatch] = React.useReducer(
    (prevState: any, action: any) => {
      switch (action.type) {
        case 'RESTORE_TOKEN':
          return {
            ...prevState,
            user: action.user,
            isLoading: false,
          };
        case 'SIGN_IN':
          return {
            ...prevState,
            isSignout: false,
            user: action.user,
          };
        case 'SIGN_OUT':
          return {
            ...prevState,
            isSignout: true,
            user: null,
          };
      }
    },
    {
      isLoading: true,
      isSignout: false,
      user: null,
    },
  );

  useEffect(() => {
    // Fetch the token from storage then navigate to our appropriate place
    const bootstrapAsync = async () => {
      let jsonUser;

      try {
        // userToken = await SecureStore.getItemAsync('userToken');
        let localStoredUser = await EncryptedStorage.getItem('registered_user');
        jsonUser = JSON.parse(localStoredUser as string);
      } catch (e) {
        // Restoring token failed
      }

      // After restoring token, we may need to validate it in production apps

      // This will switch to the App screen or Auth screen and this loading
      // screen will be unmounted and thrown away.
      dispatch({type: 'RESTORE_TOKEN', user: jsonUser});
    };

    bootstrapAsync();
  }, []);

  const authContext = React.useMemo(
    () => ({
      signOut: () => dispatch({type: 'SIGN_OUT'}),
      signUp: async (username: string) => {
        let regUser = await registerUser(username);
        if (!regUser) {
          showAlert('', 'Cant connect to the server');
        } else if (regUser.message) {
          showAlert('', regUser.message);
        } else {
          storeRegisteredUser('registered_user', regUser);
          dispatch({type: 'SIGN_IN', user: regUser});
        }
        // // In a production app, we need to send user data to server and get a token
        // // We will also need to handle errors if sign up failed
        // // After getting token, we need to persist the token using `SecureStore`
        // // In the example, we'll use a dummy token
      },
    }),
    [],
  );

  // console.log('[ user ]', state);

  return (
    <AuthContext.Provider value={authContext}>
      <NavigationContainer>
        <StatusBar barStyle="light-content" />
        {state.isLoading ? (
          <SplashScreen />
        ) : state.user === null || state.user === undefined ? (
          <RegisterScreen />
        ) : (
          <View style={styles.container}>
            <AcuCall
              webRTCAccessKey={state.user.webrtc_access_key}
              webRTCToken={state.user.webrtc_token}
              cloudRegionId={state.user.cloud_region_id}
              logLevel={state.user.log_level}
              registerClientId={state.user.username}
            />
          </View>
        )}
      </NavigationContainer>
    </AuthContext.Provider>
  );
};

export default App;
