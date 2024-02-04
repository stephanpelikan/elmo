import { PlannerDriver, PlannerReservation } from "client/gui";
import { WakeupSseCallback } from "components/SseProvider";
import { Icon } from "grommet-icons";
import { BackgroundType } from "grommet/utils";
import { TFunction } from "i18next";
import React, { MutableRefObject, useContext } from "react";

interface CalendarHours {
  [key: string /* car id */]: Array<CalendarHour> /* hours of day */
};

interface CalendarDay {
  startsAt: Date;
  hours: CalendarHours;
};

interface CalendarHour {
  index: number;
  startsAt: Date;
  endsAt: Date;
  reservation: PlannerReservation | undefined;
};

interface SelectionAction {
  action: (startsAt: Date, endsAt: Date, comment?: string) => void;
  icon?: Icon;
  iconBackground?: BackgroundType;
  modalTPrefix?: string;
  modalT?: TFunction;
}

interface Selection {
  startedAtStarts: Date;
  startedAtEnds: Date;
  startsAt: Date;
  endsAt: Date;
  carId: string;
  ownerId: number | null | undefined;
  actions?: Array<SelectionAction>;
  editingReservation?: string;
};

interface ReservationDrivers {
  [key: number /* member id */]: PlannerDriver
};

export type {
  CalendarDay,
  CalendarHour,
  CalendarHours,
  Selection,
  SelectionAction,
  ReservationDrivers,  
};

const WakeupSseCallbackContext = React.createContext<MutableRefObject<WakeupSseCallback>>({ current: undefined });

const useWakeupSseCallback = (): React.MutableRefObject<WakeupSseCallback> => useContext(WakeupSseCallbackContext);

export {
  useWakeupSseCallback
};
