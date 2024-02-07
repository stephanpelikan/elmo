import { Notification, Timeout } from "grommet";
import { useCallback, useEffect, useLayoutEffect } from "react";
import { useTranslation } from "react-i18next";
import { Dispatch, Toast } from '../AppContext';

interface MessageToastProps {
  dispatch: Dispatch
  msg: Toast;
}

const MessageToast = ({ dispatch, msg }: MessageToastProps) => {
  const { t, i18n } = useTranslation(msg.namespace);

  // see https://github.com/i18next/react-i18next/issues/1064
  useLayoutEffect(() => {
    // manually emitting a languageChanged-Event would work around this problem
    i18n.emit("languageChanged");
  }, [ msg, i18n ]);
  
  const close = useCallback(() => dispatch({ type: 'toast', toast: undefined }), [dispatch]);

  const message = t(msg.message, msg.tOptions);
  let timeout = msg.timeout !== undefined ? msg.timeout : message.length * 40;
  if (timeout < 3000) timeout = 3000;

  useEffect(() => {
    const timer: Timeout = window.setTimeout(close, timeout);
    return () => window.clearTimeout(timer);
  }, [timeout, close]);

  return (
    <Notification
        toast={ { autoClose: false } }
        title={ msg.title ? t(msg.title, msg.tOptions) as string : undefined }
        message={ message }
        status={ msg.status ? msg.status : 'unknown' }
        time={ timeout }
        onClose={ close }
    />
  );
}
      
export { MessageToast };
