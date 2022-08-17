import { Box, Button, ColumnConfig, DataTable, ResponsiveContext, Text } from 'grommet';
import { FormEdit } from 'grommet-icons';
import { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../AppContext';
import { AdministrationApi, MemberApplication } from '../../client/administration';
import i18n from '../../i18n';

i18n.addResources('en', 'administration/onboarding', {
      "edit": "edit",
      "check": "check",
      "loading": "loading...",
      "status_ACCEPTED": "Accepted",
      "status_REJECTED": "Rejected",
      "status_DUPLICATE": "Duplicate",
    });
i18n.addResources('de', 'administration/onboarding', {
      "edit": "Bearbeiten",
      "check": "Prüfen",
      "loading": "Lade Daten...",
      "status_ACCEPTED": "Aktiviert",
      "status_REJECTED": "Abgewiesen",
      "status_DUPLICATE": "Duplikat",
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
  const { administrationApi } = useAppContext();
  
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
          xxx: new Date('2022-06-05T00:00:00'),
          takeoverMemberOnboardingApplicationRequest: {
            taskId: application.taskId,
          }
        });
    }
    
    navigate('./' + application.id);
    
  };

  const columns: ColumnConfig<MemberApplication>[] = size !== 'small'
      ? [
          { property: 'createdAt', header: 'Von', primary: false,
            render: application =>
              application.createdAt && application.createdAt.toLocaleDateString(),
          },
          { property: 'email', header: 'Email',
            render: application => <Text truncate>{ application.email }</Text>
          },
          { property: 'lastName', header: 'Zuname'},
          { property: 'firstName', header: 'Vorname'},
          { property: 'status', header: 'Aktion', align: 'center',
            render: application => {
              switch (application.status) {
                case 'NEW':
                case 'DATA_INVALID':
                case 'APPLICATION_SUBMITTED':
                  const applicationSubmitted = application.status === 'APPLICATION_SUBMITTED';
                  return <Button
                        onClick={() => onEdit(application, !applicationSubmitted)}
                        secondary={applicationSubmitted}
                        hoverIndicator
                        icon={<FormEdit />}
                        size='small' />;
                default:
                  return <div>{ t(`status_${application.status}`) }</div>;
              }
            }
          },
        ]
      : [
          { property: 'createdAt', header: 'Von', size: '5rem',
            render: application =>
              application.createdAt && application.createdAt.toLocaleDateString(),
          },
          { property: 'email', header: 'Email',
            render: application => <Text truncate>{ application.email }</Text>
          },
          { property: 'status', header: 'Aktion', align: 'center', size: '3.5rem',
            render: application => {
              switch (application.status) {
                case 'NEW':
                case 'DATA_INVALID':
                case 'APPLICATION_SUBMITTED':
                  const applicationSubmitted = application.status === 'APPLICATION_SUBMITTED';
                  return <Button
                        onClick={() => onEdit(application, !applicationSubmitted)}
                        secondary={applicationSubmitted}
                        hoverIndicator
                        icon={<FormEdit />}
                        size='small' />;
                default:
                  return <div>{ t(`status_${application.status}`) }</div>;
              }
            }
          },
        ];
  
  return (
    <Box width='100%' overflow="vertical">
      <DataTable
          size='100%'
          placeholder={ memberApplications === undefined ? t('loading') : undefined }
          columns={columns}
          step={itemsBatchSize}
          onMore={() => loadData(administrationApi, setMemberApplications, memberApplications)}
          data={memberApplications} />
    </Box>
    );
}

export { ListOfOnboardings };
