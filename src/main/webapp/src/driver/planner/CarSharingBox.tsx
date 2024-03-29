import { Box, Text } from "grommet";
import { Configure, Expand, FormClose } from "grommet-icons";
import { BackgroundType, BorderType } from "grommet/utils";
import { MouseEvent, useCallback, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAppContext } from "../../AppContext";
import { PlannerCar, PlannerReservation, Role } from "../../client/gui";
import { UserAvatar } from "../../components/UserAvatar";
import i18n from '../../i18n';
import useOnClickOutside from "../../utils/clickOutside";
import { timeAsString } from "../../utils/timeUtils";
import { useCarSharingApi } from "../DriverAppContext";
import { PlannerButton } from "./PlannerButton";
import { PlannerContextMenu } from "./PlannerContextMenu";
import { CalendarHour, ReservationDrivers, SelectionAction } from "./utils";
import { BoxModal, ReasonModalProperties } from "./BoxModal";

i18n.addResources('en', 'driver/planner/car-sharing', {
      "no-remaining-hours_title": "Car-Sharing",
      "no-remaining-hours_msg": "The quota has been used up!",
      "max-reservations_title": "Car-Sharing",
      "max-reservations_msg": "The maximum number of car-sharing reservations is reached: {{value}}!",
      "conflicting-reservation_title": "Car-Sharing",
      "conflicting-reservation_msg": "This view is not up to date! Meanwhile there is a conflicting reservation. Please go back and reenter to refresh the view.",
      "conflicting-incoming_title": "Car-Sharing",
      "conflicting-incoming_msg": "Another driver created a conflicting reservation. Your selection was removed.",
      "parallel-carsharing_title": "Car-Sharing",
      "parallel-carsharing_msg": "You have another reservation in parallel for '{{value}}'!",
      "parallel-passengerservice_title": "Car-Sharing",
      "parallel-passengerservice_msg": "You are planned for passenger-service on '{{value}}' in parallel!",
      "cancel-header": "Cancellation of car-sharing",
      "cancel-reason": "Reason for cancellation:",
      "cancel-abort": "Don't cancel",
      "cancel-submit": "Cancel",
      "resize-header": "Timebox of car-sharing",
      "resize-reason": "Reason for change:",
      "resize-abort": "Don't change",
      "resize-submit": "Change",
    });
i18n.addResources('de', 'driver/planner/car-sharing', {
      "no-remaining-hours_title": "Car-Sharing",
      "no-remaining-hours_msg": "Dein Car-Sharing-Kontingent ist bereits aufgebraucht!",
      "max-reservations_title": "Car-Sharing",
      "max-reservations_msg": "Du hast bereits die maximale Anzahl an Car-Sharing-Reservierungen gebucht: {{value}}!",
      "conflicting-reservation_title": "Car-Sharing",
      "conflicting-reservation_msg": "Diese Ansicht ist nicht aktuell! Mittlerweile gibt es eine andere Reservierung in dieser Zeit. Bitte wechsle zur vorigen Ansicht steige neu ein, um die Ansicht zu aktualisieren.",
      "conflicting-incoming_title": "Car-Sharing",
      "conflicting-incoming_msg": "Ein(e) andere(r) Fahrer(in) hat eine Reservierung in der Zeit deiner Auswahl eingetragen, weshalb sie entfernt wurde.",
      "parallel-carsharing_title": "Car-Sharing",
      "parallel-carsharing_msg": "Du hast zeitgleich eine andere Car-Sharing-Reservierung für '{{value}}'!",
      "parallel-passengerservice_title": "Car-Sharing",
      "parallel-passengerservice_msg": "Du hast zeitgleich Fahrtendienst mit '{{value}}' eingetragen!",
      "cancel-header": "Car-Sharing stornieren",
      "cancel-reason": "Begründung für das Stornieren:",
      "cancel-abort": "Nicht stornieren",
      "cancel-submit": "Stornieren",
      "resize-header": "Zeitraum Car-Sharing",
      "resize-reason": "Begründung für die Änderung:",
      "resize-abort": "Nicht ändern",
      "resize-submit": "Ändern",
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
  activateSelection: (reservation: PlannerReservation, ownerId: number | null | undefined, carId: string, actions: Array<SelectionAction>) => void,
  cancelSelection: () => void,
}) => {
  const { state, toast, showLoadingIndicator } = useAppContext();
  const { t } = useTranslation('driver/planner/car-sharing');
  const carSharingApi = useCarSharingApi();

  const [ reasonModal, setReasonModal ] = useState<ReasonModalProperties>(undefined);

  const isUsersReservation = hour.reservation?.driverMemberId === state.currentUser!.memberId;
  const hasCancelButton = hour.reservation!.status === 'RESERVED';
  const hasResizeButton = ((hour.reservation!.status === 'RESERVED')
        && (hour.reservation.startsAt.getTime() > new Date().getTime()))
  const hasEditMenu = isLastHourOfReservation
      && (hasCancelButton || hasResizeButton)
      && (isUsersReservation
          || state.currentUser!.roles!.includes(Role.Admin)
          || state.currentUser!.roles!.includes(Role.Manager));

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

  const requestCancellation = (event: MouseEvent) => {
      setShowEditMenu(false);
      if (state.currentUser!.memberId === hour.reservation!.driverMemberId!) {
        cancelReservation(car.id, hour.reservation!.id);
        return;
      }
      setReasonModal({
        requestComment: true,
        prefix: 'cancel',
        onAbort: () => setReasonModal(undefined),
        hint: t('cancel-reason'),
        action: (comment) => {
          setShowEditMenu(false);
          setReasonModal(undefined);
          cancelReservation(car.id, hour.reservation!.id, comment);
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
    if ((startsAt.getTime() === hour.reservation.startsAt.getTime())
        && (endsAt.getTime() === hour.reservation.endsAt.getTime())) {
      return;
    }
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
          namespace: 'driver/planner/car-sharing',
          title: 'conflicting-reservation_title',
          message: 'conflicting-reservation_msg',
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
                namespace: 'driver/planner/car-sharing',
                title: `${violation}_title`,
                message: `${violation}_msg`,
                tOptions: { value: violations[violation] },
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
          [ {
              action: doResizing,
              modalTPrefix: isOwner ? undefined : 'resize',
              modalT: isOwner ? undefined : t
            } ]);
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
          background={ backgroundColor } >
        {
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
        }
      </Box>
      <BoxModal
          t={ t }
          reasonModal={ reasonModal } />
    </>);
};

 export {
   CarSharingBox
 };
 