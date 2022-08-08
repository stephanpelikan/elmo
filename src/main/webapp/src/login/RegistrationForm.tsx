import { Box, Button, CheckBox, DateInput, Form, FormField, Heading, ResponsiveContext, Select, TextInput } from "grommet";
import { useContext, useState } from "react";
import { useAppContext } from '../AppContext';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';
import { MemberApplicationForm, Sex } from '../client/gui';
import { CalendarHeader } from "../components/CalendarHeader";
import styled from "styled-components";

const CodeButton = styled(Button)`
  position: relative;
  &:after {
    content: '';
    width: 110%;
    height: 1px;
    background: white;
    position: absolute;
    bottom: calc(${(props) => props.theme.button.secondary.border.width} * -1 - 1px);
    left: -5%;
  }
`;

i18n.addResources('en', 'registration-form', {
      "personal data": "Personal data",
      "first-name": "First name:",
      "last-name": "Last name:",
      "sex": "Sex:",
      "MALE": "Male",
      "FEMALE": "Female",
      "OTHER": "Other",
      "birthdate": "Birthdate:",
      "birthdate_format": "yyyy/m/d",
      "birthdate_validation": "Wrong format, use yyyy/mm/dd",
      "address data": "Address data",
      "street": "Street:",
      "street-number": "Street number:",
      "zip": "ZIP:",
      "city": "City:",
      "contact data": "Contact data",
      "email": "Email-address:",
      "email-confirmation-code": "Email confirmation code:",
      "phone-number": "Phone number:",
      "prefer-notifications-per-sms": "Notify by SMS instead email?",
      "submit-form": "Submit",
    });
i18n.addResources('de', 'registration-form', {
      "personal data": "Persönliche Daten",
      "first-name": "Vorname:",
      "last-name": "Nachname:",
      "sex": "Geschlecht:",
      "MALE": "Mann",
      "FEMALE": "Frau",
      "OTHER": "Andere",
      "birthdate": "Geburtstag:",
      "birthdate_format": "d.m.yyyy",
      "birthdate_validation": "Falsches Format, bitte DD.MM.JJJJ verwenden",
      "address data": "Adressdaten",
      "street": "Straße:",
      "street-number": "Hausnummer:",
      "zip": "PLZ:",
      "city": "Stadt:",
      "contact data": "Kontaktdaten",
      "email": "Email-Adresse:",
      "email-confirmation-code": "Email Bestätigungscode:",
      "request-email-confirmation-code": "Anfordern",
      "phone-number": "Telefon:",
      "phone-confirmation-code": "SMS Bestätigungscode:",
      "phone-confirmation-code-title": "SMS Bestätigungscode:",
      "phone-confirmation-code-message": "Der Code wurde an die angegebene Email-Adresse versendet!",
      "request-phone-confirmation-code": "Anfordern",
      "prefer-notifications-per-sms": "Hinweise per SMS statt Email?",
      "submit-form": "Absenden",
    });

const RegistrationForm = () => {
  const { t } = useTranslation('registration-form');
  
  const { state, guiApi, memberApplicationFormSubmitted, toast } = useAppContext();
  
  const initialForm: MemberApplicationForm = {
      firstName: state.currentUser.firstName,
      lastName: state.currentUser.name,
      sex: null,
      birthdate: null,
      zip: "",
      city: "",
      street: "",
      streetNumber: "",
      email: state.currentUser.email,
      emailConfirmationCode: null,
      phoneNumber: "",
      phoneConfirmationCode: null,
      preferNotificationsPerSms: false
  };
  const [ formValue, setFormValue ] = useState(initialForm);
  const [ submitting, setSubmitting ] = useState(false);

  const submitForm = async () => {
    try {
      setSubmitting(true);
      await guiApi.submitMemberApplicationForm({ memberApplicationForm: formValue });
      memberApplicationFormSubmitted();
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };
  
  const requestSmsCode = async () => {
    guiApi
        .requestEmailCode({ emailAddress: formValue.phoneNumber })
        .then(() =>
          toast({
            namespace: 'registration-form',
            title: t('phone-confirmation-code-title'),
            message: t('phone-confirmation-code-message'),
          }));
  };
  
  const requestEmailCode = async () => {
    guiApi
        .requestEmailCode({ emailAddress: formValue.email })
        .then(() =>
          toast({
            namespace: 'registration-form',
            title: t('phone-confirmation-code-title'),
            message: t('phone-confirmation-code-message'),
          }));
  };
  
  const setBirthdate = (dateInput: string|Date) => {
    let date: Date;
    if (dateInput === undefined) {
      date = undefined;
    } else if (typeof dateInput === 'string') {
      date = new Date(dateInput);
      date = new Date(date.getTime());
      if (date && (!(date instanceof Date) || isNaN(date.getTime()))) {
        return;
      }
    } else {
      date = dateInput;
    }
    setFormValue({
      ...formValue,
      birthdate: date
    })
  };
  
  const setSex = (sex: Sex) => {
    setFormValue({
      ...formValue,
      sex
    })
  };
  
  const bdv = () => { 
    console.log(`bdv: '${formValue?.birthdate}'`);
    return formValue?.birthdate?.toISOString()
  };
  
  const size = useContext(ResponsiveContext);
  
  return (
    <Box
        pad='small'>
      <Form<MemberApplicationForm>
          value={ formValue }
          validate='change'
          onChange={ nextValue => {
              setFormValue(nextValue);
            } }
          onReset={ () => setFormValue(undefined) }
          onSubmit={ value => submitForm() }>
        <Heading
            size='small'
            level='2'>{t('personal data')}</Heading>
        {/* first name */}
        <FormField
            name="firstName"
            label={ t('first-name') }
            disabled={ submitting } />
        {/* last name */}
        <FormField
            name="lastName"
            label={ t('last-name') }
            disabled={ submitting } />
        {/* sex */}
        <FormField
            name="sex"
            label={ t('sex') }
            disabled={ submitting }
            htmlFor="sexSelect">
          <Select
              id="sexSelect"
              options={[ Sex.Female, Sex.Male, Sex.Other ]}
              value={ formValue?.sex }
              labelKey={t}
              onChange={({ value }) => setSex(value)}
            />
        </FormField>
        {/* birthdate */}
        <FormField
            name="birthdate"
            label={ t('birthdate') }
            validate={ ( value ) => !(value instanceof Date) || isNaN(value.getTime()) ? t('birthdate_validation') : undefined }
            disabled={ submitting }>
          <DateInput
              format={ t('birthdate_format') }
              value={ bdv() }
              onChange={ ({ value }) => setBirthdate(value as string) }
              calendarProps={ {
                  fill: size === 'small',
                  animate: false,
                  header: props => CalendarHeader({ ...props, setDate: setBirthdate })
                } } />
        </FormField>
        <Heading
            size='small'
            level='2'>{t('address data')}</Heading>
        {/* street */}
        <FormField
            name="street"
            label={ t('street') }
            disabled={ submitting } />
        {/* street number */}
        <FormField
            name="streetNumber"
            label={ t('street-number') }
            disabled={ submitting } />
        {/* zip */}
        <FormField
            name="zip"
            label={ t('zip') }
            disabled={ submitting } />
        {/* city */}
        <FormField
            name="city"
            label={ t('city') }
            disabled={ submitting } />
        <Heading
            size='small'
            level='2'>{t('contact data')}</Heading>
        {/* email */}
        <FormField
            name="email"
            label={ t('email') }
            disabled={ submitting } />
        <FormField
            htmlFor="emailConfirmationCode"
            label={ t('email-confirmation-code') }
            disabled={ submitting }>
          <Box
              direction="row"
              gap="medium"
            >
          <TextInput
              id="emailConfirmationCode"
              focusIndicator={false}
              plain />
          <CodeButton
              secondary
              fill={false}
              disabled={ submitting }
              onClick={ value => requestEmailCode() }
              label={ t('request-email-confirmation-code') } />
          </Box>
        </FormField>
        {/* phone */}
        <FormField
            name="phoneNumber"
            label={ t('phone-number') }
            disabled={ submitting } />
        <FormField
            htmlFor="phoneConfirmationCode"
            label={ t('phone-confirmation-code') }
            disabled={ submitting }>
          <Box
              direction="row"
              gap="medium"
            >
          <TextInput
              id="phoneConfirmationCode"
              focusIndicator={false}
              plain />
          <CodeButton
              secondary
              fill={false}
              disabled={ submitting }
              label={ t('request-phone-confirmation-code') } />
          </Box>
        </FormField>
        {/* prefer notifications per sms */}
        <FormField
            contentProps={ { border: false } }
            name="preferNotificationsPerSms">
          <CheckBox
              name="preferNotificationsPerSms"
              label={ t('prefer-notifications-per-sms') }
              disabled={ submitting }
            />
        </FormField>
        <Box
            margin={ { vertical: '2rem' } }
            direction="row-responsive"
            gap="medium"
            wrap>
          <Button
              type="submit"
              primary
              disabled={ submitting }
              label={ t('submit-form') } />
        </Box>
      </Form>
    </Box>);
}

export { RegistrationForm };
