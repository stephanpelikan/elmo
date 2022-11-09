import { Alert, Car, Cycle, FormNext, Schedules } from 'grommet-icons';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Accordion, AccordionPanel, Box, Button, MaskedInput, Paragraph, Select, Table, TableBody, TableCell, TableRow, Text } from 'grommet';
import { useCarSharingApi } from '../DriverAppContext';
import { useEffect, useRef, useState } from 'react';
import { CarSharingReservation } from '../../client/gui';
import useResponsiveScreen from '../../utils/responsiveUtils';
import { Content, Heading, TextHeading } from '../../components/MainLayout';
import { hoursBetween, nextHours } from '../../utils/timeUtils';
import { now, useKeepNowUpToDate } from '../../utils/now-hook';

import i18n from '../../i18n';
import styled, { keyframes } from 'styled-components';
import { useAppContext } from '../../AppContext';

i18n.addResources('en', 'driver/car-sharings', {
      "title": "Your Reservations",
      "new-reservation_another": "You need another reservation?",
      "new-reservation_first": "You currently have no Car-Sharing reservations.",
      "hint-reservation_another": "To do this, switch to the planner",
      "hint-reservation_first": "Go to the planner for a new reservation",
      "thousand-separator": ",",
      "confirm-car-sharing_title": "Car-Sharing",
      "confirm-car-sharing_km_lower-than-car": "The given value for kilometers is lower than already recorded for this car!",
    });
i18n.addResources('de', 'driver/car-sharings', {
      "title": "Deine Reservierungen",
      "new-reservation_another": "Du brauchst eine weitere Reservierung?",
      "new-reservation_first": "Aktuell hast du keine Car-Sharing Reservierungen.",
      "hint-reservation_another": "Wechsle dafür zum Planer",
      "hint-reservation_first": "Wechsle für eine neue Reservierung zum Planer",
      "thousand-separator": ".",
      "confirm-car-sharing_title": "Car-Sharing",
      "confirm-car-sharing_lower-than-car": "Der angegebene KM-Stand ist niedriger als für das Auto bereits erfasst wurde!",
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

const CarSharings = () => {

  const { t } = useTranslation('driver/car-sharings');
  const { t: tDriver } = useTranslation('driver');
  const { isPhone } = useResponsiveScreen();
  const navigate = useNavigate();
  const carSharingApi = useCarSharingApi();
  const { toast } = useAppContext();

  const [ detailsVisible, setDetailsVisible ] = useState<Array<number>>([]);
  const [ reservations, setReservations ] = useState<Array<CarSharingReservation>>(undefined);

  const kmFocus = useRef(undefined);
  const [ km, setKm ] = useState<string>('');
  const [ timestamp, setTimestamp ] = useState<Date>(undefined);
  
  useKeepNowUpToDate();
  
  useEffect(() => {
      const loadCarSharings = async () => {
          const r = await carSharingApi.getCarSharingReservations();
          setReservations(r.reservations);
          const visible = r
              .reservations
              .filter(reservation => reservation.userTaskId !== undefined)
              .map((reservation, index) => index);
          setDetailsVisible(visible);
          if (visible.length > 0) {
            const firstReservation = r.reservations[visible[0]];
            kmFocus.current = firstReservation.id;
            if (!Boolean(firstReservation.start) && Boolean(firstReservation.carKm)) {
              const kmStr = firstReservation.carKm.toString();
              setKm(kmStr.length > 3
                  ? kmStr.substring(0, kmStr.length - 3) + t('thousand-separator') + kmStr.substring(kmStr.length - 3)
                  : kmStr)
            }
          }
        };
      loadCarSharings();
    }, [ carSharingApi, setReservations, t ]);

  const gotToPlanner = (reservation: CarSharingReservation) => {
      const day = reservation.startsAt.toISOString().substring(0, 10);
      const hour = reservation.startsAt.getHours();
      navigate(`.${tDriver('url-planner')}?${day}_${reservation.carId}_${hour}`);
    };
  
  const confirmStartOrStopOfCarSharing = async (
      index: number,
      carId: string,
      reservationId: string,
      userTaskId: string,
      comment?: string) => {
    
    try {
      
      const reservation = await carSharingApi.confirmStartOrStopOfCarSharing({
          carId,
          reservationId,
          carSharingStarStopRequest: {
            km,
            comment,
            userTaskId,
            timestamp
          }
        });
      reservations[index] = reservation;
      setReservations([ ...reservations ]);
      setKm(undefined);
      setTimestamp(undefined);
        
    } catch (error) {

      if ((error.response?.status === 400)
          && (error.response?.json)) {
        let violation = 'unknown_error';
        violation = (await error.response.json()).km;
        toast({
            namespace: 'driver/car-sharings',
            title: t('confirm-car-sharing_title'),
            message: t(`confirm-car-sharing_${violation}`),
            status: 'critical'
          });
      }
      
    }
    
  };
  
  return (
      <Box
          width={ isPhone ? '17.5rem' : '21rem'}
          gap="medium"
          margin={ { bottom: 'medium' } }>
        <Heading
            icon={ <Car /> }
            margin={ { vertical: 'xxsmall' } }
            level='3'>
          { t('title') }
        </Heading>
        {
          reservations === undefined
              ? <Box
                    background="light-6"
                    round="small"
                    align="center"
                    justify='center'
                    height='16rem'>
                  <Box
                      animation="rotateRight"
                      pad='medium'>
                    <Cycle
                        style={ { marginTop: '3px' } }
                        color="white"
                        size="large" />
                  </Box>
                </Box>
              : reservations.length === 0
              ? undefined
              : <Accordion
                    activeIndex={ detailsVisible }
                    onActive={ details => setDetailsVisible(details) }
                    animate>
                  {
                    reservations.map((reservation, index) => (
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
                                      onClick={ () => gotToPlanner(reservation) }
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
                                <TableCell size="45%">Von:</TableCell>
                                <TableCell>
                                  { reservation.startsAt.toLocaleDateString() }
                                  &nbsp;
                                  { reservation.startsAt.toLocaleTimeString().replace(':00', '') }
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>Bis:</TableCell>
                                <TableCell>
                                  { reservation.endsAt.toLocaleDateString() }
                                  &nbsp;
                                  { reservation.endsAt.toLocaleTimeString().replace(':00', '') }
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>Stunden:</TableCell>
                                <TableCell>
                                  { reservation.hoursPlanned }h
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>Fahrzeug:</TableCell>
                                <TableCell>
                                  { reservation.carName }
                                </TableCell>
                              </TableRow>
                              {
                                Boolean(reservation.kmAtStart) || Boolean(reservation.userTaskId)
                                    ? <TableRow>
                                        <TableCell
                                            verticalAlign='top'>
                                          Nutzung ab:
                                        </TableCell>
                                        {
                                          !Boolean(reservation.kmAtStart)
                                              ? <TableCell
                                                    pad={ { horizontal: 'xsmall' } }
                                                    gap="small">
                                                  <Box
                                                      border={
                                                        kmFocus.current === reservation.id
                                                            ? {
                                                                side: 'all',
                                                                color: 'brand',
                                                                size: '2px'
                                                              }
                                                            : 'all'
                                                      }
                                                      margin={
                                                        kmFocus.current === reservation.id
                                                            ? undefined
                                                            : '1px'
                                                      }
                                                      round="xsmall"
                                                      pad={ { vertical: 'xsmall', horizontal: 'small'} }
                                                      gap='xsmall'
                                                      align="center"
                                                      direction="row">
                                                    <MaskedInput
                                                        id={ reservation.id }
                                                        ref={ element => {
                                                            if ((element !== null)
                                                                && (element.id === kmFocus.current)) {
                                                              kmFocus.current = undefined;
                                                              element.focus();
                                                            }
                                                          } }
                                                        plain
                                                        focusIndicator={ false }
                                                        onFocus={ () => { kmFocus.current = reservation.id; } }
                                                        onBlur={ () => { kmFocus.current = undefined; } }
                                                        style={ { padding: 0 } }
                                                        textAlign='end'
                                                        mask={
                                                             [ {
                                                                length: [1, 3],
                                                                regexp: /^[0-9]{1,3}$/,
                                                                placeholder: '1'
                                                              },
                                                              {
                                                                fixed: t('thousand-separator')
                                                              },
                                                              {
                                                                length: [3, 4],
                                                                regexp: /^[0-9]{1,4}$/,
                                                                placeholder: '234'
                                                              } ]
                                                            }
                                                          value={ km }
                                                          onChange={ (event) => {
                                                              let kmInput = event.target.value;
                                                              const separator = t('thousand-separator');
                                                              // @ts-ignore
                                                              kmInput = kmInput.replaceAll(separator, '');
                                                              if (kmInput.length > 3) {
                                                                kmInput = kmInput.substring(0, kmInput.length - 3)
                                                                    + separator
                                                                    + kmInput.substring(kmInput.length - 3);
                                                              }
                                                              if (kmInput.length > 7) return;
                                                              setKm(kmInput);
                                                            } } />
                                                    km
                                                  </Box>
                                                  <Button
                                                      primary
                                                      disabled={ km === undefined || km.length === 0 }
                                                      onClick={ () => confirmStartOrStopOfCarSharing(
                                                          index,
                                                          reservation.carId,
                                                          reservation.id,
                                                          reservation.userTaskId) }
                                                      label="Starten" /></TableCell>
                                                : <TableCell>
                                                    { reservation.start.toLocaleDateString() }
                                                    &nbsp;
                                                    { reservation.start.toLocaleTimeString().replace(/:[0-9]+$/, '') }
                                                    <br/>
                                                    { reservation.kmAtStart.toLocaleString() }
                                                    &nbsp;km
                                                  </TableCell>
                                        }
                                      </TableRow>
                                    : undefined
                              }
                              {
                                Boolean(reservation.kmAtStart)
                                    ? <TableRow>
                                        <TableCell
                                            verticalAlign='top'>
                                          Nutzung bis:
                                          <br/>
                                          (inkl. Laden)
                                        </TableCell>
                                        {
                                          !Boolean(reservation.kmAtEnd)
                                              ? <TableCell
                                                    pad={ { horizontal: 'xsmall' } }
                                                    gap="small">
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
                                                  <Box
                                                      border={
                                                        kmFocus.current === reservation.id
                                                            ? {
                                                                side: 'all',
                                                                color: 'brand',
                                                                size: '2px'
                                                              }
                                                            : 'all'
                                                      }
                                                      margin={
                                                        kmFocus.current === reservation.id
                                                            ? undefined
                                                            : '1px'
                                                      }
                                                      round="xsmall"
                                                      pad={ { vertical: 'xsmall', horizontal: 'small'} }
                                                      gap='xsmall'
                                                      align="center"
                                                      direction="row">
                                                    <MaskedInput
                                                        id={ reservation.id }
                                                        ref={ element => {
                                                            if ((element !== null)
                                                                && (element.id === kmFocus.current)) {
                                                              kmFocus.current = undefined;
                                                              element.focus();
                                                            }
                                                          } }
                                                        plain
                                                        focusIndicator={ false }
                                                        onFocus={ () => { kmFocus.current = reservation.id; } }
                                                        onBlur={ () => { kmFocus.current = undefined; } }
                                                        style={ { padding: 0 } }
                                                        textAlign='end'
                                                        mask={
                                                             [ {
                                                                length: [1, 3],
                                                                regexp: /^[0-9]{1,3}$/,
                                                                placeholder: '1'
                                                              },
                                                              {
                                                                fixed: t('thousand-separator')
                                                              },
                                                              {
                                                                length: [3, 4],
                                                                regexp: /^[0-9]{1,4}$/,
                                                                placeholder: '234'
                                                              } ]
                                                            }
                                                          value={ km }
                                                          onChange={ (event) => {
                                                              let kmInput = event.target.value;
                                                              const separator = t('thousand-separator');
                                                              // @ts-ignore
                                                              kmInput = kmInput.replaceAll(separator, '');
                                                              if (kmInput.length > 3) {
                                                                kmInput = kmInput.substring(0, kmInput.length - 3)
                                                                    + separator
                                                                    + kmInput.substring(kmInput.length - 3);
                                                              }
                                                              if (kmInput.length > 7) return;
                                                              setKm(kmInput);
                                                            } } />
                                                    km
                                                  </Box>
                                                  <Button
                                                      primary
                                                      disabled={ km === undefined || km.length === 0 }
                                                      onClick={ () => confirmStartOrStopOfCarSharing(
                                                          index,
                                                          reservation.carId,
                                                          reservation.id,
                                                          reservation.userTaskId) }
                                                      label="Beenden" /></TableCell>
                                                : <TableCell>
                                                    { reservation.end.toLocaleDateString() }
                                                    &nbsp;
                                                    { reservation.end.toLocaleTimeString().replace(/:[0-9]+$/, '') }
                                                    <br/>
                                                    { reservation.kmAtEnd.toLocaleString() }
                                                    &nbsp;km
                                                  </TableCell>
                                        }
                                      </TableRow>
                                    : undefined
                              }
                            </TableBody>
                          </Table>
                        </AccordionPanel>))
                  }
                </Accordion>
        }
        <Content>
          <TextHeading>
            {
              t(reservations?.length !== 0
                  ? 'new-reservation_another'
                  : 'new-reservation_first')
            }
          </TextHeading>
          <Box
              direction="row">
            <Box>
              <Paragraph>
                {
                  t(reservations?.length !== 0
                      ? 'hint-reservation_another'
                      : 'hint-reservation_first')
                }
              </Paragraph>
            </Box>
            <Box
                onClick={ () => navigate('.' + tDriver('url-planner')) }
                focusIndicator={ false }
                direction="row">
              <FormNext />
              <Schedules />
            </Box>
          </Box>
        </Content>
      </Box>);
  
};

export { CarSharings }
