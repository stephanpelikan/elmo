package at.elmo.member;

import at.elmo.config.ElmoProperties;
import at.elmo.member.Member.Status;
import at.elmo.member.MemberBase.Payment;
import at.elmo.member.MemberBase.Sex;
import at.elmo.util.config.ConfigService;
import at.elmo.util.email.EmailService;
import at.elmo.util.email.NamedObject;
import at.elmo.util.exceptions.ElmoUserMessageException;
import at.elmo.util.sms.SmsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StreamUtils;

import java.io.InputStream;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Random;
import java.util.UUID;

@Service
@Transactional
public class MemberService {

    private static final Random random = new Random(System.currentTimeMillis());

    @Autowired
    private ElmoProperties properties;

    @Autowired
    private MemberRepository members;

    @Autowired
    private MemberAvatarRepository memberAvatars;

    @Autowired
    private EmailService emailService;

    @Autowired
    private SmsService smsService;

    @Autowired
    private ConfigService configs;

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
            final Payment payment,
            final int hoursServedPassengerService,
            final int hoursConsumedCarSharing) {

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
        member.setHoursConsumedCarSharing(hoursConsumedCarSharing);
        member.setHoursServedPassengerService(hoursServedPassengerService);

        members.saveAndFlush(member);

    }

    public Optional<Member> getMember(
            final int memberId) {

        return members.findByMemberId(memberId);

    }

    public boolean deleteMember(
            final int memberId) {

        final var member = getMember(memberId);
        if (member.isEmpty()) {
            return false;
        }

        member.get().setStatus(Status.TO_BE_DELETED);
        members.save(member.get());

        return true;

    }

    public int getNewMemberId() {

        final var lastMemberId = configs.getLastMemberId();
        final var newMemberId = lastMemberId + 1;
        configs.setLastMemberId(newMemberId);

        return newMemberId;

    }

    public Integer saveMember(
            final Integer memberId,
            final boolean updateByMember,
            final Member updatedMember,
            final List<Role> newRoles) {

        final Member toBeUpdated;
        if (memberId == null) {
            final var newMemberId = getNewMemberId();
            toBeUpdated = new Member();
            toBeUpdated.setId(UUID.randomUUID().toString());
            toBeUpdated.setMemberId(newMemberId);
        } else {
            final var member = getMember(memberId);
            if (member.isEmpty()) {
                return null;
            }
            toBeUpdated = member.get();
        }

        if (updatedMember.getStatus() != Status.TO_BE_DELETED) {
            toBeUpdated.setStatus(updatedMember.getStatus());
        }
        toBeUpdated.setTitle(updatedMember.getTitle());
        toBeUpdated.setFirstName(updatedMember.getFirstName());
        toBeUpdated.setLastName(updatedMember.getLastName());
        toBeUpdated.setSex(updatedMember.getSex());
        toBeUpdated.setBirthdate(updatedMember.getBirthdate());
        toBeUpdated.setStreet(updatedMember.getStreet());
        toBeUpdated.setStreetNumber(updatedMember.getStreetNumber());
        toBeUpdated.setZip(updatedMember.getZip());
        toBeUpdated.setCity(updatedMember.getCity());
        toBeUpdated.setPreferNotificationsPerSms(updatedMember.isPreferNotificationsPerSms());

        // reset confirmation codes if email was changed by others than the member
        if (!updateByMember) {
            if ((updatedMember.getEmail() == null)
                    || (toBeUpdated.getEmail() != null)
                            && !updatedMember.getEmail().equals(toBeUpdated.getEmail())) {
                toBeUpdated.setEmailConfirmed(false);
            }
            if ((updatedMember.getPhoneNumber() == null)
                    || (toBeUpdated.getPhoneNumber() != null)
                            && !updatedMember.getPhoneNumber().equals(toBeUpdated.getPhoneNumber())) {
                toBeUpdated.setPhoneConfirmed(false);
            }
        }
        toBeUpdated.setEmail(updatedMember.getEmail());
        toBeUpdated.setPhoneNumber(updatedMember.getPhoneNumber());

        if (!updateByMember) {
            toBeUpdated.setComment(updatedMember.getComment());
            if (newRoles != null) {
                // ensure at least one admin exists to not lock out
                if (toBeUpdated.hasRole(Role.ADMIN)
                        && !newRoles.contains(Role.ADMIN)) {
                    final var admins = members.findByRoles_Role(Role.ADMIN);
                    if (admins.size() == 1) { // must be current user due to if above
                        return -1;
                    }
                }
                toBeUpdated.updateRoles(newRoles);
            }
        }

        members.save(toBeUpdated);

        return toBeUpdated.getMemberId();

    }

    public static enum MemberApplicationUpdate {
        SAVE,
        ACCEPTED,
        REJECT,
        INQUIRY, REQUEST
    };

    public Page<Member> getMembers(
            final int page,
            final int amount,
            final String query) {

        final var pageable =
                PageRequest.of(page, amount, Direction.ASC, "lastName", "firstName", "memberId");

        if (query == null) {
            return members.findNotDeletedMembers(pageable);
        } else {
            try {
                final var memberId = Integer.parseInt(query);
                final var member = members.findByMemberId(memberId);
                if (member.isEmpty()) {
                    return Page.empty(pageable);
                }
                return new PageImpl<>(List.of(member.get()), pageable, 1);
            } catch (NumberFormatException e) {
                return members.findByQuery(query, pageable);
            }
        }

    }

    public int getCountOfActiveMembers() {

        return (int) members.countByStatus(
                at.elmo.member.Member.Status.ACTIVE);

    }

    public void requestEmailCode(
            final MemberBase member,
            final String emailAddress) throws Exception {

        final var code = String.format("%04d", random.nextInt(10000));
        member.setEmailForConfirmationCode(emailAddress);
        member.setGeneratedEmailConfirmationCode(code);

        emailService.sendEmail(
                "member/email-confirmation",
                emailAddress,
                NamedObject.from(emailAddress).as("emailAddress"),
                NamedObject.from(member).as("member"));

    }

    public void saveEmail(
            final Member member,
            final String email,
            final String givenEmailConfirmationCode) {

        member.setEmail(email);

        if ((member.getEmailForConfirmationCode() != null)
                && member.getEmailForConfirmationCode().equals(email)
                && (member.getGeneratedEmailConfirmationCode() != null)
                && member.getGeneratedEmailConfirmationCode().equals(givenEmailConfirmationCode)) {

            member.setEmailConfirmed(true);

        }

    }

    public void savePhoneNumber(
            final Member member,
            final String phoneNumber,
            final String givenPhoneConfirmationCode) {

        member.setPhoneNumber(phoneNumber);

        if ((member.getPhoneForConfirmationCode() != null)
                && member.getPhoneForConfirmationCode().equals(phoneNumber)
                && (member.getGeneratedPhoneConfirmationCode() != null)
                && member.getGeneratedPhoneConfirmationCode().equals(givenPhoneConfirmationCode)) {

            member.setEmailConfirmed(true);

        }

    }

    public void savePreferedWayForNotifications(
            final Integer memberId,
            final boolean preferSms) {

        final var member = getMember(memberId);
        if (member.isEmpty()) {
            throw new ElmoUserMessageException();
        }

        member.get().setPreferNotificationsPerSms(preferSms);

    }

    public void requestPhoneCode(
            final MemberBase member,
            final String phoneNumber) throws Exception {

        final var code = String.format("%04d", random.nextInt(10000));
        member.setPhoneForConfirmationCode(phoneNumber);
        member.setGeneratedPhoneConfirmationCode(code);

        smsService.sendSms(
                "member/phone-number-confirmation",
                null,
                properties.getPassanagerServicePhoneNumber(),
                member.getId(),
                phoneNumber,
                NamedObject.from(member).as("member"));

    }

    public void saveAvatar(
            final int memberId,
            final InputStream png) throws Exception {

        final var avatar = memberAvatars.findByOwner_MemberId(memberId);

        final var owner = members.findByMemberId(memberId);
        if (owner.isEmpty()) {
            throw new RuntimeException(
                    "Cannot save new avatar PNG for member '"
                    + memberId
                    + "' which is unknown!");
        }

        final var now = OffsetDateTime.now();
        final var timestamp = (int)
                (now.toEpochSecond()
                - OffsetDateTime.of(2020, 1, 1, 0, 0, 0, 0, now.getOffset()).toEpochSecond());

        if (avatar.isPresent()) {

            avatar.get().setPng(
                    StreamUtils.copyToByteArray(png));
            owner.get().setTimestampOfAvatar(timestamp);
            return;

        }

        final var newAvatar = new MemberAvatar();
        newAvatar.setId(owner.get().getId());
        newAvatar.setPng(
                StreamUtils.copyToByteArray(png));
        newAvatar.setOwner(owner.get());
        owner.get().setTimestampOfAvatar(timestamp);

        memberAvatars.saveAndFlush(newAvatar);

    }

    public Optional<byte[]> getAvatar(
            final int memberId) {

        final var avatar = memberAvatars.findByOwner_MemberId(memberId);
        if (avatar.isEmpty()) {
            return Optional.empty();
        }

        return Optional.of(avatar.get().getPng());

    }

}
