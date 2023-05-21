import React from 'react';
import { Box } from "grommet";
import { useTranslation } from "react-i18next";
import useResponsiveScreen from "../../utils/responsiveUtils";
import { Car, Catalog, Schedule } from 'grommet-icons';

const Header = () => {
  const { isNotPhone } = useResponsiveScreen();
  const { t } = useTranslation('driver/history');

  return (
      <Box
          fill
          pad="xsmall"
          gap="small"
          direction="row"
          justify='between'>
        <Box>{ t('year') }</Box>
        <Box
            gap="medium"
            direction="row">
          <Box
              align='end'
              width={ isNotPhone ? '12rem' : '3.5rem' }>
            <Box
                gap="small"
                direction="row">
              <Car />
              {
                isNotPhone
                    ? t('car-sharing')
                    : undefined
              }
            </Box>
          </Box>
          <Box
              align='end'
              width={ isNotPhone ? '12rem' : '3.5rem' }>
            <Box
                gap="small"
                direction="row">
              <Schedule />
              {
                isNotPhone
                    ? t('passenger-service')
                    : undefined
              }
            </Box>
          </Box>
          <Box
              align='end'
              width={ isNotPhone ? '12rem' : '3.5rem' }>
            <Box
                gap="small"
                direction="row">
              <Catalog />
              {
                isNotPhone
                    ? t('balance')
                    : undefined
              }
            </Box>
          </Box>
        </Box>
      </Box>);
};

export { Header };
