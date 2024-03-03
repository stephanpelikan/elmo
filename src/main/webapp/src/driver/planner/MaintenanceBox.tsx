import { Box, Text } from 'grommet';
import { Configure, Expand, FormClose } from "grommet-icons";
import { BorderType } from 'grommet/utils';
import { MouseEvent, useCallback, useRef, useState } from "react";
import { useTranslation } from 'react-i18next';
import { useAppContext } from "../../AppContext";
import { PlannerCar, PlannerReservation, Role } from "../../client/gui";
import i18n from '../../i18n';
import useOnClickOutside from "../../utils/clickOutside";
import { useMaintenanceApi } from "../DriverAppContext";
import { PlannerButton } from "./PlannerButton";
import { PlannerContextMenu } from "./PlannerContextMenu";
import { CalendarHour, SelectionAction } from './utils';

i18n.addResources('en', 'driver/planner/maintenance', {
      "reservation-type": "Maintenance",
    });

i18n.addResources('de', 'driver/planner/maintenance', {
      "reservation-type": "Wartung",
    });

const MaintenanceBox = ({
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
    activateSelection: (reservation: PlannerReservation, ownerId: number | null | undefined, carId: string, actions: Array<SelectionAction>) => void,
    cancelSelection: () => void,
  }) => {
    const { state, showLoadingIndicator } = useAppContext();
    const { t } = useTranslation('driver/planner/maintenance');
    const maintenanceApi = useMaintenanceApi();

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
          await maintenanceApi.cancelMaintenanceReservation({
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
      if ((startsAt.getTime() === hour.reservation.startsAt.getTime())
          && (endsAt.getTime() === hour.reservation.endsAt.getTime())) {
        return;
      }
      try {
        showLoadingIndicator(true);
        await maintenanceApi.resizeMaintenanceReservation({
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
          [ {
              action: doResizing
            } ]);
    };

    const borderColor = 'dark-4';

    let bgOffset = '0px';
    const borders: BorderType = [];
    borders.push({ side: "vertical", color: borderColor, size: '1px' });
    if (isFirstHourOfReservation) {
      borders.push({ side: "top", color: borderColor, size: '1px' });
      bgOffset = '-1px';
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
              style={ {
                background: `repeating-linear-gradient(135deg, rgba(40, 40, 40, 0.3), rgba(40, 40, 40, 0.3) 10px, rgba(251, 210, 16, 0.3) 10px, rgba(251, 210, 16, 0.3) 20px) ${bgOffset} 0px`,
                backgroundSize: `calc(100% - ${bgOffset})`
              } }>
            {
            isFirstHourOfReservation
                ? <Text>{ t(`reservation-type` as const) }</Text>
                : <>&nbsp;</>
            }
          </Box>
        </>);
  };

export { MaintenanceBox };
