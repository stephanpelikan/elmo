import React from 'react';
import { Box, Paragraph } from 'grommet';
import { Icon } from 'grommet-icons';
import { PropsWithChildren } from 'react';

interface CardProps {
  title: string;
  icon: Icon;
  onClick?: () => void;
};

const Card = ({ children, title, icon, onClick }: PropsWithChildren<CardProps>) => {
  const CardIcon = icon;
  return (
    <Box
        width="small"
        align="center"
        round="medium"
        elevation="xlarge"
        margin="large"
        direction="column"
        alignSelf="center"
        background={{"color":"accent-2"}}
        style={{ position: 'relative' }}
        onClick={onClick}>
      <Box
          align="center"
          justify="center"
          pad="xsmall"
          margin={{ top: 'medium' }}>
        <CardIcon size='large' color='accent-1' />
        <Paragraph
            size="medium"
            margin="small"
            textAlign="center"
            color="accent-1"
            style={{ fontWeight: 'bold'}}>
          { title }
        </Paragraph>
        { children }
      </Box>
    </Box>
  );
}
  
export { Card };
