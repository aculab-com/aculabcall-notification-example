# AculabCall push notofication example app

## extras done for install

### iOS

if building error

```objective-c
(void)didUpdatePushCredentials:(PKPushCredentials *)credentials forType:(NSString *)type;     x expected type
(void)didReceiveIncomingPushWithPayload:(PKPushPayload *)payload forType:(NSString *)type;    x expected type
```

add to RNVoipPushNotificationManager.h

```objective-c
#import <PushKit/PushKit.h>
```

## SETUP iOS

go to developer.apple.com > Certificates

Create VoIP Services Certificate

download certificate, make.p12 file and from it make .pen file from it and use it for test

https://medium.com/mindful-engineering/voice-over-internet-protocol-voip-801ee15c3722

After you create VOIP.pem you can test if you VoIP notifications are working by running command using terminal from folder where VOIP.pem file lives.

```curl
curl -v --header "apns-topic: <App ID>.voip" --header "apns-push-type: voip" --header "apns-id: 123e4567-e89b-12d3-a456-4266554400a0" --cert VOIP.pem:password --data '{"uuid":"123e4567-e89b-12d3-a456-4266554400a0", "callerName":"test", "handle":"some handle"}' --http2  https://api.sandbox.push.apple.com/3/device/<device token>
```

handy links:

https://developer.apple.com/documentation/usernotifications/setting_up_a_remote_notification_server/sending_notification_requests_to_apns

https://developer.apple.com/documentation/usernotifications/setting_up_a_remote_notification_server/establishing_a_certificate-based_connection_to_apns

https://developer.apple.com/documentation/usernotifications/sending_push_notifications_using_command-line_tools

### Android
if android throws [TypeError: Network request failed] when registering user (fetch function) run

adb reverse tcp:serverPort tcp:serverPort

example

```cmd
adb reverse tcp:3500 tcp:3500
```

if multiple devices connected run adb devices to get list of devices

and run

adb -s deviceCodeFromListOfDevices reverse tcp:serverPort tcp:serverPort

example

```cmd
adb -s ZY2243N2N6 reverse tcp:3500 tcp:3500
```

### iOS

if iOS throws [TypeError: Network request failed] when registering user (fetch function)

make sure that the fetch function uses your machines network internal IP found in networks eg. 192.168.0.19

if the issue persists make sure your idb is up to date.

```cmd
sudo pip3 install --upgrade fb-idb
```
