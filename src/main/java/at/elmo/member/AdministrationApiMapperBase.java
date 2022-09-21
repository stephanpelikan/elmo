package at.elmo.member;

import at.elmo.member.MemberBase.Sex;

public abstract class AdministrationApiMapperBase extends at.elmo.util.AdministrationApiMapperBase {

    public abstract Role toDomain(at.elmo.administration.api.v1.Role role);

    public abstract Sex toDomain(at.elmo.administration.api.v1.Sex sex);

}
