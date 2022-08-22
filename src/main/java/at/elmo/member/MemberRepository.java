package at.elmo.member;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import at.elmo.member.Member.Status;

@Repository
public interface MemberRepository extends JpaRepository<Member, String> {

    Optional<Member> findByOauth2Ids_Id(String oauth2Id);

    Optional<Member> findByMemberId(Integer memberId);

    List<Member> findByRoles_Role(Role role);

    long countByStatus(Status status);

}
