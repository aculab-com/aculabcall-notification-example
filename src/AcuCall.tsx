import React, { useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  SafeAreaView,
  Image,
  Platform,
  AppState,
  Linking,
} from 'react-native';
import { styles, COLOURS } from './styles';
import { RTCView } from 'react-native-webrtc';
import { name as appName } from '../app.json';
import {
  AculabCall,
  turnOnSpeaker,
  deleteSpaces,
  initializeCallKeep,
  cancelIncomingCallNotification,
  showAlert,
} from 'react-native-aculab-client';
import { MenuButton } from './components/MenuButton';
import { CallButton } from './components/CallButton';
import { RoundButton } from './components/RoundButton';

import VoipPushNotification from 'react-native-voip-push-notification';
import messaging from '@react-native-firebase/messaging';
import { AuthContext } from './App';
import {
  clearStorage,
  deleteUser,
  refreshWebrtcToken,
  sendNotification,
  updateUser,
} from './middleware';

import RNCallKeep from 'react-native-callkeep';
import type { AndroidFromKilledCall, Notification } from './types';
import { notificationHandler } from './handlers';
import { CallKeypad } from './components/CallKeypad';

/**
 * Main call buttons component
 * @param props AculabCall instance
 * @returns main call buttons wrapped in view
 */
const MainCallButtons = (props: any) => {
  return (
    <View style={styles.callButtonsContainer}>
      <CallButton
        title={'Hang up'}
        colour={COLOURS.RED}
        onPress={() => props.aculabCall.endCall()}
      />
      <CallButton
        title={'Speaker'}
        colour={COLOURS.SPEAKER_BUTTON}
        onPress={() =>
          props.aculabCall.setState(
            { speakerOn: !props.aculabCall.state.speakerOn },
            () => turnOnSpeaker(props.aculabCall.state.speakerOn)
          )
        }
      />
    </View>
  );
};

/**
 * Dialing keypad component
 * @param props AculabCall instance
 * @returns dialing keypad wrapped in view
 */
const DialKeypad = (props: any) => {
  return (
    <View style={styles.dialKeypad}>
      {props.aculabCall.state.outboundCall ? (
        <View>
          <Text style={styles.callingText}>
            Calling {props.aculabCall.state.serviceName}
          </Text>
        </View>
      ) : (
        <View>
          <Text style={styles.callingText}>
            Service {props.aculabCall.state.serviceName}
          </Text>
          <CallKeypad props={props} />
        </View>
      )}
    </View>
  );
};

/**
 * Client call buttons component
 * @param props AculabCall instance
 * @returns client call buttons wrapped in view
 */
const ClientCallButtons = (props: any) => {
  var videoIcon: string = '';
  var audioIcon: string = '';
  if (!props.aculabCall.state.camera) {
    videoIcon = 'eye-off-outline';
  } else {
    videoIcon = 'eye-outline';
  }
  if (!props.aculabCall.state.mic) {
    audioIcon = 'mic-off-outline';
  } else {
    audioIcon = 'mic-outline';
  }
  return (
    <View style={styles.callButtonsContainer}>
      <RoundButton
        iconName={'camera-reverse-outline'}
        onPress={() => props.aculabCall.swapCam()}
      />
      <RoundButton
        iconName={videoIcon}
        onPress={() =>
          props.aculabCall.setState(
            { camera: !props.aculabCall.state.camera },
            () => props.aculabCall.mute()
          )
        }
      />
      <RoundButton
        iconName={audioIcon}
        onPress={() =>
          props.aculabCall.setState({ mic: !props.aculabCall.state.mic }, () =>
            props.aculabCall.mute()
          )
        }
      />
    </View>
  );
};

/**
 * Call out component
 * @param props AculabCall instance
 * @returns Call out view
 */
const CallOutComponent = (props: any) => {
  return (
    <View style={styles.inputContainer}>
      <View>
        <Text style={styles.basicText}>Service Name</Text>
        <TextInput
          style={styles.input}
          placeholder={'example: webrtcdemo'}
          placeholderTextColor={COLOURS.INPUT_PLACEHOLDER}
          onChangeText={(text) =>
            props.aculabCall.setState({
              serviceName: deleteSpaces(text),
            })
          }
          value={props.aculabCall.state.serviceName}
          keyboardType={'ascii-capable'}
        />
        <MenuButton
          title={'Call Service'}
          onPress={() =>
            props.aculabCall.getCallUuid(() =>
              props.aculabCall.startCall(
                'service',
                props.aculabCall.state.serviceName
              )
            )
          }
        />
      </View>
      <View>
        <Text style={styles.basicText}>Client ID</Text>
        <TextInput
          style={styles.input}
          placeholder={'example: anna123'}
          placeholderTextColor={COLOURS.INPUT_PLACEHOLDER}
          onChangeText={(text) =>
            props.aculabCall.setState({
              callClientId: deleteSpaces(text),
            })
          }
          value={props.aculabCall.state.callClientId}
        />
        <MenuButton
          title={'Call Client'}
          onPress={() => {
            // if (Platform.OS === 'ios' || Platform.OS === 'android') {
            if (props.aculabCall.state.callUuid === '') {
              props.aculabCall.getCallUuid(() => notificationHandler(props));
            } else {
              notificationHandler(props);
            }
            // } else {
            //   props.aculabCall.getCallUuid(() =>
            //     props.aculabCall.startCall(
            //       'client',
            //       props.aculabCall.state.callClientId
            //     )
            //   );
            // }
          }}
        />
      </View>
    </View>
  );
};

/**
 * Display client call component
 * @param props AculabCall instance
 * @returns client call display wrapped in view
 */
const DisplayClientCall = (props: any) => {
  if (!props.aculabCall.state.remoteStream) {
    if (props.aculabCall.state.outboundCall) {
      return (
        <View style={styles.center}>
          <Text style={styles.callingText}>
            Calling {props.aculabCall.state.callClientId}
          </Text>
        </View>
      );
    } else {
      return (
        <View style={styles.center}>
          <Text style={styles.callingText}>
            {props.aculabCall.state.callClientId}
          </Text>
        </View>
      );
    }
  } else {
    if (
      props.aculabCall.state.localVideoMuted &&
      !props.aculabCall.state.remoteVideoMuted
    ) {
      return (
        <View style={styles.vidview}>
          <RTCView
            // @ts-ignore
            streamURL={props.aculabCall.state.remoteStream.toURL()}
            style={styles.rtcview}
          />
        </View>
      );
    } else if (
      props.aculabCall.state.remoteVideoMuted &&
      !props.aculabCall.state.localVideoMuted
    ) {
      return (
        <View style={styles.vidview}>
          <Image
            source={require('./media/video_placeholder.png')}
            style={styles.videoPlaceholder}
          />
          <View style={styles.videoPlaceholder}>
            <Text style={styles.basicText}>NO VIDEO</Text>
          </View>
          <View style={styles.rtc}>
            <RTCView
              // @ts-ignore
              streamURL={props.aculabCall.state.localStream.toURL()}
              style={styles.rtcselfview}
            />
          </View>
        </View>
      );
    } else if (
      props.aculabCall.state.remoteVideoMuted &&
      props.aculabCall.state.localVideoMuted
    ) {
      return (
        <View>
          <Image
            source={require('./media/video_placeholder.png')}
            style={styles.videoPlaceholder}
          />
          <View style={styles.videoPlaceholder}>
            <Text style={styles.basicText}>NO VIDEO</Text>
          </View>
        </View>
      );
    } else {
      return (
        <View style={styles.vidview}>
          <RTCView
            // @ts-ignore
            streamURL={props.aculabCall.state.remoteStream.toURL()}
            style={styles.rtcview}
          />
          <View style={styles.rtc}>
            <RTCView
              // @ts-ignore
              streamURL={props.aculabCall.state.localStream.toURL()}
              style={styles.rtcselfview}
            />
          </View>
        </View>
      );
    }
  }
};

/**
 * handles call screen displaying - component
 * @param props AculabCall instance
 * @returns view
 */
const CallDisplayHandler = (props: any) => {
  if (props.aculabCall.state.inboundCall) {
    return (
      <View style={styles.incomingContainer}>
        <View style={styles.center}>
          <Text style={styles.callingText}>Incoming Call</Text>
          <Text style={styles.callingText}>
            {props.aculabCall.state.incomingCallClientId}
          </Text>
        </View>
      </View>
    );
  } else if (
    props.aculabCall.state.callState === 'idle' &&
    !props.aculabCall.state.outboundCall
  ) {
    return (
      <ScrollView>
        <CallOutComponent aculabCall={props.aculabCall} />
      </ScrollView>
    );
  } else {
    if (
      props.aculabCall.state.callOptions.receiveVideo ||
      props.aculabCall.state.outboundCall
    ) {
      return <DisplayClientCall aculabCall={props.aculabCall} />;
    } else {
      return <DialKeypad aculabCall={props.aculabCall} />;
    }
  }
};

/**
 * Handles call buttons being displayed component
 * @param props AculabCall instance
 * @returns view
 */
const CallButtonsHandler = (props: any) => {
  if (props.aculabCall.state.inboundCall) {
    return <View />;
  } else if (
    props.aculabCall.state.callState !== 'idle' ||
    props.aculabCall.state.outboundCall
  ) {
    if (props.aculabCall.state.callOptions.receiveVideo) {
      // calling client
      if (props.aculabCall.state.remoteStream) {
        return (
          <View>
            <ClientCallButtons aculabCall={props.aculabCall} />
            <MainCallButtons aculabCall={props.aculabCall} />
          </View>
        );
      } else {
        return <MainCallButtons aculabCall={props.aculabCall} />;
      }
    } else {
      // calling service
      return <MainCallButtons aculabCall={props.aculabCall} />;
    }
  } else {
    // idle state
    return <View />;
  }
};

/**
 * component\
 * Log out and, delete user from server and local storage
 * @param props AculabCall instance
 * @returns view
 */
const LogOutButton = (props: any) => {
  const { signOut } = useContext(AuthContext);
  return (
    <View style={styles.registrationButton}>
      <CallButton
        title={'log out'}
        colour={COLOURS.CALLING_TEXT}
        onPress={() => {
          signOut();
          deleteUser(props.aculabCall.props.registerClientId);
          props.aculabCall.unregister();
        }}
      />
    </View>
  );
};

/**
 * request iOS permission for firebase notifications
 */
const requestUserPermission = async () => {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    // console.log('Authorization status:', authStatus);
  }
};

class AcuCall extends AculabCall {
  private fcmNotificationListener: any;
  private answeredCall!: Notification | null;
  private iosDeviceToken!: string;
  private call: AndroidFromKilledCall | undefined = this.props.call;

  componentDidMount() {
    this.register();
    initializeCallKeep(appName);
    this.addCallKeepListeners();
    requestUserPermission();
    if (Platform.OS === 'ios') {
      this.initializeVoipNotifications();
    }
    // Android send webrtc ready notification when call accepted from killed state
    if (Platform.OS === 'android' && this.call) {
      this.setState({ callUIInteraction: 'answered' });
      this.setState({ inboundCall: true });
      this.answeredCall = {
        uuid: this.call.uuid,
        caller: this.call.caller,
        callee: this.props.registerClientId,
        webrtc_ready: true,
      };
      sendNotification(this.answeredCall!);
      this.answeredCallNotReceived();
      this.answeredCall = null;
    }
    this.getFcmDeviceToken();
    this.fcmNotificationListener = messaging().onMessage(
      async (remoteMessage) => {
        // place webrtc call when webrtc ready notification arrived
        if (
          remoteMessage.data!.webrtc_ready === 'true' &&
          this.state.callClientId === remoteMessage.data!.body &&
          this.state.callState === 'idle' &&
          this.state.outboundCall
        ) {
          this.startCall('client', this.state.callClientId);
        }
        // if call rejected notification default outbound call state
        else if (remoteMessage.data!.call_rejected === 'true') {
          this.setState({ outboundCall: false });
        }
        // dismiss full screen notification
        else if (
          remoteMessage.data!.call_cancelled === 'true' &&
          Platform.OS === 'android'
        ) {
          cancelIncomingCallNotification();
          Linking.openURL('app://testApp');
        }
        // Android incoming call notification - display incoming call UI notification
        else if (
          Platform.OS === 'android' &&
          remoteMessage.data!.title === 'Incoming Call' &&
          this.state.callState === 'idle'
        ) {
          this.refreshWebRtcUser();
          RNCallKeep.displayIncomingCall(
            remoteMessage.data!.uuid,
            remoteMessage.data!.body,
            remoteMessage.data!.body
          );
          this.answeredCall = {
            uuid: remoteMessage.data!.uuid,
            caller: remoteMessage.data!.body,
            callee: this.props.registerClientId,
            webrtc_ready: true,
          };
          sendNotification(this.answeredCall);
          this.setStatesNotificationCall(remoteMessage.data!.uuid);
          this.answeredCall = null;
        }
      }
    );
  }

  /**
   * Refresh WebRTC user by refreshing token and registering.\
   * This function is used to make sure that when app is running on phone in background for\
   * prolonged period of time, incoming call call can be accepted and does not result in error\
   * where sip connection times out and dies on the background.
   */
  async refreshWebRtcUser() {
    const refreshedUser = await refreshWebrtcToken(this.props.registerClientId);
    if (refreshedUser) {
      this.setState({ webRTCToken: refreshedUser.webrtcToken }, () => {
        this.register(this.state.webRTCToken);
      });
    }
  }

  componentWillUnmount() {
    this.unregister();
    this.destroyListeners();
    if (Platform.OS === 'ios') {
      this.unregisterVoipNotifications();
    }
    this.fcmNotificationListener(); // remove fcmNotificationListener
    this.fcmNotificationListener = null;
  }

  componentDidUpdate() {
    // answer call
    if (
      this.state.callUIInteraction === 'answered' &&
      this.state.callState === 'incoming call'
    ) {
      this.answerCall();
    }
    // end call
    if (
      this.state.callUIInteraction === 'rejected' &&
      this.state.callState === 'incoming call'
    ) {
      this.endCall();
    }
    // send Answered call notification when app runs and lock screen - iOS
    // send Answered call notification when app runs but not focused - Android
    if (
      this.state.callUIInteraction === 'answered' &&
      this.state.incomingUI &&
      this.answeredCall
    ) {
      sendNotification(this.answeredCall!);
      this.setState({ inboundCall: true });
      this.answeredCall = null;
    }
  }

  /**
   * Overwritten function - added set-up for notifications
   * @param payload object {uuid: string, caller: string}
   */
  answeredCallAndroid(payload: any) {
    this.answeredCall = {
      uuid: payload.uuid,
      caller: payload.caller,
      callee: this.props.registerClientId,
      webrtc_ready: true,
    };
    super.answeredCallAndroid(payload);
    this.setState({ incomingUI: true });
  }

  // rejectedCallAndroid(payload: any) {
  //   super.rejectedCallAndroid(payload);
  //   sendNotification({
  //     uuid: payload.uuid,
  //     caller: payload.caller,
  //     callee: this.props.registerClientId,
  //     call_rejected: true,
  //   });
  // }

  endCall(): void {
    super.endCall();
    // send notification that incoming call was rejected by callee
    if (this.state.outboundCall) {
      this.answeredCall = null;
      sendNotification({
        uuid: this.state.callUuid as string,
        caller: this.props.registerClientId,
        callee: this.state.callClientId,
        call_cancelled: true,
      });
    } else if (this.answeredCall) {
      sendNotification({
        uuid: this.answeredCall.uuid,
        caller: this.answeredCall.caller,
        callee: this.props.registerClientId,
        call_rejected: true,
      });
    }
  }

  /**
   * Overwritten - displays Android custom incoming UI
   * this function prevents the UI to be called twice when accepting call from killed state
   * @param {string} handle call handle
   * @param {string} callUUID call uuid
   * @param {string} name caller's name
   */
  displayCustomIncomingUI(
    handle?: string,
    callUUID?: string,
    name?: string
  ): void {
    if (!this.call) {
      super.displayCustomIncomingUI(handle, callUUID, name);
    }
    this.call = undefined;
  }

  /**
   * Unregister - set default state to client and webRTCToken and clears local storage
   */
  unregister() {
    super.unregister();
    clearStorage();
  }

  /**
   * get the FCM token and store the token in the server
   */
  getFcmDeviceToken() {
    // Get the device token
    if (Platform.OS === 'android') {
      messaging()
        .getToken()
        .then((token) => {
          // sent the token to the server
          updateUser({
            username: this.props.registerClientId,
            platform: Platform.OS,
            webrtcToken: this.props.webRTCToken,
            fcmDeviceToken: token,
          });
        });
    } else if (Platform.OS === 'ios') {
      messaging()
        .getToken()
        .then((token) => {
          // sent the token to the server
          updateUser({
            username: this.props.registerClientId,
            platform: Platform.OS,
            webrtcToken: this.props.webRTCToken,
            fcmDeviceToken: token,
            iosDeviceToken: this.iosDeviceToken,
          });
        });
    }
  }

  /**
   * if the call does not connect withing the time after call being answered it terminates callkeep
   */
  async answeredCallNotReceived() {
    setTimeout(() => {
      if (this.state.callState === 'idle' && this.state.inboundCall) {
        // RNCallKeep.endCall(this.state.callUuid as string);
        // this.setState({ callKeepCallActive: false });
        this.setState({ notificationCall: false });
        this.setState({ incomingUI: false });
        this.setState({ inboundCall: false });
        showAlert('', 'Connection issue');
      }
    }, 3000);
  }

  /**
   * Set AculabCall states for VoIP Notification
   * @param {string} uuid for the call
   */
  setStatesNotificationCall(uuid: string) {
    this.setState({ callUuid: uuid });
    this.setState({ incomingUI: true });
    this.setState({ callKeepCallActive: true });
    this.setState({ callUIInteraction: 'none' });
    this.setState({ notificationCall: true });
    this.setState({ inboundCall: true });
  }

  /**
   * iOS ONLY\
   * Run this function to unregister VoiP Push Notifications for iOS.
   */
  unregisterVoipNotifications() {
    VoipPushNotification.removeEventListener('register');
    VoipPushNotification.removeEventListener('notification');
    VoipPushNotification.removeEventListener('didLoadWithEvents');
  }

  /**
   * iOS ONLY\
   * Run this function to register VoiP Push Notifications for iOS.
   */
  initializeVoipNotifications() {
    // ===== subscribe `register` event =====
    VoipPushNotification.addEventListener('register', (token) => {
      // uncomment the following line to log device token into metro console
      // console.log('[ iOS Device token ]:', token);
      this.iosDeviceToken = token;
    });

    // ===== subscribe `notification` event =====
    // --- received VoIP notification on foreground
    VoipPushNotification.addEventListener('notification', (notification) => {
      this.refreshWebRtcUser();
      this.setStatesNotificationCall(notification.uuid);
      this.answeredCall = {
        uuid: notification.uuid,
        caller: notification.callerName,
        callee: this.props.registerClientId,
        webrtc_ready: true,
      };

      // Don't send notification if app runs but screen is locked
      if (AppState.currentState !== 'background') {
        sendNotification(this.answeredCall!);
      }

      // --- optionally, if you `addCompletionHandler` from the native side,
      // once you have done the js jobs to initiate a call, call `completion()`
      // VoipPushNotification.onVoipNotificationCompleted(notification.uuid);
    });

    // ===== subscribe `didLoadWithEvents` event =====
    VoipPushNotification.addEventListener('didLoadWithEvents', (events) => {
      // --- this will fire when there are events occurred before js bridge initialized
      // --- use this event to execute your event handler manually by event type

      if (!events || !Array.isArray(events) || events.length < 1) {
        return;
      }
      for (let voipPushEvent of events) {
        let { name, data } = voipPushEvent;
        if (
          name ===
          (VoipPushNotification as any) // ignore missing type in the package
            .RNVoipPushRemoteNotificationsRegisteredEvent
        ) {
        } else if (
          name ===
          (VoipPushNotification as any) // ignore missing type in the package
            .RNVoipPushRemoteNotificationReceivedEvent
        ) {
          if (data.uuid) {
            // triggered when app is awaken from killed state by VoIP notification
            this.setStatesNotificationCall(data.uuid);
            this.answeredCall = {
              uuid: data.uuid,
              caller: data.callerName,
              callee: this.props.registerClientId,
              webrtc_ready: true,
            };
          }
        }
      }
    });

    // ===== register =====
    // --- it will be no-op if you have subscribed before (like in native side)
    // --- but will fire `register` event if we have latest cashed voip token ( it may be empty if no token at all )
    VoipPushNotification.registerVoipToken(); // --- register token
    console.log('[ AcuCall ]', 'VoiP Push Notifications Initialized:');
  }

  /**
   * Head component
   * @returns View
   */
  CallHeadComponent = () => {
    return (
      <View style={styles.row}>
        <View style={styles.callHead}>
          <Text style={styles.basicText}>Aculab - AculabCall Example</Text>
          {this.state.client !== null ? (
            <View>
              <Text style={styles.basicText}>
                Registered as {this.props.registerClientId}
              </Text>
              <Text style={styles.basicText}>
                WebRTC state: {this.state.callState}
              </Text>
              <Text style={styles.basicText}>
                inboundCall: {this.state.inboundCall.toString()}
              </Text>
              <Text style={styles.basicText}>
                outboundCall: {this.state.outboundCall.toString()}
              </Text>
            </View>
          ) : (
            <Text style={styles.warningText}>
              Please Use Correct Registration Credentials
            </Text>
          )}
        </View>
        {this.state.callState === 'idle' ? (
          <LogOutButton aculabCall={this} />
        ) : (
          <View />
        )}
      </View>
    );
  };

  render() {
    return (
      <SafeAreaView style={styles.height100}>
        <this.CallHeadComponent />
        <View>
          <CallDisplayHandler aculabCall={this} />
        </View>
        <View style={styles.bottom}>
          <CallButtonsHandler aculabCall={this} />
        </View>
      </SafeAreaView>
    );
  }
}

export default AcuCall;
