import { Box, Button, ColumnConfig, DataTable, ResponsiveContext, Text } from 'grommet';
import { FormEdit } from 'grommet-icons';
import { useContext, useEffect, useLayoutEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { updateTitle, useAppContext } from '../../AppContext';
import { administrationApi } from '../../client';
import { MemberApplication } from '../../client/administration';
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
  
  const [ memberApplications, setMemberApplications ] = useState(undefined);
  
  const loadMemberApplications = async () => {
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
  
  useEffect(() => {
    if (memberApplications === undefined) {
      loadMemberApplications();
    }
  });
  
  const { dispatch } = useAppContext();
  useLayoutEffect(() => {
    updateTitle(dispatch, 'administration/onboarding');
  }, [ dispatch ]);

  const { t } = useTranslation('administration/onboarding');
  
  const size = useContext(ResponsiveContext);

  const columns: ColumnConfig<MemberApplication>[] = size !== 'small'
      ? [
          { property: 'createdAt', header: 'Von', primary: false,
            render: application =>
              application.createdAt && application.createdAt.toLocaleDateString(),
          },
          { property: 'member.lastName', header: 'Zuname'},
          { property: 'member.firstName', header: 'Vorname'},
          { property: 'member.status', header: 'Aktion', align: 'center',
            render: application => {
              const applicationSubmitted = application.member.status === 'APPLICATION_SUBMITTED';
              return <Button
                    secondary={applicationSubmitted}
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
            render: application => <Text truncate>{ application.member.email.replace(/\./g, ' ') }</Text>
          },
          { property: 'member.status', header: 'Aktion', align: 'center', size: '3.5rem',
            render: application => {
              const applicationSubmitted = application.member.status === 'APPLICATION_SUBMITTED';
              return <Button
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
