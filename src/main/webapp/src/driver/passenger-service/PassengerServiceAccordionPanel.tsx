import { ShiftReservation } from '../../client/gui';
import { AccordionPanel, Box, Button, Table, TableBody, TableCell, TableRow, Text } from 'grommet';
import { Alert, Schedules } from 'grommet-icons';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n';
import React from 'react';
import { toLocaleTimeStringWithoutSeconds } from '../../utils/timeUtils';
import styled, { keyframes } from "styled-components";
import { normalizeColor } from "grommet/utils";
import { useAppContext } from "../../AppContext";
import { usePlannerApi } from "../DriverAppContext";
import { useWakeupSseCallback } from "../planner/utils";

i18n.addResources('en', 'driver/shift/claimed', {
      "from": "From",
      "to": "To",
      "hours": "Hours",
      "car": "Car",
      "comment": "Comment",
      "usage-from": "Usage from",
      "usage-until": "Usage until",
      "including-charging": "incl. Charging",
      "start-usage": "Start usage",
      "stop-usage": "Stop usage",
      "extend-usage": "Extend usage",
      "start-button": "Start",
      "stop-button": "Stop",
      "swap": "Swap requested",
      "confirm-swap-button": "Accept",
      "reject-swap-button": "Reject",
      "extend-button": "Extend",
      "dismiss-button": "Dismiss",
      "comment-placeholder": "Leave blank unless charge level is not 100%, noticed damages to vehicle, etc.",
      "comment-title": "Comment",
      "km-start-title": "Mileage at start",
      "km-title": "Current Mileage",
      "km-end_missing": "Please fill the current mileage!",
      "km-end_lower-than-car": "The given mileage is lower than a previously given mileage!",
      "km-start_missing": "Please fill the mileage at start!",
      "km-start_lower-than-car": "The given mileage is lower than a previously given mileage!",
      "km-start_higher-than-end": "The given mileage is higher than the current mileage!",
    });
i18n.addResources('de', 'driver/shift/claimed', {
      "from": "Von",
      "to": "Bis",
      "hours": "Stunden",
      "car": "Fahrzeug",
      "comment": "Kommentar",
      "usage-from": "Nutzung ab",
      "usage-until": "Nutzung bis",
      "including-charging": "inkl. Laden",
      "start-usage": "Nutzung starten",
      "stop-usage": "Nutzung beenden",
      "extend-usage": "Nutzung verlängern",
      "start-button": "Starten",
      "stop-button": "Beenden",
      "swap": "Wechsel angefordert",
      "confirm-swap-button": "Akzeptieren",
      "reject-swap-button": "Ablehnen",
      "extend-button": "Verlängern",
      "dismiss-button": "Doch nicht",
      "comment-placeholder": "Leer lassen, außer wenn Ladestand nicht 100%, aufgefallene Schäden am Fahrzeug, etc.",
      "comment-title": "Kommentar",
      "km-start-title": "Kilometerstand zu Beginn",
      "km-title": "Aktueller Kilometerstand",
      "km-end_missing": "Der aktuelle Kilometerstand muss angegeben werden!",
      "km-end_lower-than-car": "Der angegebene Kilometerstand ist niedriger als für dieses Fahrzeug bereits registriert wurde!",
      "km-start_missing": "Der Start-Kilometerstand muss angegeben werden!",
      "km-start_lower-than-car": "Der angegebene Kilometerstand ist niedriger als für dieses Fahrzeug bereits registriert wurde!",
      "km-start_higher-than-end": "Der angegebene Start-Kilometerstand ist höher als der angegebene aktuelle Kilometerstand!",
    });

const blinkAnimation = (props: any) => keyframes`
  50% {
    stroke: ${normalizeColor('brand', props.theme)};
  }
`

const BlinkingAlert = styled(Alert)`
  animation-name: ${ blinkAnimation };
  animation-duration: 1s;
  animation-iteration-count: infinite;
`;

const PassengerServiceAccordionPanel = ({
    shift,
    index,
    goToPlanner
  }: {
    shift: ShiftReservation,
    index: number,
    goToPlanner: (shift: ShiftReservation) => void,
  }) => {

  const { showLoadingIndicator } = useAppContext();
  const { t } = useTranslation('driver/shift/claimed');
  const plannerApi = usePlannerApi();
  const swapInProgress = shift.swapInProgressMemberId !== undefined;

  const confirmSwap = async () => {
    try {
      showLoadingIndicator(true);
      await plannerApi.confirmSwapOfShift({ shiftId: shift.id })
    } catch(error) {
      showLoadingIndicator(false);
    }
  };

  const rejectSwap = async () => {
    try {
      showLoadingIndicator(true);
      await plannerApi.cancelOrRejectSwapOfShift({ shiftId: shift.id })
    } catch(error) {
      showLoadingIndicator(false);
    }
  };

  return (
      <AccordionPanel
          key={ shift.id }
          header={
            <Box
                direction="row"
                justify='between'
                gap="xsmall"
                align="center"
                pad="xsmall"
                background={
                    index % 2 === 0
                        ? 'light-2'
                        : 'light-4'
                  }>
              <Box
                  direction="row"
                  gap="xsmall"
                  align="center">
                <Text
                    weight={
                        shift.userTaskId !== undefined
                            ? 'bolder'
                            : undefined
                    }
                    color={
                        shift.userTaskId !== undefined
                            ? 'accent-3'
                            : undefined
                    }
                    truncate='tip'>
                  { shift.startsAt.toLocaleDateString() }
                  &nbsp;
                  { toLocaleTimeStringWithoutSeconds(shift.startsAt) }
                </Text>
              </Box>
              <Box
                  direction="row"
                  gap="small">
                <Box
                    onClick={ () => goToPlanner(shift) }
                    focusIndicator={ false }>
                  <Schedules />
                </Box>
              </Box>
            </Box>
          }>
        <Table
            margin={ { vertical: 'small' } }>
          <TableBody>
            <TableRow>
              <TableCell size="40%">{ t('car') }:</TableCell>
              <TableCell>
                { shift.carName }
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>{ t('from') }:</TableCell>
              <TableCell>
                { shift.startsAt.toLocaleDateString() }
                &nbsp;
                { toLocaleTimeStringWithoutSeconds(shift.startsAt) }
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>{ t('to') }:</TableCell>
              <TableCell>
                { shift.endsAt.toLocaleDateString() }
                &nbsp;
                { toLocaleTimeStringWithoutSeconds(shift.endsAt) }
              </TableCell>
            </TableRow>
            {
              swapInProgress
                  ? <TableRow>
                      <TableCell
                          verticalAlign="top">
                        <Box
                            direction="column"
                            gap="xsmall">
                          <BlinkingAlert />
                          { t('swap') }:
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box
                            gap="xsmall">
                          <Button
                              primary
                              onClick={ confirmSwap }
                              label={ t('confirm-swap-button') } />
                          <Button
                              onClick={ rejectSwap }
                              label={ t('reject-swap-button') } />
                        </Box>
                      </TableCell>
                    </TableRow>
                  : undefined
            }
          </TableBody>
        </Table>
      </AccordionPanel>
    );

};

export { PassengerServiceAccordionPanel };
