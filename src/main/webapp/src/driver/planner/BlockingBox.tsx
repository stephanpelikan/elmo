import { Box, Text } from 'grommet';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n';
import { MouseEvent, useCallback, useRef, useState } from "react";
import { CalendarHour } from './utils';
import { BorderType } from 'grommet/utils';
import { PlannerButton } from "./PlannerButton";
import { Configure, Expand, FormClose } from "grommet-icons";
import { PlannerCar, PlannerReservation, Role } from "../../client/gui";
import { TFunction } from "i18next";
import { useAppContext } from "../../AppContext";
import { PlannerContextMenu } from "./PlannerContextMenu";
import useOnClickOutside from "../../utils/clickOutside";
import { useBlockingApi } from "../DriverAppContext";

i18n.addResources('en', 'driver/planner/block', {
      "reservation-type": "Unavailable",
    });

i18n.addResources('de', 'driver/planner/block', {
      "reservation-type": "Nicht verfügbar",
    });

const BlockingBox = ({
    hour,
    car,
    isFirstHourOfReservation,
    isLastHourOfReservation,
    activateSelection,
    cancelSelection,
  }: {
    hour: CalendarHour,
    car: PlannerCar,
    isFirstHourOfReservation: boolean,
    isLastHourOfReservation: boolean,
    activateSelection: (reservation: PlannerReservation, ownerId: number | null | undefined, carId: string, action: (startsAt: Date, endsAt: Date, comment?: string) => void, modalPrefix?: string, modalT?: TFunction) => void,
    cancelSelection: () => void,
  }) => {
    const { state, showLoadingIndicator } = useAppContext();
    const { t } = useTranslation('driver/planner/block');
    const blockingApi = useBlockingApi();

    const [ showEditMenu, _setShowEditMenu ] = useState(false);
    const setShowEditMenu = useCallback((show: boolean) => {
      cancelSelection();
      _setShowEditMenu(show);
    }, [ _setShowEditMenu, cancelSelection ]);

    const hasEditMenu = isLastHourOfReservation
        && (hour.reservation.endsAt.getTime() > new Date().getTime())
        && (state.currentUser!.roles!.includes(Role.Admin)
            || state.currentUser!.roles!.includes(Role.Manager));

    const cancelReservation = async (carId: string, reservationId: string) => {
        try {
          showLoadingIndicator(true);
          await blockingApi.cancelBlockingReservation({
            carId,
            reservationId,
            body: undefined
          });
          // selection will be cancelled by server-sent update
        } catch (error) {
          console.log(error);
          showLoadingIndicator(false);
        }
      };
    const requestCancellation = (event: MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      setShowEditMenu(false);
      cancelReservation(car.id, hour.reservation!.id);
    };

    const doResizing = async (startsAt: Date, endsAt: Date, comment?: string) => {
      try {
        showLoadingIndicator(true);
        await blockingApi.resizeBlockingReservation({
          carId: car.id,
          reservationId: hour.reservation!.id,
          resizeReservationRequest: { startsAt, endsAt, comment }
        });
      } catch (error) {
        showLoadingIndicator(false);
        console.error(error);
      }
    };
    const requestResizing = (event: MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      activateSelection(
          hour.reservation,
          null,
          car.id,
          doResizing);
    };

    const borderColor = 'dark-4';

    const borders: BorderType = [];
    borders.push({ side: "vertical", color: borderColor, size: '1px' });
    if (isFirstHourOfReservation) {
      borders.push({ side: "top", color: borderColor, size: '1px' });
    }
    if (isLastHourOfReservation) {
      borders.push({ side: "bottom", color: borderColor, size: '1px' });
    }

    const ref = useRef(null);
    useOnClickOutside(ref, event => {
        if (!showEditMenu) return;
        event.preventDefault();
        event.stopPropagation();
        setShowEditMenu(false);
      });

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
                    <PlannerButton
                        inContextMenu
                        action={ requestCancellation }
                        background='status-critical'
                        icon={ FormClose }
                        iconSize='30rem' />
                    <PlannerButton
                        inContextMenu
                        action={ requestResizing }
                        background='dark-2'
                        icon={ Expand } />
                </PlannerContextMenu>
                : undefined
          }
          <Box
              fill
              pad={ { horizontal: 'xsmall' } }
              border={ borders }
              background={ { color: 'light-4', opacity: 'strong' } } >
            {
            isFirstHourOfReservation
                ? <Text>{ t(`reservation-type` as const) }</Text>
                : <>&nbsp;</>
            }
          </Box>
        </>);
  };

export { BlockingBox };
