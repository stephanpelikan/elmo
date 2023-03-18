import { Box, Text } from 'grommet';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n';
import React from "react";
import { CalendarHour } from './utils';
import { BackgroundType, BorderType } from 'grommet/utils';
import { useAppContext } from '../../AppContext';

i18n.addResources('en', 'driver/planner/passangerservice', {
      "reservation-type": "Passanger Service"
    });

i18n.addResources('de', 'driver/planner/passangerservice', {
      "reservation-type": "Fahrtendienst"
    });

const PassangerServiceBox = ({
    hour,
    isFirstHourOfReservation,
    isLastHourOfReservation,
  }: {
    hour: CalendarHour,
    isFirstHourOfReservation: boolean,
    isLastHourOfReservation: boolean,
  }) => {
    const { state } = useAppContext();
    const { t } = useTranslation('driver/planner/passangerservice');
  
    const borderColor =
        hour.reservation?.driverMemberId === state.currentUser!.memberId
            ? 'accent-2'
            : 'dark-4';

    const borders: BorderType = [];
    borders.push({ side: "vertical", color: borderColor, size: '1px' });
    if (isFirstHourOfReservation) {
      borders.push({ side: "top", color: borderColor, size: '1px' });
    }
    if (isLastHourOfReservation) {
      borders.push({ side: "bottom", color: borderColor, size: '1px' });
    }
    
    const backgroundColor: BackgroundType | undefined =
        hour.reservation?.driverMemberId === state.currentUser!.memberId
            ? { color: 'accent-2', opacity: 'strong' }
            : { color: 'light-4', opacity: 'strong' };
  
    return (
        <Box
            fill
            pad={ { horizontal: 'xsmall' } }
            border={ borders } 
            background={ backgroundColor } >{
          isFirstHourOfReservation
              ? <Text>{ t(`reservation-type` as const) }</Text>
              : <>&nbsp;</>
        }</Box>);
  };

export { PassangerServiceBox };
