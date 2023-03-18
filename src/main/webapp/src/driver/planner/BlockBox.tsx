import { Box, Text } from 'grommet';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n';
import React from "react";
import { CalendarHour } from './utils';
import { BorderType } from 'grommet/utils';

i18n.addResources('en', 'driver/planner/block', {
      "reservation-type": "Unavailable",
    });

i18n.addResources('de', 'driver/planner/block', {
      "reservation-type": "Nicht verfügbar",
    });

const BlockBox = ({
    hour,
    isFirstHourOfReservation,
    isLastHourOfReservation,
  }: {
    hour: CalendarHour,
    isFirstHourOfReservation: boolean,
    isLastHourOfReservation: boolean,
  }) => {
    const { t } = useTranslation('driver/planner/block');
  
    const borderColor = 'dark-4';

    const borders: BorderType = [];
    borders.push({ side: "vertical", color: borderColor, size: '1px' });
    if (isFirstHourOfReservation) {
      borders.push({ side: "top", color: borderColor, size: '1px' });
    }
    if (isLastHourOfReservation) {
      borders.push({ side: "bottom", color: borderColor, size: '1px' });
    }
    
    return (
        <Box
            fill
            pad={ { horizontal: 'xsmall' } }
            border={ borders } 
            background={ { color: 'light-4', opacity: 'strong' } } >{
          isFirstHourOfReservation
              ? <Text>{ t(`reservation-type` as const) }</Text>
              : <>&nbsp;</>
        }</Box>);
  };

export { BlockBox };
