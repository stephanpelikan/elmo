import { Accordion, Text } from 'grommet';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppContext, useReservationGuiApi } from '../../AppContext';
import { ReservationOverviewTotal } from '../../client/gui';
import { Content, Heading, MainLayout } from '../../components/MainLayout';
import i18n from '../../i18n';
import useResponsiveScreen from '../../utils/responsiveUtils';
import { Header } from './Header';
import { Footer } from './Footer';
import { HistoryAccordionPanel } from './HistoryAccordionPanel';

i18n.addResources('en', 'driver/history', {
      "title": "History",
      "year": "Year",
      "total": "Total",
      "passenger-service": "Passenger Service",
      "car-sharing": "Car-Sharing",
      "no-completed-usage-yet": "So far you have not done any passenger-service shifts and have not used car sharing!",
    });
i18n.addResources('de', 'driver/history', {
      "title": "Historie",
      "year": "Jahr",
      "total": "Gesamt",
      "passenger-service": "Fahrtendienst",
      "car-sharing": "Car-Sharing",
      "no-completed-usage-yet": "Bislang hast du keine Fahrtendienstschichten geleistet und kein Car-Sharing genutzt!"
    });

const Main = () => {

  const reservationGuiApi = useReservationGuiApi();
  const { t } = useTranslation('driver/history');
  const { showLoadingIndicator } = useAppContext();
  const { isNotPhone } = useResponsiveScreen();

  const [ years, setYears ] = useState<Array<ReservationOverviewTotal> | undefined>(undefined);
  const [ hoursServedPassengerService, setHoursServedPassengerService ] = useState(0);
  const [ hoursConsumedCarSharing, setHoursConsumedCarSharing] = useState(0);
  const [ activeYear, setActiveYear ] = useState(-1);
  
  useEffect(() => {
    if (years === undefined) {
      showLoadingIndicator(true);
      const loadYears = async () => {
        const result = await reservationGuiApi.getDriverActivities();
        setYears(result.overview);
        setHoursConsumedCarSharing(result.carSharingHours);
        setHoursServedPassengerService(result.passengerServiceHours);
        showLoadingIndicator(false);
      }
      loadYears();
    }
  }, [ reservationGuiApi, setYears ]);
  
  return (
      <MainLayout>
        <Heading
            size='small'
            level='2' >
          { t('title') }
        </Heading>
        <Content>
          {
              years?.length === 0
                  ? <Text>
                      { t('no-completed-usage-yet') }
                    </Text>
                  : <>
                      <Header />
                      <Accordion
                          border={ {
                              color: 'dark-4',
                              side: 'top'
                            } }>
                        {
                          years?.
                              map(
                                  (year, index) =>
                                  <HistoryAccordionPanel
                                      key={ year.year }
                                      index={ index } 
                                      year={ year } />)
                        }
                      </Accordion>
                      <Footer
                          years={ years } />
                    </>
          }
        </Content>
      </MainLayout>);
};

export { Main };
