import { Box, Text } from "grommet";
import { FormClose } from "grommet-icons";
import React, { MouseEvent } from "react";
import { PlannerReservation } from "../../client/gui";
import { UserAvatar } from "../../components/UserAvatar";
import { timeAsString } from "../../utils/timeUtils";
import { CalendarHour, ReservationDrivers } from "./PlannerTypes";


const CancellationBox = ({
    carId,
    reservation,
    cancelReservation
  }: {
    carId: string,
    reservation: PlannerReservation,
    cancelReservation: (event: MouseEvent, carId: string, reservationId: string) => void
  }) => {
    return <Box
          style={ { position: 'relative' } }>
        <Box
            style={ { position: 'absolute', right: '2.5rem' } }
            onMouseDownCapture={ (event) => cancelReservation(event, carId, reservation.id) }
            round="full"
            overflow="hidden"
            border={ { color: 'accent-3', size: '3px' } }
            background='status-critical'>
          <FormClose
              color="white"
              size="30rem" />
        </Box>
      </Box>;
  };

const PlannerReservationBox = ({
    drivers,
    hour,
    cancellationBox
  }: {
    drivers: ReservationDrivers,
    hour: CalendarHour,
    cancellationBox?: any,
  }) => {
    return (
      <>
        {
          cancellationBox ? cancellationBox : undefined
        }
        <Box
            pad={ {
                horizontal: '0rem',
                vertical: '1px'
              } }
            gap='xsmall'
            direction="row">
          <UserAvatar
              size='small'
              border={ { color: 'dark-4', size: '1px' }}
              user={ drivers[ hour.reservation!.driverMemberId! ] } />
          <Box>
              <Text
                  truncate>{
                timeAsString(hour.reservation!.startsAt)
              } - {
                timeAsString(hour.reservation!.endsAt)
              }</Text>
          </Box>
        </Box>
      </>);
  };

 export {
   PlannerReservationBox,
   CancellationBox
 };
 