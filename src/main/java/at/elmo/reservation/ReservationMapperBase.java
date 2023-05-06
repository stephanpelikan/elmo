package at.elmo.reservation;

import at.elmo.gui.api.v1.Sex;
import at.elmo.util.mapper.GuiApiMapperBase;

public abstract class ReservationMapperBase extends GuiApiMapperBase {

    public abstract Sex toApi(at.elmo.member.MemberBase.Sex sex);

}
