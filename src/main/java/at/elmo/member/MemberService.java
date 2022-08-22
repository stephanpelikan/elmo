package at.elmo.member;

import java.util.Optional;
import java.util.Random;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import at.elmo.config.ElmoProperties;
import at.elmo.member.onboarding.MemberApplication;
import at.elmo.util.email.EmailService;
import at.elmo.util.sms.SmsService;

@Service
@Transactional
public class MemberService {

    private static final Random random = new Random(System.currentTimeMillis());

    @Autowired
    private ElmoProperties properties;

    @Autowired
    private MemberRepository members;

    @Autowired
    private EmailService emailService;
    
    @Autowired
    private SmsService smsService;
    
    public Optional<Member> getMemberByOAuth2User(
            final String oauth2Id) {
        
        return members.findByOauth2Ids_Id(oauth2Id);
        
    }

    public Optional<Member> getMember(
            final String memberId) {
        
        return members.findById(memberId);
        
    }

    public static enum MemberApplicationUpdate {
        SAVE,
        ACCEPTED,
        REJECT,
        INQUIRY, REQUEST
    };

    public Page<Member> getMembers(
            final int page,
            final int amount) {
        
        return members.findAll(
                Pageable.ofSize(amount).withPage(page));
        
    }

    public int getCountOfActiveMembers() {
        
        return (int) members.countByStatus(
                at.elmo.member.Member.Status.ACTIVE);
        
    }
    
    public void requestEmailCode(
            final MemberApplication application,
            final String emailAddress) throws Exception {

        final var code = String.format("%04d", random.nextInt(10000));
        application.setEmail(emailAddress);
        application.setGeneratedEmailConfirmationCode(code);

        emailService.sendEmail(
                "member/email-confirmation",
                emailAddress,
                application);
        
    }
    
    public void requestPhoneCode(
            final MemberApplication application,
            final String phoneNumber) throws Exception {

        final var code = String.format("%04d", random.nextInt(10000));
        application.setPhoneNumber(phoneNumber);
        application.setGeneratedPhoneConfirmationCode(code);

        smsService.sendSms(
                "member/phone-number-confirmation",
                properties.getTransportServiceCarName(),
                properties.getTransportServicePhoneNumber(),
                application.getId(),
                phoneNumber,
                application);
        
    }
    
}