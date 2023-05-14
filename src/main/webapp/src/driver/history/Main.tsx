import { Accordion } from 'grommet';
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
    });
i18n.addResources('de', 'driver/history', {
      "title": "Historie",
      "year": "Jahr",
      "total": "Gesamt",
      "passenger-service": "Fahrtendienst",
      "car-sharing": "Car-Sharing",
    });

const Main = () => {

  const reservationGuiApi = useReservationGuiApi();
  const { t } = useTranslation('driver/history');
  const { showLoadingIndicator } = useAppContext();
  const { isNotPhone } = useResponsiveScreen();

  const [ years, setYears ] = useState<Array<ReservationOverviewTotal> | undefined>(undefined);
  const [ activeYear, setActiveYear ] = useState(-1);
  
  useEffect(() => {
    if (years === undefined) {
      showLoadingIndicator(true);
      const loadYears = async () => {
        const result = await reservationGuiApi.getReservationOverviewTotals();
        setYears(result);
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
          <Header />
          <Accordion>
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
        </Content>
      </MainLayout>);
};

export { Main };
