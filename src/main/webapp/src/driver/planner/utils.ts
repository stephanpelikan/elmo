import { PlannerDriver, PlannerReservation } from "client/gui";
import { WakeupSseCallback } from "components/SseProvider";
import React, { MutableRefObject, useContext } from "react";
import { TFunction } from "i18next";

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

interface Selection {
  startedAtStarts: Date;
  startedAtEnds: Date;
  startsAt: Date;
  endsAt: Date;
  carId: string;
  ownerId: number | null | undefined;
  editingReservation?: string;
  editingAction?: (startsAt: Date, endsAt: Date, comment?: string) => void;
  editingModalPrefix?: string;
  editingModalT?: TFunction;
};

interface ReservationDrivers {
  [key: number /* member id */]: PlannerDriver
};

export type {
  CalendarDay,
  CalendarHour,
  CalendarHours,
  Selection,
  ReservationDrivers,  
};

const WakeupSseCallbackContext = React.createContext<MutableRefObject<WakeupSseCallback>>({ current: undefined });

const useWakeupSseCallback = (): React.MutableRefObject<WakeupSseCallback> => useContext(WakeupSseCallbackContext);

export {
  useWakeupSseCallback
};
