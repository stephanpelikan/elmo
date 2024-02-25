import { Member, PlannerDriver, Sex, User as UserDto } from '../client/gui';
import { Help, User as UserMale, UserFemale } from 'grommet-icons';
import { Anchor, Avatar, Box, Text } from 'grommet';
import { BorderType } from 'grommet/utils';
import { MouseEvent, useRef, useState } from 'react';
import useOnClickOutside from '../utils/clickOutside';
import { useAppContext, useMemberGuiApi } from '../AppContext';
import { Content } from './MainLayout';

type UserAvatarProps = {
  user?: UserDto | PlannerDriver;
  border?: BorderType;
  size?: 'xsmall' | 'small' | 'medium' | 'large' | 'xlarge' | string;
};

const UserAvatar = ({
  user,
  border,
  size = 'medium',
}: UserAvatarProps) => {

  const { state } = useAppContext();
  const memberApi = useMemberGuiApi();

  const backgroundColor = user && user.memberId
      ? `hsl(${ (user.memberId * 207) % 360 }, 70%, 45%)`
      : 'dark-2';
  const UserIcon = user === undefined
      ? Help
      : user.sex === Sex.Female
      ? UserFemale
      : UserMale;

  const intSize = parseInt(size);
  let symbolSize: string;
  if (Number.isNaN(intSize)) {
    switch (size) {
      case 'xsmall':
        symbolSize = '10rem';
        break;
      case 'small':
        symbolSize = '16rem';
        break;
      case 'medium':
        symbolSize = '28rem';
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
  
  const [ showDetails, setShowDetails ] = useState<Member | undefined>(undefined);
  const ref = useRef(null);
  useOnClickOutside(ref, event => {
      if (!showDetails) return;
      event.preventDefault();
      event.stopPropagation();
      setShowDetails(undefined);
    });
  const loadAndShowDetails = async (event: MouseEvent) => {
    if (user === undefined) return;
    event.preventDefault();
    event.stopPropagation();
    if (state.currentUser!.memberId === user.memberId) return;
    const details = await memberApi.getMemberDetails({ memberId: user.memberId! });
    setShowDetails(details);
  };

  return (
      <Box
          style={ { position: 'relative' } }
          onMouseDown={ loadAndShowDetails }>
        {
          showDetails
              ? <Box
                    ref={ ref }
                    background='white'
                    style={ {
                        position: 'absolute',
                        maxWidth: 'unset',
                        margin: '-0.3rem',
                        zIndex: 20,
                        opacity: 2,
                        boxShadow: '5px 5px 10px rgba(0, 0, 0, 0.5)'
                    } }
                    height="xsmall"
                    width="16rem"
                    round="small"
                    border
                    pad={ {
                        left: `calc(${symbolSize} * 0.15)`,
                        top: '0.3rem'
                      } }>
                  <Text
                      weight="bold">{ user.memberId }</Text>
                  <Content>
                    <Text truncate="tip">
                      { showDetails.firstName } { showDetails.lastName }
                    </Text>
                    <Anchor
                        href={ `tel:${ showDetails.phoneNumber }` }>
                      { showDetails.phoneNumber }
                    </Anchor>
                  </Content>
                </Box>
              : undefined
        }
        <Avatar
            style={ { zIndex: (state.currentUser!.memberId !== user?.memberId) && showDetails ? 20 : undefined } }
            background={ backgroundColor }
            size={ size }
            border={ border }
            src={ user?.avatar ? `/api/v1/gui/member/${ user.memberId }/avatar?ts=${ user.avatar }` : undefined }>
          <UserIcon color='accent-1' size={ symbolSize } />
        </Avatar>
      </Box>);
    
}

export { UserAvatar }
