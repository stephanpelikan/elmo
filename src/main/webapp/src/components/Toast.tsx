import { Notification } from "grommet";
import { useCallback, useEffect, useLayoutEffect } from "react";
import { useTranslation } from "react-i18next";
import { Dispatch, Toast } from '../AppContext';

interface MessageToastProps {
  dispatch: Dispatch
  msg: Toast;
};

const MessageToast = ({ dispatch, msg }: MessageToastProps) => {
  const { t, i18n } = useTranslation(msg.namespace);
  
  // see https://github.com/i18next/react-i18next/issues/1064
  useLayoutEffect(() => {
    // manually emitting a languageChanged-Event would work around this problem
    i18n.emit("languageChanged");
  }, [ msg, i18n ]);
  
  const close = useCallback(() => dispatch({ type: 'toast', toast: undefined }), [dispatch]);
  
  useEffect(() => {
    const timer = setTimeout(close, 4000);
    return () => clearTimeout(timer);
  }, [msg, close]);
  
  return (
    <Notification
        toast={{ autoClose: false }}
        title={msg.title ? t(msg.title as string) : undefined}
        message={t(msg.message)}
        onClose={close}
    />
  );
}
      
export { MessageToast };
