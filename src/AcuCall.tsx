import React, { useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  SafeAreaView,
  Image,
  Platform,
} from 'react-native';
import { styles, COLOURS } from './styles';
import { RTCView } from 'react-native-webrtc';
import {
  AculabCall,
  turnOnSpeaker,
  deleteSpaces,
} from 'react-native-aculab-client';
import { MenuButton } from './components/MenuButton';
import { KeypadButton } from './components/KeypadButton';
import { CallButton } from './components/CallButton';
import { RoundButton } from './components/RoundButton';

import VoipPushNotification from 'react-native-voip-push-notification';
import messaging from '@react-native-firebase/messaging';
import { AuthContext } from './App';
import {
  clearStorage,
  deleteUser,
  sendNotification,
  updateUser,
} from './middleware';

import RNCallKeep from 'react-native-callkeep';
import { AndroidFromKilledCall, Notification } from './types';
import { notificationHandler } from './handlers';

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
      {props.aculabCall.state.callState === 'calling' ||
      props.aculabCall.state.callState === 'ringing' ? (
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
        </View>
      )}
      <View>
        <View style={styles.callButtonsContainer}>
          <KeypadButton
            title={'1'}
            onPress={() => props.aculabCall.sendDtmf('1')}
          />
          <KeypadButton
            title={'2'}
            onPress={() => props.aculabCall.sendDtmf('2')}
          />
          <KeypadButton
            title={'3'}
            onPress={() => props.aculabCall.sendDtmf('3')}
          />
        </View>
        <View style={styles.callButtonsContainer}>
          <KeypadButton
            title={'4'}
            onPress={() => props.aculabCall.sendDtmf('4')}
          />
          <KeypadButton
            title={'5'}
            onPress={() => props.aculabCall.sendDtmf('5')}
          />
          <KeypadButton
            title={'6'}
            onPress={() => props.aculabCall.sendDtmf('6')}
          />
        </View>
        <View style={styles.callButtonsContainer}>
          <KeypadButton
            title={'7'}
            onPress={() => props.aculabCall.sendDtmf('7')}
          />
          <KeypadButton
            title={'8'}
            onPress={() => props.aculabCall.sendDtmf('8')}
          />
          <KeypadButton
            title={'9'}
            onPress={() => props.aculabCall.sendDtmf('9')}
          />
        </View>
        <View style={styles.callButtonsContainer}>
          <KeypadButton
            title={'*'}
            onPress={() => props.aculabCall.sendDtmf('*')}
          />
          <KeypadButton
            title={'0'}
            onPress={() => props.aculabCall.sendDtmf('0')}
          />
          <KeypadButton
            title={'#'}
            onPress={() => props.aculabCall.sendDtmf('#')}
          />
        </View>
      </View>
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
            if (Platform.OS === 'ios' || Platform.OS === 'android') {
              if (props.aculabCall.state.callUuid === '') {
                props.aculabCall.getCallUuid(() => notificationHandler(props));
              } else {
                notificationHandler(props);
              }
            } else {
              props.aculabCall.getCallUuid(() =>
                props.aculabCall.startCall(
                  'client',
                  props.aculabCall.state.callClientId
                )
              );
            }
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
    if (
      props.aculabCall.state.callState === 'calling' ||
      props.aculabCall.state.callState === 'ringing' ||
      props.aculabCall.state.callState === 'connecting'
    ) {
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
  if (
    props.aculabCall.state.callState === 'incoming call' ||
    props.aculabCall.state.incomingUI === true
  ) {
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
  } else if (props.aculabCall.state.callState === 'idle') {
    return (
      <ScrollView>
        <CallOutComponent aculabCall={props.aculabCall} />
      </ScrollView>
    );
  } else {
    if (props.aculabCall.state.callOptions.receiveVideo) {
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
  if (props.aculabCall.state.callState === 'incoming call') {
    return <View />;
  } else if (props.aculabCall.state.callState !== 'idle') {
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
    console.log('Authorization status:', authStatus);
  }
};

class AcuCall extends AculabCall {
  private fcmNotificationListener: any;
  private answeredCall!: Notification | null;
  private iosDeviceToken!: string;
  private call: AndroidFromKilledCall | undefined = this.props.call;

  componentDidMount() {
    this.register();
    this.initializeCallKeep('AculabCall Example');
    requestUserPermission();
    if (Platform.OS === 'ios') {
      this.initializeVoipNotifications();
    }
    if (Platform.OS === 'android' && this.call) {
      this.setState({ callUIInteraction: 'answered' });
      this.answeredCall = {
        uuid: this.call.uuid,
        caller: this.call.caller,
        callee: this.props.registerClientId,
        webrtc_ready: true,
      };
      console.log('sent confirm notification', this.state.callUIInteraction);
      sendNotification(this.answeredCall!);
      this.answeredCall = null;
    }
    this.getFcmDeviceToken();
    this.fcmNotificationListener = messaging().onMessage(
      async (remoteMessage) => {
        console.log(
          'A new FCM message arrived! foreground, platform',
          Platform.OS
        );
        console.log(
          'A new FCM message arrived! foreground, message',
          remoteMessage
        );
        if (
          remoteMessage.data!.webrtc_ready === 'true' &&
          this.state.callClientId === remoteMessage.data!.body &&
          this.state.callState === 'idle'
        ) {
          this.startCall('client', this.state.callClientId);
        } else if (
          Platform.OS === 'android' &&
          remoteMessage.data!.title === 'Incoming Call' &&
          this.state.callState === 'idle'
        ) {
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
        }
      }
    );
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
    if (
      this.state.callUIInteraction === 'answered' &&
      this.state.callState === 'incoming call'
    ) {
      this.answerCall();
    }
    if (
      this.state.callUIInteraction === 'rejected' &&
      this.state.callState === 'incoming call'
    ) {
      this.endCall();
    }
    if (
      this.state.callUIInteraction === 'answered' &&
      this.state.incomingUI &&
      this.answeredCall
    ) {
      console.log('answered call notification fired up from component update');
      sendNotification(this.answeredCall!);
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
          console.log(token);
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
          console.log(token);
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
  async terminateInboundUIIfNotCall() {
    setTimeout(() => {
      if (this.state.callState === 'idle' && this.state.callKeepCallActive) {
        RNCallKeep.endCall(this.state.callUuid as string);
        this.setState({ callKeepCallActive: false });
        this.setState({ notificationCall: false });
        this.setState({ incomingUI: false });
      }
    }, 8000);
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
    this.terminateInboundUIIfNotCall();
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
    // --- NOTE: You still need to subscribe / handle the rest events as usual.
    // --- This is just a helper which cache and propagate early fired events if and only if for
    // --- "the native events which DID fire BEFORE js bridge is initialed",
    // --- it does NOT mean this will have events each time when the app reopened.

    // ===== Step 1: subscribe `register` event =====
    VoipPushNotification.addEventListener('register', (token) => {
      // --- send token to your apn provider server
      // The timeout is not needed is server is using database but with writing into files the server resets itself.
      // Therefore, this delay makes time for server to reset after registering user request.
      this.iosDeviceToken = token;
    });

    // ===== Step 2: subscribe `notification` event =====
    // --- this.onVoipPushNotificationReceived
    VoipPushNotification.addEventListener('notification', (notification) => {
      // --- when receive remote voip push, register your VoIP client, show local notification ... etc
      this.setStatesNotificationCall(notification.uuid);
      // console.log('[ Push Notifications ]', 'Notification:', notification);

      sendNotification({
        uuid: notification.uuid,
        caller: notification.callerName,
        callee: this.props.registerClientId,
        webrtc_ready: true,
      });

      // --- optionally, if you `addCompletionHandler` from the native side, once you have done the js jobs to initiate a call, call `completion()`
      VoipPushNotification.onVoipNotificationCompleted(notification.uuid);
    });

    // ===== Step 3: subscribe `didLoadWithEvents` event =====
    VoipPushNotification.addEventListener('didLoadWithEvents', (events) => {
      // --- this will fire when there are events occurred before js bridge initialized
      // --- use this event to execute your event handler manually by event type
      // console.log('[ Push Notifications ]', 'Events:', events);

      if (!events || !Array.isArray(events) || events.length < 1) {
        return;
      }
      for (let voipPushEvent of events) {
        let { name, data } = voipPushEvent;
        // console.log('[ Push Notifications ]', 'Event Name:', name);
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
          // console.log('[ Push Notifications ]', 'Event Received data', data);
          if (data.uuid) {
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

    // ===== Step 4: register =====
    // --- it will be no-op if you have subscribed before (like in native side)
    // --- but will fire `register` event if we have latest cashed voip token ( it may be empty if no token at all )
    VoipPushNotification.registerVoipToken(); // --- register token
    console.log('[ AcuCall ]', 'VoiP Push Notifications Initialized:');
  }

  /**
   * Head component
   * @returns view
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
                State: {this.state.callState}
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
