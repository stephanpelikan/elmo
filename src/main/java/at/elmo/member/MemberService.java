package at.elmo.member;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import at.elmo.config.ElmoProperties;
import at.elmo.member.Member.Role;
import at.elmo.member.Member.Sex;
import at.elmo.member.Member.Status;
import at.elmo.member.login.ElmoOAuth2User;
import at.elmo.member.login.OAuth2Identifier;
import at.elmo.member.onboarding.MemberApplication;
import at.elmo.member.onboarding.MemberApplicationRepository;
import at.elmo.member.onboarding.MemberOnboarding;
import at.elmo.util.ElmoException;
import at.elmo.util.UserContext;

@Service
@Transactional
public class MemberService {

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

        final var result = members.saveAndFlush(newMember);
        
        // configured administrator will get admin-role
        if (oauth2User.getEmail().equals(properties.getAdminIdentificationEmailAddress())) {
            newMember.addRole(Role.ADMIN);
            return; // no onboarding configured administrator
        }

        memberOnboarding.doOnboarding(result);
        
    }
    
    public void processMemberApplicationInformation(
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
            final boolean preferNotificationsPerSms) {

        final var member = userContext.getLoggedInMember();

        if ((member.getStatus() != Status.NEW)
                && (member.getStatus() != Status.EMAIL_VERIFIED)) {
            
            throw new ElmoException(
                    "Application form of '"
                    + member.getId()
                    + "' expired since status already '"
                    + member.getStatus()
                    + "'!");

        }

        member.setFirstName(firstName);
        member.setLastName(lastName);
        member.setBirthdate(birthdate);
        member.setZip(zip);
        member.setCity(city);
        member.setStreet(streetNumber);
        member.setStreetNumber(streetNumber);
        member.setEmail(getEmail(member, email, emailConfirmationCode));
        //member.setPhoneNumber(getPhoneNumber(member, phoneNumber, phoneConfirmationCode));
        member.setPhoneNumber(phoneNumber); // TODO: use confirmation code once SMS is available
        member.setPreferNotificationsPerSms(preferNotificationsPerSms);
        
        // configured administrator will become active immediately
        if (member.getEmail().equals(properties.getAdminIdentificationEmailAddress())) {
            member.setStatus(Status.ACTIVE);
            return; // no onboarding configured administrator
        }

        member.setStatus(Status.APPLICATION_SUBMITTED);
        
    }

    public Page<MemberApplication> getMemberApplications(
            final int page,
            final int amount) {
        
        return memberApplications.findAll(
                Pageable.ofSize(amount).withPage(page));
        
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
        
        if (!member.getLastPhoneConfirmationCode().equals(phoneConfirmationCode)) {
            throw new RuntimeException("mismatching phone confirmation code");
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
        
        if (!member.getLastEmailConfirmationCode().equals(emailConfirmationCode)) {
            throw new RuntimeException("mismatching email confirmation code");
        }
        
        member.setLastEmailConfirmationCode(null);
        
        return email;
    
    }
    
}