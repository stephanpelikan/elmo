import { Box, Button, Markdown, Paragraph } from 'grommet';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';
import { useAppContext, useOnboardingGuiApi } from "../AppContext";
import { MemberApplicationForm, OnboardingApi, UserStatus } from '../client/gui';
import React, { useEffect, useState } from 'react';
import { parseLocalDate } from '../utils/timeUtils';
import { Emoji, Halt } from 'grommet-icons';
import { MainLayout, Heading, Content } from '../components/MainLayout';

i18n.addResources('en', 'login/registration/submitted', {
      "title_REJECTED": "Sorry...",
      "title_APPLICATION_SUBMITTED": "Thank you!",
      "title_INACTIVE": "Inactive!",
      "text_REJECTED": "...but your registration was not accepted. The reason is:",
      "text_APPLICATION_SUBMITTED": "You have complete your application. The Elmo-association's management board will check your data and give you a clearance soon. You will receive an email or a text message.",
      "text_INACTIVE": "Your access to the Elmo service is currently inactive. Get in contact with the Elmo-association's management board if you want to reactivate it.",
      "button_changedata": "Fix data",
      "no_comments": "None",
      "salutation_MALE": "Mr. ",
      "salutation_FEMALE": "Mrs. ",
      "salutation_OTHER": "",
      "birthdate_format": "yyyy/m/d",
    });

// @ts-ignore
i18n.addResources('de', 'login/registration/submitted', {
      "title_REJECTED": "Leider...",
      "title_APPLICATION_SUBMITTED": "Danke!",
      "title_INACTIVE": "Inaktiv!",
      "text_REJECTED": "...konnte deine Registrierung nicht akzeptiert werden. Die Begründung dafür ist:",
      "text_APPLICATION_SUBMITTED": `*Du hast deine Registrierungsanfrage abgeschlossen.*

Der Vereinsvorstand wird deine Daten prüfen und dir in Kürze den Zugang zum Elmo-Dienst freischalten. Du wirst darüber per {{notificationChannel}} informiert.

### Persönliche Daten:

{{salutation}} {{title}} {{memberApplicationForm.firstName}} {{memberApplicationForm.lastName}}<br>
Geboren: {{birthdate}}

### Adressdaten:

{{memberApplicationForm.street}} {{memberApplicationForm.streetNumber}}<br>
{{memberApplicationForm.zip}} {{memberApplicationForm.city}}<br>

### Kontaktdaten:

Email: {{memberApplicationForm.email}}<br>
Telefon {{memberApplicationForm.phoneNumber}}<br>
Bevorzugt: {{notificationChannel}}

### Zur Registrierung:

Bermerkungen:

\`\`\`
{{applicationComment}}
\`\`\`
`,
      "text_INACTIVE": "Dein Zugang zum Elmo-Dienst ist derzeit inaktiv. Bitte wende dich an den Vereinsvorstand, wenn du ihn wieder aktivieren möchtest.",
      "button_changedata": "Daten korrigieren",
      "label_notification_email": "Email",
      "label_notification_sms": "SMS",
      "no_comments": "Keine",
      "salutation_MALE": "Herr ",
      "salutation_FEMALE": "Frau ",
      "salutation_OTHER": "",
      "birthdate_format": "d.m.yyyy",
    });

const loadData = async (
    onboardingApi: OnboardingApi,
    setMemberApplicationForm: (applicationForm: MemberApplicationForm) => void
  ) => {

  const application = await onboardingApi.loadMemberApplicationForm();
  
  setMemberApplicationForm(application);
  
};

const RegistrationSubmitted = () => {
  const { state, memberApplicationFormRevoked, showLoadingIndicator } = useAppContext();

  const onboardingApi = useOnboardingGuiApi();
  
  const [ memberApplicationForm, setMemberApplicationForm ] = useState<MemberApplicationForm | undefined>(undefined);

  useEffect(() => {
      if (memberApplicationForm !== undefined) {
        return;
      }
      const initRegistrationSubmitted = async () => { 
          showLoadingIndicator(true);
          await loadData(onboardingApi, setMemberApplicationForm);
          showLoadingIndicator(false);
        };
      initRegistrationSubmitted();
    }, [ memberApplicationForm, onboardingApi, setMemberApplicationForm ]);
    
  const takeOver = async () => {
    await onboardingApi.takeoverMemberApplicationForm({
        takeoverMemberApplicationFormRequest: {
          taskId: memberApplicationForm!.taskId
        }
      });
    memberApplicationFormRevoked();
  };

  const { t } = useTranslation('login/registration/submitted');
  
  if (memberApplicationForm === undefined) {
    return <></>;
  }
  
  if (state.currentUser!.status ===  UserStatus.Rejected) {
    return (
      <Box
          pad='medium'>
        <Heading
            size='small'
            level='2'>{ t(`title_${state.currentUser!.status}`) }</Heading>
        <Paragraph>{ t(`text_${state.currentUser!.status}`) }</Paragraph>
        <Markdown>{ memberApplicationForm?.comment }</Markdown>
      </Box>);
  }
  
  const isNotInactive = state.currentUser!.status !== 'INACTIVE';
  const Icon = isNotInactive ? Emoji : Halt;
  
  return (
    <MainLayout>
      <Heading icon={
            <Icon
                color='brand'
                size='large'
                style={ { marginRight: '0.5rem' } } />
          }>
        { t(`title_${state.currentUser!.status}`) }
      </Heading>
      <Content>
        <Markdown
            options={ {
                forceBlock: true,
              } }>
          { t(`text_${state.currentUser!.status}`, {
              memberApplicationForm,
              title: memberApplicationForm?.title ? memberApplicationForm.title : '',
              salutation: t(`salutation_${memberApplicationForm.sex}`),
              birthdate: parseLocalDate(memberApplicationForm.birthdate)?.toLocaleDateString(),
              applicationComment: Boolean(memberApplicationForm.applicationComment) ? memberApplicationForm.applicationComment : t('no_comments'),
              notificationChannel: memberApplicationForm.preferNotificationsPerSms ? t('label_notification_sms') : t('label_notification_email')
            } )
          }
        </Markdown>
        {
          isNotInactive
              ? <Box
                    align='center'
                    pad={{ bottom: 'medium' }}>
                  <Button
                      secondary
                      onClick={takeOver}
                      label={ t('button_changedata') } />
                </Box>
              : undefined
        }
      </Content>
    </MainLayout>);
  
}

export { RegistrationSubmitted };