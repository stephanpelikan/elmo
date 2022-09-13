import { UserAvatar } from './UserAvatar';
import { Badge } from './Badge';
import styled from "styled-components";
import { Sex } from '../client/gui';
import { Box } from 'grommet';

interface MemberIdAvatarProps {
  memberId: number;
  sex: Sex;
  avatar?: number;
}

const UserBadge = styled(Badge)`
  position: absolute;
  right: -0.8rem;
  top: -0.55rem;
`;

const MemberIdAvatar = ({
  memberId,
  sex,
  avatar
}: MemberIdAvatarProps) => {
  
  return (
      <Box style={{ position: 'relative' }}>
        <UserAvatar user={ { memberId: memberId, sex: sex, avatar: avatar } } />
        <UserBadge count={ memberId } size='small' textSize="xsmall"
            background='brand' />
      </Box>);
  
}

export { MemberIdAvatar };
