import { useEffect } from "react";

let now = new Date();

const useKeepNowUpToDate = (
    dependencies: Array<any> = [],
    eachSecondHook?: (lastNow?: Date) => void) => {
      
  useEffect(() => {
      const timer = window.setInterval(() => {
          const lastNow = now;
          now = new Date();
          if (eachSecondHook !== undefined) {
            eachSecondHook(lastNow);
          }
        }, 1000);
      return () => window.clearInterval(timer);
    }, [ eachSecondHook, ...dependencies ]);  // eslint-disable-line react-hooks/exhaustive-deps
  
};

export { now, useKeepNowUpToDate };
