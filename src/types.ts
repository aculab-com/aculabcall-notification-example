import { AcuMobComProps } from 'react-native-aculab-client/lib/typescript/types';

export interface AculabCallProps extends AcuMobComProps {
  call?: string;
}

export type AculabCallParam = {
  webRTCAccessKey: string;
  webRTCToken: string;
  cloudRegionId: string;
  logLevel: number | string;
  registerClientId: string;
};

export type AuthStackParam = {
  Register: undefined;
  AculabCall: AculabCallParam;
};

export type ButtonProps = {
  title: string;
  colour?: string;
  onPress: ((event: any) => void) | undefined;
};

export type RoundButtonProps = {
  iconName: string;
  onPress: () => void;
};

export type AuthContextTypes = {
  signUp: (username: string) => void;
  signOut: () => void;
};

export interface User {
  id?: number;
  username: string;
  fcmDeviceToken?: string;
  iosDeviceToken?: string;
  platform?: string;
  webrtcToken: string;
}

export interface Notification {
  uuid: string;
  caller: string;
  callee: string;
  webrtc_ready?: boolean;
  call_rejected?: boolean;
  call_cancelled?: boolean;
}

export interface AndroidFromKilledCall {
  uuid: string;
  caller: string;
  callee: string;
}
