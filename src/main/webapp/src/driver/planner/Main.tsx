import { Box, ColumnConfig, DataTable, DateInput, Text } from "grommet";
import { useTranslation } from "react-i18next";
import i18n from '../../i18n';
import { debounceByKey } from '../../utils/debounce';
import useResponsiveScreen from '../../utils/responsiveUtils';
import { currentHour, nextHours, numberOfHoursBetween } from '../../utils/timeUtils';
import { SnapScrollingDataTable } from '../../components/SnapScrollingDataTable';
import { useCarSharingApi, usePlannerApi } from '../DriverAppContext';
import { PlannerApi, PlannerCar, PlannerReservation, ReservationType, ReservationEvent } from "../../client/gui";
import React, { memo, MouseEvent as ReactMouseEvent, MutableRefObject, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Contract, DocumentTime, History } from "grommet-icons";
import { useAppContext } from "../../AppContext";
import { CalendarHeader } from "../../components/CalendarHeader";
import { useGuiSse } from '../../client/guiClient';
import { now, registerEachSecondHook, unregisterEachSecondHook } from '../../utils/now-hook';
import { EventSourceMessage } from "../../components/SseProvider";
import { CalendarDay, CalendarHour, ReservationDrivers, Selection, useWakeupSseCallback } from "./utils";
import { SelectionBox } from "./SelectionBox";
import { CarSharingBox } from "./CarSharingBox";
import { BlockBox } from "./BlockBox";
import { PassengerServiceBox } from "./PassengerServiceBox";

i18n.addResources('en', 'driver/planner', {
      "title.long": 'Planner',
      "title.short": 'Planner',
      "remaining": "Remaining hours:",
      "max-hours": "Largest reservation possible:",
      "no-remaining-hours_title": "Planning",
      "no-remaining-hours_msg": "The quota has been used up!",
      "max-reservations_title": "Planning",
      "max-reservations_msg": "The maximum number of car-sharing reservations is reached: {{value}}!",
      "conflicting-reservation_title": "Planning",
      "conflicting-reservation_msg": "This view is not up to date! Meanwhile there is a conflicting reservation. Please go back and reenter to refresh the view.",
      "conflicting-incoming_title": "Planning",
      "conflicting-incoming_msg": "Another driver created a conflicting reservation. Your selection was removed.",
      "parallel-carsharing_title": "Planning",
      "parallel-carsharing_msg": "You have another reservation in parallel for '{{value}}'!",
      "parallel-passengerservice_title": "Planning",
      "parallel-passengerservice_msg": "You are planned for passenger-service on '{{value}}' in parallel!",
      "date_format": "yyyy/mm/dd",
    });
i18n.addResources('de', 'driver/planner', {
      "title.long": 'Planer',
      "title.short": 'Planer',
      "remaining": "Verbleibende Stunden:",
      "max-hours": "Größtmögliche Reservierung:",
      "no-remaining-hours_title": "Planer",
      "no-remaining-hours_msg": "Dein Car-Sharing-Kontingent ist bereits aufgebraucht!",
      "max-reservations_title": "Planer",
      "max-reservations_msg": "Du hast bereits die maximale Anzahl an Car-Sharing-Reservierungen gebucht: {{value}}!",
      "conflicting-reservation_title": "Planer",
      "conflicting-reservation_msg": "Diese Ansicht ist nicht aktuell! Mittlerweile gibt es eine andere Reservierung in dieser Zeit. Bitte wechsle zur vorigen Ansicht steige neu ein, um die Ansicht zu aktualisieren.",
      "conflicting-incoming_title": "Planer",
      "conflicting-incoming_msg": "Ein(e) andere(r) Fahrer(in) hat eine Reservierung in der Zeit deiner Auswahl eingetragen, weshalb sie entfernt wurde.",
      "parallel-carsharing_title": "Planning",
      "parallel-carsharing_msg": "Du hast zeitgleich eine andere Car-Sharing-Reservierung für '{{value}}'!",
      "parallel-passengerservice_title": "Planning",
      "parallel-passengerservice_msg": "Du hast zeitgleich Fahrtendienst mit '{{value}}' eingetragen!",
      "date_format": "dd.mm.yyyy",
    });

const itemsBatchSize = 48;

interface DayVersions {
  [key: string /* YYYYMMdd + '_' + car.id */]: number
};

interface Restrictions {
  maxHours: number;
  remainingHours: number;
  allowPaidCarSharing: boolean;
};

const DayTable = memo<{
    dayVersion: number,
    drivers: ReservationDrivers,
    car: PlannerCar,
    days: CalendarDay[],
    day: CalendarDay,
    useSearch: boolean,
    selection: Selection,
    cancelSelection: (event: ReactMouseEvent) => void,
    acceptSelection: (event: ReactMouseEvent) => void,
    cancelReservation: (event: ReactMouseEvent, carId: string, reservationId: string) => void,
    mouseDownOnDrag: (event: ReactMouseEvent | TouchEvent, top: boolean) => void,
    mouseDownOnHour: (event: ReactMouseEvent, car: PlannerCar, hour: CalendarHour) => void,
    mouseEnterHour: (event: ReactMouseEvent | Event, car: PlannerCar, days: CalendarDay[], day: CalendarDay, hour: CalendarHour) => void,
    touchMove: (event: TouchEvent) => void,
    touchEnd: (event: TouchEvent) => void }>(
  ({ drivers, car, days, day, useSearch, selection, cancelSelection, acceptSelection, cancelReservation, mouseDownOnHour, mouseEnterHour, mouseDownOnDrag, touchMove, touchEnd }) => {

    const hours = day.hours[car.id];

    const dayColumns: ColumnConfig<any>[] = [ {
        property: '-not-used-but-mandatory-',
        sortable: false,
        render: (hour: CalendarHour) => {
            const hasSelection = (selection !== undefined)
                        && (selection.carId === car.id)
                        && (selection.startsAt.getTime() <= hour.startsAt.getTime())
                        && (selection.endsAt.getTime() >= hour.endsAt.getTime());
            
            const index = hours.indexOf(hour);
            
            const isFirstHourOfReservation =
                (hour.reservation?.startsAt.getTime() === hour.startsAt.getTime())
              || (hour.reservation && (index === 0));
            
            const isLastHourOfReservation =
                (hour.reservation?.endsAt.getTime() === hour.endsAt.getTime());
            
            return (
                <Box
                    id={ `${day.startsAt.toISOString().substring(0,10)}_${car.id}_${hour.startsAt.getHours() + 1}` }
                    direction="row"
                    fill
                    background={
                        hour.startsAt.getHours() % 2 === 0
                            ? (hour.endsAt.getTime() < now.getTime() ? 'dark-3' : 'white' )
                            : (hour.endsAt.getTime() < now.getTime() ? 'dark-2' : 'light-2' )
                      }
                    ref={ element => {
                        if (useSearch && (element?.id === document.location.search.substring(1))) {
                          element.scrollIntoView({ behavior: 'smooth' });
                        }
                        const handler = (event: Event) => {
                            if (hour.reservation) {
                              return;
                            }
                            mouseEnterHour(event, car, days, day, hour);
                          };
                        element?.addEventListener('custommouseover', handler);
                      } }
                    onMouseOver={ event => {
                        if (hour.reservation) {
                          event.preventDefault();
                          event.stopPropagation();
                          return;
                        }
                        mouseEnterHour(event, car, days, day, hour);
                      } }>
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
                      width="100%"
                      style={ {
                          position: 'relative',
                          minHeight: '100%'
                        } }
                      margin={ { horizontal: '1rem' }} >{
                    hasSelection
                        ? <SelectionBox
                                hour={ hour }
                                selection={ selection }
                                acceptSelection={ acceptSelection }
                                cancelSelection={ cancelSelection }
                                mouseDownOnDrag={ mouseDownOnDrag }
                                touchMove={ touchMove }
                                touchEnd={ touchEnd } />
                        : !Boolean(hour.reservation) || (hour.reservation!.status === 'CANCELLED')
                        ? undefined
                        : hour.reservation?.type === ReservationType.Cs
                        ? <CarSharingBox
                              hour={ hour }
                              car={ car }
                              isFirstHourOfReservation={ isFirstHourOfReservation }
                              isLastHourOfReservation={ isLastHourOfReservation }
                              drivers={ drivers }
                              cancelReservation={ cancelReservation }
                            />
                        : hour.reservation?.type === ReservationType.Block
                        ? <BlockBox
                              hour={ hour }
                              isFirstHourOfReservation={ isFirstHourOfReservation }
                              isLastHourOfReservation={ isLastHourOfReservation }
                            />
                        : hour.reservation?.type === ReservationType.Ps
                        ? <PassengerServiceBox
                              hour={ hour }
                              isFirstHourOfReservation={ isFirstHourOfReservation }
                              isLastHourOfReservation={ isLastHourOfReservation }
                              drivers={ drivers }
                            />
                        : undefined // add new reservation types here
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

    return (
        <Box
            id={ `${day.startsAt.toISOString().substring(0,10)}_${car.id}_0` }
            ref={ element => {
                 if (useSearch && (element?.id === document.location.search.substring(1))) {
                   element.scrollIntoView({ behavior: 'smooth' });
                 }
               } }>
        <DataTable
            fill
            pin
            pad={ { header: 'none', body: 'none' } }
            primaryKey={ false }
            style={ { tableLayout: 'fixed' } }
            columns={ dayColumns }
            data={ hours } />
        </Box>);
        
  }, (prev, next) => {
    return prev.dayVersion === next.dayVersion;
  });

const dayVersionKey = (time: Date, carId: string): string =>
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
    cars: Array<PlannerCar>
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
      plannerApi: PlannerApi,
      dayVersions: MutableRefObject<DayVersions>,
      updateDayVersions: (versions: DayVersions) => void,
      setEndDate: (endDate: Date) => void,
      startsAt: Date,
      endsAt: Date,
      days: Array<CalendarDay>,
      setDays: (hours: Array<CalendarDay>) => void,
      drivers: ReservationDrivers,
      setDrivers: (drivers: ReservationDrivers) => void,
      setRestrictions?: (restrictions: Restrictions) => void,
      setCars?: (cars: Array<PlannerCar>) => void,
    ) => {

  const calendar = await plannerApi.getPlannerCalendar({
      plannerCalendarRequest: { startsAt, endsAt }
    });

  if (setRestrictions) {
    setRestrictions({
        remainingHours: calendar.remainingHours!,
        maxHours: calendar.maxHours!,
        allowPaidCarSharing: calendar.allowPaidCarSharing
      });
  }
  if (setCars) {
    setCars(calendar.cars);
  }
  
  const newDays: Array<CalendarDay> = [];

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
      const numberOfReservations = car.reservations?.length || 0;
      let reservation: PlannerReservation | undefined = undefined;
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

const Planner = () => {
  
  const { t } = useTranslation('driver/planner');
  const { state, toast, setAppHeaderTitle, showLoadingIndicator } = useAppContext();
  const { isPhone, isNotPhone } = useResponsiveScreen();
  
  const wakeupSseCallback = useWakeupSseCallback();
  const carSharingApi = useCarSharingApi(wakeupSseCallback);
  const plannerApi = usePlannerApi(wakeupSseCallback);

  useLayoutEffect(() => {
    setAppHeaderTitle('driver/planner', false);
  }, [ setAppHeaderTitle ]);
  
  const [ dayVersions, _setDayVersions ] = useState<DayVersions>({});
  const dayVersionsRef = useRef(dayVersions);
  const updateDayVersions = (versions: DayVersions) => {
      const newVersions = { ...versions };
      dayVersionsRef.current = newVersions;
      _setDayVersions(newVersions);
    };
  
  const daySearchParam = document.location.search?.indexOf('_') || -1;
  const [ useSearch, setUseSearch ] = useState(true);
  const [ startsAt, _setStartsAt ] = useState<Date>(
      daySearchParam > 0
          ? new Date(document.location.search.substring(1, daySearchParam))
          : currentHour()
    );
  const setStartsAt = (dateInput: string|Date) => {
    let date: Date | undefined;
    if (dateInput === undefined) {
      date = undefined;
    } else if (typeof dateInput === 'string') {
      date = new Date(dateInput);
      date = new Date(date.getTime());
      if (date && (!(date instanceof Date) || isNaN(date.getTime()))) {
        return;
      }
    } else {
      date = dateInput;
    }
    setUseSearch(false);
    _setStartsAt(nextHours(date!, date!.getHours(), true));
    setDays(undefined);
    setRestrictions(undefined);
  };

  const [ endDate, setEndDate ] = useState<Date | undefined>(undefined);
  const [ days, _setDays]  = useState<Array<CalendarDay> | undefined>(undefined);
  const daysRef = useRef(days);
  const setDays = (d: Array<CalendarDay> | undefined) => {
      daysRef.current = d;
      _setDays(d);
    };
  const [ cars, setCars ] = useState<Array<PlannerCar> | undefined>(undefined);
  const [ drivers, _setDrivers ] = useState<ReservationDrivers | undefined>(undefined);
  const driversRef = useRef(drivers);
  const setDrivers = (d: ReservationDrivers) => {
      driversRef.current = d;
      _setDrivers(d);
    };
  const [ restrictions, _setRestrictions ] = useState<Restrictions | undefined>(undefined);
  const restrictionsRef = useRef(restrictions);
  const setRestrictions = useCallback((r: Restrictions | undefined) => {
      restrictionsRef.current = r;
      _setRestrictions(r);
    }, [ restrictionsRef, _setRestrictions ]);

  useEffect(() => {
      const initPlanner = async () => {
          if (restrictions === undefined) {
            showLoadingIndicator(true);
            const endsAt = nextHours(startsAt, (24 - startsAt.getHours()) + 24, false);
            await loadData(plannerApi, dayVersionsRef, updateDayVersions, setEndDate, startsAt, endsAt, days!, setDays, drivers!, setDrivers, setRestrictions, setCars);
            showLoadingIndicator(false);
            setTimeout(() => setUseSearch(false), 1000);
          }
        };
      initPlanner();
    }, [ plannerApi, days, restrictions, setRestrictions, drivers, startsAt, showLoadingIndicator ]);
  
  useEffect(() => {
      const rerenderPastHoursHook = (lastNow: Date) => {
          if (now.getHours() !== lastNow.getHours()) {
            increaseDayVersions(dayVersionsRef, now, cars!);
            updateDayVersions(dayVersionsRef.current);
          }
        };
      registerEachSecondHook(rerenderPastHoursHook);
      return () => unregisterEachSecondHook(rerenderPastHoursHook);
    }, [ cars ]);

  const [ _isMouseDown, setMouseIsDown ] = useState(false);
  const isMouseDown = useRef(_isMouseDown);
  const [ _selection, _setSelection ] = useState<Selection | undefined>(undefined);
  const selection = useRef(_selection);
  const setSelection = useCallback((s: Selection | undefined) => {
      selection.current = s;
      _setSelection(s);
      setUseSearch(false);
    }, [ _setSelection, selection, setUseSearch ]);
  
  const mouseDownOnDrag = useCallback((event: ReactMouseEvent | TouchEvent, top: boolean) => {
      if (isMouseDown.current) return;
      if (selection.current === undefined) return;
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
  const mouseDownOnHour = useCallback((event: ReactMouseEvent, car: PlannerCar, hour: CalendarHour) => {
      if (isMouseDown.current) return;
      if (hour.endsAt.getTime() < now.getTime()) return;
      event.preventDefault();
      if ((restrictionsRef.current!.remainingHours < 1)
          && !restrictionsRef.current!.allowPaidCarSharing) {
        toast({
            namespace: 'driver/car-sharing/booking',
            title: t('no-remaining-hours_title'),
            message: t('no-remaining-hours_msg'),
            status: 'warning'
          });
        return;
      }

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
  const mouseEnterHour = useCallback((event: ReactMouseEvent | Event, car: PlannerCar, days: CalendarDay[], day: CalendarDay, hour: CalendarHour) => {
      if (!isMouseDown.current) return;
      if (selection.current === undefined) return;
      if (car.id !== selection.current.carId) return;
      if (hour.endsAt.getTime() < now.getTime()) return;
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
              Math.min(restrictionsRef.current!.remainingHours, restrictionsRef.current!.maxHours),
              true);
          const indexOfStartsAt = indexOfHour
              + numberOfHoursBetween(selection.current.startsAt, hour.startsAt);
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
              Math.min(restrictionsRef.current!.remainingHours, restrictionsRef.current!.maxHours),
              false);
          const indexOfEndsAt = indexOfHour
              - numberOfHoursBetween(selection.current.endsAt, hour.endsAt);
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
      // minimize selection to start-hour or selection accross different days
      increaseDayVersion(dayVersionsRef, selection.current.startsAt, car.id);
      increaseDayVersion(dayVersionsRef, new Date(selection.current.endsAt.getTime() - 3600000), car.id);

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
  const lastMoveElement = useRef<Element | null>(null);
  const mouseMove = useCallback((event: MouseEvent) => {
      if (!isMouseDown.current) return;
      event.preventDefault();
      event.stopPropagation();
    }, [ isMouseDown ]);
  const touchMove = useCallback((event: TouchEvent) => {
      if (!isMouseDown.current) return;
      event.preventDefault();
      event.stopPropagation();
      const moveEvent = event as TouchEvent;
      const touch = moveEvent.touches[0];
      if (lastMoveElement.current !== undefined) {
        const elements = document
            .elementsFromPoint(touch.pageX, touch.pageY)
            .filter(e => Boolean(e.id));
        const element = elements.length > 0 ? elements[0] : undefined;
        if ((element !== undefined) && (lastMoveElement.current !== element)) {
          lastMoveElement.current = element;
          const mouseOverEvent = new CustomEvent('custommouseover', {
                bubbles: true,
                cancelable: false,
                detail: moveEvent,
              });
          element.dispatchEvent(mouseOverEvent);
        }
      } else {
        lastMoveElement.current = document.elementFromPoint(touch.pageX, touch.pageY);
      }
    }, [ isMouseDown ]);
  const mouseUp = useCallback(() => {
      isMouseDown.current = false;
      setMouseIsDown(false);
    }, [ setMouseIsDown ]);
  const touchEnd = useCallback(() => {
      mouseUp();
    }, [ mouseUp ]);
  const cancelSelection = useCallback((event: ReactMouseEvent) => {
      event.preventDefault();
      event.stopPropagation();

      for (let hour = selection.current!.startsAt.getTime()
          ; hour !== selection.current!.endsAt.getTime()
          ; hour += 3600000) {
        increaseDayVersion(dayVersionsRef, new Date(hour), selection.current!.carId);
      }
      updateDayVersions(dayVersionsRef.current);
      setSelection(undefined);

    }, [ setSelection, selection ]);
  
  const acceptSelection = useCallback((event: ReactMouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      const addPlannerReservation = async () => {
          try {
            showLoadingIndicator(true);
            await carSharingApi.addCarSharingReservation({
                carId: selection.current!.carId,
                addPlannerReservation: {
                  driverMemberId: state.currentUser!.memberId!,
                  startsAt: selection.current!.startsAt,
                  endsAt: selection.current!.endsAt,
                  type: ReservationType.Cs,
                }
              });
            // selection will be cancelled by server-sent update
          } catch (error) {
            showLoadingIndicator(false);
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
              Object
                  .keys(violations)
                  .forEach(violation => {
                      toast({
                          namespace: 'driver/car-sharing/booking',
                          title: t(`${violation}_title`),
                          message: t(`${violation}_msg`, { value: violations[violation] }),
                          status: 'critical'
                        });
                  });
            }
          } 
        };
      addPlannerReservation();
    }, [ carSharingApi, t, toast, selection, state.currentUser, showLoadingIndicator ]);
  
  const cancelReservation = useCallback((event: ReactMouseEvent, carId: string, reservationId: string) => {
      event.preventDefault();
      event.stopPropagation();
      const removePlannerReservation = async () => {
          try {
            showLoadingIndicator(true);
            await carSharingApi.cancelCarSharingReservation({
                carId,
                reservationId,
              });
            // selection will be cancelled by server-sent update
          } catch (error) {
            console.log(error);
            showLoadingIndicator(false);
          } 
        };
      removePlannerReservation();
    }, [ carSharingApi, showLoadingIndicator ]);
  
  useEffect(() => {
      window.addEventListener('mouseup', mouseUp);
      window.addEventListener('mousemove', mouseMove);
      return () => {
          window.removeEventListener('mouseup', mouseUp);
          window.removeEventListener('mousemove', mouseMove);
        };
    }, [ mouseUp, mouseMove ]);
  
  const updateReservations = useMemo(
    () => async (ev: EventSourceMessage<ReservationEvent>) =>
      {
        const startsAt = new Date(ev.data.startsAt);
        const endsAt = new Date(ev.data.endsAt);
        const midnightOfStartsAtDay = new Date(startsAt.getFullYear(), startsAt.getMonth(), startsAt.getDate());
        const updateStartsAt = midnightOfStartsAtDay.getTime() < daysRef.current![0].startsAt.getTime() ? daysRef.current![0].startsAt : midnightOfStartsAtDay;
        const updateEndsAt = nextHours(endsAt, 24 - endsAt.getHours(), false);
        
        debounceByKey(
            `Reservation#${updateStartsAt.toString()}-${updateEndsAt.toString()}`,
            async () => {
                await loadData(plannerApi, dayVersionsRef, updateDayVersions, setEndDate, updateStartsAt, updateEndsAt, daysRef.current!, setDays, driversRef.current!, setDrivers, setRestrictions);
                showLoadingIndicator(false);
              }
          );
        
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
          if (ev.data.driverMemberId !== state.currentUser!.memberId) {
            toast({
                namespace: 'driver/car-sharing/booking',
                title: t('conflicting-incoming_title'),
                message: t('conflicting-incoming_msg'),
                status: 'warning'
              });
          }
          setSelection(undefined);
        }
      },
    [ plannerApi, setRestrictions, setSelection, state.currentUser, t, toast, showLoadingIndicator ]);
    
  wakeupSseCallback.current = useGuiSse<ReservationEvent>(
      updateReservations,
      /^Reservation$/
    );

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
                  key={ day.startsAt.toISOString() }
                  dayVersion={ dayVersion }
                  drivers={ drivers! }
                  days={ days! }
                  day={ day }
                  car={ car }
                  useSearch={ useSearch }
                  selection={ selection.current! }
                  cancelSelection={ cancelSelection }
                  acceptSelection={ acceptSelection }
                  cancelReservation={ cancelReservation }
                  mouseDownOnDrag={ mouseDownOnDrag }
                  mouseDownOnHour={ mouseDownOnHour }
                  mouseEnterHour={ mouseEnterHour }
                  touchMove={ touchMove }
                  touchEnd={ touchEnd } />;
            },
          header: car.name,
        }));
        
  const loadMore = async () => {
    if (days === undefined) return;
    if (days.length === 0) return;
    const day = days[ days.length - 1 ];
    if (!day) return;
    const startsAt = endDate!;
    const endsAt = nextHours(startsAt, itemsBatchSize, false);
    await loadData(plannerApi, dayVersionsRef, updateDayVersions, setEndDate, startsAt, endsAt, days, setDays, drivers!, setDrivers, setRestrictions);
  };
  
  const headerHeight = '3rem';
  const phoneMargin = '10vw';
  
  const currentRemainingHours = restrictions === undefined
      ? '-'
      : (restrictions.remainingHours - (selection.current !== undefined ? numberOfHoursBetween(selection.current.endsAt, selection.current.startsAt) : 0));
  
  return (
      <Box
          fill>
        <Box
            direction="row"
            align="center"
            justify="center"
            background='dark-3'
            gap='large'
            pad={ { top: 'medium', bottom: 'small', horizontal: 'medium' } }>
          <Box
              direction="row"
              gap="small"
              justify="center">
            <DocumentTime />
            <>{
              isNotPhone
                  ? t('remaining')
                  : undefined
            }</>
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
          </Box>
          <Box
              direction="row"
              gap="small"
              justify="center">
            <Contract />
            <>{
              isNotPhone
                  ? t('max-hours')
                  : undefined
            }</>
            <Text
                weight='bold'>
              &nbsp;{ restrictions === undefined ? '-' : restrictions.maxHours }h
            </Text>
          </Box>
          <Box
              style={ { minHeight: 'auto' } }
              width={ isPhone ? "50%" : 'small' }
              gap="medium">
            <DateInput
                format={ t('date_format') }
                value={ startsAt.toISOString() }
                onChange={ ({ value }) => setStartsAt(value as string) }
                icon={ <History /> }
                dropProps={ {
                    align: { top: "bottom", right: "right" },
                    background: 'white',
                    pad: isPhone ? 'medium' : 'small',
                    width: isPhone ? '90%' : '25rem',
                    height: isPhone ? '50%' : '25rem',
                    responsive: true
                  } }
                calendarProps={ {
                    fill: true,
                    animate: false,
                    header: props => CalendarHeader({ ...props, showRange: false, setDate: setStartsAt }),
// @ts-ignore
                    children: ({ day, date, isSelected }) => (
                        <Box
                            fill
                            background={
                                isSelected
                                    ? 'brand'
                                    : date.getMonth() !== now.getMonth()
                                    ? 'light-2'
                                    : (date.getMonth() === now.getMonth() && date.getDate() === now.getDate())
                                    ? { color: 'accent-3', opacity: 'medium' }
                                    : 'white'
                                  }>
                          <Box
                              align="center"
                              justify="center"
                              fill>
                            <Text
                                size="medium">
                              { day }
                            </Text>
                          </Box>
                        </Box>
                      )
                  } } />
          </Box>
        </Box>
        <SnapScrollingDataTable
            headerHeight={ headerHeight }
            phoneMargin={ phoneMargin }
            primaryKey={ false }
            columns={ carColumns }
            step={ 2 }
            onMore={ loadMore }
            data={ days }
            replace={ true } />
      </Box>);
      
};

export { Planner };
