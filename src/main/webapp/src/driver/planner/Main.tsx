import { Box, ColumnConfig, DataTable, DateInput, Text, TextArea } from "grommet";
import { Car, Contract, DocumentTime, Halt, History, MapLocation, Troubleshoot } from "grommet-icons";
import {
  memo,
  MouseEvent as ReactMouseEvent,
  MutableRefObject,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { useTranslation } from "react-i18next";
import { useAppContext } from "../../AppContext";
import { PlannerApi, PlannerCar, PlannerReservation, ReservationEvent, ReservationType } from "../../client/gui";
import { useGuiSse } from '../../client/guiClient';
import { CalendarHeader } from "../../components/CalendarHeader";
import { Modal } from "../../components/Modal";
import { SnapScrollingDataTable } from '../../components/SnapScrollingDataTable';
import { EventSourceMessage } from "../../components/SseProvider";
import i18n from '../../i18n';
import { debounceByKey } from '../../utils/debounce';
import { now, registerEachSecondHook, unregisterEachSecondHook } from '../../utils/now-hook';
import useResponsiveScreen from '../../utils/responsiveUtils';
import { currentHour, nextHours, numberOfHoursBetween } from '../../utils/timeUtils';
import {
  useBlockingApi,
  useCarSharingApi,
  useMaintenanceApi,
  usePassengerServiceApi,
  usePlannerApi
} from '../DriverAppContext';
import { BlockingBox } from "./BlockingBox";
import { CarSharingBox } from "./CarSharingBox";
import { PassengerServiceBox } from "./PassengerServiceBox";
import { SelectionBox } from "./SelectionBox";
import {
  CalendarDay,
  CalendarHour,
  ReservationDrivers,
  Selection,
  SelectionAction,
  useWakeupSseCallback
} from "./utils";
import { MaintenanceBox } from "./MaintenanceBox";

i18n.addResources('en', 'driver/planner', {
      "title.long": 'Planner',
      "title.short": 'Planner',
      "remaining": "Remaining hours:",
      "max-hours": "Largest reservation possible:",
      "date_format": "yyyy/mm/dd",
      "blocking-create-header": "Blocking reservation",
      "blocking-create-reason": "Reason for blocking this period:",
      "blocking-create-abort": "Abort",
      "blocking-create-submit": "Block period",
      "passengerservice-create-header": "Passenger service reservation",
      "passengerservice-create-reason": "Reason for this extra passenger service:",
      "passengerservice-create-abort": "Abort",
      "passengerservice-create-submit": "Create Reservation",
      "maintenance-create-header": "Maintenance reservation",
      "maintenance-create-reason": "Reason for this maintenance:",
      "maintenance-create-abort": "Abort",
      "maintenance-create-submit": "Create Reservation",
      "create-carsharing": "Car-Sharing",
      "create-passengerservice": "Passenger Service",
      "create-maintenance": "Maintenance",
      "create-blocking": "Blocker",
    });
i18n.addResources('de', 'driver/planner', {
      "title.long": 'Planer',
      "title.short": 'Planer',
      "remaining": "Verbleibende Stunden:",
      "max-hours": "Größtmögliche Reservierung:",
      "date_format": "dd.mm.yyyy",
      "blocking-create-header": "Blockende Reservierung",
      "blocking-create-reason": "Grund für das Blockieren des Zeitraums:",
      "blocking-create-abort": "Abbrechen",
      "blocking-create-submit": "Zeitraum blockieren",
      "passengerservice-create-header": "Fahrtendienstreservierung",
      "passengerservice-create-reason": "Grund für diesen extra Fahrtendienst:",
      "passengerservice-create-abort": "Abbrechen",
      "passengerservice-create-submit": "Reservierung anlegen",
      "maintenance-create-header": "Wartungsreservierung",
      "maintenance-create-reason": "Grund für die Wartungsfahrt:",
      "maintenance-create-abort": "Abbrechen",
      "maintenance-create-submit": "Reservierung anlegen",
      "create-carsharing": "Car-Sharing",
      "create-passengerservice": "Fahrtendienst",
      "create-maintenance": "Wartung",
      "create-blocking": "Blocker",
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
    acceptSelection: (indexOfSelectionAction: number) => void,
    activateSelection: (reservation: PlannerReservation, ownerId: number | null | undefined, carId: string, actions: Array<SelectionAction>) => void,
    cancelSelection: () => void,
    mouseDownOnDrag: (event: ReactMouseEvent | TouchEvent, top: boolean) => void,
    mouseDownOnHour: (event: ReactMouseEvent, car: PlannerCar, hour: CalendarHour) => void,
    mouseEnterHour: (event: ReactMouseEvent | Event, car: PlannerCar, days: CalendarDay[], day: CalendarDay, hour: CalendarHour) => void,
    touchMove: (event: TouchEvent) => void,
    touchEnd: (event: TouchEvent) => void }>(
  ({ drivers, car, days, day, useSearch, selection, activateSelection, cancelSelection, acceptSelection, mouseDownOnHour, mouseEnterHour, mouseDownOnDrag, touchMove, touchEnd }) => {

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
                            if (hour.reservation && (selection?.editingReservation !== hour.reservation.id)) {
                              return;
                            }
                            mouseEnterHour(event, car, days, day, hour);
                          };
                        element?.addEventListener('custommouseover', handler);
                      } }
                    onMouseOver={ event => {
                        if (hour.reservation && (selection?.editingReservation !== hour.reservation.id)) {
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
                                drivers={ drivers }
                                acceptSelection={ acceptSelection }
                                cancelSelection={ cancelSelection }
                                mouseDownOnDrag={ mouseDownOnDrag }
                                touchMove={ touchMove }
                                touchEnd={ touchEnd } />
                        : !Boolean(hour.reservation) || (hour.reservation!.status === 'CANCELLED') || (hour.reservation!.id === selection?.editingReservation)
                        ? undefined
                        : hour.reservation?.type === ReservationType.Cs
                        ? <CarSharingBox
                              hour={ hour }
                              car={ car }
                              isFirstHourOfReservation={ isFirstHourOfReservation }
                              isLastHourOfReservation={ isLastHourOfReservation }
                              drivers={ drivers }
                              activateSelection={ activateSelection }
                              cancelSelection={ cancelSelection }
                            />
                        : hour.reservation?.type === ReservationType.Block
                        ? <BlockingBox
                              hour={ hour }
                              car={ car }
                              isFirstHourOfReservation={ isFirstHourOfReservation }
                              isLastHourOfReservation={ isLastHourOfReservation }
                              activateSelection={ activateSelection }
                              cancelSelection={ cancelSelection }
                            />
                        : hour.reservation?.type === ReservationType.M
                            ? <MaintenanceBox
                                hour={ hour }
                                car={ car }
                                isFirstHourOfReservation={ isFirstHourOfReservation }
                                isLastHourOfReservation={ isLastHourOfReservation }
                                activateSelection={ activateSelection }
                                cancelSelection={ cancelSelection }
                            />
                        : hour.reservation?.type === ReservationType.Ps
                        ? <PassengerServiceBox
                              car={ car }
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

const increaseDayVersions = (
    dayVersions: MutableRefObject<DayVersions>,
    time: Date,
    cars: Array<PlannerCar>
  ) => {
    cars.forEach(car => increaseDayVersion(dayVersions, time, car.id));
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

const AcceptSelectionModal = ({
  selection,
  indexOfAction,
  onAbort,
  onAccept
}: {
  selection: Selection | undefined,
  indexOfAction: number,
  onAbort: () => void,
  onAccept: () => void,
}) => {
  const [ modalComment, setModalComment ] = useState<string | undefined>(undefined);
  const { isPhone } = useResponsiveScreen();

  if (indexOfAction === -1) return undefined;

  return (
      <Modal
          show={ true }
          t={ selection.actions[indexOfAction].modalT }
          header={ `${selection.actions[indexOfAction].modalTPrefix}-header` }
          abort={ () => {
            setModalComment('');
            onAbort();
          } }
          abortLabel={ `${selection.actions[indexOfAction].modalTPrefix}-abort` }
          action={ () => {
            selection.actions[indexOfAction].action(
                selection.startsAt,
                selection.endsAt,
                modalComment);
            setModalComment('');
            onAccept();
          } }
          actionLabel={ `${selection.actions[indexOfAction].modalTPrefix}-submit` }
          actionDisabled={ !Boolean(modalComment) }>
        <Box
            key={ `${indexOfAction}` }
            direction="column"
            pad={ { vertical: isPhone ? 'large' : 'small' } }
            gap={ isPhone ? 'medium' : 'small' }>
          {
              selection.actions[indexOfAction].modalT
              && selection.actions[indexOfAction].modalT(`${selection.actions[indexOfAction].modalTPrefix}-reason`)
          }
          <TextArea
              value={ modalComment }
              autoFocus
              onChange={ event => setModalComment(event.target.value) }
          />
        </Box>
      </Modal>);

}

const typeNsMapping = {
  'CS': 'car-sharing',
  'BLOCK': 'blocking',
  'PS': 'passenger-service',
};

const Planner = () => {
  
  const { t } = useTranslation('driver/planner');
  const { state, toast, setAppHeaderTitle, showLoadingIndicator } = useAppContext();
  const { isPhone, isNotPhone } = useResponsiveScreen();
  
  const wakeupSseCallback = useWakeupSseCallback();
  const carSharingApi = useCarSharingApi(wakeupSseCallback);
  const blockingApi = useBlockingApi(wakeupSseCallback);
  const maintenanceApi = useMaintenanceApi(wakeupSseCallback);
  const passengerServiceApi = usePassengerServiceApi(wakeupSseCallback);
  const plannerApi = usePlannerApi(wakeupSseCallback);

  const addReservation = useCallback(
      async (type: ReservationType, comment?: string) => {
        const ns = typeNsMapping[type];
        try {
          showLoadingIndicator(true);
          if (type === ReservationType.Cs) {
            await carSharingApi.addCarSharingReservation({
              carId: selection.current!.carId,
              addPlannerReservation: {
                type,
                driverMemberId: state.currentUser!.memberId!,
                startsAt: selection.current!.startsAt,
                endsAt: selection.current!.endsAt,
                comment,
              }
            });
          } else if (type === ReservationType.Block) {
            await blockingApi.addBlockingReservation({
              carId: selection.current!.carId,
              addPlannerReservation: {
                type,
                startsAt: selection.current!.startsAt,
                endsAt: selection.current!.endsAt,
                comment,
              }
            });
          } else if (type === ReservationType.M) {
            await maintenanceApi.addMaintenanceReservation({
              carId: selection.current!.carId,
              addPlannerReservation: {
                type,
                startsAt: selection.current!.startsAt,
                endsAt: selection.current!.endsAt,
                comment,
              }
            });
          } else if (type === ReservationType.Ps) {
            await passengerServiceApi.addShift({
              carId: selection.current!.carId,
              addPlannerReservation: {
                type,
                startsAt: selection.current!.startsAt,
                endsAt: selection.current!.endsAt,
                comment,
              }
            });
          }
          // selection will be cancelled by server-sent update
        } catch (error) {
          showLoadingIndicator(false);
          // CONFLICT means there is another reservation
          if (error.response?.status === 409) {
            toast({
              namespace: `driver/planner/${ns}`,
              title: 'conflicting-reservation_title',
              message: 'conflicting-reservation_msg',
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
                    namespace: `driver/planner/${ns}`,
                    title: `${violation}_title`,
                    message: `${violation}_msg`,
                    tOptions: { value: violations[violation] },
                    status: 'critical'
                  });
                });
          }
        }
      },
      [ state.currentUser, carSharingApi, showLoadingIndicator, toast, blockingApi, passengerServiceApi, maintenanceApi ]);

  useLayoutEffect(() => {
    setAppHeaderTitle('driver/planner', false);
  }, [ setAppHeaderTitle ]);
  
  const [ dayVersions, _setDayVersions ] = useState<DayVersions>({});
  const dayVersionsRef = useRef(dayVersions);
  const updateDayVersions = useCallback((versions: DayVersions) => {
      const newVersions = { ...versions };
      dayVersionsRef.current = newVersions;
      _setDayVersions(newVersions);
    }, [ _setDayVersions ]);
  
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
    }, [ plannerApi, days, restrictions, setRestrictions, drivers, startsAt, showLoadingIndicator, updateDayVersions ]);
  
  useEffect(() => {
      const rerenderPastHoursHook = (lastNow: Date) => {
          if (now.getHours() !== lastNow.getHours()) {
            increaseDayVersions(dayVersionsRef, now, cars!);
            updateDayVersions(dayVersionsRef.current);
          }
        };
      registerEachSecondHook(rerenderPastHoursHook);
      return () => unregisterEachSecondHook(rerenderPastHoursHook);
    }, [ cars, updateDayVersions ]);

  const [ _isMouseDown, setMouseIsDown ] = useState(false);
  const isMouseDown = useRef(_isMouseDown);
  const [ _selection, _setSelection ] = useState<Selection | undefined>(undefined);
  const selection = useRef(_selection);
  const setSelection = useCallback((s: Selection | undefined) => {
      selection.current = s;
      _setSelection(s);
      setUseSearch(false);
    }, [ _setSelection, selection, setUseSearch ]);
  const increaseDayVersionsOfSelection = useCallback(() => {
      if (selection.current !== undefined) {
        for (let hour = selection.current.startsAt.getTime()
            ; hour !== selection.current.endsAt.getTime()
            ; hour += 3600000) {
          increaseDayVersion(dayVersionsRef, new Date(hour), selection.current.carId);
        }
      }
    }, [ selection ]);
  const activateSelection = useCallback((
      reservation: PlannerReservation,
      ownerId: number | null | undefined,
      carId: string,
      actions?: Array<SelectionAction>,
    ) => {
      if (isMouseDown.current) return;
      increaseDayVersionsOfSelection();
      const s: Selection = {
        startedAtStarts: reservation.startsAt,
        startedAtEnds: reservation.endsAt,
        startsAt: reservation.startsAt,
        endsAt: reservation.endsAt,
        carId: carId,
        ownerId: ownerId,
        editingReservation: reservation.id,
        actions: actions,
      };
      setSelection(s);
      // minimize selection to start-hour or selection across different days
      for (let hour = selection.current!.startsAt.getTime()
          ; hour !== selection.current!.endsAt.getTime()
          ; hour += 3600000) {
        increaseDayVersion(dayVersionsRef, new Date(hour), selection.current!.carId);
      }
      updateDayVersions(dayVersionsRef.current);
    }, [ setSelection, updateDayVersions, increaseDayVersionsOfSelection ]);

  const mouseDownOnDrag = useCallback((event: ReactMouseEvent | TouchEvent, top: boolean) => {
      if (isMouseDown.current) return;
      if (selection.current === undefined) return;
      event.preventDefault();
      event.stopPropagation();
      const s: Selection = {
          startedAtStarts: top ? selection.current.endsAt : selection.current.startsAt,
          startedAtEnds: top ? selection.current.endsAt : selection.current.startsAt,
          startsAt: selection.current.startsAt,
          endsAt: selection.current.endsAt,
          carId: selection.current.carId,
          ownerId: selection.current.ownerId,
          editingReservation: selection.current.editingReservation,
          actions: selection.current.actions,
        };
      setSelection(s);
      isMouseDown.current = true;
      setMouseIsDown(true);
    }, [ setMouseIsDown, setSelection ]);
  const mouseDownOnHour = useCallback((event: ReactMouseEvent, car: PlannerCar, hour: CalendarHour) => {
      if (isMouseDown.current) return;
      if (hour.endsAt.getTime() < now.getTime()) return;
      event.preventDefault();
      const isAdmin = state.currentUser.roles.includes("ADMIN")
          || state.currentUser.roles.includes("MANAGER")
      if (!isAdmin
          && (restrictionsRef.current!.remainingHours < 1)
          && !restrictionsRef.current!.allowPaidCarSharing) {
        toast({
            namespace: 'driver/planner/car-sharing',
            title: t('no-remaining-hours_title'),
            message: t('no-remaining-hours_msg'),
            status: 'warning'
          });
        return;
      }

      const actions: Array<SelectionAction> =
          isAdmin
              ? [
                  {
                    action: () => addReservation(ReservationType.Cs),
                    icon: Car,
                    altText: t('create-carsharing'),
                  },
                  {
                    action: (_startsAt, _endsAt, comment) => addReservation(ReservationType.Ps, comment),
                    icon: MapLocation,
                    iconBackground: 'brand',
                    altText: t('create-passengerservice'),
                    modalTPrefix: 'passengerservice-create',
                    modalT: t
                  },
                  {
                    action: (_startsAt, _endsAt, comment) => addReservation(ReservationType.M, comment),
                    icon: Troubleshoot,
                    iconBackground: 'blue',
                    altText: t('create-maintenance'),
                    modalTPrefix: 'maintenance-create',
                    modalT: t
                  },
                  {
                    action: (_startsAt, _endsAt, comment) => addReservation(ReservationType.Block, comment),
                    icon: Halt,
                    iconBackground: 'dark-4',
                    altText: t('create-blocking'),
                    modalTPrefix: 'blocking-create',
                    modalT: t
                  },
                ]
              : [ {
                    action: () => addReservation(ReservationType.Cs)
                } ];

      increaseDayVersionsOfSelection();
      increaseDayVersion(dayVersionsRef, hour.startsAt, car.id);
      increaseDayVersion(dayVersionsRef, hour.endsAt, car.id);
      updateDayVersions(dayVersionsRef.current);
      const s: Selection = {
          startedAtStarts: hour.startsAt,
          startedAtEnds: hour.endsAt,
          startsAt: hour.startsAt,
          endsAt: hour.endsAt,
          carId: car.id,
          ownerId: isAdmin ? null : undefined,
          actions
        };
      setSelection(s);
      isMouseDown.current = true;
      setMouseIsDown(true);
    }, [ setMouseIsDown, t, toast, setSelection, updateDayVersions, increaseDayVersionsOfSelection, addReservation, state.currentUser.roles ]);

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
              restrictionsRef.current!.allowPaidCarSharing ? restrictionsRef.current!.maxHours : Math.min(restrictionsRef.current!.remainingHours, restrictionsRef.current!.maxHours),
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
            if (hourToTest.reservation &&
                (hourToTest.reservation.id !== selection.current.editingReservation)) break;
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
              restrictionsRef.current!.allowPaidCarSharing ? restrictionsRef.current!.maxHours : Math.min(restrictionsRef.current!.remainingHours, restrictionsRef.current!.maxHours),
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
            if (hourToTest.reservation &&
                (hourToTest.reservation.id !== selection.current.editingReservation)) break;
            endsAt = nextHours(selection.current.endsAt, i, false);
          }
        }
        increaseDayVersion(dayVersionsRef, new Date(selection.current.endsAt.getTime() - 3600000), car.id);
        increaseDayVersion(dayVersionsRef, endsAt, car.id);
      }
      // minimize selection to start-hour or selection across different days
      increaseDayVersion(dayVersionsRef, selection.current.startsAt, car.id);
      increaseDayVersion(dayVersionsRef, new Date(selection.current.endsAt.getTime() - 3600000), car.id);

      updateDayVersions(dayVersionsRef.current);
      const s: Selection = {
          startedAtStarts: selection.current.startedAtStarts,
          startedAtEnds: selection.current.startedAtEnds,
          startsAt,
          endsAt,
          carId: car.id,
          ownerId: selection.current.ownerId,
          editingReservation: selection.current.editingReservation,
          actions: selection.current.actions,
        };
      setSelection(s);
  }, [ isMouseDown, setSelection, selection, updateDayVersions ]);

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
  const cancelSelection = useCallback(() => {
      if (selection.current === undefined) {
        return;
      }
      for (let hour = selection.current!.startsAt.getTime()
          ; hour !== selection.current!.endsAt.getTime()
          ; hour += 3600000) {
        increaseDayVersion(dayVersionsRef, new Date(hour), selection.current!.carId);
      }
      updateDayVersions(dayVersionsRef.current);
      setSelection(undefined);
    }, [ setSelection, selection, updateDayVersions ]);

  const [ showAcceptModal, setShowAcceptModal ] = useState(-1);
  const acceptSelection = useCallback((indexOfSelectionAction: number) => {
      if (selection.current!.actions[indexOfSelectionAction].modalTPrefix === undefined) {
        selection.current!.actions[indexOfSelectionAction].action(
            selection.current!.startsAt,
            selection.current!.endsAt);
        cancelSelection();
        return;
      }
      setShowAcceptModal(indexOfSelectionAction);
    }, [ selection, setShowAcceptModal, cancelSelection ]);

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

        debounceByKey(
            `Reservation#${ev.data.id}`,
            async () => {
                const oldReservations = daysRef.current?.map(day => day.hours)
                    .flatMap(cars => Object
                        .keys(cars)
                        .map(carId => ({
                          carId,
                          reservations: cars[carId].map(hour => hour.reservation).filter(r => r && r.id === ev.data.id)
                        }))
                        .filter(reservation => reservation.reservations.length > 0)
                        .map(reservation => ({ carId: reservation.carId, ...reservation.reservations[0] }))
                    );
                let updateStartsAt = oldReservations.length > 0 && oldReservations[0].startsAt.getTime() < startsAt.getTime()
                    ? oldReservations[0].startsAt
                    : startsAt;
                let updateEndsAt = oldReservations.length > 0 && oldReservations[0].endsAt.getTime() > endsAt.getTime()
                    ? oldReservations[0].endsAt
                    : endsAt;
                const midnightOfStartsAtDay = new Date(updateStartsAt.getFullYear(), updateStartsAt.getMonth(), updateStartsAt.getDate());
                const loadDataStartsAt = midnightOfStartsAtDay.getTime() < daysRef.current![0].startsAt.getTime() ? daysRef.current![0].startsAt : midnightOfStartsAtDay;
                const loadDataEndsAt = nextHours(updateEndsAt, 24 - updateEndsAt.getHours(), false);
                await loadData(plannerApi, dayVersionsRef, updateDayVersions, setEndDate, loadDataStartsAt, loadDataEndsAt, daysRef.current!, setDays, driversRef.current!, setDrivers, setRestrictions);
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
                namespace: 'driver/planner/car-sharing',
                title: t('conflicting-incoming_title'),
                message: t('conflicting-incoming_msg'),
                status: 'warning'
              });
          }
          setSelection(undefined);
        }
      },
    [ plannerApi, setRestrictions, setSelection, state.currentUser, t, toast, showLoadingIndicator, updateDayVersions ]);
    
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
                  activateSelection={ activateSelection }
                  cancelSelection={ cancelSelection }
                  acceptSelection={ acceptSelection }
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
        <AcceptSelectionModal
            selection={ selection.current }
            indexOfAction={ showAcceptModal }
            onAccept={ () => {
                setShowAcceptModal(-1);
                cancelSelection();
              } }
            onAbort={ () => {
                setShowAcceptModal(-1);
                cancelSelection();
              } } />
      </Box>);
      
};

export { Planner };
