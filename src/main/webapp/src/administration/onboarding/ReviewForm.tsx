import { Box, Button, FormField, Text, TextArea, Form, ThemeContext , ThemeType, DateInput, Select, CheckBox, TextInput, Collapsible } from "grommet";
import { deepMerge } from 'grommet/utils';
import React, { ChangeEvent, MouseEvent, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { useAppContext } from "../../AppContext";
import { Member, MemberApplication, MemberApplicationUpdate, OnboardingApi, Role, Sex } from "../../client/administration";
import { theme as appTheme } from '../../app/App';
import i18n from '../../i18n';
import { css } from "styled-components";
import { CalendarHeader } from '../../components/CalendarHeader';
import { ViolationsAwareFormField } from "../../components/ViolationsAwareFormField";
import { debounce } from '../../utils/debounce';
import { Copy } from "grommet-icons";
import { useOnboardingAdministrationApi, useMemberApi } from '../AdminAppContext';
import { parseLocalDate, toLocalDateString } from '../../utils/timeUtils';
import useResponsiveScreen from '../../utils/responsiveUtils';
import { Content, MainLayout, Heading } from "../../components/MainLayout";

i18n.addResources('en', 'administration/onboarding/review', {
      "member-id": "Member ID:",
      "member-id_placeholder": "If already a member, then enter the known ID",
      "member-id_info": "For new members a new ID will be assigned automatically. If an existing member registers again, then enter his/her member ID. Only phone number and email address will stored because they are confirmed by sending codes. The rest of the masterdata are kept as is.",
      "member-id_validation": "1-5 digits",
      "person-title": "Title:",
      "first-name": "First name:",
      "last-name": "Last name:",
      "sex": "Sex:",
      "MALE": "Male",
      "FEMALE": "Female",
      "OTHER": "Other",
      "initial-role": "Initial role:",
      "PASSENGER": "Passenger",
      "DRIVER": "Driver",
      "MANAGER": "Manager",
      "ADMIN": "Administrator",
      "birthdate": "Birthdate:",
      "birthdate_format": "yyyy/mm/dd",
      "birthdate_missing": "Please enter the birthday!",
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
      "comment": "Comment:",
      "comment_placeholder": "Comment on reject/inquiry",
      "application-comment": "Remarks on application:",
      "application-comment_placeholder": "None",
      "reset": "Reset",
      "save": "Save",
      "save_title": "Save member data",
      "save_success": "Successfully saved",
      "clipboard_title": "Clipboard",
      "clipboard_message": "The text was copied to the clipboard",
    });
i18n.addResources('de', 'administration/onboarding/review', {
      "member-id": "Mitgliedsnummer:",
      "member-id_placeholder": "Für bestehende Mitglieder ausfüllen",
      "member-id_info": "Neuen Mitgliedern wird automatisch eine Nummer vergeben. Bei wiederholter Anmeldung eines bereits bestehenden Mitglieds bitte hier die vorhandene Mitgliedsnummer eintragen: Die bestehenden Stammdaten werden angezeigt und die der Anmeldung können übernommen werden.",
      "member-id_validation": "1-5 stellige Nummer",
      "person-title": "Titel:",
      "first-name": "Vorname:",
      "last-name": "Nachname:",
      "sex": "Geschlecht:",
      "MALE": "Mann",
      "FEMALE": "Frau",
      "OTHER": "Andere",
      "initial-role": "Role des Mitglieds:",
      "PASSENGER": "Passagier",
      "DRIVER": "FahrerIn",
      "MANAGER": "ManagerIn",
      "ADMIN": "AdministratorIn",
      "birthdate": "Geburtstag:",
      "birthdate_format": "dd.mm.yyyy",
      "birthdate_missing": "Bitte trage das Geburtsdatum ein!",
      "street": "Straße:",
      "street-number": "Hausnummer:",
      "zip": "PLZ:",
      "city": "Stadt:",
      "email": "Email-Adresse:",
      "email_validation": "Korrekte Email-Addresse benötigt",
      "email_missing": "Bitte trage eine Email-Adresse ein!",
      "email_format": "Format: [Adresse]@[Domäne]",
      "phone-number": "Telefon:",
      "phone-number_missing": "Bitte trage eine Telefonnummer ein!",
      "phone-number_format": "Falsches Format: +[Land][Vorwahl ohne Null][Nummer]!",
      "prefer-notifications-per-sms": "Hinweise per SMS statt Email?",
      "activate-member": "Freischalten",
      "inquiry": "Rückfrage",
      "reject-member": "Ablehnen",
      "comment": "Kommentar:",
      "comment_placeholder": "Kommentar für Rückfragen/Abweisen",
      "application-comment": "Bermerkungen zum Antrag:",
      "application-comment_placeholder": "Keine",
      "reset": "Zurücksetzen",
      "save": "Speichern",
      "save_title": "Mitgliedsdaten speichern",
      "save_success": "Erfolgreich gespeichert",
      "clipboard_title": "Zwischenablage",
      "clipboard_message": "Der Text wurde in die Zwischenablage kopiert",
    });
    
interface FormState {
  taskId: string;
  memberId: number | undefined;
  title: string;
  firstName: string;
  lastName: string;
  sex: Sex | undefined;
  birthdate: Date | undefined;
  street: string;
  streetNumber: string;
  city: string;
  zip: string;
  email: string;
  phoneNumber: string;
  preferNotificationsPerSms: boolean;
  comment: string;
  applicationComment: string;
  initialRole: Role;
};

const setFormValueByApplication = (
    application: MemberApplication,
    setFormValue: (formValue: FormState) => void) => {
  
  const formValue: FormState = {
    taskId: application.taskId!,
    memberId: application.memberId,
    title: application.title ?? '',
    firstName: application.firstName ?? '',
    lastName: application.lastName ?? '',
    birthdate: parseLocalDate(application.birthdate),
    sex: application.sex,
    street: application.street ?? '',
    streetNumber: application.streetNumber ?? '',
    city: application.city ?? '',
    zip: application.zip ?? '',
    email: application.email ?? '',
    phoneNumber: application.phoneNumber ?? '',
    preferNotificationsPerSms: application.preferNotificationsPerSms ?? false,
    comment: application.comment ?? '',
    applicationComment: application.applicationComment ?? '',
    initialRole: application.initialRole ? application.initialRole : Role.Passenger,
  };
  setFormValue(formValue);
  
};

const loadData = async (
    onboardingApi: OnboardingApi,
    setFormValue: (formValue: FormState) => void,
    applicationId: string
  ) => {

  const application = await onboardingApi.getMemberOnboardingApplication({
    applicationId
  });
  setFormValueByApplication(application, setFormValue);
  
};

const updateData = async (
    onboardingApi: OnboardingApi,
    formValue: FormState,
    setFormValue: (formValue: FormState) => void,
    applicationId: string,
    action: MemberApplicationUpdate,
  ): Promise<boolean> => {
  try {
    const application = await onboardingApi.updateMemberOnboardingApplication({
      applicationId,
      updateMemberOnboarding: {
        action,
        taskId: formValue.taskId,
        memberApplication: {
          id: applicationId,
          birthdate: toLocalDateString(formValue.birthdate!),
          city: formValue.city,
          email: formValue.email,
          title: formValue.title,
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
          applicationComment: formValue.applicationComment,
          initialRole: formValue.initialRole,
        }
      }
    });  
    setFormValueByApplication(application, setFormValue);
    return new Promise((resolve, _reject) => resolve(true));
  } catch (error) {
    return new Promise((_resolve, reject) => reject(error.response.json()));
  }
};

const theme: ThemeType = deepMerge(appTheme, {
  textArea: {
    extend: css`
        background-color: #eeeeee;
        font-weight: normal;
      `
  },
});

const ReviewForm = () => {
  
  const { isPhone } = useResponsiveScreen();
  const { toast, showLoadingIndicator } = useAppContext();
  const onboardingApi = useOnboardingAdministrationApi();
  const memberApi = useMemberApi();
  const navigate = useNavigate();
  const params = useParams();
  const { t } = useTranslation('administration/onboarding/review');
  
  const [ formValue, setFormValue ] = useState<FormState | undefined>(undefined);
  const [ violations, setViolations ] = useState<Record<string, string>>({});
  
  const loading = formValue === undefined;
  
  useEffect(() => {
      if (formValue !== undefined) {
        return;
      }
      const initReviewForm = async () => {
          showLoadingIndicator(true);
          await loadData(onboardingApi, setFormValue, params.applicationId!);
          showLoadingIndicator(false);
        };
      initReviewForm();
    }, [ formValue, onboardingApi, setFormValue, params.applicationId, showLoadingIndicator ]);

  const setBirthdate = (dateInput: string|Date) => {
    let date: Date | undefined;
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
      ...formValue!,
      birthdate: date
    })
  };
  
  const setSex = (sex: Sex) => {
    setFormValue({
      ...formValue!,
      sex
    })
  };

  const setInitialRole = (initialRole: Role) => {
    setFormValue({
      ...formValue!,
      initialRole
    })
  };
  
  const reject = () => {
    updateData(
        onboardingApi,
        formValue!,
        setFormValue,
        params.applicationId!,
        MemberApplicationUpdate.Reject)
      .then(() => {
          navigate('..', { replace: true } );
        })
      .catch(error => error.then((violations: Record<string, string>) => setViolations(violations)));
  };

  const inquiry = () => {
    updateData(
        onboardingApi,
        formValue!,
        setFormValue,
        params.applicationId!,
        MemberApplicationUpdate.Inquiry)
      .then(() => {
          navigate('..', { replace: true } );
        })
      .catch(error => error.then((violations: Record<string, string>) => setViolations(violations)));
  };

  const accept = () => {
    updateData(
        onboardingApi,
        formValue!,
        setFormValue,
        params.applicationId!,
        MemberApplicationUpdate.Accepted)
      .then(() => {
          navigate('..', { replace: true } );
        })
      .catch(error => error.then((violations: Record<string, string>) => setViolations(violations)));
  };
  
  const save = () => {
    updateData(
        onboardingApi,
        formValue!,
        setFormValue,
        params.applicationId!,
        MemberApplicationUpdate.Save)
      .then(() =>
          toast({
            namespace: 'administration/onboarding/review',
            title: t('save_title'),
            message: t('save_success'),
            status: 'normal'
          }))
      .catch(error => error.then((violations: Record<string, string>) => setViolations(violations)));
  };
  
  const [ memberIdState, setMemberIdState ] = useState(undefined);
  const [ memberSuggestions, setMemberSuggestions ] = useState<Array<{ value: number, label: JSX.Element}>>([]);
  const [ member, setMember ] = useState<Member | undefined>(undefined);
  
  const onChangeMemberId = useMemo(
    () => debounce(
      async (event: ChangeEvent<HTMLInputElement>) => {
        setMemberIdState(undefined);
        if (formValue!.memberId) {
          setMember(undefined);
          setFormValue({
              ...formValue!,
              memberId: undefined
            });
        }
        if (!Boolean(event.target.value)) {
          setMemberSuggestions([]);
        } else {
          const result = await memberApi.getMembers({ pageNumber: 0, pageSize: 10, query: event.target.value });
          setMemberSuggestions(
              result
                .members
                .map(m => ({
                  value: m.memberId,
                  label: <Box><Text margin='small'>{m.memberId}: {m.lastName}, {m.firstName}</Text></Box>
                })));
        }
      }, 500),
    [ formValue, memberApi ]);

  const onMemberSuggestionSelect = async (event: { suggestion: { value: any; }; }) => {
    const memberId = event.suggestion.value;
    setMemberIdState(memberId);
    setFormValue({
        ...formValue!,
        memberId
      });
    const result = await memberApi.getMemberById({ memberId });
    setMember(result);
  };
  
  const copyToClipbard = (data: string | undefined | null) => {
    if (!Boolean(data)) {
      return;
    }
    navigator.clipboard.writeText(data!);
    toast({
      namespace: 'administration/onboarding/review',
      title: t('clipboard_title'),
      message: t('clipboard_message'),
      status: 'normal'
    });
  };
    
  return (
    <MainLayout>
      <Heading
          size='small'
          level='2'>
        {
          formValue?.firstName
        } {
          formValue?.lastName
        }
      </Heading>
      <Content>
        <ThemeContext.Extend value={ theme }>
        <Form<FormState>
            value={ formValue }
            validate='change'
            onChange={ nextValue => {
                setFormValue(nextValue);
              } }
            onReset={ () => setFormValue(undefined) }
            onSubmit={ _value => accept() }>
          {/* application comment */}
          <FormField
              name="applicationComment"
              label={ t('application-comment') }
              htmlFor="applicationComment">
            <Text
                id="applicationComment"
                style={ { fontFamily: 'monospace', whiteSpace: 'pre' } }
                margin={ { horizontal: 'small' } }
                wordBreak="keep-all"
                >{ Boolean(formValue?.applicationComment) ? formValue?.applicationComment : t('application-comment_placeholder') }</Text>
          </FormField>
          {/* Member ID */}
          <ViolationsAwareFormField
              label='member-id'
              name='member-id'
              t={ t }
              violations={ violations }
              disabled={ loading }
              info={ member
                  ? <Box
                        background={ { color: 'brand', opacity: "weak" } }>
                      <Text
                          margin='xsmall'
                          color='dark-3'
                          truncate>
                        { member.firstName } { member.lastName },&nbsp;{ member.street } { member.streetNumber },<br/>
                        { member.phoneNumber } <Copy onClick={ () => copyToClipbard(member.phoneNumber) } size="16rem" cursor='pointer' />,<br/>
                        { member.email } <Copy onClick={ () => copyToClipbard(member.email) } size="16rem" cursor='pointer' />
                      </Text>
                    </Box>
                  : t('member-id_info') }>
            <TextInput
                value={ memberIdState }
                onChange={ onChangeMemberId }
                onSuggestionSelect={ onMemberSuggestionSelect }
                suggestions={ memberSuggestions }
                placeholder={<Text>{ t('member-id_placeholder') }</Text>}
              />
          </ViolationsAwareFormField>
          {/* title */}
          <ViolationsAwareFormField
              name="title"
              label='person-title'
              t={ t }
              violations={ violations }
              disabled={ loading || !!member } />
          {/* first name */}
          <ViolationsAwareFormField
              name="firstName"
              label='first-name'
              t={ t }
              violations={ violations }
              disabled={ loading || !!member } />
          {/* last name */}
          <ViolationsAwareFormField
              name="lastName"
              label='last-name'
              t={ t }
              violations={ violations }
              disabled={ loading || !!member } />
          {/* sex */}
          <ViolationsAwareFormField
              name="sex"
              label='sex'
              t={ t }
              violations={ violations }
              disabled={ loading || !!member }
              htmlFor="sexSelect">
            <Select
                id="sexSelect"
                options={[ Sex.Female, Sex.Male, Sex.Other ]}
                value={ formValue?.sex }
                labelKey={ t }
                disabled={ loading || !!member }
                onChange={({ value }) => setSex(value)}
              />
          </ViolationsAwareFormField>
          {/* birthdate */}
          <ViolationsAwareFormField
              name="birthdate"
              label='birthdate'
              t={ t }
              violations={ violations }
              disabled={ loading || !!member }>
            <DateInput
                format={ t('birthdate_format') }
                value={ formValue?.birthdate?.toISOString() }
                disabled={ loading || !!member }
                onChange={ ({ value }) => setBirthdate(value as string) }
                calendarProps={ {
                    fill: isPhone,
                    animate: false,
                    header: props => CalendarHeader({ ...props, setDate: setBirthdate })
                  } } />
          </ViolationsAwareFormField>
          {/* street */}
          <ViolationsAwareFormField
              name="street"
              label='street'
              t={ t }
              violations={ violations }
              disabled={ loading || !!member } />
          {/* street number */}
          <ViolationsAwareFormField
              name="streetNumber"
              label='street-number'
              t={ t }
              violations={ violations }
              disabled={ loading || !!member } />
          {/* zip */}
          <ViolationsAwareFormField
              name="zip"
              label='zip'
              t={ t }
              violations={ violations }
              disabled={ loading || !!member } />
          {/* city */}
          <ViolationsAwareFormField
              name="city"
              label='city'
              t={ t }
              violations={ violations }
              disabled={ loading || !!member } />
          {/* phone */}
          <ViolationsAwareFormField
              name="phoneNumber"
              label='phone-number'
              placeholder="+436641234567"
              t={t}
              violations={ violations }
              disabled={ loading } />
          {/* email */}
          <ViolationsAwareFormField
              name="email"
              label='email'
              t={ t }
              violations={ violations }
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
          {/* initial role */}
          <Collapsible open={ !member }>
            <ViolationsAwareFormField
                name="initialRole"
                label='initial-role'
                t={ t }
                violations={ violations }
                disabled={ loading || !!member }
                htmlFor="initialRoleSelect">
              <Select
                  id="initialRoleSelect"
                  options={[ Role.Passenger, Role.Driver, Role.Manager, Role.Admin ]}
                  value={ formValue?.initialRole }
                  labelKey={ t }
                  onChange={({ value }) => setInitialRole(value)}
                />
            </ViolationsAwareFormField>
          </Collapsible>
          {/* comment */}
          <FormField
              label={ t('comment') }
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
                onClick={ (_event: MouseEvent<HTMLButtonElement & HTMLAnchorElement>) => inquiry() } />
            <Button
                type="submit"
                primary
                disabled={ loading }
                label={ t('activate-member') } />
            <Button
                color='control'
                disabled={ loading }
                label={ t('reject-member') }
                onClick={ (_value: MouseEvent<HTMLButtonElement & HTMLAnchorElement>) => reject() } />
            <Button
                disabled={ loading }
                label={ t('save') }
                onClick={ (_value: MouseEvent<HTMLButtonElement & HTMLAnchorElement>) => save() } />
            <Button
                type="reset"
                disabled={ loading }
                label={ t('reset') } />
          </Box>
        </Form>
        </ThemeContext.Extend>
      </Content>
    </MainLayout>
  );
};

export { ReviewForm };
