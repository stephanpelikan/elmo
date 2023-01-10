import { CarSharingReservation, PlannerDriver } from '../../client/gui';
import { AccordionPanel, Box, Button, Select, Table, TableBody, TableCell, TableRow, Text, TextArea } from 'grommet';
import { Car, Schedules } from 'grommet-icons';
import styled, { keyframes } from 'styled-components';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n';
import React, { useCallback, useState } from 'react';
import { Modal } from '../../components/Modal';
import { hoursBetween, nextHours, toLocaleTimeStringWithoutSeconds } from '../../utils/timeUtils';
import { now } from '../../utils/now-hook';
import { SubHeading } from '../../components/MainLayout';
import { KmInput } from '../../components/KmInput';
import { normalizeColor } from 'grommet/utils';
import { useDriverApi } from '../DriverAppContext';
import { UserAvatar } from '../../components/UserAvatar';

type Confirmation = 'start' | 'stop' | 'extend' | undefined;

type ExtendOption = {
  timestamp: Date;
  booked: boolean;
  driver: PlannerDriver | undefined;
};

i18n.addResources('en', 'driver/car-sharings/reservation', {
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
      "km-title": "Current Mileage",
    });
i18n.addResources('de', 'driver/car-sharings/reservation', {
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
      "km-title": "Aktueller Kilometerstand",
    });

const blinkAnimation = (props: any) => keyframes`
  50% {
    background-color: ${normalizeColor('brand', props.theme)};
  }
`
const BlinkingButton = styled(Button)`
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
    confirmStartOrStopOfCarSharing: (timestamp: Date, km: number, comment: string) => Promise<boolean>,
  }) => {

  const { t } = useTranslation('driver/car-sharings/reservation');
  const driverApi = useDriverApi();

  const [ confirmation, setConfirmation ] = useState<Confirmation>(undefined);
  const [ timestamp, setTimestamp ] = useState<Date | undefined>(undefined);
  const [ km, setKm ] = useState<number | undefined>(reservation.carKm);
  const [ comment, setComment ] = useState<string | undefined>(reservation.comment);
  
  const showConfirmStartModal = (km?: number) => {
    setKm(km);
    setComment(reservation.comment);
    setConfirmation('start');
    setTimestamp(nextHours(now, 1, false));
  };
  
  const [ extendOptions, setExtendOptions ] = useState<Array<ExtendOption>>([]);
  const extendModal = useCallback(async (type: Confirmation) => {
      const calendar = await driverApi.getPlannerCalendar({
          plannerCalendarRequest: {
            startsAt: now,
            endsAt: nextHours(reservation.endsAt, 8, false)
          }
        });
      const reservations = calendar
          .cars[ calendar.cars.findIndex(car => car.id === reservation.carId) ]
          .reservations;
      const newExtendOptions = hoursBetween(now, nextHours(reservation.endsAt, 48, false))
          .map(hour => {
              const conflictingReservation = reservations
                  .find(r => (r.id !== reservation.id)
                      && (r.startsAt.getTime() <= hour.getTime())
                      && (r.endsAt.getTime() > hour.getTime()));
              const hourReservation = reservations
                  .find(r => (r.startsAt.getTime() <= hour.getTime())
                      && (r.endsAt.getTime() > hour.getTime()))
              const driver = calendar.drivers.find(d => d.memberId === hourReservation?.driverMemberId);
              return {
                  timestamp: hour,
                  booked: Boolean(conflictingReservation),
                  driver
                };
            });
      setExtendOptions(newExtendOptions);
      setKm(undefined);
      setComment(reservation.comment);
      setTimestamp(nextHours(now, 1, false));
      setConfirmation(type);
    }, [ driverApi, reservation, setConfirmation, setTimestamp, setComment, setKm, setExtendOptions ]);
  const showExtendModal = () => extendModal('extend');
  
  const showConfirmStopModal = () => extendModal('stop');

  const confirm = async () => {
      const success = await confirmStartOrStopOfCarSharing(timestamp!, km!, comment!);
      if (!success) return;
      setConfirmation(undefined);
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
                  { toLocaleTimeStringWithoutSeconds(reservation.startsAt) }
                  &nbsp;
                  { reservation.hoursPlanned }h
                </Text>
              </Box>
              <Box
                  direction="row"
                  gap="small">
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
              <TableCell size="40%">{ t('car') }:</TableCell>
              <TableCell>
                { reservation.carName }
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>{ t('from') }:</TableCell>
              <TableCell>
                { reservation.startsAt.toLocaleDateString() }
                &nbsp;
                { toLocaleTimeStringWithoutSeconds(reservation.startsAt) }
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>{ t('to') }:</TableCell>
              <TableCell>
                { reservation.endsAt.toLocaleDateString() }
                &nbsp;
                { toLocaleTimeStringWithoutSeconds(reservation.endsAt) }
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>{ t('hours') }:</TableCell>
              <TableCell>
                { reservation.hoursPlanned }h
              </TableCell>
            </TableRow>
            {
              Boolean(reservation.kmAtStart)
                  ? <TableRow>
                      <TableCell
                          verticalAlign='top'>
                        { t('usage-from') }:
                      </TableCell>
                      <TableCell>
                        { reservation.startUsage!.toLocaleDateString() }
                        &nbsp;
                        { toLocaleTimeStringWithoutSeconds(reservation.startUsage!) }
                        <br/>
                        { reservation.kmAtStart!.toLocaleString() }
                        &nbsp;km
                      </TableCell>
                    </TableRow>
                  : undefined
            }
            {
              Boolean(reservation.kmAtEnd)
                  ? <TableRow>
                      <TableCell
                          verticalAlign='top'>
                        { t('usage-until') }:
                      </TableCell>
                      <TableCell>
                        { reservation.endUsage!.toLocaleDateString() }
                        &nbsp;
                        { toLocaleTimeStringWithoutSeconds(reservation.endUsage!) }
                        <br/>
                        { reservation.kmAtEnd!.toLocaleString() }
                        &nbsp;km
                      </TableCell>
                    </TableRow>
                  : undefined
            }
            {
              Boolean(reservation.comment)
                  ? <TableRow>
                      <TableCell>{ t('comment') }:</TableCell>
                      <TableCell>
                        { reservation.comment }
                      </TableCell>
                    </TableRow>
                  : undefined
            }
            {
              Boolean(reservation.userTaskId) && Boolean(reservation.userTaskType === 'confirmStartOfUsage')
                  ? <TableRow>
                      <TableCell colSpan={ 2 }>
                        <BlinkingButton
                            primary
                            onClick={ () => showConfirmStartModal(reservation.carKm) }
                            label={ t('start-usage') } />
                      </TableCell>
                    </TableRow>
                  : Boolean(reservation.userTaskId) && Boolean(reservation.userTaskType === 'confirmEndOfUsage')
                  ? <>
                      <TableRow>
                        <TableCell colSpan={ 2 }>
                          <Button
                              secondary
                              onClick={ showExtendModal }
                              label={ t('extend-button') } />
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={ 2 }>
                          <BlinkingButton
                              primary
                              onClick={ showConfirmStopModal }
                              label={ t('stop-button') } />
                        </TableCell>
                      </TableRow>
                    </>
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
              : confirmation !== undefined
              ? <Modal
                    show={ true }
                    abort={ () => setConfirmation(undefined) }
                    abortLabel='dismiss-button'
                    action={ confirm }
                    actionLabel={ `${confirmation}-button` }
                    header={ `${confirmation}-usage` }
                    t={ t }>
                  <Box
                      gap="small"
                      margin={ { bottom: 'large' } }>
                    <SubHeading>{ t('usage-until') } ({ t('including-charging') }):</SubHeading>
                    <Select
                        dropHeight="small"
                        height="3rem"
                        options={ extendOptions }
                        disabledKey='booked'
                        labelKey={ o => o.timestamp }
                        valueLabel={ v => (
                            <Box
                                pad="xsmall">
                              { toLocaleTimeStringWithoutSeconds(v) }
                            </Box>)
                          }
                        children={ (v, _index, _options, mode) => (
                            <Box
                                direction="row"
                                gap="xsmall"
                                align="center"
                                height="2.2rem"
                                background={ mode.disabled
                                    ? '#dddddd'
                                    : v.timestamp.getTime() !== timestamp?.getTime()
                                    ? undefined
                                    : 'brand' }
                                pad="xsmall">
                              { toLocaleTimeStringWithoutSeconds(v.timestamp) }
                              { v.driver === undefined
                                  ? undefined
                                  : <Box
                                        direction="row"
                                        gap="xsmall">
                                      <UserAvatar
                                          size='small'
                                          border={ { color: 'dark-4', size: '1px' }}
                                          user={ v.driver } />
                                      <Text truncate>
                                        { v.driver.firstName }&nbsp;
                                        { v.driver.lastName }
                                      </Text>
                                    </Box>                              
                              }
                            </Box>)
                          }
                        value={ timestamp }
                        onChange={ ({ option }) => setTimestamp(option.timestamp) } />
                    {
                      confirmation === 'stop'
                          ? <>
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
                            </>
                          : undefined
                    }
                  </Box>
                </Modal>
              : undefined
        }
      </AccordionPanel>
    );

};

export { ReservationAccordionPanel };
