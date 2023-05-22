import React from 'react';
import { Box } from 'grommet';
import { useTranslation } from 'react-i18next';
import { Content, Heading } from '../../components/MainLayout';
import useResponsiveScreen from '../../utils/responsiveUtils';
import { FormNext, History as HistoryIcon } from 'grommet-icons';
import { useNavigate } from 'react-router-dom';

const History = () => {

  const { t } = useTranslation('driver/history');
  const { t: tDriver } = useTranslation('driver');
  const { isPhone } = useResponsiveScreen();
  const navigate = useNavigate();

  return (
      <Box
          width={ isPhone ? '17.5rem' : '21rem'}
          gap="medium"
          margin={ { bottom: 'medium' } }>
        <Heading
            icon={ <HistoryIcon /> }
            margin={ { vertical: 'xxsmall' } }
            level='3'>
          { t('title') }
        </Heading>
        <Content>
          <Box
              gap="xsmall"
              direction="row">
            <Box>
                {
                  t('dashboard-hint')
                }
            </Box>
            <Box
                style={ { minWidth: 'auto' } }
                onClick={ () => navigate('.' + tDriver('url-history')) }
                focusIndicator={ false }
                direction="row">
              <FormNext />
              <HistoryIcon />
            </Box>
          </Box>
        </Content>
      </Box>);

};

export { History };
