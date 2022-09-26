import { Anchor, Box, Button, CheckBox, Collapsible, DateInput, Form, FormField, Heading, Paragraph, Select, Text, TextArea, TextInput } from "grommet";
import { useEffect, useState } from "react";
import { useAppContext, useMemberGuiApi, useOnboardingGuiApi } from '../AppContext';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';
import { MemberApplicationForm, OnboardingApi, Sex } from '../client/gui';
import { CalendarHeader } from "../components/CalendarHeader";
import { ViolationsAwareFormField } from "../components/ViolationsAwareFormField";
import styled from "styled-components";
import { parseLocalDate, toLocalDateString } from '../utils/timeUtils';
import useResponsiveScreen from '../utils/responsiveUtils';

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
      "birthdate_format": "yyyy/mm/dd",
      "address data": "Address data",
      "street": "Street:",
      "street_missing": "Please enter the name of the street!",
      "street-number": "Street number:",
      "street-number_missing": "Please enter the street-number!",
      "zip": "ZIP:",
      "zip_missing": "Please enter a ZIP code!",
      "city": "City:",
      "city_missing": "Please enter the name of the city!",
      "contact data": "Contact data",
      "email": "Email-address:",
      "email_missing": "Please enter the email address!",
      "email_format": "Format: [name]@[domain]",
      "email-confirmation-code": "Email confirmation code:",
      "email-confirmation-code-title": "Email confirmation code:",
      "email-confirmation-code-message": "The code was sent to the given email-address!",
      "email-confirmation-code_missing": "Use the button to the right to get a code by email!",
      "email-confirmation-code_mismatch": "The code does not match! Request another one.",
      "email-confirmation-code_format": "The code must consist of 4 digits!",
      "email-confirmation-code_enter": "Enter the code you received by email!",
      "request-email-confirmation-code": "Request",
      "phone-number": "Phone number:",
      "phone-number_missing": "Please enter the phone number!",
      "phone-number_format": "Wrong format: +[country][area code without zero][number]!",
      "phone-confirmation-code": "SMS confirmation code:",
      "phone-confirmation-code-title": "SMS confirmation code:",
      "phone-confirmation-code-message": "The code was sent to the given phone number!",
      "phone-confirmation-code_missing": "Use the button to the right to get a code by email!",
      "phone-confirmation-code_mismatch": "The code does not match! Request another one.",
      "phone-confirmation-code_format": "The code must consist of 4 digits!",
      "phone-confirmation-code_enter": "Enter the code you received as text-message!",
      "request-phone-confirmation-code": "Request",
      "prefer-notifications-per-sms": "Notify by SMS instead email?",
      "about application": "About your application",
      "comment": "Change notices:",
      "application-comment": "Remarks you want to make:",
      "application-comment_placeholder": "What would you like to tell us?",
      "terms-and-conditions": "I agree to service conditions:",
      "terms-and-conditions-details": "details",
      "submit-form": "Submit",
      "already-member": "Already a member?",
      "member-id": "Member ID:",
      "member-id_placeholder": "The member ID you got on registration",
      "member-id_format": "The member ID has to be a number",
      "member-id_wrong": "The given form data does not match an existing member having this ID! Please register as a new member and enter your known member ID underneath as a comment.",
      "completed": "Registration successfully completed!",
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
      "birthdate_format": "dd.mm.yyyy",
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
      "email_info": "Es wird die Email-Adresse von deiner Anmeldung vorgeschlagen, aber du solltest - sofern anders - die Adresse eintragen auf der du regelmäßig Emails abrufst.",
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
      "already-member": "Bereits Mitglied?",
      "member-id": "Mitgliedsnummer:",
      "member-id_placeholder": "..welche du ursprünglich erhalten hast",
      "member-id_format": "Die Mitgliedsnummer muss eine Zahl sein",
      "member-id_wrong": "Die eingegebenen Daten passen nicht zu einem Mitglied mit der angegebenen Nummer! Bitte registriere dich als neues Mitglied und gib die dir bekannte Nummer unten als Bemerkung an.",
      "completed": "Registrierung erfolgreich!",
    });

const loadData = async (
    onboardingApi: OnboardingApi,
    setMemberApplicationForm: (applicationForm: MemberApplicationForm) => void,
    setIsAlreadyMember: (alreadyMember: boolean) => void,
    setSubmitting: (submitting: boolean) => void,
  ) => {

  try {
    setSubmitting(true);
    const application = await onboardingApi.loadMemberApplicationForm();
    setMemberApplicationForm(application);
    setIsAlreadyMember(!!application.memberId);
  } finally {
    setSubmitting(false);
  }
  
};

const RegistrationForm = () => {
  
  const { isPhone } = useResponsiveScreen();
  const { t } = useTranslation('registration-form');
  const onboardingApi = useOnboardingGuiApi();
  const memberApi = useMemberGuiApi();
  
  const { memberApplicationFormSubmitted, toast,
      setAppHeaderTitle, state, fetchCurrentUser } = useAppContext();
  
  const [ formValue, setFormValue ] = useState<MemberApplicationForm>(undefined);
  const [ isAlreadyMember, setIsAlreadyMember ] = useState(false);
  const [ submitting, setSubmitting ] = useState(false);
  const [ termsAccepted, setTermsAccepted ] = useState(false);
  const [ violations, setViolations ] = useState({});

  useEffect(() => {
     setAppHeaderTitle('registration-form');
   }, [ setAppHeaderTitle, t ]);
  
  useEffect(() => {
      if (formValue === undefined) { 
        loadData(onboardingApi, setFormValue, setIsAlreadyMember, setSubmitting);
      };
    }, [ formValue, onboardingApi, setFormValue ]);

  const submitForm = async () => {
    try {
      setSubmitting(true);
      await onboardingApi.submitMemberApplicationForm({ memberApplicationForm: formValue });
      if (isAlreadyMember) {
        new Promise((resolve, reject) => {
            fetchCurrentUser(resolve, reject, true);
          })
          .then(() =>
            toast({
              namespace: 'registration-form',
              title: t('title.long'),
              message: t('completed'),
              status: 'normal'
            }));
      } else {
        memberApplicationFormSubmitted();
      }
    } catch (error) {
      setViolations(await error.response.json());
    } finally {
      setSubmitting(false);
    }
  };
  
  const requestSmsCode = async () => {
    if (!formValue.phoneNumber) {
      setViolations({ ...violations, phoneNumber: 'missing' });
      return;
    }
    try {
      await memberApi
          .requestPhoneCode({ body: formValue.phoneNumber })
          .then(() =>
            toast({
              namespace: 'registration-form',
              title: t('phone-confirmation-code-title'),
              message: t('phone-confirmation-code-message'),
            }));
      setViolations({ ...violations, phoneNumber: undefined });
    } catch (error) {
      if (error.response?.json) {
        const v = await error.response.json();
        setViolations({ ...violations, ...v });
      } else {
        console.error(error);
      }
    }
  };
  
  const requestEmailCode = async () => {
    if (!formValue.email) {
      setViolations({ ...violations, email: 'missing' });
      return;
    }
    try {
      await memberApi
          .requestEmailCode({ body: formValue.email })
          .then(() =>
            toast({
              namespace: 'registration-form',
              title: t('email-confirmation-code-title'),
              message: t('email-confirmation-code-message'),
            }));
      setViolations({ ...violations, email: undefined });
    } catch (error) {
      if (error.response?.json) {
        const v = await error.response.json();
        setViolations({ ...violations, ...v });
      } else {
        console.error(error);
      }
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
      birthdate: toLocalDateString(date)
    })
  };
  
  const setSex = (sex: Sex) => {
    setFormValue({
      ...formValue,
      sex
    })
  };
  
  const selectIsAlreadyMember = checked => {
    
    setIsAlreadyMember(checked);
    if (!checked) {
      setFormValue({ ...formValue, memberId: undefined })
    }
    
  };
  
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
        <CheckBox
            label={ t('already-member') }
            toggle
            checked={ isAlreadyMember }
            pad='small'
            onChange={ event => selectIsAlreadyMember(event.target.checked) }
            disabled={ submitting }
          />
        <Collapsible
            open={ isAlreadyMember }>
          <ViolationsAwareFormField
              name="memberId"
              label='member-id'
              t={ t }
              placeholder={ t('member-id_placeholder') }
              validate={ {
                  regexp: /^[0-9]+$/,
                  message: t('member-id_format'),
                  status: 'error'
                } }
              violations={ violations }
              disabled={ submitting } />
        </Collapsible>
        <Heading
            size='small'
            level='2'>{ t('personal data') }</Heading>
        {/* title */}
        <Collapsible
            open={ !isAlreadyMember }>
          <ViolationsAwareFormField
              name="title"
              label='person-title'
              t={ t }
              violations={ violations }
              disabled={ submitting } />
        </Collapsible>
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
        <Collapsible
            open={ !isAlreadyMember }>
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
        </Collapsible>
        {/* birthdate */}
        <FormField
            name="birthdate"
            label={ t('birthdate') }
            disabled={ submitting }>
          <DateInput
              format={ t('birthdate_format') }
              value={ parseLocalDate(formValue?.birthdate)?.toISOString() }
              onChange={ ({ value }) => setBirthdate(value as string) }
              calendarProps={ {
                  fill: isPhone,
                  animate: false,
                  header: props => CalendarHeader({ ...props, setDate: setBirthdate })
                } } />
        </FormField>
        <Collapsible
            open={ !isAlreadyMember }>
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
        </Collapsible>
        <Heading
            size='small'
            level='2'>{t('contact data')}</Heading>
        {/* email */}
        <ViolationsAwareFormField
            name="email"
            label='email'
            info={ t('email_info') }
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
              gap="medium">
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
              gap="medium">
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
        <Collapsible
            open={ !isAlreadyMember }>
          <FormField
              name="applicationComment"
              label={ t('application-comment') }
              disabled={ submitting }
              htmlFor="applicationComment">
            <Box
                height={ isPhone ? '9rem': undefined }>
              <TextArea
                  name="applicationComment"
                  fill
                  focusIndicator={false}
                  plain
                  size="medium"
                  placeholder={ t('application-comment_placeholder') } />
            </Box>
          </FormField>
        </Collapsible>
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
