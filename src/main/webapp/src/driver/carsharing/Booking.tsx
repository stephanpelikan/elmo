import { Box, ColumnConfig, Tag } from "grommet";
import { useTranslation } from "react-i18next";
import i18n from '../../i18n';
import useResponsiveScreen from '../../utils/responsiveUtils';
import { currentHour, nextHours } from '../../utils/timeUtils';
import { SnapScrollingDataTable } from '../../components/SnapScrollingDataTable';
import { useCarSharingApi } from '../DriverAppContext';
import { CarSharingApi, CarSharingCar, CarSharingReservation } from "../../client/gui";
import { useCallback, useEffect, useRef, useState } from "react";

i18n.addResources('en', 'driver/carsharing/booking', {
      "loading": "loading...",
    });
i18n.addResources('de', 'driver/carsharing/booking', {
      "loading": "Lade Daten...",
    });

const itemsBatchSize = 40;

interface CalendarHour {
  index: number;
  startsAt: Date;
  endsAt: Date;
  reservation: CarSharingReservation | undefined;
};

interface DateMarkerElement {
  id: string;
  prev?: DateMarkerElement;
  next?: DateMarkerElement;
  offsetTop: number;
  text: string;
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
  const { isPhone, isNotPhone } = useResponsiveScreen();
  const carSharingApi = useCarSharingApi();

  const [ hours, setHours ] = useState(undefined);
  const [ cars, setCars ] = useState<Array<CarSharingCar>>(undefined);
  //const [ history, setHistory ] = useState(false);
  const history = false;
  const [ dateMarkers, setDateMarkers ] = useState<Array<DateMarkerElement>>([]);
  const tableRef = useRef<HTMLDivElement>();
  
  useEffect(() => {
      if (hours === undefined) {
        const startsAt = currentHour(history);
        const endsAt = nextHours(startsAt, itemsBatchSize, history);
        loadData(carSharingApi, startsAt, endsAt, history, hours, setHours, setCars);
      }
    }, [ carSharingApi, hours, setHours, history ]);
    
  const moveDateMarkers = useCallback((event) => {
      if (dateMarkers.length === 0) return;
      
      const currentScrollTop = event.currentTarget.scrollTop;
      const visibleHeight = event.currentTarget.getBoundingClientRect().height;
      
      const indexOfFirstMarker = dateMarkers.findIndex(dm =>
          (dm.offsetTop >= currentScrollTop)
              && ((dm.prev === undefined) || (dm.prev.offsetTop < currentScrollTop)));
      if (indexOfFirstMarker === -1) return;

      let firstMarker = undefined;
      let firstMarkerPos = -1;
      for (let i = indexOfFirstMarker; (i > 0) && (i < dateMarkers.length); ++i) {
        const dateMarker = dateMarkers[i];
        const newPos = dateMarker.offsetTop - currentScrollTop;
        if ((newPos - 20) > visibleHeight) { // 20 ... make sure element is not visible
          i = dateMarkers.length;
          continue;
        }
        const element = document.getElementById(dateMarker.id);
        if (firstMarker === undefined) {
          firstMarker = dateMarker;
          firstMarkerPos = newPos;
        }
        element.style.top = `${newPos}px`;
      }

      if (firstMarker === undefined) return;
      if (firstMarker.prev === undefined) return;
      const prevElement = document.getElementById(firstMarker.prev.id);
      if (firstMarkerPos < prevElement.offsetWidth) {
        prevElement.style.top = `${firstMarkerPos - prevElement.offsetWidth}px`;
      } else {
        prevElement.style.top = '0px';
      }
      
      if (firstMarker.prev.prev === undefined) return;
      const prevPrevElement = document.getElementById(firstMarker.prev.prev.id);
      prevPrevElement.style.top = `-${prevPrevElement.offsetWidth}px`;
      
    }, [ dateMarkers ]);
  
  useEffect(() => {
//    const resizeListener = () => moveDateMarkers({ currentTarget: tableRef.current });
//    window.addEventListener('resize', resizeListener, { passive: true });
//    return () => window.removeEventListener('resize', resizeListener);
  }, [ moveDateMarkers ]);

  const columnSize = isPhone ? '70vw' : '200px';
  const columns: ColumnConfig<any>[] = !cars
      ? []
      : cars?.map(car => ({
          property: car.id,
          size: columnSize,
          render: hour => {
              const index = hours.indexOf(hour);
              const carIndex = cars.indexOf(car);
              const reservationHour = hour[car.id];
              const showDate = (carIndex === 0) // first car column only
                            && /*(*/((index === 0) // first row
                                || (reservationHour.startsAt.getHours() === 0)); // or midnight row
              return <Box
                          style={ {
                              position: showDate ? 'sticky' : undefined,
                              borderTop: 'solid -1px red',
                            } }>
                        <Box
                            margin={ { left: 'small' } }
                            pad='xsmall'
                            style={ {
                                position: 'relative',
                                maxWidth: '20px',
                              } }
                            align="end"
                            ref={ el => {
                                if (!showDate) return;
                                if (!el) return;
                                const id = reservationHour.startsAt.toISOString();
                                if (dateMarkers.findIndex(dm => dm.id === id) !== -1) return;
                                let offset = 0;
                                let current: HTMLElement = el;
                                const currentHour = reservationHour.startsAt.getHours();
                                const isFirstRow = (index === 0) // first row
                                    && (currentHour !== 0); // and not midnight
                                while (current && (!(current instanceof HTMLTableElement))) {
                                  offset += isFirstRow
                                      ? -1 * current.offsetHeight * currentHour // 1 = border above first line
                                      : current.offsetTop;
                                  current = current.offsetParent as HTMLElement;
                                }
                                const newDateMarker: DateMarkerElement =  {
                                  id,
                                  next: undefined,
                                  offsetTop: offset, // 1 = top margin
                                  text: reservationHour.startsAt.toLocaleDateString()
                                };
                                const newDateMarkers = [ ...dateMarkers, newDateMarker ]
                                    .sort((a, b) => a.offsetTop - b.offsetTop);
                                setDateMarkers(newDateMarkers);
                                const indexOfNewDateMarker = newDateMarkers.indexOf(newDateMarker);
                                if (indexOfNewDateMarker > 0) {
                                  const prev = newDateMarkers[indexOfNewDateMarker - 1];
                                  prev.next = newDateMarker;
                                  newDateMarker.prev = prev;
                                }
                                if ((indexOfNewDateMarker + 1) < newDateMarkers.length) {
                                  const next = newDateMarkers[indexOfNewDateMarker + 1];
                                  next.prev = newDateMarker;
                                  newDateMarker.next = next;
                                }
                              }
                          }>
                        {
                          reservationHour.startsAt.getHours()
                        }
                        </Box>
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
  
  const headerHeight = '2.8rem';
  const phoneMargin = '15vw';
  
  return (
    <Box
        style={ { position: 'relative' }}>
      <SnapScrollingDataTable
          headerHeight={ headerHeight }
          ref={ tableRef }
          phoneMargin={ phoneMargin }
          primaryKey={ false }
          placeholder={ hours === undefined ? t('loading') : undefined }
          columns={ columns }
          step={ itemsBatchSize }
          sort={ { property: 'nothing', direction: "asc", external: true } }
          onMore={ loadMore }
          data={ hours }
          replace={ true }>
        <Box
            overflow='hidden'
            style={ {
                position: 'absolute',
                top: headerHeight,
                left: '0',
                width: isPhone ? phoneMargin : `calc((100% - (${columnSize} * ${columns.length})) / 2)`,
                height: `calc(100% - ${headerHeight})`,
              } }>
          <Box
              style={ {
                  position: isPhone ? 'relative' : 'absolute',
                  right: isNotPhone ? '2rem' : undefined,
                  marginLeft: isPhone ? 'auto' : undefined,
                  marginRight: isPhone ? 'auto' : undefined,
                  width: `${isPhone ? '2.6' : '3'}rem`,
                  top: '0',
                  height: '100%',
                  backgroundColor: 'rgba(200, 200, 200, 0.5)'
                } }
              >
            {
              dateMarkers.map((dateMarker, index) => {
                  return (
                      <Box
                          key={ dateMarker.id }
                          id={ dateMarker.id }
                          style={ {
                              position: 'absolute',
                              top: dateMarker.offsetTop,
                              left: `calc((100% - ${isPhone ? '2' : '2.4'}rem) / 2)`,
                              maxWidth: 'unset',
                              maxHeight: 'unset',
                            } }
                            /* ref={ el => index === 0 ? moveDateMarkers({ currentTarget: tableRef.current }) : undefined } */>
                        <Box
                            pad={ { horizontal: 'small' } }
                            style={ {
                                  position: 'relative',
                                  transform: 'rotate(-90deg)',
                                  left: '-100%',
                                  transformOrigin: 'top right',
                              } }>
                          <Tag value={ dateMarker.text } />
                        </Box>
                      </Box>);
                })
            }
          </Box>
        </Box>
      </SnapScrollingDataTable>
    </Box>);
      
};

export { Booking };
