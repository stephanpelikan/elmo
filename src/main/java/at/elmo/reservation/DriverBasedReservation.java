package at.elmo.reservation;

import at.elmo.member.Member;
import at.elmo.reservation.planner.Reservation;

public interface DriverBasedReservation extends Reservation {

    Member getDriver();
    
}
