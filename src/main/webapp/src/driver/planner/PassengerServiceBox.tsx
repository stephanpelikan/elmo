import { Box, Text } from 'grommet';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n';
import React, { useRef, useState } from "react";
import { CalendarHour, ReservationDrivers, useWakeupSseCallback } from './utils';
import { BackgroundType, BorderType } from 'grommet/utils';
import { useAppContext } from '../../AppContext';
import { Clear, Configure, SchedulePlay, Transaction } from 'grommet-icons';
import { PlannerButton } from './PlannerButton';
import { usePlannerApi } from '../DriverAppContext';
import { UserAvatar } from '../../components/UserAvatar';
import { PlannerContextMenu } from './PlannerContextMenu';
import { useOnClickOutside } from 'usehooks-ts';
import { ShiftStatus } from '../../client/gui';

i18n.addResources('en', 'driver/planner/passengerservice', {
      "reservation-type": "Passenger Service"
    });

i18n.addResources('de', 'driver/planner/passengerservice', {
      "reservation-type": "Fahrtendienst"
    });

const PassengerServiceBox = ({
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
    const { t } = useTranslation('driver/planner/passengerservice');
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
    const claimable = hour.reservation!.status === ShiftStatus.Unclaimed;
    const unclaimable = hour.reservation!.status === ShiftStatus.Claimed;
    const editable = unclaimable;
    const [ showEditMenu, setShowEditMenu ] = useState(false);
    const ref = useRef(null);
    useOnClickOutside(ref, event => {
        if (!showEditMenu) return;
        event.preventDefault();
        event.stopPropagation();
        setShowEditMenu(false);
      });
 
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
            isFirstHourOfReservation && editable
                ? <PlannerButton
                      action={ () => setShowEditMenu(true) }
                      background='dark-4'
                      icon={ Configure } />
                : undefined
          }
          {
            showEditMenu
                ? <PlannerContextMenu
                      ref={ ref }>
                    <PlannerButton
                        inContextMenu
                        action={ () => setShowEditMenu(false) }
                        background='dark-4'
                        showBorder={false}
                        icon={ Configure } />
                    {
                      unclaimable && ownedByCurrentUser
                          ? <PlannerButton
                               inContextMenu
                               action={ () => {
                                   unclaim();
                                   setShowEditMenu(false);
                                 } }
                               background='status-critical'
                               icon={ Clear } />
                          : undefined
                    }
                    {
                      unclaimable && !ownedByCurrentUser
                          ? <PlannerButton
                               inContextMenu
                               action={ () => {
                                   unclaim();
                                   setShowEditMenu(false);
                                 } }
                               background='status-warning'
                               icon={ Transaction } />
                          : undefined
                    }
                  </PlannerContextMenu>
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

export { PassengerServiceBox };
