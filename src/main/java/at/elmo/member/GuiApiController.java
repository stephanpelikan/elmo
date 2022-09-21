package at.elmo.member;

import at.elmo.gui.api.v1.MemberApi;
import at.elmo.util.UserContext;
import at.elmo.util.email.EmailService;
import at.elmo.util.exceptions.ElmoValidationException;
import at.elmo.util.sms.SmsService;
import org.slf4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;

import javax.validation.Valid;
import javax.validation.constraints.NotNull;

@RestController("memberGuiApi")
@RequestMapping("/api/v1")
public class GuiApiController implements MemberApi {

    @Autowired
    private Logger logger;

    @Autowired
    private UserContext userContext;

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

    @Override
    public ResponseEntity<Void> uploadAvatar(
            final Resource body) {

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

    @Override
    public ResponseEntity<Void> requestEmailCode(
            final @NotNull @Valid String emailAddress) {

        final var application = userContext.getLoggedInMemberApplication();

        if (!emailService.isValidEmailAddressFormat(emailAddress)) {
            throw new ElmoValidationException("email", "format");
        }

        try {

            memberService.requestEmailCode(application, emailAddress);

        } catch (Exception e) {

            logger.error("Could not send email-confirmation code for member-application '{}'", application.getId(), e);
            return ResponseEntity.internalServerError().build();

        }

        return ResponseEntity.ok().build();

    }

    @Override
    public ResponseEntity<Void> requestPhoneCode(
            final @NotNull @Valid String phoneNumber) {

        final var application = userContext.getLoggedInMemberApplication();

        if (!smsService.isValidPhoneNumberFormat(phoneNumber)) {
            throw new ElmoValidationException("phoneNumber", "format");
        }

        try {

            memberService.requestPhoneCode(application, phoneNumber);

        } catch (Exception e) {

            logger.error("Could not send phone-confirmation code for member-application '{}'", application.getId(), e);
            return ResponseEntity.internalServerError().build();

        }

        return ResponseEntity.ok().build();

    }

}
