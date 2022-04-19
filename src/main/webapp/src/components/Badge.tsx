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
  textSize?: BadgeSize;
}

const badgeSize = (size: string) => {
  switch (size) {
  case 'xsmall': return '1rem';
  case 'small': return '1.25rem';
  case 'medium': return '1.5rem';
  case 'large': return '1.75rem';
  case 'xlarge': return '2rem';
  default: throw new Error('Unknown size');
  }
};

const textOffset = (size: string) => {
  switch (size) {
  case 'xsmall': return '0.02rem';
  case 'small': return '0.03rem';
  case 'medium': return '0.05rem';
  case 'large': return '0.08rem';
  case 'xlarge': return '0.12rem';
  default: throw new Error('Unknown size');
  }
};

const CountText = styled(Text)<any>`
  font-size: ${props => badgeSize(props.textSize)};
  line-height: ${props => badgeSize(props.size)};
  font-weight: 700;
  width: ${props => badgeSize(props.size)};
  text-align: center;
  top: ${props => textOffset(props.size)};
  position: relative;
`

const Badge = ({ count, background, size = 'medium', textSize = 'medium', ...props }: BadgeProps) => (
  <Box align='center' pad='small' justify='center' round={badgeSize(size)} background={background} {...props}>
    <CountText size={size} textSize={textSize}>{count}</CountText>
  </Box>);

export { Badge }
