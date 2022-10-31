import { Box, Heading, Text } from 'grommet';
import { Cycle } from 'grommet-icons';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ShiftOverview, ShiftOverviewWeek } from '../../client/gui';
import useResponsiveScreen from '../../utils/responsiveUtils';
import { useDriverApi } from '../DriverAppContext';
import { Day } from './Day';
import i18n from '../../i18n';

i18n.addResources('en', 'driver/overview', {
      "title": "Overview Passanger-Service",
      "hint": "Click on a shift to go to the planner",
      "has-drivers": "Has driver",
      "has-partial-drivers": "Partial",
      "has-no-drivers": "Unassigned",
      "calendar-week": "CW",
    });
i18n.addResources('de', 'driver/overview', {
      "title": "Überblick Fahrtendienst",
      "hint": "Klicke auf eine Schicht, um zum Planer zu gelangen",
      "has-drivers": "Mit Fahrer",
      "has-partial-drivers": "Teilweise",
      "has-no-drivers": "Offen",
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
  const driverApi = useDriverApi();
  
  const [ overview, setOverview ] = useState<ShiftOverview>(undefined);
  useEffect(() => {
      const loadOverview = async () => {
          const loadedOverview = await driverApi.getShiftOverview();
          setOverview(loadedOverview);
        };
      loadOverview();
    }, [ driverApi, setOverview ]);
    
  return <Box
             width={ isPhone ? '17.5rem' : '21rem'}
             gap="medium">
           <Heading
               margin={ { vertical: 'xxsmall' } }
               level='3'>
             <>{ t('title') }</>
           </Heading>
           <Box
                justify='between'
                align="center"
                direction="row">
              <Text
                  color='accent-3'
                  weight='bold'>{ t('calendar-week') }&nbsp;{ overview?.weeks?.at(0).description }</Text>
              {
                overview !== undefined
                    ? <Text>&nbsp;({ new Date(overview?.weeks?.at(0).startsAt).toLocaleDateString() }
                          - { new Date(overview?.weeks?.at(0).endsAt).toLocaleDateString() })</Text>
                    : undefined
              }
            </Box>
           <WeekBox week={ overview?.weeks?.at(0) } />
           <Box
                justify='between'
                align="center"
                direction="row">
              <Text
                  color='accent-3'
                  weight='bold'>{ t('calendar-week') }&nbsp;{ overview?.weeks?.at(1).description }</Text>
              {
                overview !== undefined
                    ? <Text>&nbsp;({ new Date(overview?.weeks?.at(1).startsAt).toLocaleDateString() }
                          - { new Date(overview?.weeks?.at(1).endsAt).toLocaleDateString() })</Text>
                    : undefined
              }
            </Box>
           <WeekBox week={ overview?.weeks?.at(1) } />
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
                 <Text>{ t('has-drivers') }</Text>
               </Box>
               {
                 overview?.numberOfCars > 1
                    ? <Box
                          direction="row"
                          gap="xsmall"
                          align="center">
                       <Box background="status-warning" width="1rem" height="1rem"></Box>
                       <Text>{ t('has-partial-drivers') }</Text>
                     </Box>
                   : undefined
               }
               <Box
                    direction="row"
                    gap="xsmall"
                    align="center">
                 <Box background="status-critical" width="1rem" height="1rem"></Box>
                 <Text>{ t('has-no-drivers') }</Text>
               </Box>
             </Box>
             <Text>{ t('hint') }</Text>
           </Box>
         </Box>;

};

export { Overview };
