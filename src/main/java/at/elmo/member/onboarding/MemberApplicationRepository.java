package at.elmo.member.onboarding;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import at.elmo.member.onboarding.MemberApplication.Status;

@Repository
public interface MemberApplicationRepository extends JpaRepository<MemberApplication, String> {

    long countByStatus(Status status);

}
