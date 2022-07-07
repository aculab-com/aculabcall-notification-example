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

You have to edit variable URL_BASE within middleware.ts file in order for requests to find your server.
The variable expects string in format \<server IP>:\<server port>'

for example:

```ts
const URL_BASE = 'http://192.168.0.12:3500/';
```

## configure for notifications

Note, this example uses Firebase Cloud Messaging (FCM) and Apple Voice over Internet Protocol (VoIP) notification. For this example application to work correctly you must set FCM for android and also for iOS (make sure you linked the FCM with Apple APN) as well as set up iOS VoIP Notifications.

Side note:  
You can achieve the same results using only FCM notifications linked to Apple APN. Effectively you can not be using apple APN directly as this example does for [iOS incoming call notification](https://github.com/aculab-com/AculabCall-notification-server/blob/main/middleware/notificationHandler.ts#L10) (server side). To make it work correctly you will need to register CallKeep in [app's index](https://github.com/aculab-com/aculabcall-notification-example/blob/main/index.js) file and make use of FCM background messages to wake up the app on iOS. You can use the Android style of notifications as guidance for your code.

### iOS VoIP

go to your developer apple account > Certificates

Create VoIP Services Certificate, download certificate, make.p12 file and from it make .pem file.

You can follow take inspiration from [this guide's](https://medium.com/mindful-engineering/voice-over-internet-protocol-voip-801ee15c3722) Prepare to Receive VoIP Push Notifications section.

After you create VOIP.pem you can test if your VoIP notifications are working by running curl command bellow using terminal from folder where VOIP.pem file lives. Variables for this command can be found in following ways:  
get ios_bundle: open ios/xcworkspace with Xcode.. your_app -> TARGETS - Your_app -> General - Bundle Identifier  
get device_token: console log token variable within [VoipPushNotification 'register' event listener](https://github.com/aculab-com/aculabcall-notification-example/blob/main/src/AcuCall.tsx#L704) run the app on iOS and when initializeVoipNotifications() is called the device_token will log into the Metro console.

```curl
curl -v --header "apns-topic: <ios_bundle>.voip" --header "apns-push-type: voip" --header "apns-id: 123e4567-e89b-12d3-a456-4266554400a0" --cert VOIP.pem:password --data '{"uuid":"123e4567-e89b-12d3-a456-4266554400a0", "callerName":"test", "handle":"some handle"}' --http2  https://api.sandbox.push.apple.com/3/device/<device_token>
```

This certificate needs to be placed in the [AculabCall-notification-server](https://github.com/aculab-com/AculabCall-notification-server#apple-apn) in certificates folder.

handy links:  
[sending_notification_requests_to_apns](https://developer.apple.com/documentation/usernotifications/setting_up_a_remote_notification_server/sending_notification_requests_to_apns)  
[establishing_a_certificate-based_connection_to_apns](https://developer.apple.com/documentation/usernotifications/setting_up_a_remote_notification_server/establishing_a_certificate-based_connection_to_apns)  
[sending_push_notifications_using_command-line_tools](https://developer.apple.com/documentation/usernotifications/sending_push_notifications_using_command-line_tools)

### FCM

This example application is using Cloud Messaging API (Legacy)
register you app on firebase console <https://console.firebase.google.com>

**Register the example app with firebase**  
**get Google-services.json file** (steps 1-3 of [Firebase Android documentation](https://firebase.google.com/docs/android/setup))  
and place it into android/app folder

**get GoogleService-Info.plist file** (steps 1-3 of [this documentation](https://firebase.google.com/docs/ios/setup))  
and place it into ios/app folder  
**Upload your APNs authentication key** to Firebase. If you don't already have an APNs authentication key, make sure to create one in the [Apple Developer Member Center](https://developer.apple.com/membercenter/index.action).  
Certificates, Identifiers & Profiles -> Keys -> create new key -> Enter the key Name, select Apple Push Notification service (APNs) and click Continue -> click Register -> download the auth key.

1. Inside your project in the Firebase console, select the gear icon, select **Project Settings**, and then select the **Cloud Messaging** tab.
2. In **APNs authentication key** under **iOS app configuration**, click the **Upload** button.
3. Browse to the location where you saved your key, select it, and click **Open**. Add the key ID for the key (available in the [Apple Developer Member Center](https://developer.apple.com/membercenter/index.action)) and click **Upload**.

get FCM API Key:  
go to [console firebase](https://console.firebase.google.com) -> your project -> project settings -> Cloud Messaging

There you find in Cloud Messaging API section the Server Key value.  
This key needs to be stored in [AculabCall-notification-server](https://github.com/aculab-com/AculabCall-notification-server#aculab-and-fcm-constants)

handy link:  
[react native firebase](https://rnfirebase.io/)

## Errors you may encounter

### Android

If android has problems to connect to the [AculabCall-notification-server](https://github.com/aculab-com/AculabCall-notification-server) e.g. throws [TypeError: Network request failed] when registering user (fetch function) and iOS works, make sure that [android debug bridge (adb)](https://developer.android.com/studio/command-line/adb) can reach the server's port by running the following command from the app's root folder:

adb reverse tcp:serverPort tcp:serverPort  
for example if you server runs on port 3500, run:

```cmd
adb reverse tcp:3500 tcp:3500
```

if multiple android devices are connected, get list of devices:

```cmd
adb devices
```

then run reverse command on a particular device you running the app on:  
adb -s deviceCodeFromListOfDevices reverse tcp:serverPort tcp:serverPort

for example:

```cmd
adb -s ZY2243N2N6 reverse tcp:3500 tcp:3500
```

### iOS

#### iOS Network error

If iOS throws [TypeError: Network request failed] when registering user (fetch function)
make sure that the fetch function uses your machine's network internal IP found in networks eg. 192.168.0.19

I have encountered this issue while I was using localhost and local host IP (127.0.0.1).

If the issue persists make sure your [iOS development bridge (idb)](https://fbidb.io/docs/overview) is up to date.

update idb by running following command from app's root folder:

```cmd
sudo pip3 install --upgrade fb-idb
```

#### iOS build error

If build error:

```objective-c
(void)didUpdatePushCredentials:(PKPushCredentials *)credentials forType:(NSString *)type;     x expected type
(void)didReceiveIncomingPushWithPayload:(PKPushPayload *)payload forType:(NSString *)type;    x expected type
```

I have encountered this error and narrowed it down to RNVoipPushNotification package missing PushKit import.

add to RNVoipPushNotificationManager.h

```objective-c
#import <PushKit/PushKit.h>
```

#### iOS signing error

If you encounter error:

'Your development team, "ACCOUNT NAME", does not support the Push Notifications capability'

There are 2 possibilities:

1. Your Apple account is not enrolled with developer program. In this case get your apple account enrolled with the Apple developer program.

2. Your Account is registered as an organization, you might be using the account of an individual person for "Signing Team". In this case select the organization as "Signing Team".
