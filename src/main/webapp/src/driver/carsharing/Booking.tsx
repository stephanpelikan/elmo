import { Box, ColumnConfig, DataTable, Text } from "grommet";
import { useTranslation } from "react-i18next";
import i18n from '../../i18n';
import useResponsiveScreen from '../../utils/responsiveUtils';
import { currentHour, nextHours } from '../../utils/timeUtils';
import { SnapScrollingDataTable } from '../../components/SnapScrollingDataTable';
import { useCarSharingApi } from '../DriverAppContext';
import { CarSharingApi, CarSharingCar, CarSharingReservation } from "../../client/gui";
import { CSSProperties, memo, MouseEvent, useCallback, useEffect, useRef, useState } from "react";
import { BorderType } from "grommet/utils";
import { TFunction } from "i18next";

i18n.addResources('en', 'driver/carsharing/booking', {
      "loading": "loading...",
      "reservation-type_BLOCK": "Unavailable",
      "reservation-type_PS": "Passanger Service",
    });
i18n.addResources('de', 'driver/carsharing/booking', {
      "loading": "Lade Daten...",
      "reservation-type_BLOCK": "Nicht verfügbar",
      "reservation-type_PS": "Fahrtendienst",
    });

const itemsBatchSize = 48;

interface CalendarHours {
  [key: string /* car id */]: Array<CalendarHour> /* hours of day */
}

interface CalendarDay {
  startsAt: Date;
  hours: CalendarHours;
}

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

const DayTable = memo<{
    t: TFunction,
    car: CarSharingCar,
    day: CalendarDay,
    selection: Selection,
    mouseDownOnHour: (event: MouseEvent, car: CarSharingCar, hour: CalendarHour) => void,
    mouseEnterHour: (event: MouseEvent, car: CarSharingCar, hour: CalendarHour) => void }>(
  ({ t, car, day, selection, mouseDownOnHour, mouseEnterHour }) => {

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
            const isFirstHourOfSelection = hasSelection
                        && (selection.startsAt.getTime() === hour.startsAt.getTime());
            const isLastHourOfSelection = hasSelection
                        && (selection.endsAt.getTime() === hour.endsAt.getTime());
            const selectionBorderRadius: CSSProperties = {};
            const selectionBorders: BorderType = hasSelection
                ? [ {
                    color: 'accent-3',
                    style: "solid",
                    size: '3px',
                    side: 'vertical',
                  } ]
                : undefined
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
                      onMouseOverCapture={ event => {
                          if (hour.reservation) {
                            event.preventDefault();
                            event.stopPropagation();
                            return;
                          }
                          mouseEnterHour(event, car, hour);
                        } }
                      pad={ {
                          horizontal: 'small',
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
                      background={ hour.reservation ? 'light-4' : undefined }>
                    <Text
                        truncate>{
                      ((hour.reservation?.startsAt.getTime() === hour.startsAt.getTime())
                          || (hour.reservation && (index === 0)))
                          ? t(`reservation-type_${hour.reservation.type}`)
                          : undefined
                    }</Text>{
                    hasSelection
                        ? <Box
                              background={ {
                                  color: 'brand',
                                  opacity: "medium",
                                } }
                              border={ selectionBorders }
                              direction="row"
                              align="center"
                              justify="between"
                              width="100%"
                              style={ {
                                  ...selectionBorderRadius,
                                  position: 'absolute',
                                  boxSizing: 'content-box',
                                  left: '-3px',
                                  top: isFirstHourOfSelection ? '-3px' : '0',
                                  minHeight: '100%',
                                  zIndex: '2'
                                } }>{
                            isFirstHourOfSelection
                                ? <Box>
                                    <Text>B</Text>
                                  </Box>
                                : <Text />
                          }{
                            isLastHourOfSelection
                                ? <Text>E</Text>
                                : <Text />
                          }</Box>
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
                  weight="bold"
                  size="xsmall"
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
    if ((nextDayEffectedBySelection === prevDayEffectedBySelection)
        && ((nextDayEffectedBySelection === false)
            || ((next.car.id !== next.selection?.carId)
                && (prev.car.id !== prev.selection.carId)))) {
      return true;
    }
    return false;
    
  });

const loadData = async (
      carSharingApi: CarSharingApi,
      startsAt: Date,
      endsAt: Date,
      days: Array<CalendarDay>,
      setDays: (hours: Array<CalendarDay>) => void,
      setCars: (cars: Array<CarSharingCar>) => void | undefined,
    ) => {

  const calendar = await carSharingApi.getCarSharingCalendar({
      carSharingCalendarRequest: {
        startsAt,
        endsAt,
        history: false
      }
    });
  
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

  const [ endDate, setEndDate ] = useState<Date>(undefined);
  const [ days, setDays]  = useState<Array<CalendarDay>>(undefined);
  const [ cars, setCars ] = useState<Array<CarSharingCar>>(undefined);

  useEffect(() => {
      if (days === undefined) {
        const startsAt = currentHour(false);
        const endsAt = nextHours(startsAt, (24 - startsAt.getHours()) + 24, false);
        setEndDate(endsAt);
        loadData(carSharingApi, startsAt, endsAt, days, setDays, setCars);
      }
    }, [ carSharingApi, days, setDays ]);
    
  const [ _isMouseDown, setMouseIsDown ] = useState(false);
  const isMouseDown = useRef(_isMouseDown);
  const [ _selection, setSelection ] = useState<Selection>(undefined);
  const selection = useRef(_selection);
  
  const mouseDownOnHour = useCallback((event: MouseEvent, car: CarSharingCar, hour: CalendarHour) => {
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
      event.preventDefault();
    }, [ setMouseIsDown, setSelection ]);
  const mouseEnterHour = useCallback((event: MouseEvent, car: CarSharingCar, hour: CalendarHour) => {
      if (!isMouseDown.current) return;
      if (car.id !== selection.current.carId) return;
      event.preventDefault();
      const s = {
          startedAtStarts: selection.current.startedAtStarts,
          startedAtEnds: selection.current.startedAtEnds,
          startsAt: hour.startsAt.getTime() < selection.current.startedAtStarts.getTime() ? hour.startsAt : selection.current.startedAtStarts,
          endsAt: hour.endsAt.getTime() > selection.current.startedAtEnds.getTime() ? hour.endsAt : selection.current.startedAtEnds,
          carId: car.id,
        };
      setSelection(s);
      selection.current = s;
    }, [ isMouseDown, setSelection, selection ]);
  const mouseMove = useCallback(event => {
      if (!isMouseDown.current) return;
      event.preventDefault();
    }, [ isMouseDown ]);
  const mouseUp = useCallback(event => {
      setMouseIsDown(false);
      isMouseDown.current = false;
    }, [ setMouseIsDown ]);
    
  useEffect(() => {
      window.addEventListener('mouseup', mouseUp);
      window.addEventListener('mousemove', mouseMove);
      return () => {
          window.removeEventListener('mouseup', mouseUp);
          window.removeEventListener('mousemove', mouseMove);
        };
    }, [ mouseUp, mouseMove ]);
  
  const carColumnSize = isPhone ? '70vw' : '270px';
  const carColumns: ColumnConfig<any>[] = !cars
      ? []
      : cars?.map(car => ({
          property: car.id,
          sortable: false,
          size: carColumnSize,
          render: (day: CalendarDay) => {
              return <DayTable
                  t={ t }
                  day={ day }
                  car={ car }
                  selection={ selection.current }
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
    loadData(carSharingApi, startsAt, endsAt, days, setDays, setCars);
  };
  
  const headerHeight = '2.8rem';
  const phoneMargin = '15vw';
  
  return (
      <SnapScrollingDataTable
          fill
          headerHeight={ headerHeight }
          phoneMargin={ phoneMargin }
          primaryKey={ false }
          columns={ carColumns }
          step={ 2 }
          onMore={ loadMore }
          data={ days }
          replace={ true } />);
      
};

export { Booking };
