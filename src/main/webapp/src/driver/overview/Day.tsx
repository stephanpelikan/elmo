import { Box, Text } from 'grommet';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ShiftOverviewDay, ShiftOverviewHour } from '../../client/gui';
import { now, registerEachSecondHook, unregisterEachSecondHook } from '../../utils/now-hook';

const Day = ({
    dayIndex,
    day
}: {
    dayIndex: number,
    day: ShiftOverviewDay
}) => {
  
  const { t } = useTranslation('driver');
  const navigate = useNavigate();
  
  const gotToPlanner = (_event: MouseEvent, hourIndex: number) => {
      let hour: ShiftOverviewHour | undefined = undefined;
      do {
        hour = day.hours![hourIndex];
        --hourIndex;
      } while ((hourIndex > 0) && (hour.description === undefined));
      navigate(`.${t('url-planner')}?${day.date}_${hour.carId}_${hour.description}`);
    };
    
  const [ forceRefresh, setForceRefresh ] = useState(0);
  
  useEffect(() => {
      const rerenderOverview = (lastNow: Date) => {
          if (now.getHours() !== lastNow.getHours()) {
            setForceRefresh(forceRefresh + 1);
          }
        };
      registerEachSecondHook(rerenderOverview);
      return () => unregisterEachSecondHook(rerenderOverview);
    }, [ forceRefresh, setForceRefresh]);
  
  let shiftCounter = 0;
  return (
      <Box
          pad={ { top: '1.5rem' } }
          style={ { position: 'relative' } }
          align="center"
          width="100%">
        <Box
            style={ {
                position: 'relative',
                top: '-2.4rem',
              } }
            align="center"
            height="4%">
          <Text
              style={ { textShadow: '0px 3px 3px #ffffff' } }
              weight='bolder'>
            {
              new Date(day.date).toLocaleDateString(undefined, { weekday:"short"})
            }
          </Text>
          <Text>{ day.description }.</Text>
        </Box>
        {
          day.hours.map((hour, hourIndex) => {
                const clickTarget = hour.status === 'NO_SHIFT'
                    ? undefined
                    : (event: MouseEvent) => gotToPlanner(event, hourIndex);
                const bgColor = hour.status === 'NO_SHIFT'
                    ? 'light-4'
                    : hour.status === 'FREE'
                    ? 'status-critical'
                    : hour.status === 'PARTIAL'
                    ? 'status-warning'
                    : 'status-ok';
                if (hour.description !== undefined) ++shiftCounter;
                const bgOpacity = hour.status === 'NO_SHIFT'
                    ? undefined
                    : shiftCounter % 2 === 0
                    ? 0.6
                    : 1
                return (
                    <Box
                        key={ `${day.description}#${hourIndex}` }
                        onClick={ clickTarget }
                        focusIndicator={ false }
                        style={ { zIndex: `calc(24 - ${hour.description})`, position: 'relative' } }
                        pad={ { top: 'xxxsmall' } }
                        width="100%"
                        height="4%"
                        round={ {
                            corner: (dayIndex === 0) && (hourIndex === 23)
                                ? 'bottom-left'
                                : (dayIndex === 6) && (hourIndex === 23)
                                ? 'bottom-right'
                                : undefined,
                            size: (hourIndex === 23) && ((dayIndex === 0) || (dayIndex === 6))
                                ? 'small'
                                : '0'
                          } }
                        background={ {
                            color: bgColor,
                            opacity: bgOpacity
                          } }>
                      <Box
                          align="center"
                          fill
                          background={ hour.endsAt.getTime() <= now.getTime()
                              ? {
                                  color: "dark-4",
                                  opacity: 'strong'
                                }
                              : undefined }>
                        { hour.description }
                      </Box>
                    </Box>);
              })
        }
      </Box>);
};

export { Day };
