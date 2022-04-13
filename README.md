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
