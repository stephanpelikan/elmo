import React from 'react';
import { Box, Text } from "grommet";
import { useTranslation } from "react-i18next";
import useResponsiveScreen from "../../utils/responsiveUtils";
import { Car, Catalog, Schedule } from 'grommet-icons';
import { ReservationOverviewTotal } from '../../client/gui';

const Footer = ({
  hoursServedPassengerService,
  hoursConsumedCarSharing
}: {
  hoursServedPassengerService?: number,
  hoursConsumedCarSharing?: number
}) => {
  const { isNotPhone } = useResponsiveScreen();
  const { t } = useTranslation('driver/history');

  const balanceTotal = hoursServedPassengerService! - hoursConsumedCarSharing!;
         
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
              width={ isNotPhone ? '12rem' : '3.5rem' }>
            <Text
                weight='bold'>
              {
                hoursConsumedCarSharing === undefined
                    ? undefined
                    : `${hoursConsumedCarSharing!}h`
              }
            </Text>
          </Box>
          <Box
              align='end'
              width={ isNotPhone ? '12rem' : '3.5rem' }>
            <Text
                weight='bold'>
              {
                hoursServedPassengerService === undefined
                    ? undefined
                    : `${hoursServedPassengerService!}h`
              }
            </Text>
          </Box>
          <Box
              align='end'
              width={ isNotPhone ? '12rem' : '3.5rem' }>
            <Text
                weight='bold'
                color={ balanceTotal < 0 ? 'status-critical' : 'undefined' }>
              {
                balanceTotal
              }h
            </Text>
          </Box>
        </Box>
      </Box>);
};

export { Footer };
