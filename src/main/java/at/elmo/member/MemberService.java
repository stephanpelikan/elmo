package at.elmo.member;

import java.time.LocalDate;
import java.util.Map;
import java.util.Optional;
import java.util.Random;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import at.elmo.config.ElmoProperties;
import at.elmo.member.MemberBase.Sex;
import at.elmo.member.onboarding.MemberApplication;
import at.elmo.member.onboarding.MemberApplicationRepository;
import at.elmo.member.onboarding.MemberOnboarding;
import at.elmo.util.email.EmailService;
import at.elmo.util.exceptions.ElmoValidationException;
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
    private MemberApplicationRepository memberApplications;

    @Autowired
    private MemberOnboarding memberOnboarding;

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
    
    @Transactional(noRollbackFor = ElmoValidationException.class)
    public MemberApplication processMemberApplicationInformation(
            final String applicationId,
            final String taskId,
            final MemberApplicationUpdate action,
            final Map<String, String> violations,
            final Integer memberId,
            final String firstName,
            final String lastName,
            final LocalDate birthdate,
            final Sex sex,
            final String zip,
            final String city,
            final String street,
            final String streetNumber,
            final String email,
            final String emailConfirmationCode,
            final String phoneNumber,
            final String phoneConfirmationCode,
            final boolean preferNotificationsPerSms,
            final String comment, final String applicationComment) {

        final var application = memberApplications
                .getById(applicationId);
        memberOnboarding.validateMemberForApplicationInformationProcessing(taskId, application);

        if (action == MemberApplicationUpdate.REQUEST) {

            if (application.getGeneratedEmailConfirmationCode() == null) {
                violations.put("emailConfirmationCode", "missing");
            } else if (!StringUtils.hasText(emailConfirmationCode)) {
                violations.put("emailConfirmationCode", "enter");
            } else if (!application.getGeneratedEmailConfirmationCode().equals(emailConfirmationCode)) {
                violations.put("emailConfirmationCode", "mismatch");
            } else if (!application.getEmail().equals(email)) {
                violations.put("emailConfirmationCode", "mismatch");
            }
            if (application.getGeneratedPhoneConfirmationCode() == null) {
                violations.put("phoneConfirmationCode", "missing");
            } else if (!StringUtils.hasText(phoneConfirmationCode)) {
                violations.put("phoneConfirmationCode", "enter");
            } else if (!application.getGeneratedPhoneConfirmationCode().equals(phoneConfirmationCode)) {
                violations.put("phoneConfirmationCode", "mismatch");
            } else if (!application.getPhoneNumber().equals(phoneNumber)) {
                violations.put("phoneConfirmationCode", "mismatch");
            }

        }

        application.setMemberId(memberId);
        application.setSex(sex);
        application.setFirstName(firstName);
        application.setLastName(lastName);
        application.setBirthdate(birthdate);
        application.setZip(zip);
        application.setCity(city);
        application.setStreet(street);
        application.setStreetNumber(streetNumber);
        application.setEmail(email);
        if (emailConfirmationCode != null) {
            application.setGivenEmailConfirmationCode(emailConfirmationCode);
        }
        application.setPhoneNumber(phoneNumber);
        if (phoneConfirmationCode != null) {
            application.setGivenPhoneConfirmationCode(phoneConfirmationCode);
        }
        application.setPreferNotificationsPerSms(preferNotificationsPerSms);
        application.setComment(comment);
        application.setApplicationComment(applicationComment);
        
        if (!violations.isEmpty()) {
            return application;
        }

        // configured administrator will become active immediately
        if (application.getEmail().equals(properties.getAdminIdentificationEmailAddress())) {
            throw new UnsupportedOperationException();
            // application.setStatus(Status.ACTIVE);
            // return null; // no onboarding configured administrator
        }
        
        if (action == MemberApplicationUpdate.REQUEST) {

            memberOnboarding.completeUserRegistrationForm(application, taskId);

        } else if (action == MemberApplicationUpdate.INQUIRY) {
            
            memberOnboarding.completeUserValidationFormForInvalidData(application, taskId);
            
        } else if (action == MemberApplicationUpdate.REJECT) {
            
            memberOnboarding.completeUserValidationFormAsRejected(application, taskId);
            
        } else if (action == MemberApplicationUpdate.ACCEPTED) {
            
            memberOnboarding.completeUserValidationFormAsAccepted(application, taskId);
            
        } else  if (action == MemberApplicationUpdate.SAVE) {

            return memberApplications.saveAndFlush(application);

        }

        return application;
        
    }
    
    public Optional<MemberApplication> getMemberApplication(
            final String applicationId) {

        return memberApplications.findById(applicationId);
        
    }

    public Page<MemberApplication> getMemberApplications(
            final int page,
            final int amount) {
        
        return memberApplications.findAll(
                Pageable.ofSize(amount).withPage(page));
        
    }
    
    public int getCountOfInprogressMemberApplications() {
        
        return (int) memberApplications.countByStatus(
                at.elmo.member.onboarding.MemberApplication.Status.APPLICATION_SUBMITTED);
        
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