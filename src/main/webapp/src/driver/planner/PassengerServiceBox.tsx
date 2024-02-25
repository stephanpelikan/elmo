import { Box, Table, TableBody, TableCell, TableRow, Text } from 'grommet';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n';
import { MouseEvent, useRef, useState } from "react";
import { CalendarHour, ReservationDrivers, useWakeupSseCallback } from './utils';
import { BackgroundType, BorderType } from 'grommet/utils';
import { useAppContext } from '../../AppContext';
import { Configure, FormClose, Transaction, User, UserFemale } from 'grommet-icons';
import { PlannerButton } from './PlannerButton';
import { usePassengerServiceApi } from '../DriverAppContext';
import { UserAvatar } from '../../components/UserAvatar';
import { PlannerContextMenu } from './PlannerContextMenu';
import { PlannerCar, Role, ShiftStatus } from '../../client/gui';
import useOnClickOutside from '../../utils/clickOutside';
import { BoxModal, ReasonModalProperties } from "./BoxModal";
import { now } from "../../utils/now-hook";
import { Modal } from "../../components/Modal";
import { TableCellExtendedProps } from "grommet/components/TableCell";
import { toLocaleTimeStringWithoutSeconds } from "../../utils/timeUtils";

i18n.addResources('en', 'driver/planner/passenger-service', {
      "reservation-type": "Passenger Service",
      "conflicting-driver_title": "Passenger Service",
      "conflicting-driver_msg": "This view is not up to date! Meanwhile another driver claimed the shift. Please go back and reenter to refresh the view.",
      "parallel-carsharing_title": "Passenger Service",
      "parallel-carsharing_msg": "You have another car-sharing reservation in parallel for '{{value}}'!",
      "parallel-passengerservice_title": "Passenger Service",
      "parallel-passengerservice_msg": "You are planned yourself for passenger-service on '{{value}}' in parallel!",
      "unclaim-header": "Unclaim shift?",
      "unclaim-abort": "Abort",
      "unclaim-submit": "Unclaim",
      "unclaim-reason": " Please enter a reason:",
      "unclaim_hint_by-driver": "Unclaiming the shift may cause unserved passenger rides!",
      "unclaim_hint_by-admin": "The currently registered person will be informed about the removal!",
      "cancel-header": "Cancel shift?",
      "cancel-abort": "Abort",
      "cancel-submit": "Confirm",
      "cancel-reason": " Please enter a reason:",
      "cancel-hint": "Cancelling the shift may cause unserved passenger rides!",
      "info-abort": "Dismiss",
    });

i18n.addResources('de', 'driver/planner/passenger-service', {
      "reservation-type": "Fahrtendienst",
      "conflicting-driver_title": "Fahrtendienst",
      "conflicting-driver_msg": "Diese Ansicht ist nicht aktuell! Mittlerweile wurde der Fahrtendienst bereits übernommen. Bitte wechsle zur vorigen Ansicht steige neu ein, um die Ansicht zu aktualisieren.",
      "conflicting-reservation_title": "Fahrtendienst",
      "conflicting-reservation_msg": "Diese Ansicht ist nicht aktuell! Mittlerweile wurde der Fahrtendienst bereits übernommen. Bitte wechsle zur vorigen Ansicht steige neu ein, um die Ansicht zu aktualisieren.",
      "parallel-carsharing_title": "Fahrtendienst",
      "parallel-carsharing_msg": "Du hast zeitgleich eine andere Car-Sharing-Reservierung für '{{value}}'!",
      "parallel-passengerservice_title": "Fahrtendienst",
      "parallel-passengerservice_msg": "Du hast zeitgleich Fahrtendienst mit '{{value}}' eingetragen!",
      "unclaim-header": "Aus der Schicht austragen?",
      "unclaim-submit": "Austragen",
      "unclaim-abort": "Abbrechen",
      "unclaim-reason": " Bitte gib eine Begründung an:",
      "unclaim_hint_by-driver": "Sich aus der Schicht auszutragen könnte zu unerfüllbaren Passagierfahrten führen!",
      "unclaim_hint_by-admin": "Die aktuell eingetragene Person wird über das Austragen informiert!",
      "cancel-header": "Schicht entfernen",
      "cancel-abort": "Abbrechen",
      "cancel-submit": "Bestätigen",
      "cancel-reason": " Bitte gib eine Begründung an:",
      "cancel-hint": "Die Schicht zu entfernen könnte zu unerfülllbaren Passagierfahrten führen!",
      "info-abort": "Schließen"
    });

const infoTableCellDefaultProps: TableCellExtendedProps = {
  pad: { vertical: 'xsmall' }
};

const PassengerServiceBox = ({
  car,
  hour,
  isFirstHourOfReservation,
  isLastHourOfReservation,
  drivers,
}: {
  car: PlannerCar,
  hour: CalendarHour,
  isFirstHourOfReservation: boolean,
  isLastHourOfReservation: boolean,
  drivers: ReservationDrivers,
}) => {
  const { state, toast, showLoadingIndicator } = useAppContext();
  const { t } = useTranslation('driver/planner/passenger-service');
  const wakeupSseCallback = useWakeupSseCallback();
  const passengerServiceApi = usePassengerServiceApi(wakeupSseCallback);

  const [ reasonModal, setReasonModal ] = useState<ReasonModalProperties>(undefined);

  const claim = async () => {
      setShowEditMenu(false);
      try {
        showLoadingIndicator(true);
        await passengerServiceApi.claimShift({ shiftId: hour.reservation!.id });
      } catch(error) {
        showLoadingIndicator(false);
        // CONFLICT means there is another reservation
        if (error.response?.status === 409) {
          toast({
              namespace: 'driver/planner/passenger-service',
              title: 'conflicting-driver_title',
              message: 'conflicting-driver_msg',
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
                      namespace: 'driver/planner/passenger-service',
                      title: `${violation}_title`,
                      message: `${violation}_msg`,
                      tOptions: { value: violations[violation] },
                      status: 'critical'
                    });
              });
        }
      }
    };

  const requestUnclaim = () => {
      setShowEditMenu(false);
      const within48Hours = (hour.startsAt.getTime() - now.getTime()) < 1000 * 3600 * 48;
      setReasonModal({
        requestComment: within48Hours,
        prefix: 'unclaim',
        onAbort: () => setReasonModal(undefined),
        hint:
            t(ownedByCurrentUser ? 'unclaim_hint_by-driver' : 'unclaim_hint_by-admin')
            + (within48Hours ? t('unclaim-reason') : ''),
        action: async comment => {
          setShowEditMenu(false);
          setReasonModal(undefined);
          try {
            showLoadingIndicator(true);
            await passengerServiceApi.unclaimShift({ shiftId: hour.reservation!.id });
          } catch(error) {
            showLoadingIndicator(false);
          }
        }
      });
    };

  const requestSwap = async () => {
      setShowEditMenu(false);
      try {
        showLoadingIndicator(true);
        await passengerServiceApi.requestSwapOfShift({ shiftId: hour.reservation!.id })
      } catch(error) {
        showLoadingIndicator(false);
      }
    };

  const confirmSwap = async () => {
      setShowEditMenu(false);
      try {
        showLoadingIndicator(true);
        await passengerServiceApi.confirmSwapOfShift({ shiftId: hour.reservation!.id })
      } catch(error) {
        showLoadingIndicator(false);
      }
    };

  const cancelSwap = async () => {
    setShowEditMenu(false);
    try {
      showLoadingIndicator(true);
      await passengerServiceApi.cancelOrRejectSwapOfShift({ shiftId: hour.reservation!.id })
    } catch(error) {
      showLoadingIndicator(false);
    }
  };

  const requestCancellation = (event: MouseEvent) => {
    const within48Hours = (hour.startsAt.getTime() - now.getTime()) < 1000 * 3600 * 48;
    setShowEditMenu(false);
    setReasonModal({
      requestComment: within48Hours,
      prefix: 'cancel',
      onAbort: () => setReasonModal(undefined),
      hint: t('cancel-hint') + (within48Hours ? t('cancel-reason') : ''),
      action: async comment => {
        setShowEditMenu(false);
        setReasonModal(undefined);
        try {
          showLoadingIndicator(true);
          await passengerServiceApi.cancelPassengerServiceShift({
            carId: car.id,
            shiftId: hour.reservation!.id,
            body: comment
          });
        } catch(error) {
          showLoadingIndicator(false);
        }
      }
    });
  };

  const hasDriver = hour.reservation!.driverMemberId !== undefined;
  const ownedByCurrentUser = hour.reservation!.driverMemberId === state.currentUser!.memberId;
  const isAdmin = state.currentUser!.roles!.includes(Role.Admin) || state.currentUser!.roles!.includes(Role.Manager);
  const unclaimed = hour.reservation!.status === ShiftStatus.Unclaimed;
  const claimed = hour.reservation!.status === ShiftStatus.Claimed;
  const cancellable = claimed && (ownedByCurrentUser || isAdmin);
  const swapInProgress = hour.reservation!.swapInProgressMemberId !== undefined;
  const swappable = claimed && !ownedByCurrentUser && !swapInProgress;
  const swapConfirmable = swapInProgress && (ownedByCurrentUser || isAdmin);
  const swapCancelable = swapInProgress && ((state.currentUser!.memberId === hour.reservation!.swapInProgressMemberId)
      || ownedByCurrentUser
      || isAdmin);
  const hasEditMenu = isAdmin || claimed;
  const [ showEditMenu, setShowEditMenu ] = useState(false);
  const ref = useRef(null);
  useOnClickOutside(ref, event => {
      if (!showEditMenu) return;
      event.preventDefault();
      event.stopPropagation();
      setShowEditMenu(false);
    });

  const borderColor = 'dark-4';
  const borders: BorderType = [];
  borders.push({ side: "vertical", color: borderColor, size: '1px' });
  if (isFirstHourOfReservation) {
    borders.push({ side: "top", color: borderColor, size: '1px' });
  }
  if (isLastHourOfReservation) {
    borders.push({ side: "bottom", color: borderColor, size: '1px' });
  }

  const backgroundColor: BackgroundType | undefined =
      ownedByCurrentUser
          ? { color: 'status-ok', opacity: 'strong' }
          : hasDriver
          ? { color: 'light-4', opacity: 'strong' }
          : { color: 'status-critical', opacity: 'medium' };

  const [ showDetails, setShowDetails ] = useState(undefined);
  const loadAndShowDetails = async (event: MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      setShowDetails(
          <Table
              margin={ { vertical: "small" } }>
            <TableBody>
              <TableRow>
                <TableCell { ...infoTableCellDefaultProps }>
                  <strong>Zeitraum:&nbsp;</strong>
                </TableCell>
                <TableCell { ...infoTableCellDefaultProps }>
                  {
                    toLocaleTimeStringWithoutSeconds(hour.reservation.startsAt)
                  }
                  -
                  {
                    toLocaleTimeStringWithoutSeconds(hour.reservation.endsAt)
                  }
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell { ...infoTableCellDefaultProps }>
                  <strong>{
                    drivers[ hour.reservation!.driverMemberId! ]?.sex === "FEMALE"
                        ? 'Fahrerin'
                        : 'Fahrer'
                  }:&nbsp;</strong>
                </TableCell>
                <TableCell { ...infoTableCellDefaultProps }>
                  {
                    hour.reservation!.driverMemberId === undefined
                        ? 'Nicht belegt'
                        : `${drivers[ hour.reservation!.driverMemberId! ].firstName} ${drivers[ hour.reservation!.driverMemberId! ].lastName}`
                  }
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>);
    };

  return (
      <>
        {
          !showEditMenu && isLastHourOfReservation && !hasEditMenu && unclaimed
              ? <PlannerButton
                    action={ claim }
                    icon={ state.currentUser!.sex === "FEMALE" ? UserFemale : User } />
              : undefined
        }
        {
          !showEditMenu && isLastHourOfReservation && hasEditMenu
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
                    unclaimed
                        ? <PlannerButton
                            inContextMenu
                            action={ claim }
                            icon={ state.currentUser!.sex === "FEMALE" ? UserFemale : User } />
                        : undefined
                  }
                  {
                    cancellable
                        ? <PlannerButton
                             inContextMenu
                             action={ requestUnclaim }
                             background='status-warning'
                             icon={ state.currentUser!.sex === "FEMALE" ? UserFemale : User }
                             iconAddition="cancel" />
                        : undefined
                  }
                  {
                    swappable
                        ? <PlannerButton
                             inContextMenu
                             action={ requestSwap }
                             background='status-warning'
                             icon={ Transaction } />
                        : undefined
                  }
                  {
                    swapConfirmable
                        ? <PlannerButton
                            inContextMenu
                            action={ confirmSwap }
                            background='status-ok'
                            icon={ Transaction }
                            iconAddition="confirm" />
                        : undefined
                  }
                  {
                    swapCancelable
                        ? <PlannerButton
                            inContextMenu
                            action={ cancelSwap }
                            background='status-alert'
                            icon={ Transaction }
                            iconAddition="cancel" />
                        : undefined
                  }
                  {
                    isAdmin
                        ? <PlannerButton
                            inContextMenu
                            action={ requestCancellation }
                            background='status-critical'
                            icon={ FormClose }
                            iconSize='30rem' />
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
            background={ backgroundColor }
            style={ { position: 'relative' } }
            onMouseDown={ loadAndShowDetails }>{
          isFirstHourOfReservation
              ? <>
                  <UserAvatar
                      size='small'
                      border={ { color: 'dark-4', size: '1px' }}
                      user={ drivers[ hour.reservation!.driverMemberId! ] } />
                  <Box
                      pad={ { horizontal: 'xsmall' } } >
                    <Text
                        truncate>{ t(`reservation-type` as const) }</Text>
                  </Box>
                </>
              : <>&nbsp;</>
        }</Box>
        <BoxModal
            t={ t }
            reasonModal={ reasonModal } />
        <Modal
            t={ t }
            header={ 'reservation-type' }
            abortLabel={ 'info-abort' }
            abort={ () => setShowDetails(undefined) }
            show={ showDetails !== undefined }>
          {
            showDetails
          }
        </Modal>
      </>);
  };

export { PassengerServiceBox };
