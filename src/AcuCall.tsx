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
  showAlert,
} from 'react-native-aculab-client';
import { MenuButton } from './components/MenuButton';
import { KeypadButton } from './components/KeypadButton';
import { CallButton } from './components/CallButton';
import { RoundButton } from './components/RoundButton';
import EncryptedStorage from 'react-native-encrypted-storage';

import VoipPushNotification from 'react-native-voip-push-notification';
import { AuthContext } from './App';
import { deleteUser, sendNotification, updateUser } from './middleware';

import RNCallKeep from 'react-native-callkeep';

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
            if (Platform.OS !== 'ios') {
              // if (props.aculabCall.state.callUuid === '') {
              props.aculabCall.getCallUuid(() => notificationHandler(props));
              // } else {
              //   notificationHandler(props);
              // }
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

const CallDisplayHandler = (props: any) => {
  if (
    props.aculabCall.state.callState === 'incoming call' ||
    (props.aculabCall.state.incomingUI &&
      props.aculabCall.state.callUIInteraction === 'answered') ||
    (props.aculabCall.state.incomingUI &&
      props.aculabCall.state.callUIInteraction === 'none')
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

const LogOutButton = (props: any) => {
  const { signOut } = useContext(AuthContext);
  return (
    <View style={styles.registrationButton}>
      <CallButton
        title={'log out'}
        colour={COLOURS.CALLING_TEXT}
        onPress={() => {
          signOut();
          deleteUser({
            username: props.aculabCall.props.registerClientId,
            webrtcToken: props.aculabCall.props.webRTCToken,
          });
          props.aculabCall.unregister();
        }}
      />
    </View>
  );
};

const clearStorage = async () => {
  try {
    await EncryptedStorage.clear();
    // Congrats! You've just cleared the device storage!
  } catch (err) {
    console.error('[ AcuCall ]', 'clearStorage error', err);
  }
};

const notificationHandler = async (props: any) => {
  let response;
  response = await sendNotification({
    uuid: props.aculabCall.state.callUuid,
    caller: props.aculabCall.props.registerClientId,
    callee: props.aculabCall.state.callClientId,
  });

  try {
    if (response.message === 'success') {
      // this delay is needed so the app has time to initialize on the callee side
      // after receiving notification (iOS)
      setTimeout(() => {
        props.aculabCall.startCall(
          'client',
          props.aculabCall.state.callClientId
        );
      }, 7000);
    } else if (response.message === 'calling_web_interface') {
      props.aculabCall.startCall('client', props.aculabCall.state.callClientId);
    } else {
      // console.log('resp', response);
      showAlert('', response.message);
    }
  } catch (err) {
    console.error('[ notificationHandler ]', err);
  }
};

class AcuCall extends AculabCall {
  componentDidMount() {
    this.register();
    this.initializeCallKeep('AculabCall Example');
    if (Platform.OS === 'ios') {
      this.initializeVoipNotifications();
    }
  }

  componentWillUnmount() {
    this.unregister();
    this.destroyListeners();
    if (Platform.OS === 'ios') {
      this.unregisterVoipNotifications();
    }
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
  }

  unregister() {
    super.unregister();
    clearStorage();
  }

  /**
   * if the call does not connect withing the time after call being answered it terminates callkeep
   */
  async terminateInboundUIIfNotCall() {
    setTimeout(() => {
      if (this.state.callState === 'idle' && this.state.callKeepCallActive) {
        RNCallKeep.endCall(this.state.callUuid as string);
      }
    }, 10000);
  }

  /**
   * Set AculabCall states for VoIP Notification
   * @param <string> uuid for the call
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
    // --- this.onVoipPushNotificationRegistered
    VoipPushNotification.addEventListener('register', (token) => {
      // --- send token to your apn provider server
      // The timeout is not needed is server is using database but with writing into files the server resets itself.
      // Therefore, this delay makes time for server to reset after registering user request.
      setTimeout(() => {
        updateUser({
          username: this.props.registerClientId,
          platform: Platform.OS,
          webrtcToken: this.props.webRTCToken,
          deviceToken: token,
        });
      }, 3000);
      // console.log('[ Push Notifications ]', 'Token:', token);
    });

    // ===== Step 2: subscribe `notification` event =====
    // --- this.onVoipPushNotificationReceived
    VoipPushNotification.addEventListener('notification', (notification) => {
      // --- when receive remote voip push, register your VoIP client, show local notification ... etc
      this.setStatesNotificationCall(notification.uuid);
      console.log('[ Push Notifications ]', 'Notification:', notification);
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
          // this.onVoipPushNotificationRegistered(data);
          // console.log('[ Push Notifications ]', 'Event Registered Data:', data);
        } else if (
          name ===
          (VoipPushNotification as any) // ignore missing type in the package
            .RNVoipPushRemoteNotificationReceivedEvent
        ) {
          if (data.uuid) {
            this.setStatesNotificationCall(data.uuid);
          }
          // this.onVoipPushNotificationReceived(data);
          // console.log('[ Push Notifications ]', 'Event Received data', data);
          // this.setState({callUuid: data.uuid});
        }
      }
    });

    // ===== Step 4: register =====
    // --- it will be no-op if you have subscribed before (like in native side)
    // --- but will fire `register` event if we have latest cashed voip token ( it may be empty if no token at all )
    VoipPushNotification.registerVoipToken(); // --- register token
    console.log('[ AcuCall ]', 'VoiP Push Notifications Initialized:');
  }

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
