import { useEffect, useState } from 'react';
import { Box, Paragraph } from 'grommet';
import { Car, DocumentUser, Group } from 'grommet-icons';
import { administrationApi } from '../client';
import { CardBadge } from './CardBadge';
import { Card } from './Card';

const AdminMain = () => {
  const [ countOfInprogressMemberApplications, setCountOfInprogressMemberApplications ] = useState(-1);
  
  const loadCountOfInprogressMemberApplications = async () => {
    const count = await administrationApi.getCountOfInprogressMemberApplications();
    setCountOfInprogressMemberApplications(count);
  };
  
  useEffect(() => {
    if (countOfInprogressMemberApplications === -1) {
      loadCountOfInprogressMemberApplications();
    }
  });
  
  return (
    <Box justify="center" pad="small" direction="row" wrap>
      <Card icon={DocumentUser} title='Anmeldungen'>
        {
          countOfInprogressMemberApplications > 0
          ? <CardBadge count={countOfInprogressMemberApplications} background='accent-3' />
          : <></>
        }
      </Card>
      <Card icon={Group} title='Mitglieder' />
      <Card icon={Car} title='Fahrer' />
    </Box>);
}

export default AdminMain;
