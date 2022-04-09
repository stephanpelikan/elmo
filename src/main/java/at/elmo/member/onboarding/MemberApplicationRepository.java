package at.elmo.member.onboarding;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MemberApplicationRepository extends JpaRepository<MemberApplication, String> {

}
