import { MemberApi, Member, Sex, Role, MemberStatus } from '../../client/administration';
import { useMemberApi } from '../AdminAppContext';
import i18n from '../../i18n';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Button, CheckBox, DateInput, Form, FormField, Paragraph, Select, Table, TableBody, TableCell, TableRow, TextArea } from 'grommet';
import { useTranslation } from 'react-i18next';
import { ViolationsAwareFormField } from "../../components/ViolationsAwareFormField";
import { parseLocalDateToIsoString, toLocalDateString } from '../../utils/timeUtils';
import useResponsiveScreen from '../../utils/responsiveUtils';
import { CalendarHeader } from '../../components/CalendarHeader';
import { Modal } from '../../components/Modal';
import { useAppContext } from '../../AppContext';
import { LoadingIndicator } from '../../components/LoadingIndicator';
import { MainLayout, Heading, Content, SubHeading } from '../../components/MainLayout';

i18n.addResources('en', 'administration/member-details', {
    "new": "new",
    "hoursServedPassangerService": "Hours served passanger service",
    "hoursConsumedCarSharing": "Hours consumed car-sharing",
    "person-title": "Title:",
    "first-name": "First name:",
    "first-name_missing": "Please enter a name!",
    "last-name": "Last name:",
    "last-name_missing": "Please enter a name!",
    "sex": "Sex:",
    "sex_missing": "Please choose a sex!",
    "MALE": "Male",
    "FEMALE": "Female",
    "OTHER": "Other",
    "birthdate": "Birthdate:",
    "birthdate_format": "yyyy/mm/dd",
    "birthdate_missing": "Please enter the birthday!",
    "street": "Street:",
    "street_missing": "Please enter the name of the street!",
    "street-number": "Street number:",
    "street-number_missing": "Please enter the street-number!",
    "zip": "ZIP:",
    "zip_missing": "Please enter a ZIP code!",
    "city": "City:",
    "city_missing": "Please enter the name of the city!",
    "email": "Email-address:",
    "email_missing": "Please enter the email address!",
    "email_format": "Format: [name]@[domain]",
    "phone-number": "Phone number:",
    "phone-number_missing": "Please enter the phone number!",
    "phone-number_format": "Wrong format: +[country][area code without zero][number]!",
    "prefer-notifications-per-sms": "Notify by SMS instead email?",
    "roles": "Roles:",
    "roles_last-admin": "You cannot remove the Admin role, because this is user is the last admin.",
    "PASSANGER": "Passanger",
    "DRIVER": "Driver",
    "MANAGER": "Manager",
    "ADMIN": "Administrator",
    "comment": "Comment:",
    "comment_placeholder": "Comment, e.g. hints for purchasing",
    "reset": "Reset changes",
    "delete": "Delete",
    "delete_header": "Delete member?",
    "delete_question": "Delete a member irrevocably?",
    "delete_hint_header": "Hint:",
    "delete_hint": "The member-ID cannot be assigned to new members any more.",
    "inactive": "The member is inactive!",
    "save": "Save",
    "member-saved_title": "Save",
    "member-saved_message": "Changes successfully were persisted!",
    "enable": "Enable",
    "member-enable_title": "Enable",
    "member-enable_message": "Member is now enabled!",
    "disable": "Disable",
    "member-disabled_title": "Disable",
    "member-disabled_message": "Member is now disabled!",
    "abort": "Abort",
  });
i18n.addResources('de', 'administration/member-details', {
    "new": "Neu",
    "hoursServedPassangerService": "Geleiste Stunden Fahrtendienst",
    "hoursConsumedCarSharing": "Konsumierte Stunden Car-Sharing",
    "person-title": "Titel:",
    "first-name": "Vorname:",
    "first-name_missing": "Bitte trage einen Vornamen ein!",
    "last-name": "Nachname:",
    "last-name_missing": "Bitte trage einen Nachnamen ein!",
    "sex": "Geschlecht:",
    "sex_missing": "Bitte wähle ein Geschlecht!",
    "MALE": "Mann",
    "FEMALE": "Frau",
    "OTHER": "Andere",
    "birthdate": "Geburtstag:",
    "birthdate_format": "dd.mm.yyyy",
    "birthdate_missing": "Bitte trage das Geburtsdatum ein!",
    "street": "Straße:",
    "street_missing": "Bitte trage eine Straße ein!",
    "street-number": "Hausnummer:",
    "street-number_missing": "Bitte trage eine Hausnummer ein!",
    "zip": "PLZ:",
    "zip_missing": "Bitte trage eine Postleitzahl ein!",
    "city": "Stadt:",
    "city_missing": "Bitte trage eine Stadt ein!",
    "email": "Email-Adresse:",
    "email_missing": "Bitte trage eine Email-Adresse ein!",
    "email_format": "Format: [Name]@[Domäne]",
    "phone-number": "Telefon:",
    "phone-number_missing": "Bitte trage eine Telefonnummer ein!",
    "phone-number_format": "Falsches Format: +[Land][Vorwahl ohne Null][Nummer]!",
    "prefer-notifications-per-sms": "Hinweise per SMS statt Email?",
    "roles": "Rollen:",
    "roles_last-admin": "Du kannst die Administrator-Rolle kann nicht entfernt, weil dieser Benutzer der letzte Administrator ist.",
    "PASSANGER": "Passagier",
    "DRIVER": "FahrerIn",
    "MANAGER": "ManagerIn",
    "ADMIN": "AdministratorIn",
    "comment": "Kommentar:",
    "comment_placeholder": "Kommentare, z.B. zur Verrechung",
    "save": "Speichern",
    "member-saved_title": "Speichern",
    "member-saved_message": "Die Änderungen wurden gespeichert!",
    "disable": "Deaktivieren",
    "member-disabled_title": "Deaktivieren",
    "member-disabled_message": "Mitglied wurde deaktiviert!",
    "enable": "Aktivieren",
    "member-enabled_title": "Aktivieren",
    "member-enabled_message": "Mitglied wurde aktiviert!",
    "delete": "Löschen",
    "delete_question": "Das Mitglied wird unwiderruflich gelöscht!",
    "delete_hint": "Die Mitgliedsnummer kann nicht neu vergeben werden.",
    "delete_hint_header": "Hinweis:",
    "delete_header": "Mitglied löschen?",
    "inactive": "Das Mitglied ist inaktiv!",
    "reset": "Änderungen zurücksetzen",
    "abort": "Abbrechen",
  });

const loadData = async (
    memberApi: MemberApi,
    setFormValue: (formValue: Member) => void,
    memberId: number
  ) => {

  const member = await memberApi.getMemberById({ memberId });
  setFormValue(member);
  
};

const EditMember = () => {

  const { toast } = useAppContext();
  const { isPhone } = useResponsiveScreen();
  const { t } = useTranslation('administration/member-details');
  const navigate = useNavigate();
  const memberApi = useMemberApi();
  const params = useParams();
  const isNewMember = params.memberId === '-';
  const memberId: number = isNewMember ? -1 : parseInt(params.memberId!);
  const memberIdString: string = isNewMember ? t('new') : params.memberId!;
  
  const [ confirmDelete, setConfirmDelete ] = useState(false);
  const [ formValue, setFormValue ] = useState<Member | undefined | null>(isNewMember ? {
      id: null,
      status: MemberStatus.Active,
      memberId: memberId,
    } as Member : undefined);
  const [ violations, setViolations ] = useState({});
  const loading = !Boolean(formValue);
  
  useEffect(() => {
    if (formValue === undefined) {
      setFormValue(null);
      loadData(memberApi, setFormValue, memberId);
    }
  }, [ formValue, memberApi, setFormValue, memberId ]);
  
  const setSex = (sex: Sex) => {
    setFormValue({
      ...formValue!,
      sex
    })
  };
  
  const isInactive = () => formValue?.status === MemberStatus.Inactive;
  
  const setBirthdate = (dateInput: string|Date) => {
    let date: string | undefined;
    if (dateInput === undefined) {
      date = undefined;
    } else if (typeof dateInput === 'string') {
      date = toLocalDateString(new Date(dateInput));
    } else {
      if (isNaN(dateInput.getTime())) {
        return;
      }
      date = toLocalDateString(dateInput);
    }
    setFormValue({
      ...formValue!,
      birthdate: date
    })
  };
  
  const setRoles = (roles: Array<Role>) => {
    violations["roles"] = undefined;
    setFormValue({
      ...formValue!,
      roles
    })
  };
  
  const saveMemberAndActivate = async () => {
    try {
      const newFormValue = await memberApi.saveMember({
          memberId,
          member: {
            ...formValue!,
            status: isInactive() ? MemberStatus.Active : MemberStatus.Inactive,
          },
        });
      setFormValue(newFormValue);
      toast({
          namespace: 'administration/member-details',
          title: t(isInactive() ? 'member-enabled_title' : 'member-disabled_title'),
          message: t(isInactive() ? 'member-enabled_message' : 'member-disabled_message'),
          status: 'normal'
        });
    } catch (error) {
      if (error.response?.json) {
        setViolations(await error.response.json());
      }
    }
  };

  const saveMember = async () => {
    try {
      const newFormValue = await memberApi.saveMember({
          memberId,
          member: {
            ...formValue!,
            status: isNewMember ? MemberStatus.Active : formValue!.status,
          },
        });
      setFormValue(newFormValue);
      toast({
          namespace: 'administration/member-details',
          title: t('member-saved_title'),
          message: t('member-saved_message'),
          status: 'normal'
        });
    } catch (error) {
      if (error.response?.json) {
        setViolations(await error.response.json());
      }
    }
  };
  
  const deleteMember = async () => {
    await memberApi.deleteMember({ memberId });
    navigate('..', { replace: true });
  };
  
  return (
    <MainLayout>
      <Heading
          size='small'
          level='2'>
        {
          formValue?.firstName ? formValue?.firstName : ''
        } {
          formValue?.lastName ? formValue?.lastName : ''
        } ({
          memberIdString
        })
        {
          isInactive()
              ? <Paragraph
                    margin={ { vertical: 'xsmall' } }
                    color="red">
                  { t('inactive') }
                </Paragraph>
              : <></>
        }
      </Heading>
      <Content>
      {
          formValue?.roles?.includes(Role.Driver)
              ? <Table style={ { maxWidth: '23rem' } }>
                  <TableBody>
                    <TableRow>
                      <TableCell>{ t('hoursServedPassangerService') }:</TableCell>
                      <TableCell>{ formValue.hoursServedPassangerService }h</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>{ t('hoursConsumedCarSharing') }:</TableCell>
                      <TableCell>{ formValue.hoursConsumedCarSharing }h</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              : undefined
      }
      <Form<Member>
          value={ formValue ?? undefined }
          validate='change'
          onChange={ nextValue => {
              setFormValue(nextValue);
            } }
          onReset={ () => loadData(memberApi, setFormValue, memberId) }
          onSubmit={ _value => saveMember() }>
        {/* title */}
        <ViolationsAwareFormField
            name="title"
            label='person-title'
            t={ t }
            violations={ violations }
            disabled={ loading } />
        {/* first name */}
        <ViolationsAwareFormField
            name="firstName"
            label='first-name'
            t={ t }
            violations={ violations }
            disabled={ loading } />
        {/* last name */}
        <ViolationsAwareFormField
            name="lastName"
            label='last-name'
            t={ t }
            violations={ violations }
            disabled={ loading } />
        {/* sex */}
        <ViolationsAwareFormField
            name="sex"
            label='sex'
            t={ t }
            violations={ violations }
            disabled={ loading }
            htmlFor="sexSelect">
          <Select
              id="sexSelect"
              options={[ Sex.Female, Sex.Male, Sex.Other ]}
              value={ formValue?.sex }
              labelKey={ t }
              disabled={ loading }
              onChange={({ value }) => setSex(value)}
            />
        </ViolationsAwareFormField>
        {/* birthdate */}
        <ViolationsAwareFormField
            name="birthdate"
            label="birthdate"
            t={ t }
            violations={ violations }
            disabled={ loading }>
          <DateInput
              format={ t('birthdate_format') }
              value={ parseLocalDateToIsoString(formValue?.birthdate) }
              disabled={ loading }
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
            disabled={ loading } />
        {/* street number */}
        <ViolationsAwareFormField
            name="streetNumber"
            label='street-number'
            t={ t }
            violations={ violations }
            disabled={ loading } />
        {/* zip */}
        <ViolationsAwareFormField
            name="zip"
            label='zip'
            t={ t }
            violations={ violations }
            disabled={ loading } />
        {/* city */}
        <ViolationsAwareFormField
            name="city"
            label='city'
            t={ t }
            violations={ violations }
            disabled={ loading } />
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
        <ViolationsAwareFormField
            name="roles"
            label='roles'
            t={ t }
            violations={ violations }
            disabled={ loading }
            htmlFor="rolesSelect">
          <Select
              id="rolesSelect"
              multiple
              options={[ Role.Passanger, Role.Driver, Role.Manager, Role.Admin ]}
              value={ formValue?.roles }
              labelKey={ t }
              messages={ { multiple: formValue?.roles?.map(role => t(role)).join(', ') } }
              onChange={({ value }) => setRoles(value)}
            />
        </ViolationsAwareFormField>
        {/* comment */}
        <FormField
            label={ t('comment') }
            disabled={ loading }
            htmlFor='comment'>
          <TextArea
              name="comment"
              id="comment"
              placeholder={ t('comment_placeholder') } />
        </FormField>
        <Box
            margin={ { vertical: '2rem' } }
            direction="row-responsive"
            gap="medium"
            wrap>
          <Button
              type="submit"
              primary
              disabled={ loading }
              label={ t('save') } />
          {
            isNewMember
                ? undefined
                : <Button
                      secondary
                      disabled={ loading }
                      label={ t('delete') }
                      onClick={ (_value: any) => setConfirmDelete(true) } />
          }
          {
            isNewMember
                ? undefined
                : <Button
                      secondary
                      disabled={ loading }
                      label={ t(isInactive() ? 'enable' : 'disable') }
                      onClick={ saveMemberAndActivate } />
          }
          <Button
              type="reset"
              disabled={ loading }
              label={ t('reset') } />
        </Box>
      </Form>
      </Content>
      <Modal
          show={ confirmDelete }
          action={ deleteMember }
          actionLabel='delete'
          abort={ () => setConfirmDelete(false) }
          header='delete_header'
          t={ t }>
        <SubHeading>{ t('delete_question') }</SubHeading>
        <Paragraph><i>{ t('delete_hint_header') }</i> { t('delete_hint') }</Paragraph>
      </Modal>
      {
        loading ? <LoadingIndicator /> : undefined
      }
    </MainLayout>);
    
}

export { EditMember};
