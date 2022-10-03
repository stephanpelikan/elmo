import { Box, ColumnConfig, Tag } from "grommet";
import { useTranslation } from "react-i18next";
import i18n from '../../i18n';
import useResponsiveScreen from '../../utils/responsiveUtils';
import { currentHour, nextHours } from '../../utils/timeUtils';
import { SnapScrollingDataTable } from '../../components/SnapScrollingDataTable';
import { useCarSharingApi } from '../DriverAppContext';
import { CarSharingApi, CarSharingCar, CarSharingReservation } from "../../client/gui";
import { useEffect, useRef, useState } from "react";

i18n.addResources('en', 'driver/carsharing/booking', {
      "loading": "loading...",
    });
i18n.addResources('de', 'driver/carsharing/booking', {
      "loading": "Lade Daten...",
    });

const itemsBatchSize = 30;

interface CalendarHour {
  index: number;
  startsAt: Date;
  endsAt: Date;
  reservation: CarSharingReservation | undefined;
};

interface DateMarkerElement {
  id: string;
  index: number;
  prev: string;
  next: string;
  offsetTop: number;
  height: number;
}

const loadData = async (
      carSharingApi: CarSharingApi,
      startsAt: Date,
      endsAt: Date,
      history: boolean,
      hours: Array<CalendarHour>,
      setHours: (hours: Array<CalendarHour>) => void,
      setCars: (cars: Array<CarSharingCar>) => void | undefined,
    ) => {

  const calendar = await carSharingApi.getCarSharingCalendar({
      carSharingCalendarRequest: {
        startsAt,
        endsAt,
        history
      }
    });
  
  if (setCars) {
    setCars(calendar.cars);
  }
  
  const newHours = [];

  const currentHour = { at: startsAt };
  while (currentHour.at.getTime() !== endsAt.getTime()) {
    
    const nextHour = nextHours(currentHour.at, 1, history);
    
    const hour = {};
    calendar.cars.forEach((car, index) => {
      const item: CalendarHour = {
        index,
        startsAt: currentHour.at,
        endsAt: nextHour,
        reservation: undefined,
      };
      hour[car.id] = item;
    });
    newHours.push(hour);
    
    currentHour.at = nextHour;
    
  }
  
  if (hours) {
    setHours([ ...hours, ...newHours ]);
  } else {
    setHours(newHours);
  }
  
};

const Booking = () => {
  
  const { t } = useTranslation('driver/carsharing/booking');
  const { isPhone } = useResponsiveScreen();
  const carSharingApi = useCarSharingApi();

  const [ hours, setHours ] = useState(undefined);
  const [ cars, setCars ] = useState<Array<CarSharingCar>>(undefined);
  //const [ history, setHistory ] = useState(false);
  const history = false;
  //const [ dateMarkers, setDateMarkers ] = useState({});
  const tableRef = useRef<HTMLDivElement>();
  const dateMarkers = {};
  
  useEffect(() => {
    if (hours === undefined) {
      const startsAt = currentHour(history);
      const endsAt = nextHours(startsAt, itemsBatchSize, history);
      loadData(carSharingApi, startsAt, endsAt, history, hours, setHours, setCars);
    }
  }, [ carSharingApi, hours, setHours, history ]);

  const moveDateMarkers = (event) => {
      Object.keys(dateMarkers).forEach((id, index) => {
          const currentScrollTop = event.currentTarget.scrollTop;
          const currentScrollBottom = + event.currentTarget.getBoundingClientRect().height + currentScrollTop;
          const dateMarker: DateMarkerElement = dateMarkers[id];
          const dateMarkerElement = document.getElementById(id);
          const offsetBottom = dateMarker.offsetTop + dateMarker.height;
          if (currentScrollTop > dateMarker.offsetTop) {
            //console.log('s', id, dateMarker.offsetTop);
            //console.log(currentScrollTop, dateMarker.offsetTop);
            dateMarkerElement.style.top = (currentScrollTop - dateMarker.offsetTop) + 'px';
          } else if (offsetBottom > currentScrollBottom) {
            dateMarkerElement.style.backgroundColor = 'green';
          } else {
            dateMarkerElement.style.backgroundColor = 'white';
          }
        });
    };
  
  const columns: ColumnConfig<any>[] = !cars
      ? []
      : cars?.map(car => ({
          property: car.id,
          size: isPhone ? '70vw' : '250px',
          render: hour => {
              const index = hours.indexOf(hour);
              const carIndex = cars.indexOf(car);
              const reservationHour = hour[car.id];
              const showDate = (carIndex === 0) // first car column only
                            && /*(*/((index === 0) // first row
                                || (reservationHour.startsAt.getHours() === 0)); // or midnight row

              let prevDateElement = undefined;
              let dateElementIndex = 0;
              return <Box
                          margin={ { left: 'small' } }
                          pad='xsmall'
                          style={ {
                              position: 'relative',
                              maxWidth: '20px',
                            } }
                          align="end">
                      {
                        reservationHour.startsAt.getHours()
                      }
                      {
                        showDate
                          ? <Box
                                id={ reservationHour.startsAt.toISOString() }
                                style={ {
                                  position: 'absolute',
                                  top: '0',
                                  transform: 'rotate(-90deg)',
                                  } }>
                              <Box
                                  style={ {
                                      position: 'absolute',
                                      bottom: '2rem',
                                      right: '0',
                                      maxWidth: 'unset',
                                    } }
                                    ref={ el => {
                                        if (!el) return;
                                        const id = reservationHour.startsAt.toISOString();
                                        const dateMarker = dateMarkers[id];
                                        if (dateMarker !== undefined) {
                                          //el.style.right = document.getElementById(id).style.right;
                                          return;
                                        }
                                        let offset = 0;
                                        let current: HTMLElement = (el.offsetParent as HTMLElement).offsetParent as HTMLElement;
                                        const currentHour = reservationHour.startsAt.getHours();
                                        const isFirstRow = (index === 0) // first row
                                            && (currentHour !== 0); // and not midnight
                                        el.parentElement.style.top = isFirstRow
                                            ? (-1 * current.offsetHeight * currentHour + 1).toString() + 'px'
                                            : '0px';
                                        while (current && (!(current instanceof HTMLTableElement))) {
                                          offset += isFirstRow
                                              ? -1 * current.offsetHeight * currentHour + 1 // 1 = border above first line
                                              : current.offsetTop;
                                          current = current.offsetParent as HTMLElement;
                                        }
                                        const newDateMarker: DateMarkerElement =  {
                                          id,
                                          index: dateElementIndex,
                                          prev: prevDateElement,
                                          next: undefined,
                                          offsetTop: offset - 1, // 1 = top margin
                                          height: el.offsetWidth + 2, // 2 = top and bottom margin
                                        };
                                        if (prevDateElement) {
                                          prevDateElement.next = newDateMarker.id;
                                        }
                                        prevDateElement = newDateMarker;
                                        dateMarkers[id] = newDateMarker;
                                      }
                                  }>
                                <Tag value={ reservationHour.startsAt.toLocaleDateString() } />
                              </Box>
                            </Box>
                          : <></>
                      }
                      </Box>;
            },
          header: car.name,
        }));
  
  const loadMore = async () => {
    if (hours.length === 0) {
      return;
    }
    const hour = hours[ hours.length - 1 ];
    if (!hour) {
      return;
    }
    const firstReservationHour = hour[ Object.keys(hour)[0] ];
    const startsAt = firstReservationHour.endsAt;
    const endsAt = nextHours(startsAt, itemsBatchSize, history);
    loadData(carSharingApi, startsAt, endsAt, history, hours, setHours, setCars);
  };
  
  return (
    <SnapScrollingDataTable
        onScroll={ moveDateMarkers }
        ref={ tableRef }
        phoneMargin="15vw"
        primaryKey={ false }
        placeholder={ hours === undefined ? t('loading') : undefined }
        columns={ columns }
        step={ itemsBatchSize }
        sort={ { property: 'nothing', direction: "asc", external: true } }
        onMore={ loadMore }
        data={ hours } />);
      
};

export { Booking };
