import { Cycle, Schedule, ShareOption } from 'grommet-icons';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Box } from 'grommet';
import React from 'react';
import useResponsiveScreen from '../../utils/responsiveUtils';
import { Heading } from '../../components/MainLayout';
import i18n from '../../i18n';

i18n.addResources('en', 'driver/shifts', {
      "title": "Your shifts",
    });
i18n.addResources('de', 'driver/shifts', {
      "title": "Deine Schichten",
    });

const Shifts = () => {

  const { t } = useTranslation('driver/shifts');
  const { isPhone } = useResponsiveScreen();
  const navigate = useNavigate();

  const shifts = undefined;
  
  return (
      <Box
          width={ isPhone ? '17.5rem' : '21rem'}
          gap="medium"
          margin={ { bottom: 'medium' } }>
        <Heading
            icon={ <Schedule /> }
            margin={ { vertical: 'xxsmall' } }
            level='3'>
          { t('title') }
        </Heading>
        {
          shifts === undefined
              ? <Box
                    background="light-6"
                    round="small"
                    align="center"
                    justify='center'
                    height='16rem'>
                  <Box
                      animation="rotateRight"
                      pad='medium'>
                    <Cycle
                        style={ { marginTop: '3px' } }
                        color="white"
                        size="large" />
                  </Box>
                </Box>
              : <Box
                    title={ t('card-planner') }
                    onClick={ () => navigate('.' + t('url-planner')) }>
                  <ShareOption />
                </Box>
        }
      </Box>);
  
};

export { Shifts }
