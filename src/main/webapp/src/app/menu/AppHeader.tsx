import { Box, Button, Header, Heading, Image, ResponsiveContext } from "grommet";
import { Menu as MenuIcon } from 'grommet-icons';
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAppContext, setShowMenu } from '../../AppContext';

const AppHeader = () => {
  
  const { state, dispatch } = useAppContext();

  const { t, i18n } = useTranslation(state.title);
  
  // see https://github.com/i18next/react-i18next/issues/1064
  useEffect(() => {
    //Manually emitting a languageChanged-Event would work around this problem
    i18n.emit("languageChanged");
  }, [ state.title, i18n ]);
  
  const toogleMenu = () => {
    setShowMenu(dispatch, !state.showMenu);
  };
  
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
                  level='2'>{t('title.short')}</Heading>
            ) : (
              <Heading
                  margin='small'
                  level='3'>{t('title.long')}</Heading>
            )
          )
        }
        </ResponsiveContext.Consumer>
      </Box>
      <Box>
        <Button
            icon={<MenuIcon />}
            onClick={toogleMenu} />
      </Box>
    </Header>
  );
        
}

export { AppHeader };
