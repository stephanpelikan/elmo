import React, { useLayoutEffect } from 'react';
import { Box } from 'grommet';
import { useAppContext } from '../AppContext';
import { useCurrentUserRoles } from '../utils/roleUtils';
import { Overview } from './overview/DashboardItem';
import { CarSharings } from './car-sharing/DashboardItem';
import { Shifts } from './passenger-service/DashboardItem';
import useResponsiveScreen from '../utils/responsiveUtils';
import { History } from './history/DashboardItem';

const Dashboard = () => {
  
  const { setAppHeaderTitle } = useAppContext();
  const { isDriverOnly } = useCurrentUserRoles();
  const { isPhone } = useResponsiveScreen();
  
  useLayoutEffect(() => {
      setAppHeaderTitle(isDriverOnly ? 'app' : 'driver', false);
    }, [ setAppHeaderTitle, isDriverOnly ]);

  return (
    <Box
        fill='horizontal'
        direction="row-reverse"
        justify="center"
        gap={ isPhone ? undefined : 'large' }
        margin={ { vertical: 'medium' } }
        wrap>
      <Overview />
      <Box>
        <Shifts />
        <CarSharings />
        <History />
      </Box>
    </Box>);
}

export { Dashboard };
