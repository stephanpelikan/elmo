package at.elmo.member;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MemberAvatarRepository extends JpaRepository<MemberAvatar, String> {

    Optional<MemberAvatar> findByOwner_MemberId(int memberId);

}
