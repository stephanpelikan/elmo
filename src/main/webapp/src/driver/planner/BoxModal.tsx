import { Modal } from "../../components/Modal";
import { Box, TextArea } from "grommet";
import { useState } from "react";
import useResponsiveScreen from "../../utils/responsiveUtils";
import { TFunction } from "i18next";

export type ReasonModalProperties = {
  prefix: string,
  action: (comment?: string) => void,
  onAbort: () => void,
  requestComment?: boolean,
  hint: string,
} | undefined;

const BoxModal = ({
  t,
  reasonModal,
}: {
  t: TFunction,
  reasonModal: ReasonModalProperties,
}) => {
  const [ comment, setComment ] = useState<string | undefined>(undefined);
  const { isPhone } = useResponsiveScreen();

  if (reasonModal === undefined) return undefined;

  return (
      <Modal
          show={ Boolean(reasonModal) }
          t={ t }
          header={ `${reasonModal?.prefix}-header` }
          abort={ () => {
            setComment('');
            reasonModal.onAbort();
          } }
          abortLabel={ `${reasonModal?.prefix}-abort` }
          action={ () => {
            reasonModal!.action(comment);
            setComment('');
          } }
          actionLabel={ `${reasonModal?.prefix}-submit` }
          actionDisabled={ !Boolean(!reasonModal.requestComment || comment) }>
        <Box
            direction="column"
            pad={ { vertical: isPhone ? 'large' : 'small' } }
            gap={ isPhone ? 'medium' : 'small' }>
          {
            reasonModal.hint
          }
          {
            reasonModal.requestComment
                ? <TextArea
                      value={ comment }
                      onChange={ event => setComment(event.target.value) } />
                : undefined
          }
        </Box>
      </Modal>);
}

export { BoxModal };
