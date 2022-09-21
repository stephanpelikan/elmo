import { useEffect } from 'react';
import { FLUTTER_REFRESH_TOKEN } from './FlutterSupport';

// @ts-ignore
const nativeCommunicator = typeof webkit !== 'undefined' ? webkit.messageHandlers.native : window.native;

const Ready = () => {
  
  useEffect(() => {
    
      const storedToken = window.localStorage.getItem(FLUTTER_REFRESH_TOKEN);
      const carAppIsActive = Boolean(storedToken);
      
      if (nativeCommunicator) {
        nativeCommunicator.postMessage(JSON.stringify([
            {
              "type": "Ready",
              "carAppActive": carAppIsActive
            }
          ]));
      } else {
        console.log(`Ready; Car-App-Active: ${carAppIsActive ? 'Yes' : 'No'}`);
      }
      
    }, []);
  
  return (<></>);
  
}

export { Ready }
