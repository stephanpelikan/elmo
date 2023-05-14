import React from 'react';
import { Box, Text } from "grommet";
import { useTranslation } from "react-i18next";
import useResponsiveScreen from "../../utils/responsiveUtils";
import { Car, Catalog, Schedule } from 'grommet-icons';
import { ReservationOverviewTotal } from '../../client/gui';

const Footer = ({
  years
}: {
  years?: Array<ReservationOverviewTotal>,
}) => {
  const { isNotPhone } = useResponsiveScreen();
  const { t } = useTranslation('driver/history');

  const carSharingTotal = 
     years
         ? years.reduce((result, year) => result + year.carSharingHours, 0)
         : 0;
  const passangerServiceTotal = 
     years
         ? years.reduce((result, year) => result + year.passangerServiceHours, 0)
         : 0;
  const totalTotal = passangerServiceTotal - carSharingTotal;
         
  return (
      <Box
          fill
          pad="xsmall"
          gap="small"
          direction="row"
          justify='between'>
        <Box>
          <Text
              weight='bold'>
            { t('total') }
          </Text>
        </Box>
        <Box
            gap="medium"
            direction="row">
          <Box
              align='end'
              width={ isNotPhone ? '12rem' : '4.8rem' }>
            <Text
                weight='bold'
                color={ carSharingTotal < 0 ? 'status-critical' : 'undefined' }>
              {
                carSharingTotal
              }h
            </Text>
          </Box>
          <Box
              align='end'
              width={ isNotPhone ? '12rem' : '4.8rem' }>
            <Text
                weight='bold'
                color={ passangerServiceTotal < 0 ? 'status-critical' : 'undefined' }>
              {
                passangerServiceTotal
              }h
            </Text>
          </Box>
          <Box
              align='end'
              width={ isNotPhone ? '12rem' : '4.8rem' }>
            <Text
                weight='bold'
                color={ totalTotal < 0 ? 'status-critical' : 'undefined' }>
              {
                totalTotal
              }h
            </Text>
          </Box>
        </Box>
      </Box>);
};

export { Footer };
