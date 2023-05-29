import { Box, Text, TextArea } from "grommet";
import { Configure, FormClose } from "grommet-icons";
import { BackgroundType, BorderType } from "grommet/utils";
import React, { MouseEvent, useCallback, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAppContext } from "../../AppContext";
import { PlannerCar, Role } from "../../client/gui";
import { Modal } from "../../components/Modal";
import { UserAvatar } from "../../components/UserAvatar";
import useOnClickOutside from "../../utils/clickOutside";
import { timeAsString } from "../../utils/timeUtils";
import { PlannerButton } from "./PlannerButton";
import { PlannerContextMenu } from "./PlannerContextMenu";
import { CalendarHour, ReservationDrivers } from "./utils";
import i18n from '../../i18n';
import useResponsiveScreen from "../../utils/responsiveUtils";

i18n.addResources('en', 'driver/planner/carsharing', {
      "cancellation": "Cancellation of car-sharing",
      "reason": "Reason for cancellation:",
      "abort": "Don't cancel",
      "cancel": "Cancel",
    });
i18n.addResources('de', 'driver/planner/carsharing', {
      "cancellation": "Car-Sharing abbrechen",
      "reason": "Begründung für das Abbrechen:",
      "abort": "Nicht abbrechen",
      "cancel": "Abbrechen",
    });

const CarSharingBox = ({
    hour,
    car,
    isFirstHourOfReservation,
    isLastHourOfReservation,
    drivers,
    cancelReservation,
  }: {
    hour: CalendarHour,
    car: PlannerCar,
    isFirstHourOfReservation: boolean,
    isLastHourOfReservation: boolean,
    drivers: ReservationDrivers,
    cancelReservation: (event: MouseEvent | undefined, carId: string, reservationId: string, comment?: string) => void,
  }) => {
    const { state } = useAppContext();
    const { t } = useTranslation('driver/planner/carsharing');
    const { isPhone } = useResponsiveScreen();

    const hasCancelButton = isLastHourOfReservation
        && (hour.reservation!.status === 'RESERVED')
        && (hour.reservation?.driverMemberId === state.currentUser!.memberId);
    const hasEditMenu = isLastHourOfReservation
        && (state.currentUser!.roles!.includes(Role.Admin)
            || state.currentUser!.roles!.includes(Role.Manager));
    const [ reasonModal, setReasonModal ] = useState<{
        title: string,
        text: string,
        cancelReservation: (comment: string) => void
      } | undefined>(undefined);

    const [comment, setComment] = React.useState('');
    const cancelReservationByAdmin = useCallback((event: MouseEvent) => {
        if (state.currentUser!.memberId === hour.reservation!.driverMemberId!) {
          cancelReservation(event, car.id, hour.reservation!.id);
          return;
        }
        setShowEditMenu(false);
        setReasonModal({
            title: t('cancellation'),
            text: t('reason'),
            cancelReservation: (currentComment) => cancelReservation(undefined, car.id, hour.reservation!.id, currentComment)
          });
      }, [ state.currentUser, cancelReservation, car.id, hour.reservation, t ]);
    
    const [ showEditMenu, setShowEditMenu ] = useState(false);
    const ref = useRef(null);
    useOnClickOutside(ref, event => {
        if (!showEditMenu) return;
        event.preventDefault();
        event.stopPropagation();
        setShowEditMenu(false);
      });
      
    const borderColor =
        hour.reservation?.driverMemberId === state.currentUser!.memberId
            ? 'accent-3'
            : 'dark-4';
    const borders: BorderType = [];
    borders.push({ side: "vertical", color: borderColor, size: '1px' });
    if (isFirstHourOfReservation) {
      borders.push({ side: "top", color: borderColor, size: '1px' });
    }
    if (isLastHourOfReservation) {
      borders.push({ side: "bottom", color: borderColor, size: '1px' });
    }
    
    const backgroundColor: BackgroundType | undefined =
        hour.reservation?.driverMemberId === state.currentUser!.memberId
            ? { color: 'accent-3', opacity: 'strong' }
            : { color: 'light-4', opacity: 'strong' };
    
    return (
      <>
        {
          !showEditMenu && hasEditMenu
              ? <PlannerButton
                    action={ () => setShowEditMenu(true) }
                    background='dark-4'
                    icon={ Configure } />
              : !showEditMenu && hasCancelButton
              ? <PlannerButton
                    action={ (event) => cancelReservation(event, car.id, hour.reservation!.id) }
                    background='status-critical'
                    icon={ FormClose }
                    iconSize='30rem' />
              : undefined
        }
        {
          showEditMenu
              ? <PlannerContextMenu
                    ref={ ref }>
                  <PlannerButton
                      inContextMenu
                      action={ () => setShowEditMenu(false) }
                      background='dark-4'
                      showBorder={false}
                      icon={ Configure } />
                  <PlannerButton
                    inContextMenu
                    action={ (event) => cancelReservationByAdmin(event) }
                    background='status-critical'
                    icon={ FormClose }
                    iconSize='30rem' />
                </PlannerContextMenu>
              : undefined
        }
        <Box
            pad={ {
                horizontal: 'xsmall',
                vertical: '1px'
              } }
            fill
            gap='xsmall'
            direction="row"
            border={ borders }
            background={ backgroundColor } >{
          isFirstHourOfReservation
              ? <>
                  <UserAvatar
                      size='small'
                      border={ { color: 'dark-4', size: '1px' }}
                      user={ drivers[ hour.reservation!.driverMemberId! ] } />
                  <Box
                      pad={ { horizontal: 'xsmall' } } >
                    <Text
                        truncate>{
                      timeAsString(hour.reservation!.startsAt)
                    } - {
                      timeAsString(hour.reservation!.endsAt)
                    }</Text>
                  </Box>
                </>
              : <>&nbsp;</>
        }</Box>
        <Modal
            show={ Boolean(reasonModal) }
            t={ t }
            header='cancellation'
            abort={ () => {
                setComment('');
                setReasonModal(undefined);
              } }
            abortLabel='abort'
            action={ () => {
                reasonModal!.cancelReservation(comment);
                setComment('');
              } }
            actionLabel='cancel'
            actionDisabled={ !Boolean(comment) }>
          <Box
              direction="column"
              pad={ { vertical: isPhone ? 'large' : 'small' } }
              gap={ isPhone ? 'medium' : 'small' }>
            { t('reason') }
            <TextArea
                value={ comment }
                onChange={ event => setComment(event.target.value) }
              />
          </Box>
        </Modal>
      </>);
  };

 export {
   CarSharingBox
 };
 