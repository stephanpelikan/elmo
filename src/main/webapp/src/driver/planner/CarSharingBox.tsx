import { Box, Text, TextArea } from "grommet";
import { Configure, Expand, FormClose } from "grommet-icons";
import { BackgroundType, BorderType } from "grommet/utils";
import { TFunction } from "i18next";
import { MouseEvent, useCallback, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAppContext } from "../../AppContext";
import { PlannerCar, PlannerReservation, Role } from "../../client/gui";
import { Modal } from "../../components/Modal";
import { UserAvatar } from "../../components/UserAvatar";
import i18n from '../../i18n';
import useOnClickOutside from "../../utils/clickOutside";
import useResponsiveScreen from "../../utils/responsiveUtils";
import { timeAsString } from "../../utils/timeUtils";
import { useCarSharingApi } from "../DriverAppContext";
import { PlannerButton } from "./PlannerButton";
import { PlannerContextMenu } from "./PlannerContextMenu";
import { CalendarHour, ReservationDrivers } from "./utils";

i18n.addResources('en', 'driver/planner/carsharing', {
      "conflicting-reservation_title": "Passenger Service",
      "conflicting-reservation_msg": "This view is not up to date! Meanwhile another driver claimed the shift. Please go back and reenter to refresh the view.",
      "parallel-carsharing_title": "Passenger Service",
      "parallel-carsharing_msg": "You have another car-sharing reservation in parallel for '{{value}}'!",
      "parallel-passengerservice_title": "Passenger Service",
      "parallel-passengerservice_msg": "You are planned yourself for passenger-service on '{{value}}' in parallel!",
      "cancellation-header": "Cancellation of car-sharing",
      "cancellation-reason": "Reason for cancellation:",
      "cancellation-abort": "Don't cancel",
      "cancellation-cancel": "Cancel",
      "resize-header": "Timebox of car-sharing",
      "resize-reason": "Reason for change:",
      "resize-abort": "Don't change",
      "resize-cancel": "Change",
    });
i18n.addResources('de', 'driver/planner/carsharing', {
      "conflicting-reservation_title": "Fahrtendienst",
      "conflicting-reservation_msg": "Diese Ansicht ist nicht aktuell! Mittlerweile wurde der Fahrtendienst bereits übernommen. Bitte wechsle zur vorigen Ansicht steige neu ein, um die Ansicht zu aktualisieren.",
      "parallel-carsharing_title": "Fahrtendienst",
      "parallel-carsharing_msg": "Du hast zeitgleich eine andere Car-Sharing-Reservierung für '{{value}}'!",
      "parallel-passengerservice_title": "Fahrtendienst",
      "parallel-passengerservice_msg": "Du hast zeitgleich Fahrtendienst mit '{{value}}' eingetragen!",
      "cancellation-header": "Car-Sharing stornieren",
      "cancellation-reason": "Begründung für das Stornieren:",
      "cancellation-abort": "Nicht stornieren",
      "cancellation-cancel": "Stornieren",
      "resize-header": "Zeitraum Car-Sharing",
      "resize-reason": "Begründung für die Änderung:",
      "resize-abort": "Nicht ändern",
      "resize-cancel": "Ändern",
    });

const CarSharingBox = ({
    hour,
    car,
    isFirstHourOfReservation,
    isLastHourOfReservation,
    drivers,
    activateSelection,
    cancelSelection,
  }: {
    hour: CalendarHour,
    car: PlannerCar,
    isFirstHourOfReservation: boolean,
    isLastHourOfReservation: boolean,
    drivers: ReservationDrivers,
    activateSelection: (reservation: PlannerReservation, ownerId: number | null | undefined, carId: string, action: (startsAt: Date, endsAt: Date, comment?: string) => void, modalPrefix?: string, modalT?: TFunction) => void,
    cancelSelection: () => void,
  }) => {
    const { state, toast, showLoadingIndicator } = useAppContext();
    const { t } = useTranslation('driver/planner/carsharing');
    const { isPhone } = useResponsiveScreen();
    const carSharingApi = useCarSharingApi();

    const isUsersReservation = hour.reservation?.driverMemberId === state.currentUser!.memberId;
    const hasCancelButton = hour.reservation!.status === 'RESERVED';
    const hasResizeButton = ((hour.reservation!.status === 'RESERVED')
          && (hour.reservation.startsAt.getTime() > new Date().getTime()))
    const hasEditMenu = isLastHourOfReservation
        && (hasCancelButton || hasResizeButton)
        && (isUsersReservation
            || state.currentUser!.roles!.includes(Role.Admin)
            || state.currentUser!.roles!.includes(Role.Manager));
    const [ reasonModal, setReasonModal ] = useState<{
        prefix: string,
        action: (comment: string) => void
      } | undefined>(undefined);

    const [ showEditMenu, _setShowEditMenu ] = useState(false);
    const setShowEditMenu = useCallback((show: boolean) => {
        cancelSelection();
        _setShowEditMenu(show);
      }, [ _setShowEditMenu, cancelSelection ]);

    const cancelReservation = async (carId: string, reservationId: string, comment?: string) => {
        try {
          showLoadingIndicator(true);
          await carSharingApi.cancelCarSharingReservation({
            carId,
            reservationId,
            body: comment
          });
          // selection will be cancelled by server-sent update
        } catch (error) {
          console.log(error);
          showLoadingIndicator(false);
        }
      };

    const [comment, setComment] = useState('');
    const requestCancellation = (event: MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();
        if (state.currentUser!.memberId === hour.reservation!.driverMemberId!) {
          cancelReservation(car.id, hour.reservation!.id);
          return;
        }
        setShowEditMenu(false);
        setReasonModal({
          prefix: 'cancellation',
          action: (currentComment) => {
            setReasonModal(undefined);
            cancelReservation(car.id, hour.reservation!.id, currentComment);
          }
        });
      };

    const ref = useRef(null);
    useOnClickOutside(ref, event => {
        if (!showEditMenu) return;
        event.preventDefault();
        event.stopPropagation();
        setShowEditMenu(false);
      });

    const doResizing = async (startsAt: Date, endsAt: Date, comment?: string) => {
      try {
        showLoadingIndicator(true);
        await carSharingApi.resizeCarSharingReservation({
          carId: car.id,
          reservationId: hour.reservation!.id,
          resizeReservationRequest: { startsAt, endsAt, comment }
        });
      } catch (error) {
        showLoadingIndicator(false);
        // CONFLICT means there is another reservation
        if (error.response?.status === 409) {
          toast({
            namespace: 'driver/planner/carsharing',
            title: t('conflicting-reservation'),
            message: t('conflicting-reservation_msg'),
            status: 'critical'
          });
        }
        // violations response
        else if (error.response?.json) {
          const violations = await error.response?.json()
          Object
              .keys(violations)
              .forEach(violation => {
                toast({
                  namespace: 'driver/planner/carsharing',
                  title: t(`${violation}_title`),
                  message: t(`${violation}_msg`, { value: violations[violation] }),
                  status: 'critical'
                });
              });
        } else {
          console.error(error);
        }
      }
    };
    const requestResizing = (event: MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();
        const isOwner = state.currentUser!.memberId === hour.reservation!.driverMemberId!;
        setReasonModal(undefined);
        activateSelection(
            hour.reservation,
            hour.reservation.driverMemberId,
            car.id,
            doResizing,
            isOwner ? undefined : 'resize',
            isOwner ? undefined : t);
    };

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
                  {
                    hasCancelButton
                        ? <PlannerButton
                              inContextMenu
                              action={ requestCancellation }
                              background='status-critical'
                              icon={ FormClose }
                              iconSize='30rem' />
                        : undefined
                  }
                  {
                    hasResizeButton
                        ? <PlannerButton
                              inContextMenu
                              action={ requestResizing }
                              background='dark-2'
                              icon={ Expand } />
                        : undefined
                  }
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
            header={ `${reasonModal?.prefix}-header` }
            abort={ () => {
                setComment('');
                setReasonModal(undefined);
              } }
            abortLabel={ `${reasonModal?.prefix}-abort` }
            action={ () => {
                reasonModal!.action(comment);
                setComment('');
              } }
            actionLabel={ `${reasonModal?.prefix}-cancel` }
            actionDisabled={ !Boolean(comment) }>
          <Box
              direction="column"
              pad={ { vertical: isPhone ? 'large' : 'small' } }
              gap={ isPhone ? 'medium' : 'small' }>
            { t(`${reasonModal?.prefix}-reason`) }
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
 