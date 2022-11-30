import { User as UserDto, Sex, PlannerDriver } from '../client/gui';
import { User as UserMale, UserFemale } from 'grommet-icons';
import { Avatar, Box, Paragraph, Text } from 'grommet';
import { BorderType } from 'grommet/utils';
import React, { useRef, useState } from 'react';
import useOnClickOutside from '../utils/clickOutside';
import { useAppContext } from '../AppContext';

type UserAvatarProps = {
  user: UserDto | PlannerDriver;
  border?: BorderType;
  size?: 'xsmall' | 'small' | 'medium' | 'large' | 'xlarge' | string;
};

const UserAvatar = ({
  user,
  border,
  size = 'medium',
}: UserAvatarProps) => {

  const { state } = useAppContext();

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
  
  const [ showDetails, setShowDetails ] = useState(false);
  const ref = useRef(null);
  useOnClickOutside(ref, event => {
      if (!showDetails) return;
      event.preventDefault();
      event.stopPropagation();
      setShowDetails(false);
    });
  
  return (
      <Box
          style={ { position: 'relative' } }
          onMouseDown={ () => setShowDetails(true) }>
        {
          (state.currentUser!.memberId !== user.memberId) && showDetails
              ? <Box
                    ref={ ref }
                    background='white'
                    style={ {
                        position: 'absolute',
                        maxWidth: 'unset',
                        margin: '-0.3rem',
                        zIndex: 20,
                        boxShadow: '5px 5px 10px rgba(0, 0, 0, 0.5)'
                    } }
                    height="xsmall"
                    width="small"
                    round="small"
                    border
                    pad={ {
                        left: `calc(${symbolSize} * 0.15)`,
                        top: '0.3rem'
                      } }>
                  <Text
                      weight="bold">{ user.memberId }</Text>
                  <Paragraph>
                      { user.firstName } { user.lastName }
                  </Paragraph>
                </Box>
              : undefined
        }
        <Avatar
            style={ { zIndex: (state.currentUser!.memberId !== user.memberId) && showDetails ? 20 : undefined } }
            background={ backgroundColor }
            size={ size }
            border={ border }
            src={ user.avatar ? `/api/v1/gui/member/${ user.memberId }/avatar?ts=${ user.avatar }` : undefined }>
          {
            user.sex === Sex.Female
                ? <UserFemale color='accent-1' size={ symbolSize } />
                : <UserMale color='accent-1' size={ symbolSize } />
          }
        </Avatar>
      </Box>);
    
}

export { UserAvatar }
