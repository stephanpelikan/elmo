import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { Box } from 'grommet';
import { Car, DocumentUser, Group } from 'grommet-icons';
import { CardBadge } from './CardBadge';
import { Card } from './Card';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../AppContext';

const TaskCards = () => {
  const { administrationApi, setAppHeaderTitle } = useAppContext();
  
  const { t } = useTranslation('administration');
  
  const navigate = useNavigate();
  
  const [ countOfInprogressMemberOnboardings, setCountOfInprogressMemberOnboardings ] = useState(-1);
  
  const loadCountOfInprogressMemberOnboardings = useCallback(async () => {
    const { count } = await administrationApi.getCountOfInprogressMemberOnboardings();
    setCountOfInprogressMemberOnboardings(count);
  }, [ administrationApi ]);
  
  useEffect(() => {
    if (countOfInprogressMemberOnboardings === -1) {
      loadCountOfInprogressMemberOnboardings();
    }
  }, [ countOfInprogressMemberOnboardings, loadCountOfInprogressMemberOnboardings ]);

  useLayoutEffect(() => {
    setAppHeaderTitle('administration');
  }, [ setAppHeaderTitle ]);
  
  return (
    <Box justify="center" pad="medium" direction="row" wrap>
      <Card
          title='Anmeldungen'
          icon={DocumentUser}
          onClick={ () => navigate('.' + t('url-onboardings')) }>
        {
          countOfInprogressMemberOnboardings > 0
          ? <CardBadge
              count={countOfInprogressMemberOnboardings}
              textSize={countOfInprogressMemberOnboardings > 99 ? 'xsmall' : 'small'}
              size='large'
              background='accent-3' />
          : <></>
        }
      </Card>
      <Card
          title='Mitglieder'
          icon={Group} />
      <Card
          title='Fahrer'
          icon={Car} />
    </Box>);
}

export { TaskCards };
