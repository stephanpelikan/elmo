package at.elmo.member;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.Random;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import at.elmo.config.ElmoProperties;
import at.elmo.member.Member.Role;
import at.elmo.member.Member.Sex;
import at.elmo.member.Member.Status;
import at.elmo.member.login.ElmoOAuth2User;
import at.elmo.member.login.OAuth2Identifier;
import at.elmo.member.onboarding.MemberApplication;
import at.elmo.member.onboarding.MemberApplicationRepository;
import at.elmo.member.onboarding.MemberOnboarding;
import at.elmo.util.UserContext;
import at.elmo.util.email.EmailService;
import at.elmo.util.exceptions.ElmoException;
import at.elmo.util.exceptions.ElmoForbiddenException;

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
    private UserContext userContext;

    @Autowired
    private EmailService emailService;
    
    public Optional<Member> getMemberByOAuth2User(
            final String oauth2Id) {
        
        return members.findByOauth2Ids_Id(oauth2Id);
        
    }
    
    public void registerMemberByOAuth2User(
            final ElmoOAuth2User oauth2User) throws Exception {

        final String oauth2Id = oauth2User.getOAuth2Id();
        
        final var user = members.findByOauth2Ids_Id(oauth2Id);
        if (user.isPresent()) {
            return;
        }

        final boolean emailVerified = oauth2User.isEmailVerified();

        final var newOAuth2Id = new OAuth2Identifier();
        newOAuth2Id.setId(oauth2Id);
        newOAuth2Id.setProvider(oauth2User.getProvider());

        final var newMember = new Member();
        newOAuth2Id.setOwner(newMember);

        newMember.setOauth2Ids(List.of(newOAuth2Id));
        newMember.setId(UUID.randomUUID().toString());
        newMember.setEmail(oauth2User.getEmail());
        newMember.setStatus(emailVerified ? Status.EMAIL_VERIFIED : Status.NEW);
        newMember.setLastName(oauth2User.getName());
        newMember.setFirstName(oauth2User.getFirstName());

        // configured administrator will get admin-role
        if (oauth2User.getEmail().equals(properties.getAdminIdentificationEmailAddress())) {
            newMember.addRole(Role.ADMIN);
            newMember.setStatus(Status.ACTIVE);

            members.saveAndFlush(newMember);
            return; // no onboarding configured administrator
        }

        final var result = members.saveAndFlush(newMember);

        memberOnboarding.doOnboarding(result);
        
    }
    
    public Optional<Member> getMember(
            final String memberId) {
        
        return members.findById(memberId);
        
    }
    
    private void validateMemberForApplicationInformationProcessing(
            final String taskId,
            final MemberApplication application) {

        final var member = application.getMember();
        if (!member.getId().equals(userContext.getLoggedInMember().getId())
                && !userContext.hasRole(Role.MANAGER)) {

            throw new ElmoForbiddenException("Not allowed");

        }

        if (!taskId.equals(application.getUserTaskId())) {

            throw new ElmoException("Application form of '" + member.getId() + "' expired!");

        }

    }

    public void takeoverMemberApplication(
            final String applicationId,
            final String taskId) {

        final var application = memberApplications.getById(applicationId);
        validateMemberForApplicationInformationProcessing(taskId, application);

        memberOnboarding.takeOver(application);
        
    }

    public static enum MemberApplicationUpdate {
        SAVE,
        DONE,
        REJECT,
        INQUIRY
    };
    
    public MemberApplication processMemberApplicationInformation(
            final String applicationId,
            final String taskId,
            final MemberApplicationUpdate action,
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
            final String comment) {

        final var application = memberApplications
                .getById(applicationId);
        final var member = application.getMember();
        validateMemberForApplicationInformationProcessing(taskId, application);

        member.setMemberId(memberId);
        member.setSex(sex);
        member.setFirstName(firstName);
        member.setLastName(lastName);
        member.setBirthdate(birthdate);
        member.setZip(zip);
        member.setCity(city);
        member.setStreet(street);
        member.setStreetNumber(streetNumber);
        member.setEmail(getEmail(member, email, emailConfirmationCode));
        //member.setPhoneNumber(getPhoneNumber(member, phoneNumber, phoneConfirmationCode));
        member.setPhoneNumber(phoneNumber); // TODO: use confirmation code once SMS is available
        member.setPreferNotificationsPerSms(preferNotificationsPerSms);
        if (StringUtils.hasText(comment)) {
            member.setComment(comment);
        }
        
        // configured administrator will become active immediately
        if (member.getEmail().equals(properties.getAdminIdentificationEmailAddress())) {
            member.setStatus(Status.ACTIVE);
            return null; // no onboarding configured administrator
        }
        
        if (action == MemberApplicationUpdate.INQUIRY) {
            
            memberOnboarding.completeUserValidationFormForInvalidData(application, taskId);
            
        } else if (action == MemberApplicationUpdate.REJECT) {
            
            memberOnboarding.completeUserValidationFormAsRejected(application, taskId);
            
        } else if (action == MemberApplicationUpdate.DONE) {
            
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

    public Optional<MemberApplication> getCurrentMemberApplication(
            final String memberId) {

        return memberApplications.findByMemberIdAndStatus(
                memberId,
                MemberApplication.Status.IN_PROGRESS);
        
    }

    public Page<MemberApplication> getMemberApplications(
            final int page,
            final int amount) {
        
        return memberApplications.findAll(
                Pageable.ofSize(amount).withPage(page));
        
    }
    
    public int getCountOfInprogressMemberApplications() {
        
        return (int) memberApplications.countByStatus(
                at.elmo.member.onboarding.MemberApplication.Status.IN_PROGRESS);
        
    }
    
    public void requestEmailCode(
            final Member member,
            final String emailAddress) throws Exception {

        final var code = String.format("%04d", random.nextInt(10000));
        member.setEmail(emailAddress);
        member.setLastEmailConfirmationCode(code);

        emailService.sendEmail(
                "member/email-confirmation",
                emailAddress,
                member);
        
    }
    
    @SuppressWarnings("unused")
    private String getPhoneNumber(
            final Member member,
            final String phoneNumber,
            final String phoneConfirmationCode) {
        
        if ((member.getPhoneNumber() != null)
                && member.getPhoneNumber().equals(phoneNumber)) {
            return member.getPhoneNumber();
        }

        if (!userContext.hasRole(Role.MANAGER)) {

            if (!member.getLastPhoneConfirmationCode().equals(phoneConfirmationCode)) {
                throw new RuntimeException("mismatching phone confirmation code");
            }

        }
        
        member.setLastPhoneConfirmationCode(null);
        
        return phoneNumber;
    
    }

    private String getEmail(
            final Member member,
            final String email,
            final String emailConfirmationCode) {
        
        if ((member.getEmail() != null)
                && member.getEmail().equals(email)) {
            return member.getEmail();
        }
        
        if (!userContext.hasRole(Role.MANAGER)) {

            if (!member.getLastEmailConfirmationCode().equals(emailConfirmationCode)) {
                throw new RuntimeException("mismatching email confirmation code");
            }

        }
        
        member.setLastEmailConfirmationCode(null);
        
        return email;
    
    }
    
}