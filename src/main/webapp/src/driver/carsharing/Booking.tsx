import { Box, ColumnConfig, DataTable, Text } from "grommet";
import { useTranslation } from "react-i18next";
import i18n from '../../i18n';
import useDebounce from '../../utils/debounce-hook';
import useResponsiveScreen from '../../utils/responsiveUtils';
import { currentHour, nextHours, timeAsString, hoursBetween } from '../../utils/timeUtils';
import { SnapScrollingDataTable } from '../../components/SnapScrollingDataTable';
import { UserAvatar } from '../../components/UserAvatar';
import { LoadingIndicator } from '../../components/LoadingIndicator';
import { useCarSharingApi } from '../DriverAppContext';
import { CarSharingApi, CarSharingCar, CarSharingDriver, CarSharingReservation, User } from "../../client/gui";
import { SSE_UPDATE_URL } from "../../client/guiClient";
import { CSSProperties, memo, MouseEvent as ReactMouseEvent, MutableRefObject, useCallback, useEffect, useRef, useState } from "react";
import { BackgroundType, BorderType } from "grommet/utils";
import { TFunction } from "i18next";
import styled from "styled-components";
import { normalizeColor,  } from "grommet/utils";
import { FormCheckmark, FormClose, FormDown, FormUp } from "grommet-icons";
import { useAppContext } from "../../AppContext";
import { useEventSource, useEventSourceListener } from "react-sse-hooks";

i18n.addResources('en', 'driver/carsharing/booking', {
      "reservation-type_BLOCK": "Unavailable",
      "reservation-type_PS": "Passanger Service",
      "remaining": "Remaining hours",
      "max-hours": "Largest reservation possible",
      "no-remaining-hours_title": "Car-Sharing",
      "no-remaining-hours_msg": "The quota has been used up!",
      "max-reservations_title": "Car-Sharing",
      "max-reservations_msg": "The maximum number of car-sharing reservations is reached: {{maxReservations}}!",
      "conflicting-reservation_title": "Car-Sharing",
      "conflicting-reservation_msg": "This view is not up to date! Meanwhile there is a conflicting reservation. Please go back and reenter to refresh the view.",
      "conflicting-incoming_title": "Car-Sharing",
      "conflicting-incoming_msg": "Another driver created a conflicting reservation. Your selection was removed.",
    });
i18n.addResources('de', 'driver/carsharing/booking', {
      "reservation-type_BLOCK": "Nicht verfügbar",
      "reservation-type_PS": "Fahrtendienst",
      "remaining": "Verbleibende Stunden",
      "max-hours": "Größtmögliche Reservierung",
      "no-remaining-hours_title": "Car-Sharing",
      "no-remaining-hours_msg": "Dein Car-Sharing-Kontingent ist bereits aufgebraucht!",
      "max-reservations_title": "Car-Sharing",
      "max-reservations_msg": "Du hast bereits die maximale Anzahl an Car-Sharing-Reservierungen gebucht: {{maxReservations}}!",
      "conflicting-reservation_title": "Car-Sharing",
      "conflicting-reservation_msg": "Diese Ansicht ist nicht aktuell! Mittlerweile gibt es eine andere Reservierung in dieser Zeit. Bitte wechsle zur vorigen Ansicht steige neu ein, um die Ansicht zu aktualisieren.",
      "conflicting-incoming_title": "Car-Sharing",
      "conflicting-incoming_msg": "Ein(e) andere(r) Fahrer(in) hat eine Reservierung in der Zeit deiner Auswahl eingetragen, weshalb sie entfernt wurde.",
    });

const itemsBatchSize = 48;

interface UpdateEvent {
  type: string;
  id: string;
  driverMemberId?: number;
  startsAt: string;
  endsAt: string;
  carId: string;
}

interface DayVersions {
  [key: string /* YYYYMMdd + '_' + car.id */]: number
};

interface ReservationDrivers {
  [key: number /* member id */]: CarSharingDriver
};

interface CalendarHours {
  [key: string /* car id */]: Array<CalendarHour> /* hours of day */
};

interface CalendarDay {
  startsAt: Date;
  hours: CalendarHours;
};

interface CalendarHour {
  index: number;
  startsAt: Date;
  endsAt: Date;
  reservation: CarSharingReservation | undefined;
};

interface Selection {
  startedAtStarts: Date;
  startedAtEnds: Date;
  startsAt: Date;
  endsAt: Date;
  carId: string;
};

interface Restrictions {
  maxHours: number;
  remainingHours: number;
};

const ButtonBox = styled(Box)`
    position: absolute;
    right: 5px;
    bottom: -24px;
  `;

const DragBox = styled(Box)<{
    top?: boolean,
  }>`
    position: absolute;
    background-color: ${props => normalizeColor("brand", props.theme)};
    ${props => !props.top ? 'left: 3.5rem' : 'right: 5px'};
    ${props => props.top ? 'top: -16px' : 'bottom: -16px'};
    border: solid 3px ${props => normalizeColor("accent-3", props.theme)};
    width: 30px;
    height: 30px;
    border-radius: 15px;
    display: inline-block;
  `;

const StyledSelectionBox = styled(Box)<{
    selectionBorderRadius: CSSProperties,
    isFirstHourOfSelection: boolean,
    numberOfHours: number,
    currentHour: number,
  }>`
    border-top-left-radius: ${props => props.selectionBorderRadius.borderTopLeftRadius};
    border-top-right-radius: ${props => props.selectionBorderRadius.borderTopRightRadius};
    border-bottom-left-radius: ${props => props.selectionBorderRadius.borderBottomLeftRadius};
    border-bottom-right-radius: ${props => props.selectionBorderRadius.borderBottomRightRadius};
    position: absolute;
    box-sizing: content-box;
    left: -3px;
    top: ${props => props.isFirstHourOfSelection ? '-3px' : '0'};
    min-height: 100%;
    z-index: ${props => props.currentHour === 0 ? 2 : 1};
  `;

const SelectionBox = ({ hour, selection, mouseDownOnDrag, cancelSelection, acceptSelection }: {
    hour: CalendarHour,
    selection: Selection,
    cancelSelection: (event: ReactMouseEvent) => void,
    acceptSelection: (event: ReactMouseEvent) => void,
    mouseDownOnDrag: (event: ReactMouseEvent, top: boolean) => void,
  }) => {

    const { state } = useAppContext();

    const isFirstHourOfSelection = selection.startsAt.getTime() === hour.startsAt.getTime();
    const isLastHourOfSelection = selection.endsAt.getTime() === hour.endsAt.getTime();
    const selectionBorderRadius: CSSProperties = {};
    const selectionBorders: BorderType = [ {
        color: 'accent-3',
        style: "solid",
        size: '3px',
        side: 'vertical',
      } ];
    if (isFirstHourOfSelection) {
      selectionBorders.push({
          color: 'accent-3',
          style: "solid",
          size: '3px',
          side: 'top',
        });
      selectionBorderRadius.borderTopLeftRadius = '7px';
      selectionBorderRadius.borderTopRightRadius = '7px';
    }
    if (isLastHourOfSelection) {
      selectionBorders.push({
          color: 'accent-3',
          style: "solid",
          size: '3px',
          side: 'bottom',
        });
      selectionBorderRadius.borderBottomLeftRadius = '7px';
      selectionBorderRadius.borderBottomRightRadius = '7px';
    }
    const numberOfHours = hoursBetween(selection.endsAt, selection.startsAt);
    const currentHour = hoursBetween(hour.startsAt, selection.startsAt);

    return <StyledSelectionBox
              selectionBorderRadius={ selectionBorderRadius }
              isFirstHourOfSelection={ isFirstHourOfSelection }
              background={ {
                  color: 'brand',
                  opacity: "medium",
                } }
              border={ selectionBorders }
              numberOfHours={ numberOfHours }
              currentHour={ currentHour }
              direction="row"
              align="center"
              justify="between"
              width="100%">{
              isFirstHourOfSelection
                  ? <>
                      <Box
                          style={ { position: 'relative' } }
                          direction="row"
                          gap="xsmall"
                          pad={ { left: numberOfHours > 1 ? '3.5rem' : '5.5rem' } }>
                        <Box
                            style={ {
                                position: 'absolute',
                                left: '4px',
                                top: '-50%',
                              } }>
                          <UserAvatar
                              size='medium'
                              border={ { color: 'accent-3', size: '3px' }}
                              user={ state.currentUser } />
                        </Box>
                        <Box>
                          <Text>
                            { numberOfHours }h
                            {
                              numberOfHours > 1 
                                  ? <Text
                                        margin='small'>{
                                      timeAsString(selection.startsAt)
                                    } - {
                                      timeAsString(selection.endsAt)
                                    }</Text>
                                  : undefined
                            }
                          </Text>
                        </Box>
                      </Box>
                      <DragBox
                          top
                          onMouseDownCapture={ event => mouseDownOnDrag(event, true) }>
                        <FormUp color="white" />
                      </DragBox>
                    </>
                  : <Text />
            }{
              isLastHourOfSelection
                  ? <>
                      <ButtonBox>
                        <Box
                            direction="row"
                            gap="small">
                          <Box
                              onMouseDownCapture={ acceptSelection }
                              round="full"
                              overflow="hidden"
                              border={ { color: 'accent-3', size: '3px' } }
                              background='status-ok'>
                            <FormCheckmark
                                color="white"
                                size="30rem" />
                          </Box>
                          <Box
                              onMouseDownCapture={ cancelSelection }
                              round="full"
                              overflow="hidden"
                              border={ { color: 'accent-3', size: '3px' } }
                              background='status-critical'>
                            <FormClose
                                color="white"
                                size="30rem" />
                          </Box>
                        </Box>
                      </ButtonBox>
                      <DragBox
                          onMouseDownCapture={ event => mouseDownOnDrag(event, false) }>
                        <FormDown color="white" />
                      </DragBox>
                    </>
                  : <Text />
            }
          </StyledSelectionBox>  
  };

const CancellationBox = ({
    carId,
    reservationId,
    cancelReservation
  }: {
    carId: string,
    reservationId: string,
    cancelReservation: (event: ReactMouseEvent, carId: string, reservationId: string) => void
  }) => <Box
          style={ { position: 'relative' } }>
        <Box
            style={ { position: 'absolute', right: '2.5rem' } }
            onMouseDownCapture={ (event) => cancelReservation(event, carId, reservationId) }
            round="full"
            overflow="hidden"
            border={ { color: 'accent-3', size: '3px' } }
            background='status-critical'>
          <FormClose
              color="white"
              size="30rem" />
        </Box>
      </Box>;

const CarSharingReservationBox = ({
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
              user={ drivers[ hour.reservation.driverMemberId ] } />
          <Box>
              <Text
                  truncate>{
                timeAsString(hour.reservation.startsAt)
              } - {
                timeAsString(hour.reservation.endsAt)
              }</Text>
          </Box>
        </Box>
      </>);
  };

const DayTable = memo<{
    t: TFunction,
    currentUser: User,
    dayVersion: number,
    drivers: ReservationDrivers,
    car: CarSharingCar,
    days: CalendarDay[],
    day: CalendarDay,
    selection: Selection,
    cancelSelection: (event: ReactMouseEvent) => void,
    acceptSelection: (event: ReactMouseEvent) => void,
    cancelReservation: (event: ReactMouseEvent, carId: string, reservationId: string) => void,
    mouseDownOnDrag: (event: ReactMouseEvent, top: boolean) => void,
    mouseDownOnHour: (event: ReactMouseEvent, car: CarSharingCar, hour: CalendarHour) => void,
    mouseEnterHour: (event: ReactMouseEvent, car: CarSharingCar, days: CalendarDay[], day: CalendarDay, hour: CalendarHour) => void }>(
  ({ t, currentUser, drivers, car, days, day, selection, cancelSelection, acceptSelection, cancelReservation, mouseDownOnHour, mouseEnterHour, mouseDownOnDrag }) => {

    const hours = day.hours[car.id];

    const dayColumns: ColumnConfig<any>[] = [ {
        property: '-not-used-but-mandatory-',
        sortable: false,
        render: (hour: CalendarHour) => {
            const borderColor = hour.reservation?.driverMemberId === currentUser.memberId
                ? 'accent-3'
                : 'dark-4';
            const backgroundColor: BackgroundType = hour.reservation
                ? hour.reservation?.driverMemberId === currentUser.memberId
                ? { color: 'accent-3', opacity: 'strong' }
                : 'light-4'
                : undefined;
            const borders = [];
            let hasTopBorder = false;
            let hasBottomBorder = false;
            if (hour.reservation) {
              borders.push({ side: "vertical", color: borderColor, size: '1px' });
              if (hour.reservation.startsAt.getTime() === hour.startsAt.getTime()) {
                borders.push({ side: "top", color: borderColor, size: '1px' });
                hasTopBorder = true;
              }
              if (hour.reservation.endsAt.getTime() === hour.endsAt.getTime()) {
                borders.push({ side: "bottom", color: borderColor, size: '1px' });
                hasBottomBorder = true;
              }
            }
            const hasSelection = (selection !== undefined)
                        && (selection.carId === car.id)
                        && (selection.startsAt.getTime() <= hour.startsAt.getTime())
                        && (selection.endsAt.getTime() >= hour.endsAt.getTime());
            
            const index = hours.indexOf(hour);
            
            const isFirstHourOfReservation = (hour.reservation?.startsAt.getTime() === hour.startsAt.getTime())
                        || (hour.reservation && (index === 0));
            const isLastHourOfReservation = hour.reservation?.endsAt.getTime() === hour.endsAt.getTime();
            const isCarSharingReservation = hour.reservation?.type === "CS";
            return (
                <Box
                    direction="row"
                    fill>
                  <Box
                      align="end"
                      pad='4px'
                      style={ { minWidth: '2rem' } }>{
                    hour.startsAt.getHours()
                  }</Box>
                  <Box
                      onMouseDown={ event => {
                          if (hour.reservation) {
                            event.stopPropagation();
                            event.preventDefault();
                            return;
                          }
                          mouseDownOnHour(event, car, hour);
                        } }
                      onMouseOver={ event => {
                          if (hour.reservation) {
                            event.preventDefault();
                            event.stopPropagation();
                            return;
                          }
                          mouseEnterHour(event, car, days, day, hour);
                        } }
                      pad={ {
                          horizontal: 'xsmall',
                          top: hasTopBorder ? undefined : '1px',
                          bottom: hasBottomBorder ? undefined : '1px',
                        } }
                      border={ borders }
                      width="100%"
                      style={ {
                          position: 'relative',
                          minHeight: '100%'
                        } }
                      margin={ { horizontal: '1rem' }}
                      background={ backgroundColor }>{
                    hasSelection
                        ? <SelectionBox
                                hour={ hour }
                                selection={ selection }
                                acceptSelection={ acceptSelection }
                                cancelSelection={ cancelSelection }
                                mouseDownOnDrag={ mouseDownOnDrag } />
                        : isFirstHourOfReservation
                        ? isCarSharingReservation
                          ? <CarSharingReservationBox
                              hour={ hour }
                              drivers={ drivers }
                              cancellationBox={ isLastHourOfReservation
                                  ? <CancellationBox
                                       carId={ car.id }
                                       reservationId={ hour.reservation.id }
                                       cancelReservation={ cancelReservation } />
                                  : undefined }
                               />
                          : <Text>{ t(`reservation-type_${hour.reservation.type}` as const) }</Text>
                        : isLastHourOfReservation
                        ? isCarSharingReservation
                          ? <CancellationBox
                               carId={ car.id }
                               reservationId={ hour.reservation.id }
                               cancelReservation={ cancelReservation } />
                          : undefined
                        : undefined
                    }
                  </Box>
                </Box>);
            },
        header: (
            <Box
                fill
                background="dark-1"
                align="center">
              <Text
                  size="medium"
                  >{
                day.startsAt.toLocaleDateString()
              }</Text>
            </Box>),
      } ];
    
    return <DataTable
        fill
        pin
        pad={ { header: 'none', body: 'none' } }
        primaryKey={ false }
        style={ { tableLayout: 'fixed' } }
        background={ { body: ["white", "light-2"] } }
        columns={ dayColumns }
        data={ hours } />;
        
  }, (prev, next) => {
    return prev.dayVersion === next.dayVersion;
  });

const dayVersionKey = (time: Date, carId: string) =>
    (time.getFullYear() * 10000 + time.getMonth() * 100 + time.getDate()) + carId;
    
const getDayVersion = (
    dayVersions: DayVersions,
    time: Date,
    carId: string
  ) => {
    const key = dayVersionKey(time, carId);
    const result = dayVersions[key];
    if (result === undefined) return 0;
    return result;
  };
  
const increaseDayVersions = (
    dayVersions: MutableRefObject<DayVersions>,
    time: Date,
    cars: Array<CarSharingCar>
  ) => {
    cars.forEach(car => increaseDayVersion(dayVersions, time, car.id));
  };   

const increaseDayVersion = (
    dayVersions: MutableRefObject<DayVersions>,
    time: Date,
    carId: string
  ) => {
    const key = dayVersionKey(time, carId);
    const v = dayVersions.current[key];
    if (v === undefined) {
      dayVersions.current[key] = 1;
    } else {
      dayVersions.current[key] = v + 1;
    }
  };

const loadData = async (
      carSharingApi: CarSharingApi,
      dayVersions: MutableRefObject<DayVersions>,
      updateDayVersions: (versions: DayVersions) => void,
      setEndDate: (endDate: Date) => void,
      startsAt: Date,
      endsAt: Date,
      days: Array<CalendarDay>,
      setDays: (hours: Array<CalendarDay>) => void,
      drivers: ReservationDrivers,
      setDrivers: (drivers: ReservationDrivers) => void,
      setCars?: (cars: Array<CarSharingCar>) => void,
      setRestrictions?: (restrictions: Restrictions) => void,
    ) => {

  const calendar = await carSharingApi.getCarSharingCalendar({
      carSharingCalendarRequest: { startsAt, endsAt }
    });

  if (setRestrictions) {
    setRestrictions({
        remainingHours: calendar.remainingHours,
        maxHours: calendar.maxHours,
      });
  }
  if (setCars) {
    setCars(calendar.cars);
  }
  
  const newDays = [];

  const currentHour = { at: startsAt, day: { startsAt, hours: {} } };
  newDays.push(currentHour.day);
  increaseDayVersions(dayVersions, startsAt, calendar.cars);
  
  const carReservationIndex = {};
  calendar.cars.forEach(car => carReservationIndex[car.id] = 0);
  while (currentHour.at.getTime() !== endsAt.getTime()) {
    
    const nextHour = nextHours(currentHour.at, 1, false);
    
    calendar.cars.forEach((car, index) => {
      let hours: Array<CalendarHour> = currentHour.day.hours[car.id];
      if (hours === undefined) {
        hours = [];
        currentHour.day.hours[car.id] = hours;
      }
      const numberOfReservations = car.reservations?.length;
      let reservation = undefined;
      if (numberOfReservations > 0) {
        for (var i = carReservationIndex[car.id];
            (i < numberOfReservations); ++i) {
          const r = car.reservations[i];
          if ((r.startsAt <= currentHour.at) && (r.endsAt >= nextHour)) {
            reservation = r;
          }
        }
      }
      const item: CalendarHour = {
        index,
        startsAt: currentHour.at,
        endsAt: nextHour,
        reservation,
      };
      hours.push(item);
    });
    
    currentHour.at = nextHour;
    if ((currentHour.day.startsAt.getDate() !== nextHour.getDate())
        && nextHour.getTime() !== endsAt.getTime()) {
      currentHour.day = { startsAt: nextHour, hours: {} };
      newDays.push(currentHour.day);
      increaseDayVersions(dayVersions, nextHour, calendar.cars);
    }
    
  }

  const newDrivers = {};
  calendar.drivers?.forEach(driver => newDrivers[ driver.memberId ] = driver );
  if (drivers === undefined) {
    setDrivers(newDrivers);
  } else {
    setDrivers({ ...drivers, ...newDrivers });
  }

  if (days) {
    const result = { };
    days.forEach(d => { result[d.startsAt.getTime()] = d; });
    newDays.forEach(d => { result[d.startsAt.getTime()] = d; });
    const updatedDays = Object.keys(result).sort().map(t => result[t]);
    setDays(updatedDays);
  } else {
    setDays(newDays);
  }
  
  updateDayVersions(dayVersions.current);
  setEndDate(endsAt);

};

const Booking = () => {
  
  const { t } = useTranslation('driver/carsharing/booking');
  const { isPhone } = useResponsiveScreen();
  const carSharingApi = useCarSharingApi();
  const { state, toast } = useAppContext();
  
  const [ dayVersions, _setDayVersions ] = useState<DayVersions>({});
  const dayVersionsRef = useRef(dayVersions);
  const updateDayVersions = (versions: DayVersions) => {
      const newVersions = { ...versions };
      dayVersionsRef.current = newVersions;
      _setDayVersions(newVersions);
    };
  
  const [ endDate, setEndDate ] = useState<Date>(undefined);
  const [ days, _setDays]  = useState<Array<CalendarDay>>(undefined);
  const daysRef = useRef(days);
  const setDays = (d: Array<CalendarDay>) => {
      daysRef.current = d;
      _setDays(d);
    };
  const [ cars, setCars ] = useState<Array<CarSharingCar>>(undefined);
  const [ drivers, _setDrivers ] = useState<ReservationDrivers>(undefined);
  const driversRef = useRef(drivers);
  const setDrivers = (d: ReservationDrivers) => {
      driversRef.current = d;
      _setDrivers(d);
    };
  const [ restrictions, _setRestrictions ] = useState<Restrictions>(undefined);
  const restrictionsRef = useRef(restrictions);
  const setRestrictions = useCallback((r: Restrictions) => {
      restrictionsRef.current = r;
      _setRestrictions(r);
    }, [ restrictionsRef, _setRestrictions ]);

  useEffect(() => {
      if (restrictions === undefined) {
        const startsAt = currentHour(false);
        const endsAt = nextHours(startsAt, (24 - startsAt.getHours()) + 24, false);
        loadData(carSharingApi, dayVersionsRef, updateDayVersions, setEndDate, startsAt, endsAt, days, setDays, drivers, setDrivers, setCars, setRestrictions);
      }
    }, [ carSharingApi, days, restrictions, setRestrictions, drivers ]);
    
  const [ _isMouseDown, setMouseIsDown ] = useState(false);
  const isMouseDown = useRef(_isMouseDown);
  const [ _selection, _setSelection ] = useState<Selection>(undefined);
  const selection = useRef(_selection);
  const setSelection = useCallback((s: Selection) => {
      selection.current = s;
      _setSelection(s);
    }, [ _setSelection, selection ]);
    
  const [ waitingForUpdate, _setWaitingForUpdate ] = useState(false);
  const waitingForUpdateRef = useRef(waitingForUpdate);
  const setWaitingForUpdate = (w: boolean) => {
      if (w === waitingForUpdateRef.current) return;
      waitingForUpdateRef.current = w;
      _setWaitingForUpdate(w);
    }
  
  const mouseDownOnDrag = useCallback((event: ReactMouseEvent, top: boolean) => {
      if (isMouseDown.current) return;
      event.preventDefault();
      event.stopPropagation();

      const s = {
          startedAtStarts: top ? selection.current.endsAt : selection.current.startsAt,
          startedAtEnds: top ? selection.current.endsAt : selection.current.startsAt,
          startsAt: selection.current.startsAt,
          endsAt: selection.current.endsAt,
          carId: selection.current.carId,
        };
      setSelection(s);
      isMouseDown.current = true;
      setMouseIsDown(true);

    }, [ setMouseIsDown, setSelection ]);
  const mouseDownOnHour = useCallback((event: ReactMouseEvent, car: CarSharingCar, hour: CalendarHour) => {
      if (isMouseDown.current) return;
      if (restrictionsRef.current.remainingHours < 1) {
        toast({
            namespace: 'driver/car-sharing/booking',
            title: t('no-remaining-hours_title'),
            message: t('no-remaining-hours_msg'),
            status: 'warning'
          });
        return;
      }
      event.preventDefault();
      event.stopPropagation();

      if (selection.current !== undefined) {
        for (let hour = selection.current.startsAt.getTime()
            ; hour !== selection.current.endsAt.getTime()
            ; hour += 3600000) {
          increaseDayVersion(dayVersionsRef, new Date(hour), selection.current.carId);
        }
      }
      increaseDayVersion(dayVersionsRef, hour.startsAt, car.id);
      increaseDayVersion(dayVersionsRef, hour.endsAt, car.id);
      updateDayVersions(dayVersionsRef.current);
      const s = {
          startedAtStarts: hour.startsAt,
          startedAtEnds: hour.endsAt,
          startsAt: hour.startsAt,
          endsAt: hour.endsAt,
          carId: car.id
        };
      setSelection(s);
      isMouseDown.current = true;
      setMouseIsDown(true);

    }, [ setMouseIsDown, t, toast, selection, setSelection ]);
  const mouseEnterHour = useCallback((event: ReactMouseEvent, car: CarSharingCar, days: CalendarDay[], day: CalendarDay, hour: CalendarHour) => {
      if (!isMouseDown.current) return;
      if (car.id !== selection.current.carId) return;
      event.preventDefault();
      event.stopPropagation();
      const wasUpperBoundaryChanged = hour.startsAt.getTime() < selection.current.startedAtStarts.getTime();
      const wasLowerBoundaryChanged = hour.endsAt.getTime() > selection.current.startedAtEnds.getTime();
      const hours = day.hours[car.id];
      const indexOfHour = hours.indexOf(hour);
      const indexOfDay = days.indexOf(day);
      let startsAt = selection.current.startedAtStarts;
      // check for selection-rules of upper boundary:
      if (wasUpperBoundaryChanged) {
        // reducing the selection will always be fine, only increasing has to checked:
        if (hour.startsAt.getTime() > selection.current.startsAt.getTime()) {
          startsAt = hour.startsAt;
        } else {
          const maxStartsAt = nextHours(
              selection.current.startedAtEnds,
              Math.min(restrictionsRef.current.remainingHours, restrictionsRef.current.maxHours),
              true);
          const indexOfStartsAt = indexOfHour
              + hoursBetween(selection.current.startsAt, hour.startsAt);
          // test each hour beginning at last selection start:
          startsAt = selection.current.startsAt;
          for (let i = 1; startsAt.getTime() !== hour.startsAt.getTime(); ++i) {
            // until period hits remaining-hours boundary:
            if (startsAt.getTime() === maxStartsAt.getTime()) break;
            // or until first reservation is found:
            const indexToTest = indexOfStartsAt - i;
            const absoluteIndexToTest = indexOfDay === 0
                ? indexToTest
                : days[0].hours[car.id].length + 24 * (indexOfDay - 1) + indexToTest;
            const firstDayOffset = days[0].hours[car.id].length;
            let indexOfDayToTest: number;
            let indexOfHourToTest: number;
            if (absoluteIndexToTest < firstDayOffset) {
              indexOfDayToTest = 0;
              indexOfHourToTest = absoluteIndexToTest;
            } else {
              indexOfDayToTest = Math.floor((absoluteIndexToTest - firstDayOffset) / 24) + 1;
              indexOfHourToTest = (absoluteIndexToTest - firstDayOffset) % 24;
            }
            const hourToTest = days[ indexOfDayToTest ].hours[car.id][ indexOfHourToTest ];
            if (hourToTest.reservation) break;
            startsAt = nextHours(selection.current.startsAt, i, true);
          }
        }
        increaseDayVersion(dayVersionsRef, selection.current.startsAt, car.id);
        increaseDayVersion(dayVersionsRef, startsAt, car.id);
      }
      let endsAt = selection.current.startedAtEnds;
      // check for selection-rules of lower boundary:
      if (wasLowerBoundaryChanged) {
        // reducing the selection will always be fine, only increasing has to checked:
        if (hour.endsAt.getTime() < selection.current.endsAt.getTime()) {
          endsAt = hour.endsAt;
        } else {
          const maxEndsAt = nextHours(
              selection.current.startedAtStarts,
              Math.min(restrictionsRef.current.remainingHours, restrictionsRef.current.maxHours),
              false);
          const indexOfEndsAt = indexOfHour
              - hoursBetween(selection.current.endsAt, hour.endsAt);
          // test each hour beginning at last selection end:
          endsAt = selection.current.endsAt;
          for (let i = 1; endsAt.getTime() !== hour.endsAt.getTime(); ++i) {
            // until period hits remaining-hours boundary:
            if (endsAt.getTime() === maxEndsAt.getTime()) break;
            // or until first reservation is found:
            const indexToTest = indexOfEndsAt + i;
            const absoluteIndexToTest = indexOfDay === 0
                ? indexToTest
                : days[0].hours[car.id].length + 24 * (indexOfDay - 1) + indexToTest;
            const firstDayOffset = days[0].hours[car.id].length;
            let indexOfDayToTest: number;
            let indexOfHourToTest: number;
            if (absoluteIndexToTest < firstDayOffset) {
              indexOfDayToTest = 0;
              indexOfHourToTest = absoluteIndexToTest;
            } else {
              indexOfDayToTest = Math.floor((absoluteIndexToTest - firstDayOffset) / 24) + 1;
              indexOfHourToTest = (absoluteIndexToTest - firstDayOffset) % 24;
            }
            const hourToTest = days[ indexOfDayToTest ].hours[car.id][ indexOfHourToTest ];
            if (hourToTest.reservation) break;
            endsAt = nextHours(selection.current.endsAt, i, false);
          }
        }
        increaseDayVersion(dayVersionsRef, new Date(selection.current.endsAt.getTime() - 3600000), car.id);
        increaseDayVersion(dayVersionsRef, endsAt, car.id);
      }
      // minimize selection to start-hour
      if (!wasUpperBoundaryChanged && !wasLowerBoundaryChanged) {
        increaseDayVersion(dayVersionsRef, selection.current.startsAt, car.id);
        increaseDayVersion(dayVersionsRef, new Date(selection.current.endsAt.getTime() - 3600000), car.id);
      }

      updateDayVersions(dayVersionsRef.current);
      const s = {
          startedAtStarts: selection.current.startedAtStarts,
          startedAtEnds: selection.current.startedAtEnds,
          startsAt,
          endsAt,
          carId: car.id,
        };
      setSelection(s);
      
    }, [ isMouseDown, setSelection, selection ]);
  const mouseMove = useCallback((event: MouseEvent) => {
      if (!isMouseDown.current) return;
      event.preventDefault();
      event.stopPropagation();
    }, [ isMouseDown ]);
  const mouseUp = useCallback(() => {
      isMouseDown.current = false;
      setMouseIsDown(false);
    }, [ setMouseIsDown ]);
  
  const cancelSelection = useCallback((event: ReactMouseEvent) => {
      event.preventDefault();
      event.stopPropagation();

      for (let hour = selection.current.startsAt.getTime()
          ; hour !== selection.current.endsAt.getTime()
          ; hour += 3600000) {
        increaseDayVersion(dayVersionsRef, new Date(hour), selection.current.carId);
      }
      updateDayVersions(dayVersionsRef.current);
      setSelection(undefined);

    }, [ setSelection, selection ]);
  
  const acceptSelection = useCallback((event: ReactMouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      const addCarSharingReservation = async () => {
          try {
            setWaitingForUpdate(true);
            await carSharingApi.addCarSharingReservation({
                carId: selection.current.carId,
                carSharingReservation: {
                  driverMemberId: state.currentUser.memberId,
                  startsAt: selection.current.startsAt,
                  endsAt: selection.current.endsAt,
                  type: 'CS',
                }
              });
            // selection will be cancelled by server-sent update
          } catch (error) {
            setWaitingForUpdate(false);
            // CONFLICT means there is another reservation
            if (error.response?.status === 409) {
              toast({
                  namespace: 'driver/car-sharing/booking',
                  title: t('conflicting-reservation_title'),
                  message: t('conflicting-reservation_msg'),
                  status: 'critical'
                });
            }
            // violations response
            else if (error.response?.json) {
              const violations = await error.response?.json()
              toast({
                  namespace: 'driver/car-sharing/booking',
                  title: t('max-reservations_title'),
                  message: t('max-reservations_msg', { maxReservations: violations["max-reservations"] }),
                  status: 'critical'
                });
            }
          } 
        };
      addCarSharingReservation();
    }, [ carSharingApi, t, toast, selection, state.currentUser ]);
  
  const cancelReservation = useCallback((event: ReactMouseEvent, carId: string, reservationId: string) => {
      event.preventDefault();
      event.stopPropagation();
      const removeCarSharingReservation = async () => {
          try {
            setWaitingForUpdate(true);
            await carSharingApi.cancelCarSharingReservation({
                carId,
                reservationId,
              });
            // selection will be cancelled by server-sent update
          } catch (error) {
            console.log(error);
            setWaitingForUpdate(false);
          } 
        };
      removeCarSharingReservation();
    }, [ carSharingApi ]);
  useEffect(() => {
      window.addEventListener('mouseup', mouseUp);
      window.addEventListener('mousemove', mouseMove);
      return () => {
          window.removeEventListener('mouseup', mouseUp);
          window.removeEventListener('mousemove', mouseMove);
        };
    }, [ mouseUp, mouseMove ]);
  
  const updateSource = useEventSource({
      source: SSE_UPDATE_URL,
    });
    
  const debounceSse = useDebounce();
  useEventSourceListener<UpdateEvent>({
      source: updateSource,
      startOnInit: true,
      event: {
        name: "Reservation#all",
        listener: ({ data }) => {
            const startsAt = new Date(data.startsAt);
            const endsAt = new Date(data.endsAt);
            const effectedDays = [];
            for (let day = startsAt.getTime(); day < endsAt.getTime(); day += 3600000 * 24) {
              const current = new Date(day);
              const key = dayVersionKey(current, data.carId);
              if (!effectedDays.includes(key)) {
                effectedDays.push(new Date(current.getFullYear(), current.getMonth(), current.getDate()));
              }
            }
            const key = dayVersionKey(endsAt, data.carId);
            if (!effectedDays.includes(key)) {
              effectedDays.push(nextHours(endsAt, 24 - endsAt.getHours(), false));
            }
            const updateStartsAt = effectedDays[0].getTime() < daysRef.current[0].startsAt.getTime() ? daysRef.current[0].startsAt : effectedDays[0];
            const updateEndsAt = effectedDays[effectedDays.length - 1];
            const updateDataAndSelection = async () => {
                await loadData(carSharingApi, dayVersionsRef, updateDayVersions, setEndDate, updateStartsAt, updateEndsAt, daysRef.current, setDays, driversRef.current, setDrivers);
                setWaitingForUpdate(false);
                // detect overlapping selection of other members:
                if (selection.current === undefined) return;
                if ((startsAt.getTime() >= selection.current.startsAt.getTime()
                        && (endsAt.getTime() <= selection.current.endsAt.getTime()))
                    || (startsAt.getTime() < selection.current.startsAt.getTime()
                        && (endsAt.getTime() > selection.current.endsAt.getTime()))
                    || (startsAt.getTime() <= selection.current.startsAt.getTime()
                        && (endsAt.getTime() > selection.current.startsAt.getTime()))
                    || (startsAt.getTime() < selection.current.endsAt.getTime()
                        && (endsAt.getTime() >= selection.current.endsAt.getTime()))) {
                  if (data.driverMemberId !== state.currentUser.memberId) {
                    toast({
                        namespace: 'driver/car-sharing/booking',
                        title: t('conflicting-incoming_title'),
                        message: t('conflicting-incoming_msg'),
                        status: 'warning'
                      });
                  }
                  setSelection(undefined);
                }
              };
            debounceSse(() => { updateDataAndSelection(); });
          },
      },
    },
    [ updateSource ]);
  
  const carColumnSize = isPhone ? '80vw' : '300px';
  const carColumns: ColumnConfig<any>[] = !cars
      ? []
      : cars?.map(car => ({
          property: car.id,
          sortable: false,
          size: carColumnSize,
          render: (day: CalendarDay) => {
              const dayVersion = getDayVersion(dayVersions, day.startsAt, car.id);
              return <DayTable
                  t={ t }
                  currentUser={ state.currentUser }
                  dayVersion={ dayVersion }
                  drivers={ drivers }
                  days={ days }
                  day={ day }
                  car={ car }
                  selection={ selection.current }
                  cancelSelection={ cancelSelection }
                  acceptSelection={ acceptSelection }
                  cancelReservation={ cancelReservation }
                  mouseDownOnDrag={ mouseDownOnDrag }
                  mouseDownOnHour={ mouseDownOnHour }
                  mouseEnterHour={ mouseEnterHour } />;
            },
          header: car.name,
        }));
        
  const loadMore = async () => {
    if (days.length === 0) return;
    const day = days[ days.length - 1 ];
    if (!day) return;
    const startsAt = endDate;
    const endsAt = nextHours(startsAt, itemsBatchSize, false);
    await loadData(carSharingApi, dayVersionsRef, updateDayVersions, setEndDate, startsAt, endsAt, days, setDays, drivers, setDrivers);
  };
  
  const headerHeight = '3rem';
  const phoneMargin = '10vw';
  
  const currentRemainingHours = restrictions === undefined
      ? '-'
      : (restrictions.remainingHours - (selection.current !== undefined ? hoursBetween(selection.current.endsAt, selection.current.startsAt) : 0));
  
  return (
      <>
        <Box
            direction="row"
            justify="center"
            background='dark-3'
            gap='small'
            pad='small'>
          <Text>
            <>{ t('remaining') }:</>
            <Text
                weight='bold'
                style={ {
                    textShadow: currentRemainingHours < 1 ? '0 0 5px white' : undefined
                  } }
                color={
                    currentRemainingHours < 1
                        ? 'status-critical'
                        : currentRemainingHours < 5
                        ? 'status-warning'
                        : 'white' }>
              &nbsp;{ currentRemainingHours } h
            </Text>
          </Text>
          <Text>
            <>{ t('max-hours') }:</>
            <Text
                weight='bold'>
              &nbsp;{ restrictions === undefined ? '-' : restrictions.maxHours } h
            </Text>
          </Text>
        </Box>
        <SnapScrollingDataTable
            fill
            headerHeight={ headerHeight }
            phoneMargin={ phoneMargin }
            primaryKey={ false }
            columns={ carColumns }
            step={ 2 }
            onMore={ loadMore }
            data={ days }
            replace={ true } />
        {
          waitingForUpdate
              ? <LoadingIndicator />
              : undefined
        }
      </>);
      
};

export { Booking };
