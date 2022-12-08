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
import { ReservationAccordionPanel } from './ReservationAccordionPanel';
import { useAppContext } from '../../AppContext';
import { EventSourceMessage, WakeupSseCallback } from '../../components/SseProvider';
import { useGuiSse } from '../../client/guiClient';
import debounce from '../../utils/debounce';
 
i18n.addResources('en', 'driver/car-sharings', {
      "title": "Your Reservations",
      "new-reservation_another": "You need another reservation?",
      "new-reservation_first": "You currently have no Car-Sharing reservations.",
      "hint-reservation_another": "To do this, switch to the planner",
      "hint-reservation_first": "Go to the planner for a new reservation",
      "confirm-car-sharing_title": "Car-Sharing",
      "confirm-car-sharing_lower-than-car": "The given value for kilometers is lower than already recorded for this car!",
      "confirm-car-sharing_missing": "You have to fill the field 'Current Mileage'!",
    });
i18n.addResources('de', 'driver/car-sharings', {
      "title": "Deine Reservierungen",
      "new-reservation_another": "Du brauchst eine weitere Reservierung?",
      "new-reservation_first": "Aktuell hast du keine Car-Sharing Reservierungen.",
      "hint-reservation_another": "Wechsle dafür zum Planer",
      "hint-reservation_first": "Wechsle für eine neue Reservierung zum Planer",
      "confirm-car-sharing_title": "Car-Sharing",
      "confirm-car-sharing_lower-than-car": "Der angegebene KM-Stand ist niedriger als für das Auto bereits erfasst wurde!",
      "confirm-car-sharing_missing": "Du musst das Feld 'Aktueller Kilometerstand' befüllen!",
    });

const CarSharings = () => {

  const { t } = useTranslation('driver/car-sharings');
  const { t: tDriver } = useTranslation('driver');
  const { isPhone } = useResponsiveScreen();
  const navigate = useNavigate();
  const { toast, state } = useAppContext();
  const wakeupSseCallback = useRef<WakeupSseCallback>(undefined);
  const carSharingApi = useCarSharingApi(wakeupSseCallback);

  const [ detailsVisible, setDetailsVisible ] = useState<Array<number>>([]);
  const [ reservations, setReservations ] = useState<Array<CarSharingReservation> | undefined>(undefined);

  const loadCarSharings = useCallback(async () => {
      const r = await carSharingApi.getCarSharingReservations();
      setReservations(r.reservations);
      const visible = r
          .reservations
          .filter(reservation => reservation.userTaskId !== undefined)
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
      "Reservation#CS"
    );

  const goToPlanner = (reservation: CarSharingReservation) => {
      const day = reservation.startsAt.toISOString().substring(0, 10);
      const hour = reservation.startsAt.getHours();
      navigate(`.${tDriver('url-planner')}?${day}_${reservation.carId}_${hour}`);
    };
  
  const confirmStartOrStopOfCarSharing = async (
      index: number,
      carId: string,
      reservationId: string,
      userTaskId: string,
      km: number,
      timestamp: Date,
      comment?: string): Promise<boolean> => {
    
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
      reservations![index] = reservation;
      setReservations([ ...reservations! ]);
      return true;
        
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
      return false;
      
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
                                    (timestamp, km, comment) => confirmStartOrStopOfCarSharing(
                                                          index,
                                                          reservation.carId,
                                                          reservation.id,
                                                          reservation.userTaskId!,
                                                          km,
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
