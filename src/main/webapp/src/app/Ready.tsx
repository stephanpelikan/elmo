import { useAppContext } from '../AppContext';
import { useEffect } from 'react';

// @ts-ignore
const nativeCommunicator = typeof webkit !== 'undefined' ? webkit.messageHandlers.native : window.native;

const Ready = () => {
  
  const { state } = useAppContext();
  
  useEffect(() => {
      if ((state.currentUser !== undefined)
          && (state.currentUser !== null)) {
        if (nativeCommunicator) {
          nativeCommunicator.postMessage(JSON.stringify([
              {
                "type": "Ready"
              }
            ]));
        } else {
          console.log('Ready');
        }
      }
    },
    [state?.currentUser]);
  
  return (<></>);
  
}

export { Ready }
