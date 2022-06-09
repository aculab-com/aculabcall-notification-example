import { showAlert } from 'react-native-aculab-client';
import { sendCallNotification } from './middleware';

/**
 * Sends call notification
 * @param props expects AculabCall instance
 */
export const notificationHandler = async (props: any) => {
  let response;
  response = await sendCallNotification({
    uuid: props.aculabCall.state.callUuid,
    caller: props.aculabCall.props.registerClientId,
    callee: props.aculabCall.state.callClientId,
  });

  console.log('notificationHandler response:', response);
  props.aculabCall.setState({ outboundCall: true });

  if (response.error) {
    props.aculabCall.setState({ outboundCall: false });
    showAlert('', response.error);
  }

  if (response.message === 'calling_web_interface') {
    props.aculabCall.startCall('client', props.aculabCall.state.callClientId);
  }
};
