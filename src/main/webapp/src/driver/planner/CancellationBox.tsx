import { Box } from "grommet";
import { FormClose } from "grommet-icons";
import { PlannerReservation } from "../../client/gui";
import React, { MouseEvent } from "react";

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

  export { CancellationBox };