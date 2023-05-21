import React, { useEffect, useState } from 'react';
import { AccordionPanel, Box, Text } from "grommet";
import useResponsiveScreen from '../../utils/responsiveUtils';
import { GetDriverActivitiesOfYear200ResponseInner, ReservationOverviewTotal, ReservationType } from '../../client/gui';
import { useAppContext, useReservationGuiApi } from '../../AppContext';
import { toLocalDateString, toLocaleTimeStringWithoutSeconds } from '../../utils/timeUtils';
import { CircleInformation } from 'grommet-icons';

const HistoryAccordionPanel = ({
  year,
  index,
  active
}: {
  year: ReservationOverviewTotal,
  index: number,
  active: boolean
}) => {

  const { isNotPhone } = useResponsiveScreen();
  const reservationGuiApi = useReservationGuiApi();
  const { showLoadingIndicator } = useAppContext();
  
  const [ details, setDetails ] = useState<Array<GetDriverActivitiesOfYear200ResponseInner> | undefined | null>(undefined);
  
  const balance = year.passangerServiceHours
      - year.carSharingHours;
      
  useEffect(() => {
    if (active && (details === undefined)) {
      showLoadingIndicator(true);
      const loadDetails = async () => {
          try {
            const result: Array<GetDriverActivitiesOfYear200ResponseInner> = await reservationGuiApi
                .getDriverActivitiesOfYear({ year: year.year });
            setDetails(result);
          } catch (error) {
             if (error.response?.status === 404) {
               setDetails(null);
             }
          } finally {
            showLoadingIndicator(false);
          }
        };
      loadDetails();
    }
  }, [ active, reservationGuiApi, showLoadingIndicator, details, year ]);

  return (
      <AccordionPanel
          key={ year.year }
          header={
              <Box
                  direction="row"
                  justify='between'
                  gap="small"
                  align="center"
                  pad="xsmall"
                  background={
                      index % 2 === 0
                          ? 'light-2'
                          : 'light-4'
                    }>
                <Box>{ year.year }</Box>
                <Box
                    gap="medium"
                    direction="row">
                  <Box
                      width={ isNotPhone ? '12rem' : '3.5rem' }
                      align="end">
                    <Text>
                      { year.carSharingHours }h
                    </Text>
                  </Box>
                  <Box
                      width={ isNotPhone ? '12rem' : '3.5rem' }
                      align="end">
                    <Text>
                      { year.passangerServiceHours }h
                    </Text>
                  </Box>
                  <Box
                      width={ isNotPhone ? '12rem' : '3.5rem' }
                      align="end">
                    <Text
                        color={ balance < 0 ? 'status-critical' : undefined }>
                      {
                        balance
                      }h
                    </Text>
                  </Box>
                </Box>
              </Box>
            }>
        {
          !Boolean(details)
              ? undefined
              : details!.map((detail, no) => (
                  <Box
                      direction="row"
                      justify='between'
                      gap="small"
                      align="center"
                      pad={ {
                          left: 'small',
                          right: 'xsmall',
                          vertical: 'xxsmall'
                        } }
                      background={
                          no % 2 === 0
                              ? 'white'
                              : 'light-1'
                        }>
                    <Box
                        direction="row"
                        align="middle"
                        gap="xsmall">
                      <Text>{ detail!.startsAt.toLocaleDateString() }</Text>
                      {
                        isNotPhone
                            ? <Text>{ toLocaleTimeStringWithoutSeconds(detail!.startsAt) }</Text>
                            : undefined
                      }
                      <CircleInformation />
                    </Box>
                    <Box
                        gap="medium"
                        direction="row">
                      <Box
                          width={ isNotPhone ? '12rem' : '3.5rem' }
                          align="end">
                      
                        {
                          detail.type === ReservationType.Cs
                              ? <Text>{ detail.usageMinutes! / 60 }h</Text>
                              : undefined
                        }
                      </Box>
                      <Box
                          width={ isNotPhone ? '12rem' : '3.5rem' }
                          align="end">
                        {
                          detail.type === ReservationType.Ps
                              ? <Text>{ detail.usageMinutes! / 60 }h</Text>
                              : undefined
                        }
                      </Box>
                      <Box
                          width={ isNotPhone ? '12rem' : '3.5rem' }
                          align="end">
                        {
                          detail.type === ReservationType.Cs
                              ? <Text>-{ detail.usageMinutes! / 60 }h</Text>
                              : detail.type === ReservationType.Ps
                              ? <Text>{ detail.usageMinutes! / 60 }h</Text>
                              : undefined
                        }
                      </Box>
                    </Box>
                  </Box>))
        }
      </AccordionPanel>);
};

export { HistoryAccordionPanel };
