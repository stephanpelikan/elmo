package at.elmo.member;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import at.elmo.member.Member.Sex;
import at.elmo.member.Member.Status;
import at.elmo.member.login.ElmoOAuth2User;
import at.elmo.member.login.OAuth2Identifier;
import at.elmo.member.onboarding.MemberOnboarding;

@Service
public class MemberService {

    @Autowired
    private MemberRepository memberRepository;

    @Autowired
    private MemberOnboarding memberOnboarding;
    
    public Optional<Member> getCurrentUser() {
        
        final var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) {
            return Optional.empty();
        }
        if (!authentication.isAuthenticated()) {
            return Optional.empty();
        }
        if (!(authentication.getPrincipal() instanceof ElmoOAuth2User)) {
            return Optional.empty();
        }
        
        final var oauth2User = (ElmoOAuth2User) authentication.getPrincipal();
        
        return memberRepository.findByOauth2Ids_Id(oauth2User.getOAuth2Id());
        
    }
    
    public Member loadOrRegisterMember(
            final ElmoOAuth2User oAuth2User) throws Exception {
        
        final String oauth2Id = oAuth2User.getOAuth2Id();
        
        final Optional<Member> user = memberRepository.findByOauth2Ids_Id(oauth2Id);
        if (user.isPresent()) {
            return user.get();
        }

        final boolean emailVerified = oAuth2User.isEmailVerified();

        final var newOAuth2Id = new OAuth2Identifier();
        newOAuth2Id.setId(oauth2Id);
        newOAuth2Id.setProvider(oAuth2User.getProvider());

        final var newMember = new Member();
        newOAuth2Id.setOwner(newMember);

        newMember.setOauth2Ids(List.of(newOAuth2Id));
        newMember.setId(UUID.randomUUID().toString());
        newMember.setEmail(oAuth2User.getEmail());
        newMember.setStatus(emailVerified ? Status.EMAIL_VERIFIED : Status.NEW);
        newMember.setLastName(oAuth2User.getName());
        newMember.setFirstName(oAuth2User.getFirstName());
        
        final var result = memberRepository.saveAndFlush(newMember);
        
        memberOnboarding.doOnboading(result);

        return result;
        
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
            final boolean preferNotificationsPerSms) throws Exception {

        final var member = getCurrentUser().get();

        if ((member.getStatus() != Status.NEW)
                && (member.getStatus() != Status.EMAIL_VERIFIED)) {
            
            throw new Exception(
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
        
        member.setStatus(Status.APPLICATION_SUBMITTED);
        
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