import { Box, InfiniteScroll, Text } from 'grommet';
import { useEffect, useLayoutEffect, useState } from 'react';
import { updateTitle, useAppContext } from '../../AppContext';
import { administrationApi } from '../../client';
import i18n from '../../i18n';

i18n.addResources('en', 'administration/onboarding', {
      "title.long": 'Member applications',
      "title.short": 'Member applications',
    });
i18n.addResources('de', 'administration/onboarding', {
      "title.long": 'Anmeldungen',
      "title.short": 'Anmeldungen',
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

  return (
    <Box
        height="100%"
        overflow="auto">
      <InfiniteScroll
          step={20}
          onMore={() => loadMemberApplications()}
          items={memberApplications === undefined ? [] : Object.keys(memberApplications)}>
        {(index) => (
          <Box
            key={memberApplications[index].id}
            flex={false}
            pad="medium"
            background={`light-${(index % 3) + 1}`}>
            <Text>{memberApplications[index].id}</Text>
          </Box>
        )}
      </InfiniteScroll>
</Box>);
}

export { ListOfOnboardings };
