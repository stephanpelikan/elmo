package at.elmo.member;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import at.elmo.member.Member.Status;

@Repository
public interface MemberRepository extends JpaRepository<Member, String> {

    Optional<Member> findByOauth2Ids_Id(String oauth2Id);

    Optional<Member> findByMemberId(Integer memberId);

    @Query("SELECT m FROM Member m WHERE m.lastName LIKE %:q% OR m.email LIKE %:q% OR m.street LIKE %:q%")
    Page<Member> findByQuery(@Param("q") String query, Pageable page);

    List<Member> findByRoles_Role(Role role);

    long countByStatus(Status status);

}
