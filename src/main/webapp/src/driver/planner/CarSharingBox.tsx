import { Box, Text } from "grommet";
import { BackgroundType, BorderType } from "grommet/utils";
import React, { MouseEvent } from "react";
import { useAppContext } from "../../AppContext";
import { PlannerCar } from "../../client/gui";
import { UserAvatar } from "../../components/UserAvatar";
import { timeAsString } from "../../utils/timeUtils";
import { CancellationBox } from "./CancellationBox";
import { CalendarHour, ReservationDrivers } from "./utils";

const CarSharingBox = ({
    hour,
    car,
    isFirstHourOfReservation,
    isLastHourOfReservation,
    drivers,
    cancelReservation,
  }: {
    hour: CalendarHour,
    car: PlannerCar,
    isFirstHourOfReservation: boolean,
    isLastHourOfReservation: boolean,
    drivers: ReservationDrivers,
    cancelReservation: (event: MouseEvent, carId: string, reservationId: string) => void,
  }) => {
    const { state } = useAppContext();

    const hasCancelButton = (isLastHourOfReservation
                              && (hour.reservation!.status === 'RESERVED')
                              && (hour.reservation?.driverMemberId === state.currentUser!.memberId));
    
    const borderColor =
        hour.reservation?.driverMemberId === state.currentUser!.memberId
            ? 'accent-3'
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
            ? { color: 'accent-3', opacity: 'strong' }
            : { color: 'light-4', opacity: 'strong' };
    
    return (
      <>
        {
          hasCancelButton
              ? <CancellationBox
                   carId={ car.id }
                   reservation={ hour.reservation! }
                   cancelReservation={ cancelReservation } />
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
          isFirstHourOfReservation
              ? <>
                  <UserAvatar
                      size='small'
                      border={ { color: 'dark-4', size: '1px' }}
                      user={ drivers[ hour.reservation!.driverMemberId! ] } />
                  <Box
                      pad={ { horizontal: 'xsmall' } } >
                    <Text
                        truncate>{
                      timeAsString(hour.reservation!.startsAt)
                    } - {
                      timeAsString(hour.reservation!.endsAt)
                    }</Text>
                  </Box>
                </>
              : <>&nbsp;</>
        }</Box>
      </>);
  };

 export {
   CarSharingBox
 };
 