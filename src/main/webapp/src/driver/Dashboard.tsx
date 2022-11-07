import { useLayoutEffect } from 'react';
import { Box } from 'grommet';
import { useAppContext } from '../AppContext';
import { useCurrentUserRoles } from '../utils/roleUtils';
import { Overview } from './overview/Main';
import { CarSharings } from './car-sharing/Main';
import { Shifts } from './passanger-service/Main';
import useResponsiveScreen from '../utils/responsiveUtils';

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
        direction={ isPhone ? "row" : "row-reverse" }
        justify="center"
        gap={ isPhone ? undefined : "xlarge" }
        margin={ { vertical: 'medium' } }
        wrap>
      <Overview />
      <Box>
        <Shifts />
        <CarSharings />
      </Box>
    </Box>);
}

export { Dashboard };
