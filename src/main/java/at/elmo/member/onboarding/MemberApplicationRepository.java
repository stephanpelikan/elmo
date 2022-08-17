package at.elmo.member.onboarding;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import at.elmo.member.onboarding.MemberApplication.Status;

@Repository
public interface MemberApplicationRepository extends JpaRepository<MemberApplication, String> {

    long countByStatus(Status status);

    Optional<MemberApplication> findByMemberIdAndStatus(String memberId, MemberApplication.Status status);

    Optional<MemberApplication> findByOauth2Id_Id(String oauth2Id);

}
