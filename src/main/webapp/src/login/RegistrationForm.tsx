import { Anchor, Box, Button, CheckBox, DateInput, Form, FormField, Heading, Paragraph, ResponsiveContext, Select, Text, TextArea, TextInput } from "grommet";
import { useContext, useEffect, useState } from "react";
import { useAppContext } from '../AppContext';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';
import { GuiApi, MemberApplicationForm, Sex } from '../client/gui';
import { CalendarHeader } from "../components/CalendarHeader";
import { ViolationsAwareFormField } from "../components/ViolationsAwareFormField";
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
      "title.long": 'Registration',
      "title.short": 'Registration',
      "personal data": "Personal data",
      "person-title": "Title:",
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
      "about application": "About your application",
      "comment": "Change notices:",
      "application-comment": "Remarks you want to make:",
      "application-comment_placeholder": "What would you like to tell us?",
      "terms-and-conditions": "I agree to service conditions:",
      "terms-and-conditions-details": "details",
      "submit-form": "Submit",
    });
i18n.addResources('de', 'registration-form', {
      "title.long": 'Registrierung',
      "title.short": 'Registrierung',
      "personal data": "Persönliche Daten",
      "person-title": "Titel:",
      "first-name": "Vorname:",
      "first-name_missing": "Bitte trage deinen Vornamen ein!",
      "last-name": "Nachname:",
      "last-name_missing": "Bitte trage deinen Nachnamen ein!",
      "sex": "Geschlecht:",
      "sex_missing": "Bitte wähle ein Geschlecht!",
      "MALE": "Mann",
      "FEMALE": "Frau",
      "OTHER": "Andere",
      "birthdate": "Geburtstag:",
      "birthdate_format": "d.m.yyyy",
      "birthdate_validation": "Format: DD.MM.JJJJ",
      "address data": "Adressdaten",
      "street": "Straße:",
      "street_missing": "Bitte trage deine Straße ein!",
      "street-number": "Hausnummer:",
      "street-number_missing": "Bitte trage deine Hausnummer ein!",
      "zip": "PLZ:",
      "zip_missing": "Bitte trage deine Postleitzahl ein!",
      "city": "Stadt:",
      "city_missing": "Bitte trage deine Stadt ein!",
      "contact data": "Kontaktdaten",
      "email": "Email-Adresse:",
      "email_missing": "Bitte trage deine Email-Adresse ein!",
      "email_format": "Format: [deine Adresse]@[deine Domäne]",
      "email-confirmation-code": "Email Bestätigungscode:",
      "email-confirmation-code-title": "Email Bestätigungscode:",
      "email-confirmation-code-message": "Der Code wurde an die angegebene Email-Adresse versendet!",
      "email-confirmation-code_missing": "Drücke den Knopf rechts, um einen Code per Email zu bekommen!",
      "email-confirmation-code_mismatch": "Der Code passt nicht! Fordere einen Neuen an.",
      "email-confirmation-code_format": "Der Code muss 4 Zeichen haben!",
      "email-confirmation-code_enter": "Trage den zugesendeted Code hier ein!",
      "request-email-confirmation-code": "Anfordern",
      "phone-number": "Telefon:",
      "phone-number_missing": "Bitte trage deine Telefonnummer ein!",
      "phone-number_format": "Falsches Format: +[Land][Vorwahl ohne Null][Nummer]!",
      "phone-confirmation-code": "SMS Bestätigungscode:",
      "phone-confirmation-code-title": "SMS Bestätigungscode:",
      "phone-confirmation-code-message": "Der Code wurde an die angegebene Telefonnummer versendet!",
      "phone-confirmation-code_missing": "Drücke den Knopf rechts, um einen Code per SMS zu bekommen!",
      "phone-confirmation-code_mismatch": "Der Code passt nicht! Fordere einen Neuen an.",
      "phone-confirmation-code_format": "Der Code muss 4 Zeichen haben!",
      "phone-confirmation-code_enter": "Trage den zugesendeted Code hier ein!",
      "request-phone-confirmation-code": "Anfordern",
      "prefer-notifications-per-sms": "Hinweise zu deinen Fahrten per SMS statt Email?",
      "comment": "Änderungshinweise:",
      "about application": "Zur Registrierung",
      "application-comment": "Bermerkungen von dir:",
      "application-comment_placeholder": "Was möchtest du uns mitteilen? Wenn dies eine zusätzliche Anmeldung (z.B. Familienmitglied), dann gib uns hier die Mitgliedsnummer des zahlenden Mitglieds bekannt.",
      "terms-and-conditions": "Ich stimme den AGBs und Datenschutzbedingungen zu:",
      "terms-and-conditions-details": "Details",
      "submit-form": "Absenden",
    });

const loadData = async (
    guiApi: GuiApi,
    setMemberApplicationForm: (applicationForm: MemberApplicationForm) => void,
    setSubmitting: (submitting: boolean) => void,
  ) => {

  try {
    setSubmitting(true);
    const application = await guiApi.loadMemberApplicationForm();
    setMemberApplicationForm(application);
  } finally {
    setSubmitting(false);
  }
  
};

const RegistrationForm = () => {
  const { t, i18n } = useTranslation('registration-form');
  
  const { guiApi, memberApplicationFormSubmitted, toast, setAppHeaderTitle, state } = useAppContext();
  
  const [ formValue, setFormValue ] = useState<MemberApplicationForm>(undefined);
  const [ submitting, setSubmitting ] = useState(false);
  const [ termsAccepted, setTermsAccepted ] = useState(false);
  const [ violations, setViolations ] = useState({});

  useEffect(() => {
     setAppHeaderTitle('registration-form');
   }, [ setAppHeaderTitle, t ]);
  
  useEffect(() => {
      if (formValue === undefined) { 
        loadData(guiApi, setFormValue, setSubmitting);
      };
    }, [ formValue, guiApi, setFormValue ]);

  const submitForm = async () => {
    try {
      setSubmitting(true);
      await guiApi.submitMemberApplicationForm({ memberApplicationForm: formValue });
      memberApplicationFormSubmitted();
    } catch (error) {
      setViolations(await error.response.json());
    } finally {
      setSubmitting(false);
    }
  };
  
  const requestSmsCode = async () => {
    try {
      await guiApi
          .requestPhoneCode({ phoneNo: formValue.phoneNumber })
          .then(() =>
            toast({
              namespace: 'registration-form',
              title: t('phone-confirmation-code-title'),
              message: t('phone-confirmation-code-message'),
            }));
      setViolations({ ...violations, phoneNumber: undefined });
    } catch (error) {
      const v = await error.response.json();
      setViolations({ ...violations, ...v });
    }
  };
  
  const requestEmailCode = async () => {
    try {
      await guiApi
          .requestEmailCode({ emailAddress: formValue.email })
          .then(() =>
            toast({
              namespace: 'registration-form',
              title: t('email-confirmation-code-title'),
              message: t('email-confirmation-code-message'),
            }));
      setViolations({ ...violations, email: undefined });
    } catch (error) {
      const v = await error.response.json();
      setViolations({ ...violations, ...v });
    }
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
        {
          Boolean(formValue?.comment)
            ? <>
                <Heading
                    size='small'
                    color='red'
                    level='2'>{ t('comment') }</Heading>
                <Text
                    style={ { fontFamily: 'monospace', whiteSpace: 'pre' } }
                    margin={ { horizontal: 'small' } }
                    wordBreak="keep-all"
                    >{ formValue?.comment }</Text>
              </>
            : <></> 
        }
        <Heading
            size='small'
            level='2'>{ t('personal data') }</Heading>
        {/* title */}
        <ViolationsAwareFormField
            name="title"
            label='person-title'
            t={ t }
            violations={ violations }
            disabled={ submitting } />
        {/* first name */}
        <ViolationsAwareFormField
            name="firstName"
            label='first-name'
            t={ t }
            violations={ violations }
            disabled={ submitting } />
        {/* last name */}
        <ViolationsAwareFormField
            name="lastName"
            label='last-name'
            t={ t }
            violations={ violations }
            disabled={ submitting } />
        {/* sex */}
        <ViolationsAwareFormField
            name="sex"
            label='sex'
            t={ t }
            violations={ violations }
            disabled={ submitting }
            htmlFor="sexSelect">
          <Select
              id="sexSelect"
              options={[ Sex.Female, Sex.Male, Sex.Other ]}
              value={ formValue?.sex }
              labelKey={ t }
              onChange={({ value }) => setSex(value)}
            />
        </ViolationsAwareFormField>
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
        <ViolationsAwareFormField
            name="street"
            label='street'
            t={ t }
            violations={ violations }
            disabled={ submitting } />
        {/* street number */}
        <ViolationsAwareFormField
            name="streetNumber"
            label='street-number'
            t={ t }
            violations={ violations }
            disabled={ submitting } />
        {/* zip */}
        <ViolationsAwareFormField
            name="zip"
            label='zip'
            t={ t }
            violations={ violations }
            disabled={ submitting } />
        {/* city */}
        <ViolationsAwareFormField
            name="city"
            label='city'
            t={ t }
            violations={ violations }
            disabled={ submitting } />
        <Heading
            size='small'
            level='2'>{t('contact data')}</Heading>
        {/* email */}
        <ViolationsAwareFormField
            name="email"
            label='email'
            t={ t }
            violations={ violations }
            disabled={ submitting } />
        <ViolationsAwareFormField
            name="emailConfirmationCode"
            htmlFor="emailConfirmationCode"
            label='email-confirmation-code'
            t={ t }
            violations={ violations }
            disabled={ submitting }>
          <Box
              direction="row"
              gap="medium"
            >
          <TextInput
              id="emailConfirmationCode"
              value={ formValue?.emailConfirmationCode }
              onChange={ code => setFormValue({ ...formValue, emailConfirmationCode: code.target.value }) }
              focusIndicator={false}
              plain />
          <CodeButton
              secondary
              fill={false}
              disabled={ submitting }
              onClick={ value => requestEmailCode() }
              label={ t('request-email-confirmation-code') } />
          </Box>
        </ViolationsAwareFormField>
        {/* phone */}
        <ViolationsAwareFormField
            name="phoneNumber"
            label='phone-number'
            placeholder="+436641234567"
            t={t}
            violations={ violations }
            disabled={ submitting } />
        <ViolationsAwareFormField
            name="phoneConfirmationCode"
            htmlFor="phoneConfirmationCode"
            label='phone-confirmation-code'
            t={ t }
            violations={ violations }
            disabled={ submitting }>
          <Box
              direction="row"
              gap="medium"
            >
          <TextInput
              id="phoneConfirmationCode"
              value={ formValue?.phoneConfirmationCode }
              onChange={ code => setFormValue({ ...formValue, phoneConfirmationCode: code.target.value }) }
              focusIndicator={false}
              plain />
          <CodeButton
              secondary
              fill={false}
              disabled={ submitting }
              onClick={ value => requestSmsCode() }
              label={ t('request-phone-confirmation-code') } />
          </Box>
        </ViolationsAwareFormField>
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
        <Heading
            size='small'
            level='2'>{t('about application')}</Heading>
        {/* application comment */}
        <FormField
            name="applicationComment"
            label={ t('application-comment') }
            disabled={ submitting }
            htmlFor="applicationComment">
          <Box
              height={ size === 'small' ? '9rem': undefined}>
            <TextArea
                name="applicationComment"
                fill
                focusIndicator={false}
                plain
                size="medium"
                placeholder={ t('application-comment_placeholder') } />
          </Box>
        </FormField>
        {/* terms and conditions */}
        <FormField
            contentProps={ { border: false } }
            name="termsAndConditions">
          <CheckBox
              name="termsAndConditions"
              onChange={ event => setTermsAccepted(event.target.checked) }
              label={
                <Paragraph margin="none">
                  { t('terms-and-conditions') }
                  <Anchor
                      target='_blank'
                      href={ state.appInformation?.homepageServiceConditionsUrl }
                      margin={ { left: 'xsmall' } }
                      label={ t('terms-and-conditions-details') } />
                </Paragraph> }
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
              disabled={ submitting || !termsAccepted }
              label={ t('submit-form') } />
        </Box>
      </Form>
    </Box>);
}

export { RegistrationForm };
