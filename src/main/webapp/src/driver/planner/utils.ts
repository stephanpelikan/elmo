import { PlannerDriver, PlannerReservation } from "client/gui";
import { WakeupSseCallback } from "components/SseProvider";
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

interface Selection {
  startedAtStarts: Date;
  startedAtEnds: Date;
  startsAt: Date;
  endsAt: Date;
  carId: string;
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

const useWakeupSseCallback = () => useContext(WakeupSseCallbackContext);

export {
  useWakeupSseCallback
};
