import { Notification } from "grommet";
import { useLayoutEffect } from "react";
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
    //Manually emitting a languageChanged-Event would work around this problem
    i18n.emit("languageChanged");
  }, [ msg, i18n ]);
  
  return (
    <Notification
        toast
        title={msg.title ? t(msg.title as string) : undefined}
        message={t(msg.message)}
        onClose={() => dispatch({ type: 'toast', toast: undefined })}
    />
  );
}
      
export { MessageToast };
