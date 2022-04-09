import { Anchor, Box, Heading, Paragraph } from "grommet";
import { Google, Amazon } from "grommet-icons";
import { useEffect } from "react";
import { useAppContext, fetchOauth2Clients } from '../AppContext';
import TextHeading from '../components/TextHeading';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';

i18n.addResources('en', 'email-verification', {
      "confirm-address": "Confirm email-address",
    });
i18n.addResources('de', 'email-verification', {
      "confirm-address": "Email-Adresse bestätigen",
    });

const EmailVerification = () => {
  const { t } = useTranslation('email-verification');
  
  const { state, dispatch } = useAppContext();
  
  return (
    <Box
        direction='column'
        fill='horizontal'
        flex='shrink'
        align='center'
        gap='medium'
        pad='medium'
        width='medium'>
      <Box>
        <Heading size='small' level='2'>{t('confirm-address')}</Heading>
      </Box>
    </Box>);
}

export { EmailVerification };
