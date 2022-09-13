import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { Box } from 'grommet';
import { Car, DocumentUser, Group } from 'grommet-icons';
import { CardBadge } from './CardBadge';
import { Card } from './Card';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../AppContext';
import { useAdministrationApi } from './AdminAppContext';

const TaskCards = () => {
  const { setAppHeaderTitle } = useAppContext();
  
  const administrationApi = useAdministrationApi();
  
  const { t } = useTranslation('administration');
  
  const navigate = useNavigate();
  
  const [ countOfInprogressMemberOnboardings, setCountOfInprogressMemberOnboardings ] = useState(-1);
  const [ countOfActiveMembers, setCountOfActiveMembers ] = useState(-1);
  
  const loadCountOfInprogressMemberOnboardings = useCallback(async () => {
    const { count } = await administrationApi.getCountOfInprogressMemberOnboardings();
    setCountOfInprogressMemberOnboardings(count);
  }, [ administrationApi ]);

  const loadCountOfActiveMembers = useCallback(async () => {
    const { count } = await administrationApi.getCountOfActiveMembers();
    setCountOfActiveMembers(count);
  }, [ administrationApi ]);
  
  useEffect(() => {
    if (countOfInprogressMemberOnboardings === -1) {
      setCountOfInprogressMemberOnboardings(0);
      loadCountOfInprogressMemberOnboardings();
    }
  }, [ countOfInprogressMemberOnboardings, loadCountOfInprogressMemberOnboardings ]);

  useEffect(() => {
    if (countOfActiveMembers === -1) {
      setCountOfActiveMembers(0);
      loadCountOfActiveMembers();
    }
  }, [ countOfActiveMembers, loadCountOfActiveMembers ]);

  useLayoutEffect(() => {
    setAppHeaderTitle('administration', true);
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
              background='brand' />
          : <></>
        }
      </Card>
      <Card
          title='Mitglieder'
          icon={Group}
          onClick={ () => navigate('.' + t('url-members')) }>
        {
          countOfActiveMembers > 0
          ? <CardBadge
              count={countOfActiveMembers}
              textSize={countOfActiveMembers > 99 ? 'xsmall' : 'small'}
              size='large'
              background='accent-3' />
          : <></>
        }
      </Card>
      <Card
          title='Fahrer'
          icon={Car} />
    </Box>);
}

export { TaskCards };
