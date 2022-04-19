# AculabCall push notofication example app

## extras done for install

### iOS

if building error

```objective-c
(void)didUpdatePushCredentials:(PKPushCredentials *)credentials forType:(NSString *)type;     x expected type
(void)didReceiveIncomingPushWithPayload:(PKPushPayload *)payload forType:(NSString *)type;    x expected type
```

add

```objective-c
#import <PushKit/PushKit.h>
```

to RNVoipPushNotificationManager.h

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
