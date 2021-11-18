import React, { useEffect } from 'react';
import { Text, Avatar, Grid, Box } from 'grommet';
import { User } from '../client/gui';
import { User as UserMale, UserFemale } from 'grommet-icons';

type CurrentUserProps = {
  user: User;
};

const CurrentUser: React.FC<CurrentUserProps> = ({
  user
}): JSX.Element => {
  useEffect(() => {

  });
  return (
    <Grid pad="small" fill="horizontal"
        gap="small" columns={['xxsmall', 'auto', 'flex']} align="center">
      {
        user.hasAvatar
          ? <Avatar src={`/api/member/${user.memberId}/avatar`} />
          : <Avatar background="accent-2">
              {
                user.female
                  ? <UserFemale color="accent-1" />
                  : <UserMale color="accent-1" />
              }
            </Avatar>
      }
      <Box>
        <Text truncate="tip">{user.email}</Text>
      </Box>
      <Text>({user.memberId})</Text>
    </Grid>
  );
}

export default CurrentUser;
