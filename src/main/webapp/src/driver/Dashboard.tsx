import { useLayoutEffect } from 'react';
import { Box } from 'grommet';
import { ShareOption } from 'grommet-icons';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../AppContext';
import { useCurrentUserRoles } from '../utils/roleUtils';
import { Overview } from './overview/Main';

const Dashboard = () => {
  
  const { setAppHeaderTitle } = useAppContext();
  const { t } = useTranslation('driver');
  const navigate = useNavigate();
  const { isDriverOnly } = useCurrentUserRoles();

  useLayoutEffect(() => {
      setAppHeaderTitle(isDriverOnly ? 'app' : 'driver', false);
    }, [ setAppHeaderTitle, isDriverOnly ]);

  return (
    <Box
        justify="center"
        pad="medium"
        direction="row-reverse"
        wrap>
      <Overview />
      <Box>
        <Box
            title={ t('card-planner') }
            onClick={ () => navigate('.' + t('url-planner')) }>
          <ShareOption />
        </Box>
      </Box>
    </Box>);
}

export { Dashboard };
