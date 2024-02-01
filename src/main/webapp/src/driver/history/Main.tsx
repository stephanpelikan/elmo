import { Accordion, Box, Text } from 'grommet';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppContext, useReservationGuiApi } from '../../AppContext';
import { ReservationOverviewTotal } from '../../client/gui';
import { Content, Heading, MainLayout } from '../../components/MainLayout';
import i18n from '../../i18n';
import { Header } from './Header';
import { Footer } from './Footer';
import { HistoryAccordionPanel } from './HistoryAccordionPanel';

i18n.addResources('en', 'driver/history', {
      "title": "History",
      "dashboard-hint": "Switch to annual report to see what shifts of passenger service you had accomplished or the car-sharing you used",
      "year": "Year",
      "balance": "Balance",
      "total": "Total",
      "passenger-service": "Passenger Service",
      "car-sharing": "Car-Sharing",
      "no-completed-usage-yet": "So far you have not done any passenger-service shifts and have not used car sharing!",
      "legacy-system-hint": "For drivers imported from a legacy system the history details of specific rides are not available.",
      "description": "Here you find an overview and details about your activities as an ELMO driver. The balance is the difference between the number of hours done as a driver for passenger service and the number of hours car-sharing was used or is reserved.",
      "detail-modal-header": "{{type}}",
      "detail-modal-from": "From:",
      "detail-modal-until": "Until:",
      "detail-modal-duration": "Duration:",
      "detail-modal-car": "Vehicle:",
      "detail-modal-distance": "KM:",
      "detail-modal-km-start": "KM from:",
      "detail-modal-km-end": "KM until:",
      "detail-modal-usage-from": "Begin:",
      "detail-modal-usage-from-not-confirmed": "Cancelled before usage",
      "detail-modal-usage-until": "End:",
      "detail-modal-usage-until-not-confirmed": "Not confirmed",
      "detail-modal-usage-until-cancelled": "Cancelled before usage",
      "detail-modal-reserved-at": "Reserved:",
      "detail-modal-last-interaction-comment": "Admin comment:",
    });
i18n.addResources('de', 'driver/history', {
      "title": "Historie",
      "dashboard-hint": "Wechsle zum Jahresüberblick um Näheres über deine bislang geleisteten Fahrtendienste und deine Nutzung des Car-Sharings zu erfahren",
      "year": "Jahr",
      "balance": "Saldo",
      "total": "Gesamt",
      "passenger-service": "Fahrtendienst",
      "car-sharing": "Car-Sharing",
      "no-completed-usage-yet": "Bislang hast du keine Fahrtendienstschichten geleistet und kein Car-Sharing genutzt!",
      "legacy-system-hint": "Für FahrerInnen die aus einem Alt-System importiert wurden stehen keine Detailinformationen aus dieser Zeit zur Verfügung.",
      "description": "Hier findest du eine Überblick und Details zu deinen Aktivitäten als ELMO-Fahrer. Der Saldo errechnet sich aus der Anzahl an Stunden in denen du Fahrtendienst geleistet hast abzüglich der Anzahl an Stunden von dir genutzten oder reservierten Car-Sharings.",
      "detail-modal-header": "{{type}}",
      "detail-modal-from": "Von:",
      "detail-modal-until": "Bis:",
      "detail-modal-duration": "Dauer:",
      "detail-modal-car": "Fahrzeug:",
      "detail-modal-distance": "KM:",
      "detail-modal-km-start": "KM Beginn:",
      "detail-modal-km-end": "KM Ende:",
      "detail-modal-usage-from": "Beginn:",
      "detail-modal-usage-from-not-confirmed": "Vor Nutzung abgebrochen",
      "detail-modal-usage-until": "Ende:",
      "detail-modal-usage-until-not-confirmed": "Nicht eingetragen",
      "detail-modal-usage-until-cancelled": "Vor Nutzung abgebrochen",
      "detail-modal-reserved-at": "Reserviert:",
      "detail-modal-last-interaction-comment": "Administrator:",
    });

const Main = () => {

  const reservationGuiApi = useReservationGuiApi();
  const { t } = useTranslation('driver/history');
  const { showLoadingIndicator } = useAppContext();

  const [ years, setYears ] = useState<Array<ReservationOverviewTotal> | undefined>(undefined);
  const [ hoursServedPassengerService, setHoursServedPassengerService ] = useState(0);
  const [ hoursConsumedCarSharing, setHoursConsumedCarSharing] = useState(0);
  const [ detailsVisible, setDetailsVisible ] = useState<Array<number>>([]);
  
  useEffect(() => {
    if (years === undefined) {
      showLoadingIndicator(true);
      const loadYears = async () => {
          try {
            const result = await reservationGuiApi.getDriverActivities();
            setYears(result.overview);
            setHoursConsumedCarSharing(result.carSharingHours);
            setHoursServedPassengerService(result.passengerServiceHours);
          } finally {
            showLoadingIndicator(false);
          }
        };
      loadYears();
    }
  }, [ reservationGuiApi, setYears, showLoadingIndicator, years ]);
  
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
                      <Box
                          margin={ { bottom: "medium" } }>
                        <Text>{ t('description') }</Text>
                      </Box>
                      <Header />
                      <Accordion
                          activeIndex={ detailsVisible }
                          onActive={ details => setDetailsVisible(details) }
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
                                      year={ year }
                                      active={ detailsVisible.includes(index) } />)
                        }
                      </Accordion>
                      <Footer
                          hoursServedPassengerService={ hoursServedPassengerService }
                          hoursConsumedCarSharing={ hoursConsumedCarSharing } />
                      <Box
                          margin={ { top: "medium" } }>
                        <Text size='small'>{ t('legacy-system-hint') }</Text>
                      </Box>
                    </>
          }
        </Content>
      </MainLayout>);
};

export { Main };
