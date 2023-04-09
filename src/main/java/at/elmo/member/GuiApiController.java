package at.elmo.member;

import at.elmo.gui.api.v1.CodeBasedChange;
import at.elmo.gui.api.v1.Member;
import at.elmo.gui.api.v1.MemberApi;
import at.elmo.util.UserContext;
import at.elmo.util.email.EmailService;
import at.elmo.util.exceptions.ElmoForbiddenException;
import at.elmo.util.exceptions.ElmoValidationException;
import at.elmo.util.sms.SmsService;
import org.slf4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;
import java.util.HashMap;

import javax.transaction.Transactional;

@RestController("memberGuiApi")
@RequestMapping("/api/v1")
public class GuiApiController implements MemberApi {

    @Autowired
    private Logger logger;

    @Autowired
    private UserContext userContext;

    @Autowired
    private GuiApiMapper mapper;

    @Autowired
    private MemberService memberService;

    @Autowired
    private EmailService emailService;

    @Autowired
    private SmsService smsService;

    @Override
    public ResponseEntity<Resource> avatarOfMember(
            final Integer memberId) {

        if (memberId == null) {
            return ResponseEntity.badRequest().build();
        }

        final var avatar = memberService.getAvatar(memberId);
        if (avatar.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity
                .ok()
                .cacheControl(CacheControl.maxAge(Duration.ofDays(365 * 10)))
                .body(new ByteArrayResource(avatar.get()));

    }

    @Transactional
    @Override
    public ResponseEntity<Void> uploadAvatar(
            final Integer memberId,
            final Resource body) {

        checkAccessOfMemberDetails(memberId);

        try {

            final var png = body.getInputStream();
            if (png == null) {
                return ResponseEntity.badRequest().build();
            }

            memberService.saveAvatar(
                    userContext.getLoggedInMember().getMemberId(),
                    png);

            return ResponseEntity.ok().build();

        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }

    }

    @Transactional
    @Override
    public ResponseEntity<Void> requestEmailCode(
            final String body) {

        if (body == null) {
            return ResponseEntity.badRequest().build();
        }
        final var emailAddress = body.replaceAll("\"", "");

        MemberBase member = userContext.getLoggedInMember();
        if (member == null) {
            member = userContext.getLoggedInMemberApplication();
        }

        if (!emailService.isValidEmailAddressFormat(emailAddress)) {
            throw new ElmoValidationException("email", "format");
        }

        try {

            memberService.requestEmailCode(member, emailAddress);

        } catch (Exception e) {

            logger.error("Could not send email-confirmation code for member '{}'", member.getId(), e);
            return ResponseEntity.internalServerError().build();

        }

        return ResponseEntity.ok().build();

    }

    @Transactional
    @Override
    public ResponseEntity<Void> changeEmail(
            final CodeBasedChange codeBasedChange) {

        if (codeBasedChange == null) {
            return ResponseEntity.badRequest().build();
        }
        final var member = userContext.getLoggedInMember();
        if (member == null) {
            return ResponseEntity.notFound().build();
        }

        final var emailConfirmationCode = codeBasedChange.getCode();
        final var email = codeBasedChange.getValue();

        if (!emailService.isValidEmailAddressFormat(email)) {
            throw new ElmoValidationException("email", "format");
        }

        final var violations = new HashMap<String, String>();
        if (member.getGeneratedEmailConfirmationCode() == null) {
            violations.put("emailConfirmationCode", "missing");
        } else if (!StringUtils.hasText(emailConfirmationCode)) {
            violations.put("emailConfirmationCode", "enter");
        } else if (!member.getGeneratedEmailConfirmationCode().trim().equals(emailConfirmationCode)) {
            violations.put("emailConfirmationCode", "mismatch");
        } else if (!member.getEmailForConfirmationCode().equals(email)) {
            violations.put("emailConfirmationCode", "mismatch");
        }
        if (!violations.isEmpty()) {
            throw new ElmoValidationException(violations);
        }

        memberService.saveEmail(
                member,
                email,
                emailConfirmationCode);

        return ResponseEntity.ok().build();

    }

    @Transactional
    @Override
    public ResponseEntity<Void> requestPhoneCode(
            final String body) {

        if (body == null) {
            return ResponseEntity.badRequest().build();
        }
        final var phoneNumber = body.replaceAll("\"", "");

        MemberBase member = userContext.getLoggedInMember();
        if (member == null) {
            member = userContext.getLoggedInMemberApplication();
        }


        if (!smsService.isValidPhoneNumberFormat(phoneNumber)) {
            throw new ElmoValidationException("phoneNumber", "format");
        }

        try {

            memberService.requestPhoneCode(member, phoneNumber);

        } catch (Exception e) {

            logger.error("Could not send phone-confirmation code for member '{}'", member.getId(), e);
            return ResponseEntity.internalServerError().build();

        }

        return ResponseEntity.ok().build();

    }

    @Transactional
    @Override
    public ResponseEntity<Void> changePhoneNumber(
            final CodeBasedChange codeBasedChange) {

        if (codeBasedChange == null) {
            return ResponseEntity.badRequest().build();
        }
        final var member = userContext.getLoggedInMember();
        if (member == null) {
            return ResponseEntity.notFound().build();
        }

        final var phoneConfirmationCode = codeBasedChange.getCode();
        final var phoneNumber = codeBasedChange.getValue();

        if (!smsService.isValidPhoneNumberFormat(phoneNumber)) {
            throw new ElmoValidationException("phoneNumber", "format");
        }

        final var violations = new HashMap<String, String>();
        if (member.getGeneratedPhoneConfirmationCode() == null) {
            violations.put("phoneConfirmationCode", "missing");
        } else if (!StringUtils.hasText(phoneConfirmationCode)) {
            violations.put("phoneConfirmationCode", "enter");
        } else if (!member.getGeneratedPhoneConfirmationCode().trim().equals(phoneConfirmationCode)) {
            violations.put("phoneConfirmationCode", "mismatch");
        } else if (!member.getPhoneForConfirmationCode().equals(phoneNumber)) {
            violations.put("phoneConfirmationCode", "mismatch");
        }
        if (!violations.isEmpty()) {
            throw new ElmoValidationException(violations);
        }

        memberService.savePhoneNumber(
                member,
                phoneNumber,
                phoneConfirmationCode);

        return ResponseEntity.ok().build();

    }

    @Override
    public ResponseEntity<Member> getMemberDetails(
            final Integer memberId) {

        checkAccessOfMemberDetails(memberId);

        final var member = memberService.getMember(memberId);
        if (member.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        final var result = mapper.toApi(member.get());

        return ResponseEntity.ok(result);

    }

    @Override
    public ResponseEntity<Void> setPreferedWayForNotifications(
            final Integer memberId,
            final String body) {

        if (!StringUtils.hasText(body)) {
            return ResponseEntity.badRequest().build();
        }

        checkAccessOfMemberDetails(memberId);

        final var mode = body.replaceAll("\"", "");

        memberService.savePreferedWayForNotifications(
                memberId,
                "SMS".equals(mode));

        return ResponseEntity.ok().build();

    }

    private void checkAccessOfMemberDetails(final Integer memberId) {

        final var loggedInMember = userContext.getLoggedInMember();
        
        // TODO: Test for relations of requested member to the current user
        if (loggedInMember.getMemberId().equals(memberId)) {
            return;
        } else if (loggedInMember.hasRole(Role.ADMIN)) {
            return;
        } else if (loggedInMember.hasRole(Role.MANAGER)) {
            return;
        } else if (loggedInMember.hasRole(Role.DRIVER)) {
            return;
        } else {
            throw new ElmoForbiddenException();
        }

    }

}
