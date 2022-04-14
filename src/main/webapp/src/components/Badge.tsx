import React from 'react'
import styled from 'styled-components'
import { Box, Text } from 'grommet'
import { BackgroundType } from 'grommet/utils'

type BadgeSize = 
  'xsmall'
  | 'small'
  | 'medium'
  | 'large'
  | 'xlarge';
  
interface BadgeProps {
  background?: BackgroundType;
  count: string | number;
  size?: BadgeSize;
}

const badgeSize = (size: string) => {
  return '1.5rem';
};

const textOffset = (size: string) => {
  return '0.05rem';
};

const CountText = styled(Text)`
  font-size: ${props => badgeSize(props.size)};
  line-height: ${props => badgeSize(props.size)};
  font-weight: 700;
  width: ${props => badgeSize(props.size)};
  text-align: center;
  left: -${props => textOffset(props.size)};
  top: ${props => textOffset(props.size)};
  position: relative;
`

const Badge = ({ count, background, size, ...props }: BadgeProps) => (
  <Box align='center' pad='small' justify='center' round={badgeSize(size)} background={background} {...props}>
    <CountText size={size}>{count}</CountText>
  </Box>);

export { Badge }
