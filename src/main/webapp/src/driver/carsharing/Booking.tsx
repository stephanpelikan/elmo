import { Box, ColumnConfig, DataTable, Text } from "grommet";
import { useTranslation } from "react-i18next";
import i18n from '../../i18n';
import useResponsiveScreen from '../../utils/responsiveUtils';
import { currentHour, nextHours, timeAsString, hoursBetween } from '../../utils/timeUtils';
import { SnapScrollingDataTable } from '../../components/SnapScrollingDataTable';
import { UserAvatar } from '../../components/UserAvatar';
import { useCarSharingApi } from '../DriverAppContext';
import { CarSharingApi, CarSharingCar, CarSharingDriver, CarSharingReservation } from "../../client/gui";
import { CSSProperties, memo, MouseEvent, useCallback, useEffect, useRef, useState } from "react";
import { BorderType } from "grommet/utils";
import { TFunction } from "i18next";
import styled from "styled-components";
import { normalizeColor,  } from "grommet/utils";
import { FormCheckmark, FormClose, FormDown, FormUp } from "grommet-icons";
import { useAppContext } from "../../AppContext";

i18n.addResources('en', 'driver/carsharing/booking', {
      "loading": "loading...",
      "reservation-type_BLOCK": "Unavailable",
      "reservation-type_PS": "Passanger Service",
      "remaining": "Remaining hours",
    });
i18n.addResources('de', 'driver/carsharing/booking', {
      "loading": "Lade Daten...",
      "reservation-type_BLOCK": "Nicht verfügbar",
      "reservation-type_PS": "Fahrtendienst",
      "remaining": "Verbleibende Stunden",
    });

const itemsBatchSize = 48;

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
}

const dayEffectedBySelection
    : (day: CalendarDay, selection: Selection) => boolean
    = (day, selection) => {
  if (selection === undefined) return false;
  const hoursOfDay = day.hours[ Object.keys(day.hours)[0] ].length;
  return (selection.startsAt.getTime() <= day.startsAt.getTime() + hoursOfDay * 3600000)
      && (selection.endsAt.getTime() >= day.startsAt.getTime());
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
    z-index: ${props => props.numberOfHours - props.currentHour + 1};
  `;

const SelectionBox = ({ hour, selection, mouseDownOnDrag, cancelSelection, acceptSelection }: {
    hour: CalendarHour,
    selection: Selection,
    cancelSelection: (event: MouseEvent) => void,
    acceptSelection: (event: MouseEvent) => void,
    mouseDownOnDrag: (event: MouseEvent, top: boolean) => void,
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


const CarSharingReservationBox = ({ drivers, hour }: {
    drivers: ReservationDrivers,
    hour: CalendarHour,
  }) => {
    return (
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
        </Box>);
  };

const DayTable = memo<{
    t: TFunction,
    drivers: ReservationDrivers,
    car: CarSharingCar,
    day: CalendarDay,
    selection: Selection,
    cancelSelection: (event: MouseEvent) => void,
    acceptSelection: (event: MouseEvent) => void,
    mouseDownOnDrag: (event: MouseEvent, top: boolean) => void,
    mouseDownOnHour: (event: MouseEvent, car: CarSharingCar, hour: CalendarHour) => void,
    mouseEnterHour: (event: MouseEvent, car: CarSharingCar, hour: CalendarHour) => void }>(
  ({ t, drivers, car, day, selection, cancelSelection, acceptSelection, mouseDownOnHour, mouseEnterHour, mouseDownOnDrag }) => {

    const hours = day.hours[car.id];

    const dayColumns: ColumnConfig<any>[] = [ {
        property: '-not-used-but-mandatory-',
        sortable: false,
        render: (hour: CalendarHour) => {
            const borders = [];
            let hasTopBorder = false;
            let hasBottomBorder = false;
            if (hour.reservation) {
              borders.push({ side: "vertical", color: 'dark-4', size: '1px' });
              if (hour.reservation.startsAt.getTime() === hour.startsAt.getTime()) {
                borders.push({ side: "top", color: 'dark-4', size: '1px' });
                hasTopBorder = true;
              }
              if (hour.reservation.endsAt.getTime() === hour.endsAt.getTime()) {
                borders.push({ side: "bottom", color: 'dark-4', size: '1px' });
                hasBottomBorder = true;
              }
            }
            const hasSelection = (selection !== undefined)
                        && (selection.carId === car.id)
                        && (selection.startsAt.getTime() <= hour.startsAt.getTime())
                        && (selection.endsAt.getTime() >= hour.endsAt.getTime());
            
            const index = hours.indexOf(hour);
            
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
                          mouseEnterHour(event, car, hour);
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
                      background={ hour.reservation ? 'light-4' : undefined }>{
                    ((hour.reservation?.startsAt.getTime() === hour.startsAt.getTime())
                        || (hour.reservation && (index === 0)))
                        ? hour.reservation.type === "CS"
                        ? <CarSharingReservationBox
                            hour={ hour }
                            drivers={ drivers } />
                        : <Text>{ t(`reservation-type_${hour.reservation.type}`) }</Text>
                        : hasSelection
                        ? <SelectionBox
                              hour={ hour }
                              selection={ selection }
                              acceptSelection={ acceptSelection }
                              cancelSelection={ cancelSelection }
                              mouseDownOnDrag={ mouseDownOnDrag } />
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

    if (prev.car.id !== next.car.id) return false;
    if (prev.day.startsAt.getTime() !== next.day.startsAt.getTime()) return false;
    const prevDayEffectedBySelection = dayEffectedBySelection(prev.day, prev.selection);
    const nextDayEffectedBySelection = dayEffectedBySelection(next.day, next.selection);
    if ((prevDayEffectedBySelection === false)
        && (nextDayEffectedBySelection === false)) return true;
    if ((prev.car.id !== prev.selection?.carId)
        && (next.car.id !== next.selection?.carId)) return true;
    return false;
    
  });

const loadData = async (
      carSharingApi: CarSharingApi,
      startsAt: Date,
      endsAt: Date,
      days: Array<CalendarDay>,
      setDays: (hours: Array<CalendarDay>) => void,
      drivers: ReservationDrivers,
      setDrivers: (drivers: ReservationDrivers) => void,
      setCars?: (cars: Array<CarSharingCar>) => void,
      setRemainingHours?: (hours: number) => void,
    ) => {

  const calendar = await carSharingApi.getCarSharingCalendar({
      carSharingCalendarRequest: { startsAt, endsAt }
    });
  
  if (setRemainingHours) {
    setRemainingHours(calendar.remainingHours);
  }
  if (setCars) {
    setCars(calendar.cars);
  }
  
  const newDays = [];

  const currentHour = { at: startsAt, day: { startsAt, hours: {} } };
  newDays.push(currentHour.day);
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
    setDays([ ...days, ...newDays ]);
  } else {
    setDays(newDays);
  }
    
};

const Booking = () => {
  
  const { t } = useTranslation('driver/carsharing/booking');
  const { isPhone } = useResponsiveScreen();
  const carSharingApi = useCarSharingApi();
  const { state } = useAppContext();
  
  const [ endDate, setEndDate ] = useState<Date>(undefined);
  const [ days, setDays]  = useState<Array<CalendarDay>>(undefined);
  const [ cars, setCars ] = useState<Array<CarSharingCar>>(undefined);
  const [ drivers, setDrivers ] = useState<ReservationDrivers>(undefined);
  const [ remainingHours, _setRemainingHours ] = useState(-1);
  const remainingHoursRef = useRef(remainingHours);
  const setRemainingHours = useCallback((hours: number) => {
      remainingHoursRef.current = hours;
      _setRemainingHours(hours);
    }, [ remainingHoursRef, _setRemainingHours ]);

  useEffect(() => {
      if (remainingHours === -1) {
        const startsAt = currentHour(false);
        const endsAt = nextHours(startsAt, (24 - startsAt.getHours()) + 24, false);
        setEndDate(endsAt);
        setRemainingHours(0);
        loadData(carSharingApi, startsAt, endsAt, days, setDays, drivers, setDrivers, setCars, setRemainingHours);
      }
    }, [ carSharingApi, days, setDays, setRemainingHours, remainingHours, drivers, setDrivers ]);
    
  const [ _isMouseDown, setMouseIsDown ] = useState(false);
  const isMouseDown = useRef(_isMouseDown);
  const [ _selection, setSelection ] = useState<Selection>(undefined);
  const selection = useRef(_selection);
  
  const mouseDownOnDrag = useCallback((event: MouseEvent, top: boolean) => {
      if (isMouseDown.current) return;
      event.preventDefault();
      event.stopPropagation();
      setMouseIsDown(true);
      isMouseDown.current = true;
      const s = {
          startedAtStarts: top ? selection.current.endsAt : selection.current.startsAt,
          startedAtEnds: top ? selection.current.endsAt : selection.current.startsAt,
          startsAt: selection.current.startsAt,
          endsAt: selection.current.endsAt,
          carId: selection.current.carId,
        };
      setSelection(s);
      selection.current = s;
    }, [ setMouseIsDown, setSelection ]);
  const mouseDownOnHour = useCallback((event: MouseEvent, car: CarSharingCar, hour: CalendarHour) => {
      if (isMouseDown.current) return;
      if (remainingHoursRef.current < 1) return;
      event.preventDefault();
      event.stopPropagation();
      setMouseIsDown(true);
      isMouseDown.current = true;
      const s = {
          startedAtStarts: hour.startsAt,
          startedAtEnds: hour.endsAt,
          startsAt: hour.startsAt,
          endsAt: hour.endsAt,
          carId: car.id
        };
      setSelection(s);
      selection.current = s;
    }, [ setMouseIsDown, setSelection ]);
  const mouseEnterHour = useCallback((event: MouseEvent, car: CarSharingCar, hour: CalendarHour) => {
      if (!isMouseDown.current) return;
      if (car.id !== selection.current.carId) return;
      event.preventDefault();
      event.stopPropagation();
      const wasUpperBoundaryChanged = hour.startsAt.getTime() < selection.current.startedAtStarts.getTime();
      const newStartsAt = wasUpperBoundaryChanged
          ? hour.startsAt
          : selection.current.startedAtStarts;
      const maxStartsAt = wasUpperBoundaryChanged
          ? nextHours(selection.current.startedAtEnds, remainingHoursRef.current, true)
          : selection.current.startedAtStarts;
      const wasLowerBoundaryChanged = hour.endsAt.getTime() > selection.current.startedAtEnds.getTime();
      const newEndsAt = wasLowerBoundaryChanged
          ? hour.endsAt
          : selection.current.startedAtEnds;
      const maxEndsAt = wasLowerBoundaryChanged
          ? nextHours(selection.current.startedAtStarts, remainingHoursRef.current, false)
          : selection.current.startedAtEnds;
      const total = hoursBetween(newStartsAt, newEndsAt);
//      const startsAt = hoursBetween(newStartsAt, selection.current.startsAt) > 1
//          ? selection.current.startsAt
//          : total > remainingHoursRef.current
      const startsAt = total > remainingHoursRef.current
          ? maxStartsAt
          : newStartsAt
//      const endsAt = hoursBetween(newEndsAt, selection.current.endsAt) > 1
//          ? selection.current.endsAt
//          : total > remainingHoursRef.current
      const endsAt = total > remainingHoursRef.current
          ? maxEndsAt
          : newEndsAt;
      const s = {
          startedAtStarts: selection.current.startedAtStarts,
          startedAtEnds: selection.current.startedAtEnds,
          startsAt,
          endsAt,
          carId: car.id,
        };
      setSelection(s);
      selection.current = s;
    }, [ isMouseDown, setSelection, selection ]);
  const mouseMove = useCallback(event => {
      if (!isMouseDown.current) return;
      event.preventDefault();
      event.stopPropagation();
    }, [ isMouseDown ]);
  const mouseUp = useCallback(() => {
      setMouseIsDown(false);
      isMouseDown.current = false;
    }, [ setMouseIsDown ]);
  
  const cancelSelection = useCallback(event => {
      event.preventDefault();
      event.stopPropagation();
      setSelection(undefined);
      selection.current = undefined;
    }, [ setSelection, selection ]);
  
  const acceptSelection = useCallback(event => {
      event.preventDefault();
      event.stopPropagation();
      const addCarSharingReservation = async () => {
          await carSharingApi.addCarSharingReservation({
              carId: selection.current.carId,
              carSharingReservation: {
                driverMemberId: state.currentUser.memberId,
                startsAt: selection.current.startsAt,
                endsAt: selection.current.endsAt,
                type: 'CS',
              }
            });
          setSelection(undefined);
        };
      addCarSharingReservation();
    }, [ carSharingApi, setSelection, selection, state.currentUser ]);
    
  useEffect(() => {
      window.addEventListener('mouseup', mouseUp);
      window.addEventListener('mousemove', mouseMove);
      return () => {
          window.removeEventListener('mouseup', mouseUp);
          window.removeEventListener('mousemove', mouseMove);
        };
    }, [ mouseUp, mouseMove ]);
  
  const carColumnSize = isPhone ? '80vw' : '300px';
  const carColumns: ColumnConfig<any>[] = !cars
      ? []
      : cars?.map(car => ({
          property: car.id,
          sortable: false,
          size: carColumnSize,
          render: (day: CalendarDay) => {
              return <DayTable
                  t={ t }
                  drivers={ drivers }
                  day={ day }
                  car={ car }
                  selection={ selection.current }
                  cancelSelection={ cancelSelection }
                  acceptSelection={ acceptSelection }
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
    setEndDate(endsAt);
    loadData(carSharingApi, startsAt, endsAt, days, setDays, drivers, setDrivers);
  };
  
  const headerHeight = '3rem';
  const phoneMargin = '10vw';
  
  const currentRemainingHours = remainingHours
      - (selection.current !== undefined ? hoursBetween(selection.current.endsAt, selection.current.startsAt) : 0);
  
  return (
      <>
        <Box
            align='center'
            background='dark-3'
            pad='small'>
          <Text>
            { t('remaining') }:
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
              &nbsp;{ currentRemainingHours }h
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
          </>);
      
};

export { Booking };
