import { useEffect, useState } from 'react';
import { Box } from 'grommet';
import { Car, DocumentUser, Group } from 'grommet-icons';
import { administrationApi } from '../client';
import { CardBadge } from './CardBadge';
import { Card } from './Card';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const TaskCards = () => {
  
  const { t } = useTranslation('administration');
  
  const navigate = useNavigate();
  
  const [ countOfInprogressMemberOnboardings, setCountOfInprogressMemberOnboardings ] = useState(-1);
  
  const loadCountOfInprogressMemberOnboardings = async () => {
    const count = await administrationApi.getCountOfInprogressMemberOnboardings();
    setCountOfInprogressMemberOnboardings(count);
  };
  
  useEffect(() => {
    if (countOfInprogressMemberOnboardings === -1) {
      loadCountOfInprogressMemberOnboardings();
    }
  });
  
  return (
    <Box justify="center" pad="medium" direction="row" wrap>
      <Card
          title='Anmeldungen'
          icon={DocumentUser}
          onClick={ () => navigate('.' + t('url-list-onboardings')) }>
        {
          countOfInprogressMemberOnboardings > 0
          ? <CardBadge count={countOfInprogressMemberOnboardings} background='accent-3' />
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
