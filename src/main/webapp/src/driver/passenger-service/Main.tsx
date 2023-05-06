import { Cycle, FormNext, Schedule, Schedules } from 'grommet-icons';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Accordion, Box, Paragraph } from 'grommet';
import React, { useCallback, useEffect, useState } from 'react';
import useResponsiveScreen from '../../utils/responsiveUtils';
import { Content, Heading, TextHeading } from '../../components/MainLayout';
import i18n from '../../i18n';
import { ShiftReservation } from '../../client/gui';
import { usePassengerServiceGuiApi } from '../../AppContext';
import { PassengerServiceAccordionPanel } from './PassengerServiceAccordionPanel';

i18n.addResources('en', 'driver/shifts', {
      "title": "Your shifts",
      "claim_first": "You currently have no passenger-service shifts claimed.",
      "claim_another": "Please consider claiming another passenger-service shift.",
      "hint-claim_another": "To do this, switch to the planner",
      "hint-claim_first": "Go to the planner for a claiming",
    });
i18n.addResources('de', 'driver/shifts', {
      "title": "Deine Schichten",
      "claim_first": "Aktuell hast du keinen Fahrtendienst übernommen.",
      "claim_another": "Überlege ob die weitere Fahrtendienste übernehmen kannst.",
      "hint-claim_another": "Wechsle dafür zum Planer",
      "hint-claim_first": "Wechsle zum Übernehmen einer Schicht zum Planer",
    });

const Shifts = () => {

  const { t } = useTranslation('driver/shifts');
  const { t: tDriver } = useTranslation('driver');
  const { isPhone } = useResponsiveScreen();
  const navigate = useNavigate();
  const passengerServiceApi = usePassengerServiceGuiApi();

  const [ detailsVisible, setDetailsVisible ] = useState<Array<number>>([]);
  const [ shifts, setShifts ] = useState<Array<ShiftReservation> | undefined>(undefined);
  
  const loadClaimedShifts = useCallback(async () => {
      const s = await passengerServiceApi.getUpcomingPassengerServiceShifts();
      setShifts(s);
    }, [ passengerServiceApi, setShifts ]);
  
  useEffect(() => {
      loadClaimedShifts();
    }, [ loadClaimedShifts ]);
  
  const goToPlanner = (shift: ShiftReservation) => {
      const day = shift.startsAt.toISOString().substring(0, 10);
      const hour = shift.startsAt.getHours();
      navigate(`.${tDriver('url-planner')}?${day}_${shift.carId}_${hour}`);
    };
  
  return (
      <Box
          width={ isPhone ? '17.5rem' : '21rem'}
          gap="medium"
          margin={ { bottom: 'medium' } }>
        <Heading
            icon={ <Schedule /> }
            margin={ { vertical: 'xxsmall' } }
            level='3'>
          { t('title') }
        </Heading>
        {
          shifts === undefined
              ? <Box
                    background="light-6"
                    round="small"
                    align="center"
                    justify='center'
                    height='16rem'>
                  <Box
                      animation="rotateRight"
                      pad='medium'>
                    <Cycle
                        style={ { marginTop: '3px' } }
                        color="white"
                        size="large" />
                  </Box>
                </Box>
              : shifts.length === 0
              ? undefined
              : <Accordion
                    activeIndex={ detailsVisible }
                    onActive={ details => setDetailsVisible(details) }
                    animate>
                  {
                    shifts.map(
                        (shift, index) =>
                            <PassengerServiceAccordionPanel
                                key={ shift.id }
                                shift={ shift }
                                index={ index }
                                goToPlanner={ goToPlanner} />)
                  }
                </Accordion>
        }
        {
          (shifts === undefined) || (shifts?.length > 1)
              ? undefined
              : <Content>
                  <TextHeading>
                    {
                      t(shifts?.length !== 0
                          ? 'claim_another'
                          : 'claim_first')
                    }
                  </TextHeading>
                  <Box
                      direction="row">
                    <Box>
                      <Paragraph>
                        {
                          t(shifts?.length !== 0
                              ? 'hint-claim_another'
                              : 'hint-claim_first')
                        }
                      </Paragraph>
                    </Box>
                    <Box
                        style={ { minWidth: 'auto' } }
                        onClick={ () => navigate('.' + tDriver('url-planner')) }
                        focusIndicator={ false }
                        direction="row">
                      <FormNext />
                      <Schedules />
                    </Box>
                  </Box>
                </Content>
        }
      </Box>);
  
};

export { Shifts }
