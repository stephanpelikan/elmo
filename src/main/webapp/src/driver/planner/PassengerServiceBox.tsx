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
      "reservation-type": "Passenger Service",
      "conflicting-driver_title": "Passenger Service",
      "conflicting-driver_msg": "This view is not up to date! Meanwhile another driver claimed the shift. Please go back and reenter to refresh the view.",
      "parallel-carsharing_title": "Passenger Service",
      "parallel-carsharing_msg": "You have another car-sharing reservation in parallel for '{{value}}'!",
      "parallel-passengerservice_title": "Passenger Service",
      "parallel-passengerservice_msg": "You are planned yourself for passenger-service on '{{value}}' in parallel!",
    });

i18n.addResources('de', 'driver/planner/passengerservice', {
      "reservation-type": "Fahrtendienst",
      "conflicting-driver_title": "Fahrtendienst",
      "conflicting-driver_msg": "Diese Ansicht ist nicht aktuell! Mittlerweile wurde der Fahrtendienst bereits übernommen. Bitte wechsle zur vorigen Ansicht steige neu ein, um die Ansicht zu aktualisieren.",
      "parallel-carsharing_title": "Fahrtendienst",
      "parallel-carsharing_msg": "Du hast zeitgleich eine andere Car-Sharing-Reservierung für '{{value}}'!",
      "parallel-passengerservice_title": "Fahrtendienst",
      "parallel-passengerservice_msg": "Du hast zeitgleich Fahrtendienst mit '{{value}}' eingetragen!",
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
    const { state, toast, showLoadingIndicator } = useAppContext();
    const { t } = useTranslation('driver/planner/passengerservice');
    const wakeupSseCallback = useWakeupSseCallback();
    const plannerApi = usePlannerApi(wakeupSseCallback);

    const claim = async () => {
        try {
          showLoadingIndicator(true);
          await plannerApi.claimShift({ shiftId: hour.reservation!.id });
        } catch(error) {
          showLoadingIndicator(false);
          // CONFLICT means there is another reservation
          if (error.response?.status === 409) {
            toast({
                namespace: 'driver/planner/passengerservice',
                title: t('conflicting-driver_title'),
                message: t('conflicting-driver_msg'),
                status: 'critical'
              });
            }
          // violations response
          else if (error.response?.json) {
            const violations = await error.response?.json()
            Object
                .keys(violations)
                .forEach(violation => {
                    toast({
                        namespace: 'driver/planner/passengerservice',
                        title: t(`${violation}_title`),
                        message: t(`${violation}_msg`, { value: violations[violation] }),
                        status: 'critical'
                      });
                });
          }
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
