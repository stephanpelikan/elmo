import { Box, Button, ColumnConfig, DataTable, Grid, Text } from 'grommet';
import { Add, Download, FormEdit, Upload } from 'grommet-icons';
import React, { ChangeEvent, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../AppContext';
import { MemberApi, Member } from '../../client/administration';
import { useMemberApi } from '../AdminAppContext';
import { CircleButton } from '../../components/CircleButton';
import { MemberIdAvatar } from '../../components/MemberIdAvatar';
import i18n from '../../i18n';
import useResponsiveScreen from '../../utils/responsiveUtils';

i18n.addResources('en', 'administration/member', {
      "edit": "edit",
      "check": "check",
      "status": "Status",
      "status_ACTIVE": "Active",
      "status_INACTIVE": "Inactive",
      "status_TO_BE_DELETED": "Will be deleted soon...",
      "email": "Email",
      "last-name": "Firstname",
      "name": "Name",
      "first-name": "Lastname",
      "roles": "Roles",
      "member-id.short": "M-ID",
      "member-id.long": "Member-ID",
      "action": "Action",
      "total": "Total:",
      "download": "download Excel-file",
      "upload": "upload Excel-file",
      "upload_title": "Upload Excel",
      "upload_success": "The Excel-file was uploaded successfully. Members named in the Excel-sheet, which are already known to the system, were ignored during processing.",
      "upload_wrong": "Unsupported content of Excel! Download the list to get a valid template.",
    });
i18n.addResources('de', 'administration/member', {
      "edit": "Bearbeiten",
      "check": "Prüfen",
      "status": "Status",
      "status_ACTIVE": "Aktiv",
      "status_INACTIVE": "Inaktiv",
      "status_TO_BE_DELETED": "Wird bald entfernt...",
      "email": "Email",
      "last-name": "Zuname",
      "name": "Name",
      "first-name": "Vorname",
      "roles": "Rolen",
      "member-id.short": "M-NR",
      "member-id.long": "Mitgliedsnummer",
      "action": "Aktion",
      "total": "Anzahl:",
      "download": "Excel herunterladen",
      "upload": "Excel hochladen",
      "upload_title": "Excel hochladen",
      "upload_success": "Die Excel-Datei wurde erfolgreich hochgeladen. Mitglieder aus dem Excel, die bereits im System erfasst sind, wurden beim Verarbeiten ignoriert.",
      "upload_wrong": "Falsches Tabellenformat! Lade die Liste herunter, um eine gültige Vorlage zu erhalten.",
    });
    
const itemsBatchSize = 30;

const loadData = async (
    memberApi: MemberApi,
    setNumberOfMembers: (number: number) => void,
    setMembers: (applications: Array<Member>) => void,
    members: Array<Member> | undefined,
  ) => {

    const result = await memberApi
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
  
  const { isPhone, isNotPhone } = useResponsiveScreen();
  const { toast, showLoadingIndicator } = useAppContext();
  const memberApi = useMemberApi();
  const { t } = useTranslation('administration/member');
  const navigate = useNavigate();
  
  const [ members, setMembers ] = useState<Array<Member> | undefined>(undefined);
  const [ numberOfMembers, setNumberOfMembers ] = useState(0);
  
  useEffect(() => {
    if (members !== undefined) {
      return;
    }
    const initList = async () => {
        showLoadingIndicator(true);
        await loadData(memberApi, setNumberOfMembers, setMembers, members);
        showLoadingIndicator(false);
      };
    initList();
  }, [ memberApi, setMembers, setNumberOfMembers, members, showLoadingIndicator ]);
  
  const uploadRef = useRef<HTMLInputElement>(null);
  
  const newMember = () => {
    navigate('./-');
  }

  const onUploadExcel = () => {
    uploadRef.current!.click();
  };
  
  const onExcelUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    
    if (!event.target?.files) {
      return;
    }
    
    try {
      
      await memberApi.uploadMembersExcelFile({ body: event.target.files[0] });
  
      toast({
          namespace: 'administration/member',
          title: t('upload_title'),
          message: t('upload_success'),
          status: 'normal'
        });
      
      setMembers(undefined);
    
    } catch (error) {

      toast({
          namespace: 'administration/member',
          title: t('upload_title'),
          message: t('upload_wrong'),
          status: 'critical'
        });
      
    }
    // @ts-ignore
    event.target.value = null; // reset file input
    
  };
  
  const onDownloadExcel = async () => {
    
    const excel = await memberApi.generateMembersExcelFileRaw();
    const disposition = excel.raw.headers.get('content-disposition')!;
    const anchor = window.document.createElement('a');
    anchor.href = window.URL.createObjectURL(await excel.value());
    const posOfEquals = disposition.indexOf('=');
    if (posOfEquals !== -1) {
      anchor.download = disposition.substring(posOfEquals + 1);
    }
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    window.URL.revokeObjectURL(anchor.href);
    
  };
  
  const edit = (member: Member) => {
    navigate('./' + member.memberId);
  };

  const columns: ColumnConfig<Member>[] = isNotPhone
      ? [
          { property: 'memberId', header: t('member-id.long'),
            render: member => (
              <Box direction='row'>
                <MemberIdAvatar memberId={ member.memberId } sex={ member.sex } avatar={ member.avatar } />
              </Box>)
          },
          { property: 'lastName', header: t('last-name')},
          { property: 'firstName', header: t('first-name')},
          { property: 'status', header: t('status'),
            render: member => <Text>{ t(`status_${member.status}`) }</Text>
          },
          { property: 'member.hoursServedPassangerService', header: t('Fahrtendienst'),
            render: member => <Text>{ member.hoursServedPassangerService }h</Text>
          },
          { property: 'member.hoursConsumedCarSharing', header: t('Car-Sharing'),
            render: member => <Text>{ member.hoursConsumedCarSharing }h</Text>
          },
          { property: 'xxxx', header: t('action'), align: 'center',
            render: member => (
              <>
                <Button label={ t('edit') } onClick={ () => edit(member) } />
              </>)
          },
        ]
      : [
          { property: 'memberId', header: t('member-id.short'),
            render: member => (
              <Box direction='row'>
                <MemberIdAvatar memberId={ member.memberId } sex={ member.sex } avatar={ member.avatar } />
              </Box>)
          },
          { property: 'lastName', header: t('name'),
            render: member => `${member.lastName} ${member.firstName ? member.firstName.substring(0, 1) + '.' : ''}`},
          { property: 'status', header: t('action'), align: 'center',
            render: member => (
              <>
                <Button icon={<FormEdit />} onClick={ () => edit(member) } />
              </>)
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
            pad={ isPhone ? 'medium' : 'small' }>
          <Box
              justify='center'
              align="center">
            <Text>{ t('total') } { numberOfMembers }</Text>
          </Box>
          <Box
              direction='row'
              gap='medium'>
            <input
                style={ { display: 'none' } }
                ref={ uploadRef }
                onChange={ onExcelUpload }
                type="file" />
            <Button
                plain
                onClick={ onUploadExcel }
                label={ isNotPhone ? t('upload') : undefined}
                icon={ <Upload /> } />
            <Button
                plain
                onClick={ onDownloadExcel }
                label={ isNotPhone ? t('download') : undefined}
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
                size='100%'
                background={ {
                  body: ['white', 'light-2']
                } }
                columns={columns}
                step={itemsBatchSize}
                sortable={ false }
                onMore={() => loadData(memberApi, setNumberOfMembers, setMembers, members)}
                data={members} />
          </Box>
        </Box>
      </Grid>
      <CircleButton
          style={ { position: 'absolute', right: '0', bottom: '1px' } }
          color='brand'
          icon={<Add color='white' />}
          onClick={ newMember } />
    </>);
}

export { ListOfMembers };
