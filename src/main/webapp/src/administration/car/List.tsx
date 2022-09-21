import { Box, Button, ColumnConfig, DataTable, Grid, ResponsiveContext, Stack, Text } from 'grommet';
import { Add, Car as CarIcon, FormEdit, PhoneVertical, ShareOption, StatusGood } from 'grommet-icons';
import { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useCarAdministrationApi } from '../AdminAppContext';
import { CircleButton } from '../../components/CircleButton';
import i18n from '../../i18n';
import { Car, CarsApi } from '../../client/administration';

i18n.addResources('en', 'administration/car', {
      "edit": "edit",
      "loading": "loading...",
      "total": "Total:",
      "shortcut": "Shortcut",
      "name": "Name",
      "action": "Action",
      "status": "Status",
      "appActive": "Car-App",
      "car-sharing": "Car-Sharing",
    });
i18n.addResources('de', 'administration/car', {
      "edit": "Bearbeiten",
      "loading": "Lade Daten...",
      "total": "Anzahl:",
      "shortcut": "Kürzel",
      "name": "Name",
      "action": "Aktion",
      "status": "Status",
      "appActive": "FD-App",
      "passanger-service": "Fahrtendienst",
      "car-sharing": "Car-Sharing",
    });
    
const itemsBatchSize = 30;

const loadData = async (
    carAdministrationApi: CarsApi,
    setNumberOfCars: (number: number) => void,
    setCars: (applications: Array<Car>) => void,
    cars: Array<Car>
  ) => {

    const result = await carAdministrationApi
        .getCars({
            pageNumber: cars === undefined
                ? 0
                : Math.floor(cars.length / itemsBatchSize)
                  + (cars.length % itemsBatchSize),
            pageSize: itemsBatchSize
          });
    setNumberOfCars(result.page.totalElements);
    setCars(
        cars === undefined
        ? result.cars
        : cars.concat(result.cars));
  
};

const ListOfCars = () => {
  
  const carAdministrationApi = useCarAdministrationApi();
  
  const [ cars, setCars ] = useState(undefined);
  const [ numberOfCars, setNumberOfCars ] = useState(0);
  
  useEffect(() => {
    if (cars === undefined) {
      loadData(carAdministrationApi, setNumberOfCars, setCars, cars);
    }
  }, [ carAdministrationApi, setCars, setNumberOfCars, cars ]);

  const { t } = useTranslation('administration/car');
  
  const navigate = useNavigate();
  
  const size = useContext(ResponsiveContext);
  
  const onEdit = async (car: Car) => {
    navigate('./' + car.id);
  };
  
  const newCar = () => {
    navigate('./-');
  }

  const columns: ColumnConfig<Car>[] = size === 'small'
        ? [
          { property: 'shortcut', header: t('shortcut'), size: '4rem' },
          { property: 'name', header: t('name') },
          { property: 'status', header: t('status'), size: '4rem',
            render: car => <Box direction='row' gap='xxsmall'>
                { car.carSharing ? <ShareOption /> : '' }
                { car.passangerService ? <CarIcon /> : '' }
                { car.appActive ? <PhoneVertical /> : '' }
              </Box> },
          { property: 'edit', header: t('action'), align: 'center', size: '4rem',
            render: car => <Button
                        onClick={() => onEdit(car)}
                        hoverIndicator
                        icon={<FormEdit />}
                        size='small' />
          },
        ]
        : [
          { property: 'shortcut', header: t('shortcut'), size: '5rem' },
          { property: 'name', header: t('name') },
          { property: 'carSharing', header: <Text truncate>{ t('car-sharing') }</Text>, size: '5rem',
            render: car => car.carSharing ? <ShareOption /> : '' },
          { property: 'passangerService', header: <Text truncate>{ t('passanger-service') }</Text>, size: '5rem',
            render: car => car.passangerService ? <CarIcon /> : '' },
          { property: 'appActive', header: t('appActive'), size: '5rem',
            render: car => car.appActive ? <PhoneVertical /> : '' },
          { property: 'edit', header: t('action'), align: 'center', size: '8rem',
            render: car => <Button
                        onClick={() => onEdit(car)}
                        label={ t('edit') }
                        hoverIndicator
                        icon={<FormEdit />}
                        size='small' />
          },
        ];
  
  return (
    <>
      <Grid
          rows={ [ 'xxsmall' ] }
          fill>
        <Box
            flex
            justify='between'
            direction='row'
            background={ { color: 'accent-2', opacity: 'strong' } }
            pad={ size === 'small' ? 'medium' : 'small' }>
          <Box
              justify='center'
              align="center">
            <Text>{ t('total') } { numberOfCars }</Text>
          </Box>
          <Box
              direction='row'
              gap='medium'>
          </Box>
        </Box>
        <Box>
          <Box
              fill='horizontal'
              overflow={ { vertical: 'auto' }}>
            <DataTable
                fill
                pin
                size='100%'
                background={ {
                  body: ['white', 'light-2']
                } }
                placeholder={ cars === undefined ? t('loading') : undefined }
                columns={columns}
                step={itemsBatchSize}
                onMore={() => loadData(carAdministrationApi, setNumberOfCars, setCars, cars)}
                data={cars} />
          </Box>
        </Box>
      </Grid>
      <CircleButton
          style={ { position: 'absolute', right: '0', bottom: '1px' } }
          color='brand'
          icon={<Add color='white' />}
          onClick={ newCar } />
    </>);
}

export { ListOfCars };
