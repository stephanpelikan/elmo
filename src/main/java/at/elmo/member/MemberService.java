package at.elmo.member;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.Random;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import at.elmo.config.ElmoProperties;
import at.elmo.member.Member.Status;
import at.elmo.member.MemberBase.Payment;
import at.elmo.member.MemberBase.Sex;
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
    
    public void createMember(
            final int memberId,
            final List<Role> roles,
            final Sex sex,
            final String title,
            final String lastName,
            final String firstName,
            final LocalDate birthdate,
            final String street,
            final String streetNumber,
            final String zip,
            final String city,
            final String email,
            final String phoneNumber,
            final String comment,
            final String iban,
            final Payment payment) {
        
        if (members.findByMemberId(memberId).isPresent()) {
            return;
        }

        final var member = new Member();
        member.setId(UUID.randomUUID().toString());
        member.setStatus(Status.ACTIVE);
        member.setMemberId(memberId);
        member.addRoles(roles);

        member.setBirthdate(birthdate);
        member.setCity(city);
        member.setComment(comment);
        member.setEmail(email);
        member.setFirstName(firstName);
        member.setIban(iban);
        member.setLastName(lastName);
        member.setPayment(payment);
        member.setPhoneNumber(phoneNumber);
        member.setSex(sex);
        member.setStreet(street);
        member.setStreetNumber(streetNumber);
        member.setTitle(title);
        member.setZip(zip);
        
        members.saveAndFlush(member);

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
                PageRequest.of(page, amount, Direction.ASC, "lastName"));
        
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