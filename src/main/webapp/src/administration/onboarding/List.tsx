import { Box, Button, InfiniteScroll, ResponsiveContext, Text } from 'grommet';
import { useEffect, useLayoutEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { updateTitle, useAppContext } from '../../AppContext';
import { administrationApi } from '../../client';
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

  return (
    <Box
        height="100%"
        overflow="auto">
      <ResponsiveContext.Consumer>{
        size => (
          <InfiniteScroll
              step={20}
              onMore={() => loadMemberApplications()}
              items={memberApplications === undefined ? [] : Object.keys(memberApplications)}>
            {index => {
              const member = memberApplications[index].member;
              const applicationSubmitted = memberApplications[index].member.status === 'APPLICATION_SUBMITTED';
              return (
                <Box
                    key={memberApplications[index].id}
                    flex={false}
                    pad="medium"
                    direction="row"
                    justify='between'
                    width='100%'
                    align='center'
                    background={`light-${(index % 3) + 1}`}>
                  <Text
                      style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{
                    size === 'small'
                        ? member.email
                        : `${member.email} - ${member.lastName} ${applicationSubmitted ? '[ wartet auf Prüfung... ]' : ''}`
                  }</Text>
                  <Button
                      secondary={applicationSubmitted}
                      label={t(applicationSubmitted ? 'check' : 'edit')}
                      size={ size === 'small' ? 'small': 'medium' } />
                </Box>
              );
            }}
          </InfiniteScroll>
        )
      }</ResponsiveContext.Consumer>
    </Box>);
}

export { ListOfOnboardings };
