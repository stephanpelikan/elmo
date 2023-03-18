import { PlannerDriver, PlannerReservation } from "client/gui";

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
  ReservationDrivers
};
