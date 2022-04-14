import { Box, InfiniteScroll, Text } from 'grommet';
import { useEffect, useState } from 'react';
import { administrationApi } from '../../client';

const ListOfOnboardings = () => {
  const [ memberApplications, setMemberApplications ] = useState(undefined);
  
  const loadMemberApplications = async () => {
    const result = await administrationApi
        .getMemberOnboardingApplications({ pageNumber: 0, pageSize: 2 });
    setMemberApplications(result.applications);
  };
  
  useEffect(() => {
    if (memberApplications === undefined) {
      loadMemberApplications();
    }
  });
  
  return (
    <Box height="100%" overflow="auto">
      <InfiniteScroll items={memberApplications === undefined ? [] : Object.keys(memberApplications)}>
        {(id, index) => (
          <Box
            flex={false}
            pad="medium"
            background={`light-${(index % 3) + 1}`}
          >
            <Text>{memberApplications[id].status}</Text>
          </Box>
        )}
      </InfiniteScroll>
</Box>);
}

export { ListOfOnboardings };
