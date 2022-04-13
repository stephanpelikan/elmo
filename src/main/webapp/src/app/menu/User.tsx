import React from 'react';
import { Text, Avatar, Grid } from 'grommet';
import { User as UserDto } from '../client/gui';
import { User as UserMale, UserFemale } from 'grommet-icons';

type CurrentUserProps = {
  user: UserDto;
};

const User = ({
  user,
}: CurrentUserProps) => {
  return <Grid fill="horizontal"
          gap="small" columns={['xxsmall', 'auto', 'flex']} align="center">
          <Avatar background="accent-2">
          {
            user.female
                ? <UserFemale color="accent-1" />
                : <UserMale color="accent-1" />
          }
          </Avatar>
          <Text truncate="tip">{user.email}</Text>
          <Text>{ user.memberId !== undefined ? `(${user.memberId})` : '' }</Text>
        </Grid>;
}

export default User;
