import { useEffect, useState } from 'react';
import { AccordionPanel, Box, Grid, Text } from "grommet";
import useResponsiveScreen from '../../utils/responsiveUtils';
import { GetDriverActivitiesOfYear200ResponseInner, ReservationOverviewTotal, ReservationType } from '../../client/gui';
import { useAppContext, useReservationGuiApi } from '../../AppContext';
import { toLocaleTimeStringWithoutSeconds } from '../../utils/timeUtils';
import { Car, CircleInformation, Schedule } from 'grommet-icons';
import { Modal } from '../../components/Modal';
import { useTranslation } from 'react-i18next';
import { Heading } from '../../components/MainLayout';

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
  const { t } = useTranslation('driver/history');

  const [ details, setDetails ] = useState<Array<GetDriverActivitiesOfYear200ResponseInner> | undefined | null>(undefined);
  const [ modal, setModal ] = useState<GetDriverActivitiesOfYear200ResponseInner | undefined>(undefined);
  
  const balance = year.passengerServiceHours
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
                      { year.passengerServiceHours }h
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
                      key={ detail.id }
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
                        align="center"
                        gap="medium">
                      <Text>{ detail!.startsAt.toLocaleDateString() }</Text>
                      {
                        isNotPhone
                            ? <Text>{ toLocaleTimeStringWithoutSeconds(detail!.startsAt) }</Text>
                            : undefined
                      }
                      <CircleInformation
                          onClick={ () => setModal(detail) }
                          size="18rem" />
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
        {
          Boolean(modal)
              ? <Modal
                    show={ true }
                    t={t}
                    abort={ () => setModal(undefined) }
                    abortLabel='OK'
                    header={
                      <Box
                          direction='row'
                          gap="medium"
                          align="center">
                        <Heading
                            icon={
                              modal!.type === ReservationType.Cs
                                  ? <Car size={ isNotPhone ? '30rem' : undefined } />
                                  : modal!.type === ReservationType.Ps
                                  ? <Schedule size={ isNotPhone ? '30rem' : undefined } />
                                  : undefined
                            }>
                          {
                            t(modal!.type === ReservationType.Cs
                                ? 'car-sharing'
                                : modal!.type === ReservationType.Ps
                                ? 'passenger-service'
                                : 'unknown')
                          }
                        </Heading>
                      </Box>
                    }>
                  <Grid
                      columns={ [ 'auto', 'flex' ] }
                      pad={ { vertical: 'medium' } }
                      gap="xsmall">
                    <Text><i>{ t('detail-modal-from') }</i></Text>
                    <Text textAlign="end">{ modal!.startsAt.toLocaleString() }</Text>
                    <Text><i>{ t('detail-modal-until') }</i></Text>
                    <Text textAlign="end">{ modal!.endsAt.toLocaleString() }</Text>
                    <Text><i>{ t('detail-modal-duration') }</i></Text>
                    <Text textAlign="end">{ modal!.usageMinutes! / 60 }h</Text>
                    <Text><i>{ t('detail-modal-car') }</i></Text>
                    <Text textAlign="end">{ modal!.carName }</Text>
                    {
                      modal!.kmAtStart && modal!.kmAtEnd
                          ? <>
                              <Text><i>{ t('detail-modal-distance') }</i></Text>
                              <Text textAlign="end">{ modal!.kmAtEnd! - modal!.kmAtStart! }km</Text>
                            </>
                          : undefined
                    }
                  </Grid>
                  <Heading
                      level='3'>
                    Details:
                  </Heading>
                  {
                    modal!.type === ReservationType.Cs
                        ? <Grid
                            columns={ [ 'auto', 'flex' ] }
                            pad={ { vertical: 'medium' } }
                            gap="xsmall">
                          <Text><i>{ t('detail-modal-reserved-at') }</i></Text>
                          <Text textAlign="end">{ modal!.createdAt?.toLocaleString() }</Text>
                          <Text><i>{ t('detail-modal-usage-from') }</i></Text>
                          <Text textAlign="end">
                            {
                              modal!.startUsage === undefined
                                  ? t('detail-modal-usage-from-not-confirmed')
                                  : modal!.startUsage?.toLocaleString()
                            }
                          </Text>
                          <Text><i>{ t('detail-modal-usage-until') }</i></Text>
                          <Text textAlign="end">
                            {
                              modal!.endUsage !== undefined
                                  ? modal!.endUsage?.toLocaleString()
                                  : modal!.status === "NOT_CONFIRMED"
                                  ? t('detail-modal-usage-until-not-confirmed')
                                  : t('detail-modal-usage-until-cancelled')
                            }
                          </Text>
                          {
                            modal!.startUsage !== undefined
                                ? <>
                                    <Text><i>{ t('detail-modal-km-start') }</i></Text>
                                    <Text textAlign="end">{ modal!.kmAtStart }km</Text>
                                  </>
                                : undefined
                          }
                          {
                            modal!.endUsage !== undefined
                                ? <>
                                    <Text><i>{ t('detail-modal-km-end') }</i></Text>
                                    <Text textAlign="end">{ modal!.kmAtEnd }km</Text>
                                  </>
                                : undefined
                          }
                          {
                            modal!.lastInteractionComment !== undefined
                                ? <>
                                  <Text><i>{ t('detail-modal-last-interaction-comment') }</i></Text>
                                  <Text textAlign="end">"{ modal!.lastInteractionComment }"</Text>
                                </>
                                : undefined
                          }
                        </Grid>
                        : modal!.type === ReservationType.Ps
                            ? <Grid
                                columns={ [ 'auto', 'flex' ] }
                                pad={ { vertical: 'medium' } }
                                gap="xsmall">
                              <Text><i>{ t('detail-modal-km-start') }</i></Text>
                              <Text textAlign="end">{ modal!.kmAtStart }km</Text>
                              <Text><i>{ t('detail-modal-km-end') }</i></Text>
                              <Text textAlign="end">{ modal!.kmAtEnd }km</Text>
                            </Grid>
                            : undefined
                  }
                </Modal>
              : <></>
        }
      </AccordionPanel>);
};

export { HistoryAccordionPanel };
