import { Box, Button, Header, Heading, Image, ResponsiveContext } from "grommet";
import { Menu as MenuIcon } from 'grommet-icons';

type AppHeaderProps = {
  toggleShowBar: () => void;
};

const AppHeader = ({ toggleShowBar }: AppHeaderProps) => {

  return (
    <Header
        tag='header'
        background='brand'
        elevation='medium'
        height='xxsmall'
        pad='xxsmall'
        style={{ zIndex: '1' }}>
      <Box
          direction='row'
          fill='vertical'
          align='center'>
        <Box
            fill='vertical'
            width={{ max: '3.5rem' }}>
          <Image
              src='/assets/logo192.png'
              fit='contain' />
        </Box>
        <ResponsiveContext.Consumer>
        {
          size => (
            size === 'small' ? (
              <Heading
                  margin='small'
                  level='2'>Elmo GF</Heading>
            ) : (
              <Heading
                  margin='small'
                  level='3'>ElektroMobil Gänserndorf</Heading>
            )
          )
        }
        </ResponsiveContext.Consumer>
      </Box>
      <Box>
        <Button
            icon={<MenuIcon />}
            onClick={toggleShowBar} />
      </Box>
    </Header>
  );
        
}

export { AppHeader };
