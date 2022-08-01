import { Box, Button, FormField, ResponsiveContext, Heading, Text, TextArea, Form, ThemeContext , ThemeType, DateInput, Select, CheckBox } from "grommet";
import { deepMerge } from 'grommet/utils';
import { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { useAppContext } from "../../AppContext";
import { AdministrationApi, MemberApplication, MemberApplicationUpdate, Sex } from "../../client/administration";
import { theme as appTheme } from '../../app/App';
import i18n from '../../i18n';
import { css } from "styled-components";
import { CalendarHeader } from '../../components/CalendarHeader';

i18n.addResources('en', 'administration/onboarding/review', {
      "member-id": "Member ID:",
      "member-id_placeholder": "If already a member, then enter the known ID",
      "member-id_info": "For new members a new number will be assigned automatically. If an existing member registers again, then enter the exists member id. The other form data will not be accepted and the member will be informed by email.",
      "member-id_validation": "1-5 digits",
      "first-name": "First name:",
      "last-name": "Last name:",
      "sex": "Sex:",
      "MALE": "Male",
      "FEMALE": "Female",
      "OTHER": "Other",
      "birthdate": "Birthdate:",
      "birthdate_format": "yyyy/m/d",
      "birthdate_validation": "Wrong format, use yyyy/mm/dd",
      "street": "Street:",
      "street-number": "Street number:",
      "zip": "ZIP:",
      "city": "City:",
      "email": "Email-address:",
      "email_validation": "Correct email-address required",
      "phone-number": "Phone number:",
      "prefer-notifications-per-sms": "Notify by SMS instead email?",
      "activate-member": "Activate",
      "reject-member": "Reject",
      "inquiry": "Inquiry",
      "comment": "Comment on reject/inquiry",
      "loading": "Loading...",
      "reset": "Reset",
      "save": "Save",
      "save_title": "Save member data",
      "save_success": "Successfully saved",
    });
i18n.addResources('de', 'administration/onboarding/review', {
      "member-id": "Mitgliedsnummer:",
      "member-id_placeholder": "Für bestehende Mitglieder ausfüllen",
      "member-id_info": "Neuen Mitgliedern wird automatisch eine Nummer vergeben. Bei wiederholter Anmeldung eines bereits bestehenden Mitglieds hier die vorhandene Mitgliedsnummer eintragen. Die anderen Formulardaten werden nicht übernommen und das Mitglied per Mail darüber informiert.",
      "member-id_validation": "1-5 stellige Nummer",
      "first-name": "Vorname:",
      "last-name": "Nachname:",
      "sex": "Geschlecht:",
      "MALE": "Mann",
      "FEMALE": "Frau",
      "OTHER": "Andere",
      "birthdate": "Geburtstag:",
      "birthdate_format": "d.m.yyyy",
      "birthdate_validation": "Falsches Format, bitte DD.MM.JJJJ verwenden",
      "street": "Straße:",
      "street-number": "Hausnummer:",
      "zip": "PLZ:",
      "city": "Stadt:",
      "email": "Email-Adresse:",
      "email_validation": "Korrekte Email-Addresse benötigt",
      "phone-number": "Telefon:",
      "prefer-notifications-per-sms": "Hinweise per SMS statt Email?",
      "activate-member": "Freischalten",
      "inquiry": "Rückfrage",
      "reject-member": "Ablehnen",
      "comment": "Kommentar für Rückfragen/Abweisen",
      "loading": "Lade Daten...",
      "reset": "Zurücksetzen",
      "save": "Speichern",
      "save_title": "Mitgliedsdaten speichern",
      "save_success": "Erfolgreich gespeichert",
    });
    
interface FormState {
  taskId: string;
  memberId: number;
  firstName: string;
  lastName: string;
  sex: Sex;
  birthdate: Date;
  street: string;
  streetNumber: string;
  city: string;
  zip: string;
  email: string;
  phoneNumber: string;
  preferNotificationsPerSms: boolean;
  comment: string;
};

const setFormValueByApplication = (
    application: MemberApplication,
    setFormValue: (formValue: FormState) => void) => {
  
  const formValue: FormState = {
    taskId: application.taskId,
    memberId: application.member.memberId,
    firstName: application.member.firstName,
    lastName: application.member.lastName,
    birthdate: application.member.birthdate,
    sex: application.member.sex,
    street: application.member.street,
    streetNumber: application.member.streetNumber,
    city: application.member.city,
    zip: application.member.zip,
    email: application.member.email,
    phoneNumber: application.member.phoneNumber,
    preferNotificationsPerSms: application.member.preferNotificationsPerSms,
    comment: application.member.comment,
  };
  setFormValue(formValue);
  
};

const loadData = async (
    administrationApi: AdministrationApi,
    setFormValue: (formValue: FormState) => void,
    applicationId: string
  ) => {

  const application = await administrationApi.getMemberOnboardingApplication({
    applicationId
  });
  setFormValueByApplication(application, setFormValue);
  
};

const updateData = async (
    administrationApi: AdministrationApi,
    formValue: FormState,
    setFormValue: (formValue: FormState) => void,
    applicationId: string,
    action: MemberApplicationUpdate,
  ): Promise<boolean> => {
  const application = await administrationApi.updateMemberOnboardingApplication({
    applicationId,
    updateMemberOnboarding: {
      action,
      taskId: formValue.taskId,
      member: {
        birthdate: formValue.birthdate,
        city: formValue.city,
        email: formValue.email,
        firstName: formValue.firstName,
        lastName: formValue.lastName,
        memberId: formValue.memberId,
        phoneNumber: formValue.phoneNumber,
        preferNotificationsPerSms: formValue.preferNotificationsPerSms,
        sex: formValue.sex,
        street: formValue.street,
        streetNumber: formValue.streetNumber,
        zip: formValue.zip,
        comment: formValue.comment,
      }
    }
  });  
  setFormValueByApplication(application, setFormValue);
  return new Promise((resolve, reject) => resolve(true));  
};

const theme: ThemeType = deepMerge(appTheme, {
  textArea: {
    extend: css`
        background-color: #eeeeee;
        font-weight: normal;
      `
  },
});

const Review = () => {
  
  const { administrationApi, toast } = useAppContext();
  
  const navigate = useNavigate();
    
  const params = useParams();
  
  const [ formValue, setFormValue ] = useState<FormState>(undefined);
  
  const loading = formValue === undefined;
  useEffect(() => {
      if (formValue === undefined) { 
        loadData(administrationApi, setFormValue, params.applicationId);
      };
    }, [ formValue, administrationApi, setFormValue, params ]);

  const { t } = useTranslation('administration/onboarding/review');
  
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
  
  const reject = () => {
    updateData(
        administrationApi,
        formValue,
        setFormValue,
        params.applicationId,
        MemberApplicationUpdate.Reject)
      .then(() => navigate('../'));
  };

  const inquiry = () => {
    updateData(
        administrationApi,
        formValue,
        setFormValue,
        params.applicationId,
        MemberApplicationUpdate.Inquiry)
      .then(() => navigate('../'));
  };
  
  const save = () => {
    updateData(
        administrationApi,
        formValue,
        setFormValue,
        params.applicationId,
        MemberApplicationUpdate.Save)
      .then(() =>
          toast({
            namespace: 'administration/onboarding/review',
            title: t('save_title'),
            message: t('save_success'),
          }));
  }
  
  const size = useContext(ResponsiveContext);
  const bdv = () => { 
    console.log(`bdv: '${formValue?.birthdate}'`);
    return formValue?.birthdate?.toISOString()
  };
    
  return (
    <Box
        pad='small'>
      <Heading
          size='small'
          level='2'>{
        loading
            ? t('loading')
            : `${formValue?.firstName} ${formValue?.lastName}`
      }</Heading>
      <ThemeContext.Extend value={ theme }>
      <Form<FormState>
          value={ formValue }
          validate='change'
          onChange={ nextValue => {
              setFormValue(nextValue);
            } }
          onReset={ () => setFormValue(undefined) }
          onSubmit={ value => save() }>
        {/* first name */}
        <FormField
            name="firstName"
            label={ t('first-name') }
            disabled={ loading } />
        {/* last name */}
        <FormField
            name="lastName"
            label={ t('last-name') }
            disabled={ loading } />
        {/* sex */}
        <FormField
            name="sex"
            label={ t('sex') }
            disabled={ loading }
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
            disabled={ loading }>
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
        {/* street */}
        <FormField
            name="street"
            label={ t('street') }
            disabled={ loading } />
        {/* street number */}
        <FormField
            name="streetNumber"
            label={ t('street-number') }
            disabled={ loading } />
        {/* zip */}
        <FormField
            name="zip"
            label={ t('zip') }
            disabled={ loading } />
        {/* city */}
        <FormField
            name="city"
            label={ t('city') }
            disabled={ loading } />
        {/* phone */}
        <FormField
            name="phoneNumber"
            label={ t('phone-number') }
            disabled={ loading } />
        {/* email */}
        <FormField
            name="email"
            label={ t('email') }
            disabled={ loading } />
        {/* prefer notifications per sms */}
        <FormField
            name="preferNotificationsPerSms">
          <CheckBox
              name="preferNotificationsPerSms"
              label={ t('prefer-notifications-per-sms') }
              disabled={ loading }
            />
        </FormField>
        {/* Member ID */}
        <FormField
            name="memberId"
            label={ t('member-id') }
            placeholder={<Text>{ t('member-id_placeholder') }</Text>}
            disabled={ loading }
            info={ t('member-id_info') } />
        {/* comment */}
        <FormField
            name="comment"
            disabled={ loading }
            htmlFor='comment'>
          <TextArea
              name="comment"
              id="comment"
              placeholder={ t('comment') } />
        </FormField>
        <Box
            margin={ { vertical: '2rem' } }
            direction="row-responsive"
            gap="medium"
            wrap>
          <Button
              secondary
              disabled={ loading }
              label={ t('inquiry') }
              onClick={ value => inquiry() } />
          <Button
              type="submit"
              primary
              disabled={ loading }
              label={ t('activate-member') } />
          <Button
              color='control'
              disabled={ loading }
              label={ t('reject-member') }
              onClick={ value => reject() } />
          <Button
              disabled={ loading }
              label={ t('save') }
              onClick={ value => save() } />
          <Button
              type="reset"
              disabled={ loading }
              label={ t('reset') } />
        </Box>
      </Form>
      </ThemeContext.Extend>
    </Box>
  );
};

export { Review };
