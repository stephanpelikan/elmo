import { Box, Text } from 'grommet';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n';
import React from "react";
import { CalendarHour, ReservationDrivers, useWakeupSseCallback } from './utils';
import { BackgroundType, BorderType } from 'grommet/utils';
import { useAppContext } from '../../AppContext';
import { Close, SchedulePlay } from 'grommet-icons';
import { PlannerButton } from './PlannerButton';
import { usePlannerApi } from '../DriverAppContext';
import { UserAvatar } from '../../components/UserAvatar';

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
    drivers,
  }: {
    hour: CalendarHour,
    isFirstHourOfReservation: boolean,
    isLastHourOfReservation: boolean,
    drivers: ReservationDrivers,
  }) => {
    const { state, showLoadingIndicator } = useAppContext();
    const { t } = useTranslation('driver/planner/passangerservice');
    const wakeupSseCallback = useWakeupSseCallback();
    const plannerApi = usePlannerApi(wakeupSseCallback);

    const claim = async () => {
        try {
          showLoadingIndicator(true);
          await plannerApi.claimShift({ shiftId: hour.reservation!.id });
        } catch(error) {
          showLoadingIndicator(false);
        }
      };
    const unclaim = async () => {
        try {
          showLoadingIndicator(true);
          await plannerApi.unclaimShift({ shiftId: hour.reservation!.id });
        } catch(error) {
          showLoadingIndicator(false);
        }
      };
    
    const hasDriver = hour.reservation!.driverMemberId !== undefined;
    const ownedByCurrentUser = hour.reservation!.driverMemberId === state.currentUser!.memberId;
    const claimable = !hasDriver;
    const unclaimable = hasDriver && ownedByCurrentUser;
 
    const borderColor = 'dark-4';
    const borders: BorderType = [];
    borders.push({ side: "vertical", color: borderColor, size: '1px' });
    if (isFirstHourOfReservation) {
      borders.push({ side: "top", color: borderColor, size: '1px' });
    }
    if (isLastHourOfReservation) {
      borders.push({ side: "bottom", color: borderColor, size: '1px' });
    }
       
    const backgroundColor: BackgroundType | undefined =
        ownedByCurrentUser
            ? { color: 'status-ok', opacity: 'strong' }
            : hasDriver
            ? { color: 'light-4', opacity: 'strong' }
            : { color: 'status-critical', opacity: 'medium' };
  
    return (
        <>
          {
            isFirstHourOfReservation && claimable
                ? <PlannerButton
                      action={ claim }
                      icon={ SchedulePlay } />
                : undefined
          }
          {
            isFirstHourOfReservation && unclaimable
                ? <PlannerButton
                      action={ unclaim }
                      background='status-critical'
                      icon={ Close } />
                : undefined
          }
          <Box
            pad={ {
                horizontal: 'xsmall',
                vertical: '1px'
              } }
            fill
            gap='xsmall'
            direction="row"
            border={ borders }
              background={ backgroundColor } >{
            isFirstHourOfReservation && hasDriver
                ? <>
                    <UserAvatar
                        size='small'
                        border={ { color: 'dark-4', size: '1px' }}
                        user={ drivers[ hour.reservation!.driverMemberId! ] } />
                    <Box
                        pad={ { horizontal: 'xsmall' } } >
                      <Text
                          truncate>{ t(`reservation-type` as const) }</Text>
                    </Box>
                  </>
                : isFirstHourOfReservation && !hasDriver
                ? <Text>{ t(`reservation-type` as const) }</Text>
                : <>&nbsp;</>
          }</Box>
        </>);
  };

export { PassangerServiceBox };
