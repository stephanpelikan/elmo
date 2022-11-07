import { useEffect } from "react";

let now = new Date();

const useKeepNowUpToDate = (
    dependencies: Array<any>,
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
    }, dependencies);
  
};

export { now, useKeepNowUpToDate };
