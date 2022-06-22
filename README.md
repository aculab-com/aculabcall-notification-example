# AculabCall push notification example app

requires [AculabCall-notification-server](https://github.com/aculab-com/AculabCall-notification-server) set-up and running

## Install The Example App

### dependencies

```terminal
npm install
```

### pods

```terminal
npx pod-install
```

### Manually add DTMF method for android

Open node_modules/react-native-webrtc/android/src/main/java/com/oney/WebRTCModule/WebRTCModule.java and add the method below into class WebRTCModule.

If you skip this step, the Android platform will throw an error when sendDtmf is called.

``` java
@ReactMethod
public void peerConnectionSendDTMF(String tone, int duration, int interToneGap, int objectID) {
    PeerConnection pc = getPeerConnection(objectID);
    RtpSender sender = pc.getSenders().get(0);

    if (sender != null) {
        DtmfSender dtmfSender = sender.dtmf();
        dtmfSender.insertDtmf(tone, duration, interToneGap); //Here the timers are in ms
    }
}
```

### Server connection

you have to edit variable URL_BASE within middleware.ts file in order for requests to find your server.
The variable expects string in format \<server IP>:\<server port>'

for example

```ts
const URL_BASE = 'http://192.168.0.12:3500/';
```

## configure for notifications

Note, this example uses FCM and VoIP notification, however you can achieve the same results using only FCM notifications if you replace iOS Voip notification with FCM notification. To make it work correctly you will need to register CallKeep in app's index. Moreover, use Android way of working with FCM notifications as inspiration for your logic.

### iOS VoIP

go to your developer apple account > Certificates

Create VoIP Services Certificate

download certificate, make.p12 file and from it make .pen file and use it for test, you can follow [this guide](https://medium.com/mindful-engineering/voice-over-internet-protocol-voip-801ee15c3722).

After you create VOIP.pem you can test if your VoIP notifications are working by running command using terminal from folder where VOIP.pem file lives.

```curl
curl -v --header "apns-topic: <App ID>.voip" --header "apns-push-type: voip" --header "apns-id: 123e4567-e89b-12d3-a456-4266554400a0" --cert VOIP.pem:password --data '{"uuid":"123e4567-e89b-12d3-a456-4266554400a0", "callerName":"test", "handle":"some handle"}' --http2  https://api.sandbox.push.apple.com/3/device/<device token>
```

This certificate needs to be placed in the [AculabCall-notification-server](https://github.com/aculab-com/AculabCall-notification-server#apple-apn).

handy links:

[sending_notification_requests_to_apns](https://developer.apple.com/documentation/usernotifications/setting_up_a_remote_notification_server/sending_notification_requests_to_apns)

[establishing_a_certificate-based_connection_to_apns](https://developer.apple.com/documentation/usernotifications/setting_up_a_remote_notification_server/establishing_a_certificate-based_connection_to_apns)

[sending_push_notifications_using_command-line_tools](https://developer.apple.com/documentation/usernotifications/sending_push_notifications_using_command-line_tools)

### FCM

Register the example app with firebase
get Google-services.json file (steps 1-3 of [Firebase Android documentation](https://firebase.google.com/docs/android/setup))
and place it into android/app folder

get GoogleService-Info.plist file (steps 1-3 of [this documentation](https://firebase.google.com/docs/ios/setup))
and place it into ios/app folder

get FCM API Key:
go to [console firebase](https://console.firebase.google.com) -> your project -> project settings -> Cloud Messaging
There you find in Cloud Messaging API section the Server Key value.
This key needs to be stored in [AculabCall-notification-server](https://github.com/aculab-com/AculabCall-notification-server#aculab-and-fcm-constants)

handy link:

[react native firebase](https://rnfirebase.io/)

## Potential errors

### Android

if android has problems to connect to the [AculabCall-notification-server](https://github.com/aculab-com/AculabCall-notification-server) e.g. throws [TypeError: Network request failed] when registering user (fetch function) and iOS works, run:

adb reverse tcp:serverPort tcp:serverPort

for example if you server runs on port 3500, run:

```cmd
adb reverse tcp:3500 tcp:3500
```

if multiple devices are connected, get list of devices:

```cmd
adb devices
```

then run reverse command on particular device:

adb -s deviceCodeFromListOfDevices reverse tcp:serverPort tcp:serverPort

for example:

```cmd
adb -s ZY2243N2N6 reverse tcp:3500 tcp:3500
```

android firebase messaging

register you app on firebase console <https://console.firebase.google.com>

### iOS

#### iOS Network error

if iOS throws [TypeError: Network request failed] when registering user (fetch function)

make sure that the fetch function uses your machine's network internal IP found in networks eg. 192.168.0.19

if the issue persists make sure your idb is up to date.

```cmd
sudo pip3 install --upgrade fb-idb
```

#### iOS build error

if build error

```objective-c
(void)didUpdatePushCredentials:(PKPushCredentials *)credentials forType:(NSString *)type;     x expected type
(void)didReceiveIncomingPushWithPayload:(PKPushPayload *)payload forType:(NSString *)type;    x expected type
```

add to RNVoipPushNotificationManager.h

```objective-c
#import <PushKit/PushKit.h>
```
