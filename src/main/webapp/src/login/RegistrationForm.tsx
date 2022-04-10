import { Box, Button, DateInput, Heading, RadioButtonGroup, Select, TextInput } from "grommet";
import { useState } from "react";
import { useAppContext, memberApplicationFormSubmitted } from '../AppContext';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';
import { MemberApplicationForm, Sex } from '../client/gui';
import { guiApi } from '../client';

i18n.addResources('en', 'registration-form', {
      "registration data": "Registration form",
    });
i18n.addResources('de', 'registration-form', {
      "registration data": "Registrierungsdaten",
    });

const RegistrationForm = () => {
  const { t } = useTranslation('registration-form');
  
  const { state, dispatch } = useAppContext();
  
  const initialForm: MemberApplicationForm = {
      firstName: state.currentUser.firstName,
      lastName: state.currentUser.name,
      sex: state.currentUser.female ? Sex.Female : Sex.Male,
      birthdate: undefined,
      zip: "",
      city: "",
      street: "",
      streetNumber: "",
      email: state.currentUser.email,
      emailConfirmationCode: null,
      phoneCountryCode: "",
      phoneProviderCode: "",
      phoneNumber: "",
      phoneConfirmationCode: null,
      preferNotificationsPerSms: false
  };
  const [ form, setForm ] = useState(initialForm);
  const [ submitting, setSubmitting ] = useState(false);

  const submitForm = async () => {
    try {
      setSubmitting(true);
      await guiApi.submitMemberApplicationForm({ memberApplicationForm: form });
      memberApplicationFormSubmitted(state, dispatch);
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };
  
  const requestSmsCode = async () => {
    
  };
  
  const requestEmailCode = async () => {
    
  };
  
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
        <Heading size='small' level='2'>{t('registration data')}</Heading>
        <Heading level='3'>{t('personal data')}</Heading>
        <TextInput placeholder={t('first name')} />
        <TextInput placeholder={t('last name')} />
        <Select options={['', t('male'), t('female'), t('other')]} />
        <DateInput format="dd.mm.yyyy" />
        <Heading level='3'>{t('address data')}</Heading>
        <TextInput placeholder={t('city')} />
        <TextInput placeholder={t('street')} />
        <TextInput placeholder={t('number')} />
        <Heading level='3'>{t('contact data')}</Heading>
        <TextInput placeholder={t('country code')} />
        <TextInput placeholder={t('provider code')} />
        <TextInput placeholder={t('phone number')} />
        <Button secondary label={t('request code SMS')} />
        <TextInput placeholder={t('code received via SMS')} />
        { /* read-only in case of state.currentUser.status === UserStatus.EmailVerified */}
        <TextInput placeholder={t('email address')} />
        { /* only shown in case of state.currentUser.status === UserStatus.New */}
        <Button secondary label={t('request code email')} />
        <TextInput placeholder={t('code received via email')} />
        { /* send ride-notifications via: */}
        <RadioButtonGroup name='notify' options={[t('email') as string, t('sms') as string]} />
        <Button primary label={t('commit')} />
      </Box>
    </Box>);
}

export { RegistrationForm };
