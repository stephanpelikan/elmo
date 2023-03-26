package at.elmo.member;

import at.elmo.member.Member.Status;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.stream.Stream;

@Repository
public interface MemberRepository extends JpaRepository<Member, String> {

    Optional<Member> findByOauth2Ids_Id(String oauth2Id);

    @Query("SELECT m FROM Member m WHERE m.status != 'TO_BE_DELETED'")
    Page<Member> findNotDeletedMembers(Pageable page);

    @Query("SELECT m FROM Member m WHERE m.status != 'TO_BE_DELETED' AND m.memberId = ?1")
    Optional<Member> findByMemberId(Integer memberId);

    @Query("SELECT m FROM Member m WHERE m.status != 'TO_BE_DELETED' AND (m.lastName LIKE %:q% OR m.email LIKE %:q% OR m.street LIKE %:q%)")
    Page<Member> findByQuery(@Param("q") String query, Pageable page);

    List<Member> findByRoles_Role(Role role);

    Stream<Member> findByStatusAndRoles_Role(Member.Status status, Role role);

    default Stream<Member> findActiveDrivers() {
        return findByStatusAndRoles_Role(Member.Status.ACTIVE, Role.DRIVER);
    }
    
    long countByStatus(Status status);

}
