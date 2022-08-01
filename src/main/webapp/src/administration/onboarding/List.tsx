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
    });
i18n.addResources('de', 'administration/onboarding', {
      "edit": "Bearbeiten",
      "check": "Prüfen",
      "loading": "Lade Daten...",
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
          { property: 'member.email', header: 'Email',
            render: application => <Text truncate>{ application.member.email }</Text>
          },
          { property: 'member.lastName', header: 'Zuname'},
          { property: 'member.firstName', header: 'Vorname'},
          { property: 'member.status', header: 'Aktion', align: 'center',
            render: application => {
              const applicationSubmitted = application.member.status === 'APPLICATION_SUBMITTED';
              return <Button
                    secondary={applicationSubmitted}
                    onClick={() => onEdit(application, !applicationSubmitted)}
                    hoverIndicator
                    icon={<FormEdit />}
                    label={ t(applicationSubmitted ? 'check' : 'edit') }
                    size='medium' />;
            }
          },
        ]
      : [
          { property: 'createdAt', header: 'Von', size: '5rem',
            render: application =>
              application.createdAt && application.createdAt.toLocaleDateString(),
          },
          { property: 'member.email', header: 'Email',
            render: application => <Text truncate>{ application.member.email }</Text>
          },
          { property: 'member.status', header: 'Aktion', align: 'center', size: '3.5rem',
            render: application => {
              const applicationSubmitted = application.member.status === 'APPLICATION_SUBMITTED';
              return <Button
                    onClick={() => onEdit(application, !applicationSubmitted)}
                    secondary={applicationSubmitted}
                    hoverIndicator
                    icon={<FormEdit />}
                    size='small' />;
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
