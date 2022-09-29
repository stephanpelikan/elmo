import { Box, ColumnConfig, DataTable, Text } from "grommet";
import { useTranslation } from "react-i18next";
import i18n from '../../i18n';
import useResponsiveScreen from '../../utils/responsiveUtils';
import { currentHour, nextHours } from '../../utils/timeUtils';
import { SnapScrollingDataTable } from '../../components/SnapScrollingDataTable';
import { useCarSharingApi } from '../DriverAppContext';
import { CarSharingApi, CarSharingCar, CarSharingReservation } from "../../client/gui";
import { useEffect, useState } from "react";
import { SnapAlignBox } from "../../components/SnapScrolling";

i18n.addResources('en', 'driver/carsharing/booking', {
      "loading": "loading...",
    });
i18n.addResources('de', 'driver/carsharing/booking', {
      "loading": "Lade Daten...",
    });

const itemsBatchSize = 30;

interface CalendarHour {
  startsAt: Date;
  endsAt: Date;
  reservation: CarSharingReservation | undefined;
};

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

  let currentHour = startsAt;
  while (currentHour.getTime() !== endsAt.getTime()) {
    
    const nextHour = nextHours(currentHour, 1, history);
    
    const hour: CalendarHour = {
      startsAt: currentHour,
      endsAt: nextHour,
      reservation: undefined
    };
    newHours.push(hour);
    
    currentHour = nextHour;
    
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
  const [ history, setHistory ] = useState(false);
  
  useEffect(() => {
    if (hours === undefined) {
      const startsAt = currentHour(history);
      const endsAt = nextHours(startsAt, itemsBatchSize, history);
      loadData(carSharingApi, startsAt, endsAt, history, hours, setHours, setCars);
    }
  }, [ carSharingApi, setHours, history ]);
  
  const columns: ColumnConfig<any>[] = !cars
      ? []
      : cars?.map(car => ({
          property: car.id,
          size: isPhone ? '80vw' : '250px',
          render: hour => {
              console.log(hours.indexOf(hour));
              return <Box
                          margin={ { left: 'small' } }
                          pad='xsmall'
                          style={ { maxWidth: '20px' } }
                          align="end">{
                        hour.startsAt.getHours()
                      }</Box>;
            },
          header: car.name,
        }));
        
  const loadMore = () => {
    const startsAt = hours[ hours.length - 1 ].endsAt;
    const endsAt = nextHours(startsAt, itemsBatchSize, history);
    loadData(carSharingApi, startsAt, endsAt, history, hours, setHours, setCars);
  };
  
  return (
    <SnapScrollingDataTable
        phoneMargin="10vw"
        primaryKey={ false }
        placeholder={ hours === undefined ? t('loading') : undefined }
        columns={ columns }
        step={ itemsBatchSize }
        onMore={ loadMore }
        data={ hours } />);
        /*
    <SnapScrollingGrid
        fill
        snapDirection='horizontal'
        rows={ [ 'xxsmall' ] }>
      <Box
          fill={ isNotPhone }
          style={ isPhone ? { width: totalWidth } : undefined }
          background={ { color: 'accent-2', opacity: 'strong' } }>
        <Box
            fill
            direction='row'
            style={ isNotPhone ? { maxWidth: tableWidth, marginLeft: 'auto', marginRight: 'auto' } : undefined }
            pad={ isPhone ? { horizontal: outerMargin } : undefined }>{
          cars?.map(car =>
            <SnapAlignBox
                pad={ isPhone ? 'medium' : 'small' }
                key={ car.id }
                align="center"
                width={ columnWidth }
                snapAlign='center'>{
              car.name
            }</SnapAlignBox>)
          }</Box>
        </Box>
      <Box
          fill={ isNotPhone }
          overflow={ { vertical: 'auto' } }>
        <DataTable
            fill
            pad='0'
            primaryKey={ false }
            style={ { maxWidth: tableWidth, position: 'relative', top: '-13px', marginLeft: 'auto', marginRight: 'auto' } }
            background={ {
              body: ['white', 'light-2']
            } }
            placeholder={ hours === undefined ? t('loading') : undefined }
            columns={ columns }
            step={ itemsBatchSize }
            onMore={ () => {} }
            data={ hours } />
      </Box>
    </SnapScrollingGrid>
    */
      
};

export { Booking };
