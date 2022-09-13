import { User as UserDto, Sex } from '../client/gui';
import { User as UserMale, UserFemale } from 'grommet-icons';
import { Avatar } from 'grommet';

type UserAvatarProps = {
  user: UserDto;
  size?: 'xsmall' | 'small' | 'medium' | 'large' | 'xlarge' | string;
};

const UserAvatar = ({
  user,
  size = 'medium'
}: UserAvatarProps) => {

  const backgroundColor = user.memberId
      ? `hsl(${ (user.memberId * 207) % 360 }, 70%, 45%)`
      : '#333333';

  const intSize = parseInt(size);
  let symbolSize: string;
  if (Number.isNaN(intSize)) {
    switch (size) {
      case 'xsmall':
        symbolSize = '10rem';
        break;
      case 'small':
        symbolSize = '15rem';
        break;
      case 'medium':
        symbolSize = '27rem';
        break;
      case 'large':
        symbolSize = '40rem';
        break;
      case 'xlarge':
        symbolSize = '57rem';
        break;
      default:
        symbolSize = '27rem';
    }
  } else {
    symbolSize = `${ intSize * 0.65 }px`;
  }
      
  return (
      <Avatar
          style={ { backgroundColor } }
          size={ size }
          src={ user.avatar ? `/api/v1/gui/member/${ user.memberId }/avatar?ts=${ user.avatar }` : undefined }>
        {
          user.sex === Sex.Female
              ? <UserFemale color='accent-1' size={ symbolSize } />
              : <UserMale color='accent-1' size={ symbolSize } />
        }
      </Avatar>
    );
    
}

export { UserAvatar }