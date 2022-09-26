package at.elmo.member;

import at.elmo.administration.api.v1.Role;
import at.elmo.administration.api.v1.Sex;

import java.util.List;

public abstract class AdministrationApiMapperBase extends at.elmo.util.mapper.AdministrationApiMapperBase {

    public abstract List<at.elmo.member.Role> toDomain(List<Role> role);

    public abstract at.elmo.member.Role toDomain(Role role);

    public abstract at.elmo.member.MemberBase.Sex toDomain(Sex sex);

}
