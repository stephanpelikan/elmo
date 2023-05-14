import React from 'react';
import { AccordionPanel, Box, Text } from "grommet";
import { Car, Schedule } from 'grommet-icons';
import useResponsiveScreen from '../../utils/responsiveUtils';
import { ReservationOverviewTotal } from '../../client/gui';

const HistoryAccordionPanel = ({
    year,
    index
  }: {
    year: ReservationOverviewTotal,
    index: number
  }) => {
    const { isNotPhone } = useResponsiveScreen();
    
    const total = year.passangerServiceHours
        - year.carSharingHours;

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
                        width={ isNotPhone ? '12rem' : '4.8rem' }
                        align="end">
                      <Box
                          direction="row"
                          gap="xsmall">                      
                        <Text>
                          { year.carSharingCount}x
                        </Text>
                        <Text>
                          =
                        </Text>
                        <Text>
                          { year.carSharingHours }h
                        </Text>
                      </Box>
                    </Box>
                    <Box
                        width={ isNotPhone ? '12rem' : '4.8rem' }
                        align="end">
                      <Box
                          direction="row"
                          gap="xsmall">                      
                        <Text>
                          { year.passangerServiceCount }x
                        </Text>
                        <Text>
                          =
                        </Text>
                        <Text>
                          { year.passangerServiceHours }h
                        </Text>
                      </Box>
                    </Box>
                    <Box
                        width={ isNotPhone ? '12rem' : '4.8rem' }
                        align="end">
                      <Text
                          color={ total < 0 ? 'status-critical' : undefined }>
                        {
                          total
                        }h
                      </Text>
                    </Box>
                  </Box>
                </Box>
              }>
          { year.year }
        </AccordionPanel>);
  };

export { HistoryAccordionPanel };
