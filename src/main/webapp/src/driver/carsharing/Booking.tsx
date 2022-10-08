import { Box, ColumnConfig, DataTable, Text } from "grommet";
import { useTranslation } from "react-i18next";
import i18n from '../../i18n';
import useResponsiveScreen from '../../utils/responsiveUtils';
import { currentHour, nextHours } from '../../utils/timeUtils';
import { SnapScrollingDataTable } from '../../components/SnapScrollingDataTable';
import { useCarSharingApi } from '../DriverAppContext';
import { CarSharingApi, CarSharingCar, CarSharingReservation } from "../../client/gui";
import { useEffect, useState } from "react";

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
    
  const carColumnSize = isPhone ? '70vw' : '200px';
  const carColumns: ColumnConfig<any>[] = !cars
      ? []
      : cars?.map(car => ({
          property: car.id,
          size: carColumnSize,
          render: (day: CalendarDay) => {
              const dayColumns: ColumnConfig<any>[] = [ {
                  property: '-not-used-but-mandatory-',
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
                      return (
                          <Box
                              direction="row"
                              fill>
                            <Box
                                align="end"
                                pad='4px'
                                width="2rem">{
                              hour.startsAt.getHours()
                            }</Box>
                            <Box
                                width="100%"
                                pad={ {
                                    horizontal: 'small',
                                    top: hasTopBorder ? undefined : '1px',
                                    bottom: hasBottomBorder ? undefined : '1px',
                                  } }
                                border={ borders }
                                style={ { minHeight: '100%' } }
                                margin={ { horizontal: '1rem' }}
                                background={ hour.reservation ? 'light-4' : undefined }>
                              <Text
                                  truncate='tip'>{
                                hour.reservation?.startsAt.getTime() === hour.startsAt.getTime()
                                    ? t(`reservation-type_${hour.reservation.type}`)
                                    : undefined
                              }</Text>
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
              const hours = day.hours[car.id];
              return <DataTable
                  fill
                  pin
                  pad={ { header: 'none', body: 'none' } }
                  primaryKey={ false }
                  background={ { body: ["white", "light-2"] } }
                  sort={ { property: 'nothing', direction: "asc", external: true } }
                  columns={ dayColumns }
                  data={ hours } />;
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
          step={ 1 }
          sort={ { property: 'nothing', direction: "asc", external: true } }
          onMore={ loadMore }
          data={ days }
          replace={ true } />);
      
};

export { Booking };
