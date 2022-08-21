package at.elmo.reservation.shift;

import at.elmo.member.MemberRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class ShiftService {



    @Autowired
    private ShiftRepository shifts;

    public List<Shift> getShifts(){
        return shifts.findAll();
    }

}
