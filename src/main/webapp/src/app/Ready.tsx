import { useAppContext } from '../AppContext';
import { useEffect } from 'react';

// @ts-ignore
const nativeCommunicator = typeof webkit !== 'undefined' ? webkit.messageHandlers.native : window.native;

const Ready = () => {
  
  const { state } = useAppContext();
  
  useEffect(() => {
      if (state.currentUser !== undefined) {
        nativeCommunicator.postMessage(JSON.stringify([
          {
            "type": "Ready"
          }
        ]));
      }
    },
    [state?.currentUser]);
  
  return (<></>);
  
}

export { Ready }
