package at.elmo.reservation;

import at.elmo.gui.api.v1.ReservationType;
import at.elmo.gui.api.v1.Sex;
import at.elmo.reservation.blocking.BlockingReservation;
import at.elmo.reservation.carsharing.CarSharing;
import at.elmo.reservation.passengerservice.shift.Shift;
import at.elmo.util.mapper.GuiApiMapperBase;

public abstract class ReservationMapperBase extends GuiApiMapperBase {

    public abstract Sex toApi(at.elmo.member.MemberBase.Sex sex);

    public ReservationType toReservationType(final ReservationBase reservation) {

        if (reservation == null) {
            return null;
        }
        if (reservation instanceof CarSharing) {
            return ReservationType.CS;
        }
        if (reservation instanceof BlockingReservation) {
            return ReservationType.BLOCK;
        }
        if (reservation instanceof Shift) {
            return ReservationType.PS;
        }
        throw new RuntimeException(
                "Unknown reservation type '"
                + reservation.toString()
                + "'! Did you forget to extend this mapping-method?");

    }

}
