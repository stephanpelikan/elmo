import { ShiftReservation } from '../../client/gui';
import { AccordionPanel, Box, Table, TableBody, TableCell, TableRow, Text } from 'grommet';
import { Schedules } from 'grommet-icons';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n';
import React from 'react';
import { toLocaleTimeStringWithoutSeconds } from '../../utils/timeUtils';

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

const PassengerServiceAccordionPanel = ({
    shift,
    index,
    goToPlanner
  }: {
    shift: ShiftReservation,
    index: number,
    goToPlanner: (shift: ShiftReservation) => void,
  }) => {

  const { t } = useTranslation('driver/shift/claimed');

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
          </TableBody>
        </Table>
      </AccordionPanel>
    );

};

export { PassengerServiceAccordionPanel };
