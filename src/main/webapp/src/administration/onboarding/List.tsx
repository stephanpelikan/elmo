import { Box, Button, ColumnConfig, DataTable, ResponsiveContext, Text } from 'grommet';
import { FormEdit } from 'grommet-icons';
import { useCallback, useContext, useEffect, useLayoutEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../../AppContext';
import { MemberApplication, MemberStatus } from '../../client/administration';
import i18n from '../../i18n';

i18n.addResources('en', 'administration/onboarding', {
      "title.long": 'Member applications',
      "title.short": 'Member applications',
      "edit": "edit",
      "check": "check",
    });
i18n.addResources('de', 'administration/onboarding', {
      "title.long": 'Anmeldungen',
      "title.short": 'Anmeldungen',
      "edit": "Bearbeiten",
      "check": "Prüfen",
    });

const itemsBatchSize = 20;

const ListOfOnboardings = () => {
  const { administrationApi, setAppHeaderTitle } = useAppContext();
  
  const [ memberApplications, setMemberApplications ] = useState(undefined);
  
  const loadMemberApplications = useCallback(async () => {
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
  }, [ memberApplications, administrationApi ]);
  
  useEffect(() => {
    if (memberApplications === undefined) {
      loadMemberApplications();
    }
  }, [ memberApplications, loadMemberApplications ]);
  
  useLayoutEffect(() => {
    setAppHeaderTitle('administration/onboarding');
  }, [ setAppHeaderTitle ]);

  const { t } = useTranslation('administration/onboarding');
  
  const size = useContext(ResponsiveContext);
  
  const onEdit = async (application: MemberApplication, takeOver: boolean) => {
    
    await administrationApi.takeoverMemberOnboardingApplication({
        applicationId: application.id,
        inlineObject: {
          status: application.member.status,
        }
      });
    
    application.member.status = MemberStatus.ApplicationSubmitted;
    
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
          columns={columns}
          step={itemsBatchSize}
          onMore={() => loadMemberApplications()}
          data={memberApplications} />
    </Box>
    );
}

export { ListOfOnboardings };
