import { Box, Button, Heading, Layer } from "grommet";
import { TFunction } from "i18next";
import { PropsWithChildren } from "react";

interface ModalProperties {
  show: boolean;
  header?: string;
  abort?: () => void;
  action?: () => void;
  actionLabel?: string;
  t: TFunction;
};

const Modal = ({
    show,
    header,
    abort,
    action,
    actionLabel,
    t,
    children
  }: PropsWithChildren<ModalProperties>) => {
    
  if (!show) return <></>;
  
  return (
    <Layer
        full
        animation="fadeIn"
        background={ { color: 'dark-1', opacity: true } }
        onEsc={ abort }
        responsive={true}
        modal={true}>
      <Box
          height='100%'
          justify="center"
          direction="column">
        <Box
            justify='center'
            direction='row'
            pad='medium'>
          <Box
              pad='medium'
              background='white'>
            {
              header
                ? <Heading
                      margin={ { vertical: 'xsmall' } }
                      level='2'>
                    { t(header) }
                  </Heading>
                : <></>
            }
            {
              children
            }
            {
              action
                ? <Box
                      direction='row'
                      justify='between'>
                    <Button
                        label={ t(actionLabel) }
                        onClick={ action }
                        primary />
                    {
                      abort
                        ? <Button
                        label={ t('abort') }
                        onClick={ abort }
                        secondary />
                      : <></>
                    }
                  </Box>
                : <></>
            }
          </Box>
        </Box>
      </Box>
    </Layer>);
  
};

export { Modal };
