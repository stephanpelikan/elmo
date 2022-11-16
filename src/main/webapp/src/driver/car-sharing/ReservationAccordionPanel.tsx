import { CarSharingReservation } from '../../client/gui';
import { AccordionPanel, Box, Button, Select, Table, TableBody, TableCell, TableRow, Text, TextArea } from 'grommet';
import { Alert, Car, Schedules } from 'grommet-icons';
import styled, { keyframes } from 'styled-components';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n';
import { useState } from 'react';
import { Modal } from '../../components/Modal';
import { hoursBetween, nextHours } from '../../utils/timeUtils';
import { now } from '../../utils/now-hook';
import { SubHeading } from '../../components/MainLayout';
import { KmInput } from '../../components/KmInput';

type Confirmation = 'start' | 'stop' | undefined;

i18n.addResources('en', 'driver/car-sharings/reservation', {
      "from": "From",
      "to": "To",
      "hours": "Hours",
      "car": "Car",
      "usage-from": "Usage from",
      "usage-until": "Usage until",
      "including-charging": "incl. Charging",
      "start-usage": "Start usage",
      "stop-usage": "Stop usage",
      "start-button": "Start",
      "stop-button": "Stop",
      "dismiss-button": "Dismiss",
      "comment-placeholder": "Leave blank unless charge level is not 100%, noticed damages to vehicle, etc.",
      "comment-title": "Comments",
      "km-title": "Current Mileage",
    });
i18n.addResources('de', 'driver/car-sharings/reservation', {
      "from": "Von",
      "to": "Bis",
      "hours": "Stunden",
      "car": "Fahrzeug",
      "usage-from": "Nutzung ab",
      "usage-until": "Nutzung bis",
      "including-charging": "inkl. Laden",
      "start-usage": "Nutzung starten",
      "stop-usage": "Nutzung beenden",
      "start-button": "Starten",
      "stop-button": "Beenden",
      "dismiss-button": "Doch nicht",
      "comment-placeholder": "Leer lassen, außer wenn Ladestand nicht 100%, aufgefallene Schäden am Fahrzeug, etc.",
      "comment-title": "Kommentare",
      "km-title": "Aktueller Kilometerstand",
    });

const blinkAnimation = keyframes`
  0% { opacity: 1 }
  50% { opacity: 0.5 }
  100% { opacity: 1 }
`
const BlinkingAlert = styled(Alert)`
  color: ${ props => props.color };
  animation-name: ${ blinkAnimation };
  animation-duration: 1s;
  animation-iteration-count: infinite;
`;

const ReservationAccordionPanel = ({
    reservation,
    index,
    goToPlanner,
    confirmStartOrStopOfCarSharing
  }: {
    reservation: CarSharingReservation,
    index: number,
    goToPlanner: (reservation: CarSharingReservation) => void,
    confirmStartOrStopOfCarSharing: (timestamp: Date, km: number, comment: string) => Promise<void>,
  }) => {

  const { t } = useTranslation('driver/car-sharings/reservation');

  const [ confirmation, setConfirmation ] = useState<Confirmation>(undefined);
  const [ timestamp, setTimestamp ] = useState<Date>(undefined);
  const [ km, setKm ] = useState<number>(reservation.carKm);
  const [ comment, setComment ] = useState<string>(undefined);
  
  const confirm = async () => {
      await confirmStartOrStopOfCarSharing(timestamp, km, comment);
      setConfirmation(undefined);
      setTimestamp(undefined);
      setKm(reservation.carKm);
      setComment(undefined);
    };

  return (
      <AccordionPanel
          key={ reservation.id }
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
                <Car
                    color={
                        reservation.userTaskId !== undefined
                            ? 'accent-3'
                            : undefined
                    }
                  />
                <Text
                    weight={
                        reservation.userTaskId !== undefined
                            ? 'bolder'
                            : undefined
                    }
                    color={
                        reservation.userTaskId !== undefined
                            ? 'accent-3'
                            : undefined
                    }
                    truncate='tip'>
                  { reservation.startsAt.toLocaleDateString() }
                  &nbsp;
                  { reservation.startsAt.toLocaleTimeString().replace(':00', '') }
                  &nbsp;
                  { reservation.hoursPlanned }h
                </Text>
              </Box>
              <Box
                  direction="row"
                  gap="small">
                {
                  reservation.userTaskId !== undefined
                      ? <BlinkingAlert
                          color={
                             reservation.status === 'RESERVED'
                                ? 'status-critical'
                                : 'status-warning'
                            } />
                      : undefined
                }
                <Box
                    onClick={ () => goToPlanner(reservation) }
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
              <TableCell size="45%">{ t('car') }:</TableCell>
              <TableCell>
                { reservation.carName }
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>{ t('from') }:</TableCell>
              <TableCell>
                { reservation.startsAt.toLocaleDateString() }
                &nbsp;
                { reservation.startsAt.toLocaleTimeString().replace(':00', '') }
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>{ t('to') }:</TableCell>
              <TableCell>
                { reservation.endsAt.toLocaleDateString() }
                &nbsp;
                { reservation.endsAt.toLocaleTimeString().replace(':00', '') }
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>{ t('hours') }:</TableCell>
              <TableCell>
                { reservation.hoursPlanned }h
              </TableCell>
            </TableRow>
            {
              Boolean(reservation.userTaskId) && Boolean(reservation.userTaskType === 'confirmStartOfUsage')
                  ? <TableRow>
                      <TableCell colSpan={ 2 }>
                        <Button
                            primary
                            onClick={ () => setConfirmation('start') }
                            label={ t('start-usage') } />
                      </TableCell>
                    </TableRow>
                  : Boolean(reservation.kmAtStart)
                  ? <TableRow>
                      <TableCell
                          verticalAlign='top'>
                        { t('usage-from') }:
                      </TableCell>
                      <TableCell>
                        { reservation.startUsage.toLocaleDateString() }
                        &nbsp;
                        { reservation.startUsage.toLocaleTimeString().replace(/:[0-9]+$/, '') }
                        <br/>
                        { reservation.kmAtStart.toLocaleString() }
                        &nbsp;km
                      </TableCell>
                    </TableRow>
                  : undefined
            }
            {
              Boolean(reservation.userTaskId) && Boolean(reservation.userTaskType === 'confirmEndOfUsage')
                  ? <TableRow>
                      <TableCell colSpan={ 2 }>
                        <Button
                            primary
                            onClick={ () => setConfirmation('stop') }
                            label={ t('stop-button') } />
                      </TableCell>
                    </TableRow>
                  : Boolean(reservation.kmAtEnd)
                  ? <TableRow>
                      <TableCell
                          verticalAlign='top'>
                        { t('usage-until') }:
                      </TableCell>
                      <TableCell>
                        { reservation.endUsage.toLocaleDateString() }
                        &nbsp;
                        { reservation.endUsage.toLocaleTimeString().replace(/:[0-9]+$/, '') }
                        <br/>
                        { reservation.kmAtEnd.toLocaleString() }
                        &nbsp;km
                      </TableCell>
                    </TableRow>
                  : undefined
            }
          </TableBody>
        </Table>
        {
          confirmation === 'start'
              ? <Modal
                    show={ true }
                    abort={ () => setConfirmation(undefined) }
                    abortLabel='dismiss-button'
                    action={ confirm }
                    actionLabel='start-button'
                    header='start-usage'
                    t={ t }>
                  <Box
                      gap="small"
                      margin={ { bottom: 'large' } }>
                    <SubHeading>{ t('km-title') }:</SubHeading>
                    <KmInput
                        km={ km }
                        setKm={ setKm } />
                    <SubHeading>{ t('comment-title') }:</SubHeading>
                    <TextArea
                        value={ comment }
                        onChange={event => setComment(event.target.value)}
                        style={ { height: '7rem' } }
                        placeholder={ t('comment-placeholder') } />
                  </Box>
                </Modal>
              : confirmation === 'stop'
              ? <Modal
                    show={ true }
                    abort={ () => setConfirmation(undefined) }
                    abortLabel='dismiss-button'
                    action={ confirm }
                    actionLabel='stop-button'
                    header='stop-usage'
                    t={ t }>
                  <Box
                      gap="small"
                      margin={ { bottom: 'large' } }>
                    <SubHeading>{ t('usage-until') } ({ t('including-charging') }):</SubHeading>
                    <Select
                        options={ hoursBetween(now, nextHours(reservation.endsAt, 5, false)) }
                        labelKey={ o => o }
                        valueLabel={ v => (
                            <Box
                                pad="xsmall">
                              { v.toLocaleTimeString().replace(/:[0-9]+$/, '') }
                            </Box>)
                          }
                        children={ v => (
                            <Box
                                background={ v.getTime() !== timestamp?.getTime() ? undefined : 'brand' }
                                pad="xsmall">
                              { v.toLocaleTimeString().replace(/:[0-9]+$/, '') }
                            </Box>)
                          }
                        value={ timestamp || nextHours(now, 1, false) }
                        onChange={ ({ option }) => setTimestamp(option) }
                         />
                    <SubHeading>{ t('km-title') }:</SubHeading>
                    <KmInput
                        km={ km }
                        setKm={ setKm } />
                    <SubHeading>{ t('comment-title') }:</SubHeading>
                    <TextArea
                        value={ comment }
                        onChange={event => setComment(event.target.value)}
                        style={ { height: '7rem' } }
                        placeholder={ t('comment-placeholder') } />
                  </Box>
                </Modal>
              : undefined
        }
      </AccordionPanel>
    );

};

export { ReservationAccordionPanel };
