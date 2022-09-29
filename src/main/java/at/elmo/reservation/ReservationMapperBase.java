package at.elmo.reservation;

import at.elmo.gui.api.v1.Sex;

public abstract class ReservationMapperBase {

    public abstract Sex toApi(at.elmo.member.MemberBase.Sex sex);

}
