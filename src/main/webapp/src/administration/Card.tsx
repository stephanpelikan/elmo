import { Box, Paragraph } from 'grommet';
import { Icon } from 'grommet-icons';
import { PropsWithChildren } from 'react';

interface CardProps {
  title: string;
  icon: Icon;
};

const Card = ({ children, title, icon }: PropsWithChildren<CardProps>) => {
  const CardIcon = icon;
  return (
    <Box
        width="small"
        align="center"
        pad="small"
        round="medium"
        elevation="xlarge"
        margin="medium"
        direction="column"
        alignSelf="center"
        background={{"color":"accent-2"}}
        style={{ position: 'relative' }}>
      <Box
          align="center"
          justify="center"
          pad="xsmall"
          margin="xsmall">
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
