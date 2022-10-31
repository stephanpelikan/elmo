import { Box, Text } from 'grommet';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ShiftOverviewDay } from '../../client/gui';

const Day = ({
    dayIndex,
    day
}: {
    dayIndex: number,
    day: ShiftOverviewDay
}) => {
  
  const { t } = useTranslation('driver');
  const navigate = useNavigate();
  
  const gotToPlanner = (event: MouseEvent, hourIndex: number) => {
      let hour = undefined;
      do {
        hour = day.hours[hourIndex];
        --hourIndex;
      } while ((hourIndex > 0) && (hour.description === undefined));
      navigate(`.${t('url-planner')}?${day.date}_${hour.carId}_${hour.description}`);
    };
  
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
                        style={ { zIndex: `calc(24 - ${hour.description})` } }
                        pad={ { top: 'xxxsmall' } }
                        width="100%"
                        height="4%"
                        align="center"
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
                      { hour.description }
                    </Box>);
              })
        }
      </Box>);
};

export { Day };
