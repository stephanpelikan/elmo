import { useEffect, useLayoutEffect, useState } from 'react';
import { Box } from 'grommet';
import { Car, DocumentUser, Group } from 'grommet-icons';
import { administrationApi } from '../client';
import { CardBadge } from './CardBadge';
import { Card } from './Card';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppContext, updateTitle } from '../AppContext';

const TaskCards = () => {

  const { t } = useTranslation('administration');
  
  const navigate = useNavigate();
  
  const [ countOfInprogressMemberOnboardings, setCountOfInprogressMemberOnboardings ] = useState(-1);
  
  const loadCountOfInprogressMemberOnboardings = async () => {
    const { count } = await administrationApi.getCountOfInprogressMemberOnboardings();
    setCountOfInprogressMemberOnboardings(count);
  };
  
  useEffect(() => {
    if (countOfInprogressMemberOnboardings === -1) {
      loadCountOfInprogressMemberOnboardings();
    }
  });
  
  const { dispatch } = useAppContext();
  useLayoutEffect(() => {
    updateTitle(dispatch, 'administration');
  }, [ dispatch ]);
  
  return (
    <Box justify="center" pad="medium" direction="row" wrap>
      <Card
          title='Anmeldungen'
          icon={DocumentUser}
          onClick={ () => navigate('.' + t('url-list-onboardings')) }>
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
