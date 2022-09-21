import { Box, Button, ColumnConfig, DataTable, ResponsiveContext, Text } from 'grommet';
import { FormEdit } from 'grommet-icons';
import { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAdministrationApi } from '../AdminAppContext';
import { AdministrationApi, MemberApplication, MemberApplicationStatus } from '../../client/administration';
import i18n from '../../i18n';

i18n.addResources('en', 'administration/onboarding', {
      "edit": "edit",
      "check": "check",
      "loading": "loading...",
      "status_ACCEPTED": "Accepted",
      "status_REJECTED": "Rejected",
      "status_DUPLICATE": "Duplicate",
      "date_of_application": "From",
      "email": "Email",
      "last-name": "Firstname",
      "first-name": "Lastname",
      "member-id": "Member-ID",
      "action": "Action",
    });
i18n.addResources('de', 'administration/onboarding', {
      "edit": "Bearbeiten",
      "check": "Prüfen",
      "loading": "Lade Daten...",
      "status_ACCEPTED": "Aktiviert",
      "status_REJECTED": "Abgewiesen",
      "status_DUPLICATE": "Duplikat",
      "date_of_application": "Von",
      "email": "Email",
      "last-name": "Zuname",
      "first-name": "Vorname",
      "member-id": "Mitgliedsnummer",
      "action": "Aktion",
    });
    
const itemsBatchSize = 20;

const loadData = async (
    administrationApi: AdministrationApi,
    setMemberApplications: (applications: Array<MemberApplication>) => void,
    memberApplications: Array<MemberApplication>
  ) => {

    const result = await administrationApi
        .getMemberOnboardingApplications({
            pageNumber: memberApplications === undefined
                ? 0
                : Math.floor(memberApplications.length / itemsBatchSize)
                  + (memberApplications.length % itemsBatchSize),
            pageSize: itemsBatchSize
          });
    setMemberApplications(
        memberApplications === undefined
        ? result.applications
        : memberApplications.concat(result.applications));
  
};

const ListOfOnboardings = () => {
  const administrationApi = useAdministrationApi();
  
  const [ memberApplications, setMemberApplications ] = useState(undefined);
  
  useEffect(() => {
    if (memberApplications === undefined) {
      loadData(administrationApi, setMemberApplications, memberApplications);
    }
  }, [ administrationApi, setMemberApplications, memberApplications ]);

  const { t } = useTranslation('administration/onboarding');
  
  const navigate = useNavigate();
  
  const size = useContext(ResponsiveContext);
  
  const onEdit = async (application: MemberApplication, takeOver: boolean) => {
    
    if (takeOver) {
      await administrationApi.takeoverMemberOnboardingApplication({
          applicationId: application.id,
          takeoverMemberOnboardingApplicationRequest: {
            taskId: application.taskId,
          }
        });
    }
    
    navigate('./' + application.id);
    
  };

  const columns: ColumnConfig<MemberApplication>[] = size !== 'small'
      ? [
          { property: 'createdAt', header: t('date_of_application'), primary: false, size: '4rem',
            render: application =>
              application.createdAt && application.createdAt.toLocaleDateString(),
          },
          { property: 'email', header: t('email'), size: 'small',
            render: application => <Text truncate>{ application.email }</Text>
          },
          { property: 'lastName', header: t('last-name'), size: 'xsmall'},
          { property: 'firstName', header: t('first-name'), size: 'xsmall'},
          { property: 'memberId', header: <Text truncate>{ t('member-id') }</Text>, size: 'xxsmall',
            render: application => <Text>{ application.memberId }</Text>
          },
          { property: 'status', header: t('action'), align: 'center', size: '8rem',
            render: application => {
              switch (application.status) {
                case MemberApplicationStatus.New:
                case MemberApplicationStatus.DataInvalid:
                case MemberApplicationStatus.ApplicationSubmitted:
                  const applicationSubmitted = application.status === MemberApplicationStatus.ApplicationSubmitted;
                  return <Button
                        onClick={() => onEdit(application, !applicationSubmitted)}
                        secondary={applicationSubmitted}
                        hoverIndicator
                        label={ t(applicationSubmitted ? 'check' : 'edit') }
                        icon={<FormEdit />}
                        size='small' />;
                default:
                  return <div>{ t(`status_${application.status}`) }</div>;
              }
            }
          },
        ]
      : [
          { property: 'createdAt', header: t('date_of_application'), size: '5rem',
            render: application =>
              application.createdAt && application.createdAt.toLocaleDateString(),
          },
          { property: 'email', header: t('email'),
            render: application => <Text truncate>{ application.email }</Text>
          },
          { property: 'status', header: t('action'), align: 'center', size: '5rem',
            render: application => {
              switch (application.status) {
                case MemberApplicationStatus.New:
                case MemberApplicationStatus.DataInvalid:
                case MemberApplicationStatus.ApplicationSubmitted:
                  const applicationSubmitted = application.status === MemberApplicationStatus.ApplicationSubmitted;
                  return <Button
                        onClick={() => onEdit(application, !applicationSubmitted)}
                        secondary={applicationSubmitted}
                        hoverIndicator
                        icon={<FormEdit />}
                        size='small' />;
                case MemberApplicationStatus.Accepted:
                  return <Text>{ t(`status_${application.status}`) }&nbsp;({ application.memberId })</Text>;
                default:
                  return <Text>{ t(`status_${application.status}`) }</Text>;
              }
            }
          },
        ];
  
  return (
    <Box
        fill='horizontal'
        overflow={ { vertical: 'auto' }}>
      <DataTable
          pin
          fill
          size='100%'
          background={ {
            body: ['white', 'light-2']
          } }
          placeholder={ memberApplications === undefined ? t('loading') : undefined }
          columns={columns}
          step={itemsBatchSize}
          onMore={() => loadData(administrationApi, setMemberApplications, memberApplications)}
          data={memberApplications} />
    </Box>
    );
}

export { ListOfOnboardings };
