import { Box, Button, ColumnConfig, DataTable, Grid, ResponsiveContext, Text } from 'grommet';
import { Add, Download, Upload } from 'grommet-icons';
import { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../AppContext';
import { AdministrationApi, Member } from '../../client/administration';
import { CircleButton } from '../../components/CircleButton';
import i18n from '../../i18n';

i18n.addResources('en', 'administration/member', {
      "edit": "edit",
      "check": "check",
      "loading": "loading...",
      "status": "Status",
      "status_ACTIVE": "Active",
      "status_INACTIVE": "Inactive",
      "status_TO_BE_DELETED": "Will be deleted soon...",
      "email": "Email",
      "last-name": "Firstname",
      "first-name": "Lastname",
      "roles": "Roles",
      "member-id.short": "M-ID",
      "member-id.long": "Member-ID",
      "action": "Action",
      "total": "Total:",
      "download": "download Excel-file",
      "upload": "upload Excel-file",
    });
i18n.addResources('de', 'administration/member', {
      "edit": "Bearbeiten",
      "check": "Prüfen",
      "loading": "Lade Daten...",
      "status": "Status",
      "status_ACTIVE": "Aktiv",
      "status_INACTIVE": "Inaktiv",
      "status_TO_BE_DELETED": "Wird bald entfernt...",
      "email": "Email",
      "last-name": "Zuname",
      "first-name": "Vorname",
      "roles": "Rolen",
      "member-id.short": "M-NR",
      "member-id.long": "Mitgliedsnummer",
      "action": "Aktion",
      "total": "Anzahl:",
      "download": "Excel hochladen",
      "upload": "Excel hochladen",
    });
    
const itemsBatchSize = 30;

const loadData = async (
    administrationApi: AdministrationApi,
    setNumberOfMembers: (number: number) => void,
    setMembers: (applications: Array<Member>) => void,
    members: Array<Member>
  ) => {

    const result = await administrationApi
        .getMembers({
            pageNumber: members === undefined
                ? 0
                : Math.floor(members.length / itemsBatchSize)
                  + (members.length % itemsBatchSize),
            pageSize: itemsBatchSize
          });
    setNumberOfMembers(result.page.totalElements);
    setMembers(
        members === undefined
        ? result.members
        : members.concat(result.members));
  
};

const ListOfMembers = () => {
  
  const { administrationApi } = useAppContext();
  
  const [ members, setMembers ] = useState(undefined);
  const [ numberOfMembers, setNumberOfMembers ] = useState(0);
  
  useEffect(() => {
    if (members === undefined) {
      loadData(administrationApi, setNumberOfMembers, setMembers, members);
    }
  }, [ administrationApi, setMembers, setNumberOfMembers, members ]);

  const { t } = useTranslation('administration/member');
  
  const navigate = useNavigate();
  
  const size = useContext(ResponsiveContext);
  
  const onEdit = async (member: Member) => {
    
    navigate('./' + member.memberId);
    
  };

  const columns: ColumnConfig<Member>[] = size !== 'small'
      ? [
          { property: 'memberId', header: t(size === 'small' ? 'member-id.short' : 'member-id.long') },
          { property: 'lastName', header: t('last-name')},
          { property: 'firstName', header: t('first-name')},
          { property: 'status', header: t('status'),
            render: member => <Text>{ t(`status_${member.status}`) }</Text>
          },
          { property: 'none', header: t('action'), align: 'center',
            render: member => <Text>{ t(`status_${member.status}`) }</Text>
          },
        ]
      : [
          { property: 'memberId', header: t(size === 'small' ? 'member-id.short' : 'member-id.long') },
          { property: 'lastName', header: t('last-name')},
          { property: 'status', header: t('action'), align: 'center',
            render: member => <Text>{ t(`status_${member.status}`) }</Text>
          },
        ];
  
  return (
    <>
      <Grid
          rows={ [ 'xxsmall' ] }
          fill>
        <Box
            flex
            justify='between'
            direction='row'
            background={ { color: 'accent-2', opacity: 'strong' } }
            pad={ size === 'small' ? 'medium' : 'small' }>
          <Box
              justify='center'
              align="center">
            <Text>{ t('total') } { numberOfMembers }</Text>
          </Box>
          <Box
              direction='row'
              gap='medium'>
            <Button
                plain
                label={ size !== 'small' ? 'Excel hochladen' : undefined}
                icon={ <Upload /> } />
            <Button
                plain
                label={ size !== 'small' ? 'Excel herunterladen' : undefined}
                icon={ <Download /> } />
          </Box>
        </Box>
        <Box>
          <Box
              fill='horizontal'
              overflow={ { vertical: 'auto' }}>
            <DataTable
                fill
                pin
                background={ {
                  body: ['white', 'light-2']
                } }
                placeholder={ members === undefined ? t('loading') : undefined }
                columns={columns}
                step={itemsBatchSize}
                onMore={() => loadData(administrationApi, setNumberOfMembers, setMembers, members)}
                data={members} />
          </Box>
        </Box>
      </Grid>
      <CircleButton
          style={ { position: 'absolute', right: '0', bottom: '1px' } }
          color='brand'
          icon={<Add color='white' />}
          onClick={() => {}} />
    </>);
}

export { ListOfMembers };
