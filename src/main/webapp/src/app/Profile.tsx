import { useTranslation } from 'react-i18next';
import { MainLayout, Heading, Content, SubHeading } from '../components/MainLayout';
import { UserAvatar } from '../components/UserAvatar';
import i18n from '../i18n';
import AvatarUpload from 'react-avatar-edit';
import { Anchor, Avatar, Box, Button, CheckBox, Collapsible, Paragraph, Stack, Text, TextInput } from 'grommet';
import React, { useEffect, useLayoutEffect, useState } from 'react';
import { useAppContext, useMemberGuiApi } from '../AppContext';
import { ViolationsAwareFormField } from "../components/ViolationsAwareFormField";
import { CoatCheck, Contact, FormEdit, Home, User } from 'grommet-icons';
import useResponsiveScreen from '../utils/responsiveUtils';
import { Member, MemberApi } from '../client/gui';
import { parseLocalDate } from '../utils/timeUtils';
import { CodeButton } from "../components/CodeButton";

i18n.addResources('en', 'passanger/profile', {
    "title.short": "Profile",
    "title.long": "User profile",
    "avatar_title": "Avatar",
    "avatar_upload_toobig": "The file is too big! Pleaes use a picture having a file size of less than 12MB.",
    "avatar_hint": "Click here...",
    "avatar-preview": "Preview:",
    "change": "Change",
    "save": "Save",
    "abort": "Abort",
    "ask_management_board": "To change this data, please send an email to",
    "contact_data": "Contact information",
    "personal_data": "Personal data",
    "address_data": "Address data",
    "email": "Email-address:",
    "email_none": "None stored",
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
    "prefer": "Prefered way of notification:",
    "prefer_sms": "Notifications about rides will be sent via SMS.",
    "prefer_email": "Notifications about rides will be sent via email.",
    "prefer-notifications-per-sms": "Notify by SMS instead email?",
    "salutation_MALE": "Mr. ",
    "salutation_FEMALE": "Mrs. ",
    "salutation_OTHER": "",
    "birthday": "Born:",
    "birthdate_format": "yyyy/m/d",
  });
i18n.addResources('de', 'passanger/profile', {
    "title.short": "Profil",
    "title.long": "Benutzerprofil",
    "avatar_title": "Avatar",
    "avatar_upload_toobig": "Das Bild ist zu groß! Bitte verwende ein Bild mit einer maximalen Dateigröße von 4MB.",
    "avatar_hint": "Klicke hier...",
    "avatar-preview": "Vorschau:",
    "change": "Ändern",
    "save": "Speichern",
    "abort": "Verwerfen",
    "contact_data": "Kontaktdaten",
    "personal_data": "Persönliche Daten",
    "address_data": "Adressdaten",
    "ask_management_board": "Um diese Daten zu ändern, sende bitte eine Email an",
    "email": "Email-Adresse:",
    "email_none": "Keine gespeichert",
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
    "prefer": "Bevorzugter Weg für Hinweise:",
    "prefer_sms": "Hinweise zu Fahrten bekommst du via SMS.",
    "prefer_email": "Hinweise zu Fahrten bekommst du via Email.",
    "salutation_MALE": "Herr ",
    "salutation_FEMALE": "Frau ",
    "salutation_OTHER": "",
    "birthday": "Geboren:",
    "birthdate_format": "d.m.yyyy",
  });

const loadMember = async (memberApi: MemberApi, memberId: number, setMember: (member: Member) => void) => {
  const details = await memberApi.getMemberDetails({ memberId });
  setMember(details);
};

const Profile = () => {
  
  const { setAppHeaderTitle, showLoadingIndicator } = useAppContext();
  const { isPhone, isNotPhone } = useResponsiveScreen();
  const { t } = useTranslation('passanger/profile');
  const { state, toast, fetchCurrentUser } = useAppContext();
  const memberApi = useMemberGuiApi();
  
  const [ member, setMember ] = useState<Member | undefined | null>(undefined);
  const [ sending, setSending ] = useState(false);
  const [ uploadedAvatar, setUploadedAvatar ] = useState<URL | null>(null);
  const [ avatarEditMode, setAvatarEditMode ] = useState(false);
  const [ emailEditMode, setEmailEditMode ] = useState(false);
  const [ email, setEmail ] = useState<string | undefined>(undefined);
  const [ emailConfirmationCode, setEmailConfirmationCode ] = useState<string | undefined>(undefined);
  const [ phoneEditMode, setPhoneEditMode ] = useState(false);
  const [ phone, setPhone ] = useState<string | undefined>(undefined);
  const [ phoneConfirmationCode, setPhoneConfirmationCode ] = useState<string | undefined>(undefined);
  const [ preferEditMode, setPreferEditMode ] = useState(false);
  const [ prefer, setPrefer ] = useState(false);
  const [ violations, setViolations ] = useState({});
  
  const onBeforeAvatarLoad = (elem: React.ChangeEvent<HTMLInputElement>) => {
    if(elem.target.files![0].size > 12 * 1024 * 1024){
      elem.target.value = "";
      toast({
        namespace: 'passanger/profile',
        title: 'avatar_title',
        message:'avatar_upload_toobig',
        status: 'warning'
      })
    };
  };
  const onCloseAvatar = () => {
    setUploadedAvatar(null);
  };
  const onCropAvatar = (preview: string) => {
    setUploadedAvatar(new URL(preview));
  };
  const abortAvatarEditing = () => {
    setAvatarEditMode(false);
    setUploadedAvatar(null);
  };
  const saveAvatarEditing = async () => {
    try {
      /* convert base64-url into Blob: */
      setSending(true);
      showLoadingIndicator(true);
      const fetchBasedConverter = await fetch(uploadedAvatar!);
      const uploadedAvatarBlob = await fetchBasedConverter.blob();
      // upload Blob
      await memberApi.uploadAvatar({
          memberId: state.currentUser!.memberId!,
          body: uploadedAvatarBlob
        });
      // Refresh current-user to make changes visible
      await new Promise((resolve, reject) => {
          fetchCurrentUser(resolve, reject, true);
        });
      abortAvatarEditing();
    } catch (e) {
      console.log(e);
    } finally {
      setSending(false);
      showLoadingIndicator(false);
    }
  };
  
  const setPreferEditing = () => {
    setPrefer(member?.preferNotificationsPerSms!);
    setPreferEditMode(true);
  };
  const abortPreferEditing = () => {
    setPrefer(member?.preferNotificationsPerSms!);
    setPreferEditMode(false);
  };
  const savePrefer = async () => {
    await memberApi.setPreferedWayForNotifications({
        memberId: state.currentUser!.memberId!,
        body: prefer ? 'SMS' : 'Email',
      })
    const updated = await memberApi.getMemberDetails({
        memberId: state.currentUser!.memberId!
      });
    setMember(updated);
    setPreferEditMode(false);
  };
  
  const setEmailEditing = () => {
    setEmail(member?.email);
    setEmailConfirmationCode(undefined);
    setEmailEditMode(true);
    setViolations([]);
  };
  const abortEmailEditing = () => {
    setEmail(member?.email);
    setEmailConfirmationCode(undefined);
    setEmailEditMode(false);
    setViolations([]);
  };
  const saveEmail = async () => {
    try {
      await memberApi.changeEmail({ codeBasedChange: {
          code: emailConfirmationCode,
          value: email,
        } });
      await new Promise((resolve, reject) => {
          fetchCurrentUser(resolve, reject, true);
        });
      const updated = await memberApi.getMemberDetails({
          memberId: state.currentUser!.memberId!
        });
      setMember(updated);
      setEmailConfirmationCode(undefined);
      setEmailEditMode(false);
      setViolations([]);
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
    if (!email) {
      setViolations({ ...violations, email: 'missing' });
      return;
    }
    try {
      await memberApi.requestEmailCode({
          body: email
        });
      setViolations({ ...violations, email: undefined });
      toast({
          namespace: 'passanger-profile',
          title: t('email-confirmation-code-title'),
          message: t('email-confirmation-code-message'),
        });
    } catch (error) {
      if (error.response?.json) {
        const v = await error.response.json();
        setViolations({ ...violations, ...v });
      } else {
        console.error(error);
      }
    }
  };

  const setPhoneEditing = () => {
    setPhone(member?.phoneNumber);
    setPhoneConfirmationCode(undefined);
    setPhoneEditMode(true);
    setViolations([]);
  };
  const abortPhoneEditing = () => {
    setPhone(member?.phoneNumber);
    setPhoneConfirmationCode(undefined);
    setPhoneEditMode(false);
    setViolations([]);
  };
  const savePhone = async () => {
    try {
      await memberApi.changePhoneNumber({
          codeBasedChange: {
            code: phoneConfirmationCode,
            value: phone,
          }
        });
      const updated = await memberApi.getMemberDetails({
          memberId: state.currentUser!.memberId!
        });
      setMember(updated);
      setPhoneConfirmationCode(undefined);
      setPhoneEditMode(false);
      setViolations([]);
    } catch (error) {
      if (error.response?.json) {
        const v = await error.response.json();
        setViolations({ ...violations, ...v });
      } else {
        console.error(error);
      }
    }
  };
  const requestPhoneCode = async () => {
    if (!phone) {
      setViolations({ ...violations, phone: 'missing' });
      return;
    }
    try {
      await memberApi.requestPhoneCode({
          body: phone
        });
      setViolations({ ...violations, phone: undefined });
      toast({
          namespace: 'passanger-profile',
          title: t('phone-confirmation-code-title'),
          message: t('phone-confirmation-code-message'),
        });
    } catch (error) {
      if (error.response?.json) {
        const v = await error.response.json();
        setViolations({ ...violations, ...v });
      } else {
        console.error(error);
      }
    }
  };
  
  useEffect(() => {
    if (member === undefined) {
      setMember(null);
      loadMember(memberApi, state.currentUser!.memberId!, setMember);
    }
  }, [ memberApi, state.currentUser, member, setMember ]);
  
  useLayoutEffect(() => {
    setAppHeaderTitle('passanger/profile', false);
  }, [ setAppHeaderTitle ]);
  
  return (
  <>
    <MainLayout>
      <Heading icon={ <User /> }>{ t('avatar_title') }</Heading>
      <Collapsible
          open={ !avatarEditMode }>
        <Content
            gap='medium'
            direction='row'>
          <Stack
              anchor='bottom-right'>
            <UserAvatar
                size='200px'
                user={ state.currentUser! } />
            {
              isPhone
                  ? <Button
                        icon={ <FormEdit /> }
                        onClick={ () => setAvatarEditMode(true) } />
                  : <></>
            }
          </Stack>
          {
            isNotPhone
                ? <Box
                      justify='center'>
                    <Button
                        icon={ <FormEdit /> }
                        onClick={ () => setAvatarEditMode(true) }
                        label={ t('change') } />
                  </Box>
                : <></>
          }
        </Content>
      </Collapsible>
      <Collapsible open={ avatarEditMode }>
        <Content
            gap='medium'
            direction='row-responsive'>
          <AvatarUpload
              width={ isPhone ? 320 : 400 }
              height={ isPhone ? 240 : 300 }
              exportAsSquare={ true }
              exportSize={ 300 }
              label={ t('avatar_hint') }
              onBeforeFileLoad={ onBeforeAvatarLoad }
              onClose={ onCloseAvatar }
              onCrop={ onCropAvatar } />
          <Box
              justify='center'
              gap='small'>
            { t('avatar-preview') }
            <Avatar
                size='large'
                border={ uploadedAvatar == null }
                src={ uploadedAvatar?.toString() } />
            <Button
                secondary
                onClick={ saveAvatarEditing }
                disabled={ sending || uploadedAvatar == null }
                label={ t('save') } />
            <Button
                onClick={ abortAvatarEditing }
                disabled={ sending }
                label={ t('abort') } />
          </Box>
        </Content>
      </Collapsible>
      <Heading icon={ <Contact /> }>{ t('contact_data') }</Heading>
      <SubHeading>{ t('email') }</SubHeading>
      <Collapsible open={ !emailEditMode }>
        <Content
            direction='row'
            justify={ isPhone ? 'between' : 'start' }
            align='center'>
          {
            member?.email
                ? <Text truncate>{ member?.email }</Text>
                : t('email_none') }
          <Button
              icon={ <FormEdit /> }
              label={ isPhone ? undefined : t('change') }
              margin={ { left: 'small', vertical: 'xxsmall' } }
              onClick={ setEmailEditing } />
        </Content>
      </Collapsible>
      <Collapsible
          open={ emailEditMode }>
        <Content
            direction='column'>
          <ViolationsAwareFormField
              name="email"
              label='email'
              t={ t }
              violations={ violations }
              disabled={ sending }>
            <TextInput
                id="email"
                onChange={ event => setEmail(event.target.value) }
                value={ email } />
          </ViolationsAwareFormField>
          <ViolationsAwareFormField
              name="emailConfirmationCode"
              htmlFor="emailConfirmationCode"
              label='email-confirmation-code'
              t={ t }
              violations={ violations }
              disabled={ sending }>
            <Box
                direction="row"
                gap="medium">
              <TextInput
                  id="emailConfirmationCode"
                  value={ emailConfirmationCode }
                  onChange={ code => setEmailConfirmationCode( code.target.value ) }
                  focusIndicator={false}
                  plain />
              <CodeButton
                  secondary
                  disabled={ sending }
                  onClick={ (value: any) => {
                      requestEmailCode();
                      value.target.blur();
                    } }
                  label={ t('request-email-confirmation-code') } />
            </Box>
          </ViolationsAwareFormField>
          <Box
              direction={ isPhone ? 'column' : 'row' }>
            <Button
                secondary
                onClick={ saveEmail }
                label={ t('save') } />
            <Button
                margin={ isNotPhone ? { horizontal: 'small' } : undefined }
                onClick={ abortEmailEditing }
                label={ t('abort') } />
          </Box>
        </Content>
      </Collapsible>
      <SubHeading>{ t('phone-number') }</SubHeading>
      <Collapsible open={ !phoneEditMode }>
        <Content
            direction='row'
            justify={ isPhone ? 'between' : 'start' }
            align='center'>
          <Text truncate>{ member?.phoneNumber }</Text>
          <Button
              icon={ <FormEdit /> }
              label={ isPhone ? undefined : t('change') }
              margin={ { left: 'small', vertical: 'xxsmall' } }
              onClick={ setPhoneEditing } />
        </Content>
      </Collapsible>
      <Collapsible
          open={ phoneEditMode }>
        <Content
            direction='column'>
          <ViolationsAwareFormField
              name="phone"
              label='phone-number'
              t={ t }
              violations={ violations }
              disabled={ sending }>
            <TextInput
                id="phone"
                onChange={ event => setPhone(event.target.value) }
                value={ phone } />
          </ViolationsAwareFormField>
          <ViolationsAwareFormField
              name="phoneConfirmationCode"
              htmlFor="phoneConfirmationCode"
              label='phone-confirmation-code'
              t={ t }
              violations={ violations }
              disabled={ sending }>
            <Box
                direction="row"
                gap="medium">
              <TextInput
                  id="phoneConfirmationCode"
                  value={ phoneConfirmationCode }
                  onChange={ code => setPhoneConfirmationCode( code.target.value ) }
                  focusIndicator={false}
                  plain />
              <CodeButton
                  secondary
                  disabled={ sending }
                  onClick={ (event: any) => {
                      requestPhoneCode();
                      event.target!.blur();
                    } }
                  label={ t('request-phone-confirmation-code') } />
            </Box>
          </ViolationsAwareFormField>
          <Box
              direction={ isPhone ? 'column' : 'row' }>
            <Button
                secondary
                onClick={ savePhone }
                label={ t('save') } />
            <Button
                margin={ isNotPhone ? { horizontal: 'small' } : undefined }
                onClick={ abortPhoneEditing }
                label={ t('abort') } />
          </Box>
        </Content>
      </Collapsible>
      <SubHeading>{ t('prefer') }</SubHeading>
      <Collapsible
          open={ !preferEditMode }>
        <Content
            direction='row'
            justify={ isPhone ? 'between' : 'start' }
            align='center'>
          <Text>{ t(member?.preferNotificationsPerSms ? 'prefer_sms' : 'prefer_email') }</Text>
          <Button
              icon={ <FormEdit /> }
              label={ isPhone ? undefined : t('change') }
              margin={ { left: 'small', vertical: 'xxsmall' } }
              onClick={ setPreferEditing } />
        </Content>
      </Collapsible>
      <Collapsible
          open={ preferEditMode }>
        <CheckBox
            checked={ prefer }
            onChange={ event => setPrefer(event.target.checked) }
            name="preferNotificationsPerSms"
            label={ t('prefer-notifications-per-sms') }
            disabled={ sending }
          />
          <Box
              direction={ isPhone ? 'column' : 'row' }>
            <Button
                secondary
                onClick={ savePrefer }
                label={ t('save') } />
            <Button
                margin={ isNotPhone ? { horizontal: 'small' } : undefined }
                onClick={ abortPreferEditing }
                label={ t('abort') } />
          </Box>
      </Collapsible>
      <Heading icon={ <CoatCheck /> }>{ t('personal_data') }</Heading>
      <Content>
        <Paragraph>
          { t(`salutation_${member?.sex}`) }
          { member?.title }
          { member?.firstName }&nbsp;
          { member?.lastName }<br/>
          { t('birthday') }&nbsp;
          { parseLocalDate(member?.birthdate)?.toLocaleDateString() }
        </Paragraph>
        { t('ask_management_board') }
        <Anchor
            target='_blank'
            weight='normal'
            href={ 'mailto:' + state.appInformation!.contactEmailAddress }>
          { state.appInformation!.contactEmailAddress }
        </Anchor>
      </Content>
      <Heading icon={ <Home /> }>{ t('address_data') }</Heading>
      <Content>
        <Paragraph>
          { member?.street }&nbsp;
          { member?.streetNumber }<br/>
          { member?.zip }&nbsp;
          { member?.city }
        </Paragraph>
        { t('ask_management_board', { mmb: state.appInformation!.contactEmailAddress }) }
        <Anchor
            target='_blank'
            weight='normal'
            href={ 'mailto:' + state.appInformation!.contactEmailAddress }>
          { state.appInformation!.contactEmailAddress }
        </Anchor>
      </Content>
    </MainLayout>
  </>);
};

export default Profile;
