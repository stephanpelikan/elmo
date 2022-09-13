package at.elmo.util.sms;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SmsRepository extends JpaRepository<Sms, String> {

    List<Sms> findBySenderNumber(
            final String senderNumber);
    
}
