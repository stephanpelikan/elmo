import { useLayoutEffect } from 'react';
import { Box } from 'grommet';
import { ShareOption } from 'grommet-icons';
import { Card } from './Card';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../AppContext';
import { useCurrentUserRoles } from '../utils/roleUtils';

const TaskCards = () => {
  
  const { setAppHeaderTitle } = useAppContext();
  const { t } = useTranslation('driver');
  const navigate = useNavigate();
  const { isDriverOnly } = useCurrentUserRoles();

  useLayoutEffect(() => {
      setAppHeaderTitle(isDriverOnly ? 'app' : 'driver', false);
    }, [ setAppHeaderTitle, isDriverOnly ]);
  
  return (
    <Box justify="center" pad="medium" direction="row" wrap>
      <Card
          title={ t('card-planner') }
          icon={ ShareOption }
          onClick={ () => navigate('.' + t('url-planner')) }>
      </Card>
    </Box>);
}

export { TaskCards };
