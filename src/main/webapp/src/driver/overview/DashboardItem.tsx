import { Box, Text } from 'grommet';
import { Cycle, MapLocation } from 'grommet-icons';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ShiftEvent, ShiftOverview, ShiftOverviewWeek } from '../../client/gui';
import useResponsiveScreen from '../../utils/responsiveUtils';
import { usePassengerServiceApi } from '../DriverAppContext';
import { Day } from './Day';
import i18n from '../../i18n';
import { Heading } from '../../components/MainLayout';
import { useGuiSse } from '../../client/guiClient';
import { EventSourceMessage, WakeupSseCallback } from '../../components/SseProvider';

i18n.addResources('en', 'driver/overview', {
      "title": "Overview Passenger-Service",
      "hint": "Click on a shift to go to the planner",
      "has-drivers": "has driver",
      "has-partial-drivers": "partial",
      "has-no-drivers": "unclaimed",
      "past": "expired",
      "calendar-week": "CW",
    });
i18n.addResources('de', 'driver/overview', {
      "title": "Überblick Fahrtendienst",
      "hint": "Klicke auf eine Schicht, um zum Planer zu gelangen",
      "has-drivers": "mit Fahrer",
      "has-partial-drivers": "teilweise",
      "has-no-drivers": "offen",
      "past": "vergangen",
      "calendar-week": "KW",
    });

const WeekBox = ({
    week
  }: {
    week: ShiftOverviewWeek
  }) => <Box
            background="light-6"
            round="small"
            align="center"
            justify='center'
            height='16rem'>
          {
            week === undefined
              ? <Box
                    animation="rotateRight"
                    pad='medium'>
                  <Cycle
                      style={ { marginTop: '3px' } }
                      color="white"
                      size="large" />
                </Box>
              : <Box
                    fill
                    gap="4px"
                    direction="row"
                    round="small">
                  {
                    week.days.map((day, index) => <Day
                        key={ `${week.startsAt.toString()}#${day.description}` }
                        dayIndex={ index }
                        day={ day } />)
                  }
                </Box>
          }
        </Box>;

const Overview = () => {

  const { t } = useTranslation('driver/overview');
  const { isPhone } = useResponsiveScreen();
  const wakeupSseCallback = useRef<WakeupSseCallback>(undefined);
  const passengerServiceApi = usePassengerServiceApi(wakeupSseCallback);
  
  const updateOverview = useMemo(
    () => async (ev: EventSourceMessage<ShiftEvent>) =>
      {
        const loadedOverview = await passengerServiceApi.getShiftOverview();
        setOverview(loadedOverview);
      },
      [ passengerServiceApi ]);
  useGuiSse<ShiftEvent>(
      updateOverview,
      /^Shift$/
    );
    
  const [ overview, setOverview ] = useState<ShiftOverview | undefined>(undefined);
  useEffect(() => {
      const loadOverview = async () => {
          const loadedOverview = await passengerServiceApi.getShiftOverview();
          setOverview(loadedOverview);
        };
      loadOverview();
    }, [ passengerServiceApi, setOverview ]);
    
  return <Box
             width={ isPhone ? '17.5rem' : '21rem'}
             gap="medium"
             margin={ { bottom: 'large' } }>
           <Heading
               icon={ <MapLocation /> }
               margin={ { vertical: 'xxsmall' } }
               level='3'>
             { t('title') }
           </Heading>
           <Box
               justify='between'
               align="center"
               direction="row">
             <Text
                 color='accent-3'
                 weight='bold'>{ t('calendar-week') }&nbsp;{ overview?.weeks[0].description }</Text>
             {
               overview !== undefined
                   ? <Text>&nbsp;({ new Date(overview?.weeks[0].startsAt).toLocaleDateString() }
                         - { new Date(overview?.weeks[0].endsAt).toLocaleDateString() })</Text>
                   : undefined
             }
           </Box>
           <WeekBox week={ overview?.weeks[0]! } />
           <Box
               justify='between'
               align="center"
               direction="row">
             <Text
                 color='accent-3'
                 weight='bold'>{ t('calendar-week') }&nbsp;{ overview?.weeks[1].description }</Text>
             {
               overview !== undefined
                   ? <Text>&nbsp;({ new Date(overview?.weeks[1].startsAt).toLocaleDateString() }
                         - { new Date(overview?.weeks[1].endsAt).toLocaleDateString() })</Text>
                   : undefined
             }
           </Box>
           <WeekBox week={ overview?.weeks[1]! } />
           <Box
                direction="column"
                gap="small">
             <Box
                 direction="row"
                 gap="small"
                 justify="center">
               <Box
                    direction="row"
                    gap="xsmall"
                    align="center">
                 <Box background="status-ok" width="1rem" height="1rem"></Box>
                 <Text size="xsmall">{ t('has-drivers') }</Text>
               </Box>
               {
                 overview?.hasPartials
                    ? <Box
                          direction="row"
                          gap="xsmall"
                          align="center">
                       <Box background="status-warning" width="1rem" height="1rem"></Box>
                       <Text size="xsmall">{ t('has-partial-drivers') }</Text>
                     </Box>
                   : undefined
               }
               <Box
                   direction="row"
                   gap="xsmall"
                   align="center">
                 <Box background="status-critical" width="1rem" height="1rem"></Box>
                 <Text size="xsmall">{ t('has-no-drivers') }</Text>
               </Box>
               <Box
                   direction="row"
                   gap="xsmall"
                   align="center">
                 <Box background="dark-4" width="1rem" height="1rem"></Box>
                 <Text size="xsmall">{ t('past') }</Text>
               </Box>
             </Box>
             <Text>{ t('hint') }</Text>
           </Box>
         </Box>;

};

export { Overview };
