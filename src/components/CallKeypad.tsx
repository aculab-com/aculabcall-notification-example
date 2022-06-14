import React from 'react';
import { View } from 'react-native';
import { styles } from '../styles';
import { KeypadButton } from './KeypadButton';

export const CallKeypad = (props: any) => {
  return (
    <View>
      <View style={styles.callButtonsContainer}>
        <KeypadButton
          title={'1'}
          onPress={() => props.props.aculabCall.sendDtmf('1')}
        />
        <KeypadButton
          title={'2'}
          onPress={() => props.props.aculabCall.sendDtmf('2')}
        />
        <KeypadButton
          title={'3'}
          onPress={() => props.props.aculabCall.sendDtmf('3')}
        />
      </View>
      <View style={styles.callButtonsContainer}>
        <KeypadButton
          title={'4'}
          onPress={() => props.props.aculabCall.sendDtmf('4')}
        />
        <KeypadButton
          title={'5'}
          onPress={() => props.props.aculabCall.sendDtmf('5')}
        />
        <KeypadButton
          title={'6'}
          onPress={() => props.props.aculabCall.sendDtmf('6')}
        />
      </View>
      <View style={styles.callButtonsContainer}>
        <KeypadButton
          title={'7'}
          onPress={() => props.props.aculabCall.sendDtmf('7')}
        />
        <KeypadButton
          title={'8'}
          onPress={() => props.props.aculabCall.sendDtmf('8')}
        />
        <KeypadButton
          title={'9'}
          onPress={() => props.props.aculabCall.sendDtmf('9')}
        />
      </View>
      <View style={styles.callButtonsContainer}>
        <KeypadButton
          title={'*'}
          onPress={() => props.props.aculabCall.sendDtmf('*')}
        />
        <KeypadButton
          title={'0'}
          onPress={() => props.props.aculabCall.sendDtmf('0')}
        />
        <KeypadButton
          title={'#'}
          onPress={() => props.props.aculabCall.sendDtmf('#')}
        />
      </View>
    </View>
  );
};
