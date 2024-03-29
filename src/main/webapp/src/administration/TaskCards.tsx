import React, { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { Box } from 'grommet';
import { Car, DocumentUser, Group, Schedules } from 'grommet-icons';
import { CardBadge } from './CardBadge';
import { Card } from './Card';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../AppContext';
import { useMemberApi, useOnboardingAdministrationApi } from './AdminAppContext';
import { useCurrentUserRoles } from '../utils/roleUtils';

const TaskCards = () => {
  
  const { setAppHeaderTitle } = useAppContext();
  const memberApi = useMemberApi();
  const onboardingApi = useOnboardingAdministrationApi();
  const { t } = useTranslation('administration');
  const navigate = useNavigate();
  const { isAdminOnly } = useCurrentUserRoles();
  
  const [ countOfInprogressMemberOnboardings, setCountOfInprogressMemberOnboardings ] = useState(-1);
  const [ countOfActiveMembers, setCountOfActiveMembers ] = useState(-1);
  
  const loadCountOfInprogressMemberOnboardings = useCallback(async () => {
    const { count } = await onboardingApi.getCountOfInprogressMemberOnboardings();
    setCountOfInprogressMemberOnboardings(count!);
  }, [ onboardingApi ]);

  const loadCountOfActiveMembers = useCallback(async () => {
    const { count } = await memberApi.getCountOfActiveMembers();
    setCountOfActiveMembers(count!);
  }, [ memberApi ]);
  
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
    setAppHeaderTitle(isAdminOnly ? 'app' : 'administration', true);
  }, [ setAppHeaderTitle, isAdminOnly ]);
  
  return (
    <Box justify="center" pad="medium" direction="row" wrap>
      <Card
          title={ t('card-onboarding') }
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
          title={ t('card-members') }
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
          title={ t('card-cars') }
          icon={ Car }
          onClick={ () => navigate('.' + t('url-cars')) } />
      <Card
          title={ t('card-planner') }
          icon={ Schedules }
          onClick={ () => navigate('.' + t('url-planner')) } />
    </Box>);
}

export { TaskCards };
