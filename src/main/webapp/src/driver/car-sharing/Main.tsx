import { Car, Cycle, FormNext, Schedules } from 'grommet-icons';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Accordion, Box, Paragraph } from 'grommet';
import { useCarSharingApi } from '../DriverAppContext';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CarSharingReservation, ReservationEvent } from '../../client/gui';
import useResponsiveScreen from '../../utils/responsiveUtils';
import { Content, Heading, TextHeading } from '../../components/MainLayout';
import i18n from '../../i18n';
import { ReservationAccordionPanel, isUserTaskForDriver } from './ReservationAccordionPanel';
import { useAppContext } from '../../AppContext';
import { EventSourceMessage, WakeupSseCallback } from '../../components/SseProvider';
import { useGuiSse } from '../../client/guiClient';
import { debounce } from '../../utils/debounce';
 
i18n.addResources('en', 'driver/car-sharings', {
      "title": "Your Reservations",
      "new-reservation_another": "You need another reservation?",
      "new-reservation_first": "You currently have no Car-Sharing reservations.",
      "hint-reservation_another": "To do this, switch to the planner",
      "hint-reservation_first": "Go to the planner for a new reservation",
    });
i18n.addResources('de', 'driver/car-sharings', {
      "title": "Deine Reservierungen",
      "new-reservation_another": "Du brauchst eine weitere Reservierung?",
      "new-reservation_first": "Aktuell hast du keine Car-Sharing Reservierungen.",
      "hint-reservation_another": "Wechsle dafür zum Planer",
      "hint-reservation_first": "Wechsle für eine neue Reservierung zum Planer",
    });

const CarSharings = () => {

  const { t } = useTranslation('driver/car-sharings');
  const { t: tDriver } = useTranslation('driver');
  const { isPhone } = useResponsiveScreen();
  const navigate = useNavigate();
  const { state } = useAppContext();
  const wakeupSseCallback = useRef<WakeupSseCallback>(undefined);
  const carSharingApi = useCarSharingApi(wakeupSseCallback);

  const [ detailsVisible, setDetailsVisible ] = useState<Array<number>>([]);
  const [ reservations, setReservations ] = useState<Array<CarSharingReservation> | undefined>(undefined);

  const loadCarSharings = useCallback(async () => {
      const r = await carSharingApi.getCarSharingReservations();
      setReservations(r);
      const visible = r
          .filter(reservation => isUserTaskForDriver(reservation.userTaskType))
          .map((_reservation, index) => index);
      setDetailsVisible(visible);
    }, [ carSharingApi, setReservations ]);

  useEffect(() => {
      loadCarSharings();
    }, [ loadCarSharings ]);
  
  const updateCarSharings = useMemo(
    () => debounce(
        async (ev: EventSourceMessage<ReservationEvent>) => {
            if (ev.data.driverMemberId !== state.currentUser!.memberId) return;
            await loadCarSharings();
          }),
    [ loadCarSharings, state.currentUser ]);

  wakeupSseCallback.current = useGuiSse<ReservationEvent>(
      updateCarSharings,
      "Reservation"
    );

  const goToPlanner = (reservation: CarSharingReservation) => {
      const day = reservation.startsAt.toISOString().substring(0, 10);
      const hour = reservation.startsAt.getHours();
      navigate(`.${tDriver('url-planner')}?${day}_${reservation.carId}_${hour}`);
    };
  
  const extendCarSharing = async (
      index: number,
      carId: string,
      reservationId: string,
      userTaskId: string,
      timestamp: Date): Promise<{ [key in string]: string } | undefined> => {
    
    try {
      
      const reservation = await carSharingApi.extendCarSharing({
          carId,
          reservationId,
          extendCarSharingRequest: {
            userTaskId,
            timestamp
          }
        });
      reservations![index] = reservation;
      setReservations([ ...reservations! ]);
      return undefined;
        
    } catch (error) {

      if ((error.response?.status === 400)
          && (error.response?.json)) {
        const violations = await error.response.json();
        return violations;
      }
      return {'': 'unknown'};
      
    }
    
  };
  
  const confirmBeginOfCarSharing = async (
      index: number,
      carId: string,
      reservationId: string,
      userTaskId: string,
      kmStart: number,
      timestamp: Date,
      comment?: string): Promise<{ [key in string]: string } | undefined> => {
    
    try {
      
      const reservation = await carSharingApi.confirmBeginOfCarSharing({
          carId,
          reservationId,
          carSharingStartRequest: {
            kmStart,
            comment,
            userTaskId,
            timestamp
          }
        });
      reservations![index] = reservation;
      setReservations([ ...reservations! ]);
      return undefined;
        
    } catch (error) {

      if (error.response?.status === 404) {
        // if start-form is outdated, then just close it:
        // the start-missing mileage can be entered in end-dialog
        return undefined;
      }
      if ((error.response?.status === 400)
          && (error.response?.json)) {
        const violations = await error.response.json();
        return violations;
      }
      return {'': 'unknown'};
      
    }
    
  };

  const confirmEndOfCarSharing = async (
      index: number,
      carId: string,
      reservationId: string,
      userTaskId: string,
      kmStart: number,
      kmEnd: number,
      timestamp: Date,
      comment?: string): Promise<{ [key in string]: string } | undefined> => {
    
    try {
      
      const reservation = await carSharingApi.confirmEndOfCarSharing({
          carId,
          reservationId,
          carSharingStopRequest: {
            kmStart,
            kmEnd,
            comment,
            userTaskId,
            timestamp
          }
        });
      reservations![index] = reservation;
      setReservations([ ...reservations! ]);
      return undefined;
        
    } catch (error) {

      if ((error.response?.status === 400)
          && (error.response?.json)) {
        const violations = await error.response.json();
        return violations;
      }
      return {'': 'unknown'};
      
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
                    reservations.map(
                        (reservation, index) =>
                            <ReservationAccordionPanel
                                key={ reservation.id }
                                reservation={ reservation }
                                index={ index }
                                goToPlanner={ goToPlanner}
                                confirmStartOrStopOfCarSharing={
                                    (type, timestamp, kmStart, kmEnd, comment) =>
                                        type === 'extend'
                                            ? extendCarSharing(
                                                          index,
                                                          reservation.carId,
                                                          reservation.id,
                                                          reservation.userTaskId!,
                                                          timestamp)
                                            : type === 'start'
                                            ? confirmBeginOfCarSharing(
                                                          index,
                                                          reservation.carId,
                                                          reservation.id,
                                                          reservation.userTaskId!,
                                                          kmStart,
                                                          timestamp,
                                                          comment)
                                            : confirmEndOfCarSharing(
                                                          index,
                                                          reservation.carId,
                                                          reservation.id,
                                                          reservation.userTaskId!,
                                                          kmStart,
                                                          kmEnd,
                                                          timestamp,
                                                          comment) } />)
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
                style={ { minWidth: 'auto' } }
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
