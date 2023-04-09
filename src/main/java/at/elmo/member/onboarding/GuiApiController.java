package at.elmo.member.onboarding;

import at.elmo.gui.api.v1.MemberApplicationForm;
import at.elmo.gui.api.v1.OnboardingApi;
import at.elmo.gui.api.v1.TakeoverMemberApplicationFormRequest;
import at.elmo.member.MemberService.MemberApplicationUpdate;
import at.elmo.util.UserContext;
import at.elmo.util.email.EmailService;
import at.elmo.util.exceptions.ElmoValidationException;
import at.elmo.util.sms.SmsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.HashMap;

import javax.validation.Valid;

@RestController("onboardingGuiApiController")
@RequestMapping("/api/v1")
public class GuiApiController implements OnboardingApi {

    @Autowired
    private UserContext userContext;

    @Autowired
    private MemberOnboarding memberOnboarding;

    @Autowired
    private EmailService emailService;

    @Autowired
    private SmsService smsService;

    @Autowired
    private GuiApiMapper mapper;

    @Override
    public ResponseEntity<Void> takeoverMemberApplicationForm(
            final @Valid TakeoverMemberApplicationFormRequest takeoverMemberApplicationFormRequest) {

        final var application = userContext.getLoggedInMemberApplication();

        memberOnboarding.takeoverMemberApplicationByApplicant(
                application.getId(),
                takeoverMemberApplicationFormRequest.getTaskId());

        return ResponseEntity.ok().build();

    }

    @Override
    public ResponseEntity<MemberApplicationForm> loadMemberApplicationForm() {

        final var application = userContext.getLoggedInMemberApplication();

        return ResponseEntity.ok(
                mapper.toApi(application));

    }

    @Override
    public ResponseEntity<String> submitMemberApplicationForm(
            final MemberApplicationForm memberApplicationForm) {

        final var violations = new HashMap<String, String>();
        if (!StringUtils.hasText(memberApplicationForm.getFirstName())) {
            violations.put("firstName", "missing");
        }
        if (!StringUtils.hasText(memberApplicationForm.getLastName())) {
            violations.put("lastName", "missing");
        }
        if (memberApplicationForm.getBirthdate() == null) {
            violations.put("birthdate", "missing");
        }
        if (memberApplicationForm.getMemberId() == null) {
            if (memberApplicationForm.getSex() == null) {
                violations.put("sex", "missing");
            }
            if (!StringUtils.hasText(memberApplicationForm.getZip())) {
                violations.put("zip", "missing");
            }
            if (!StringUtils.hasText(memberApplicationForm.getCity())) {
                violations.put("city", "missing");
            }
            if (!StringUtils.hasText(memberApplicationForm.getStreet())) {
                violations.put("street", "missing");
            }
            if (!StringUtils.hasText(memberApplicationForm.getStreetNumber())) {
                violations.put("streetNumber", "missing");
            }
        }
        if (!StringUtils.hasText(memberApplicationForm.getEmail())) {
            violations.put("email", "missing");
        } else if (!emailService.isValidEmailAddressFormat(memberApplicationForm.getEmail())) {
            violations.put("email", "format");
        }
        if (!StringUtils.hasText(memberApplicationForm.getPhoneNumber())) {
            violations.put("phoneNumber", "missing");
        } else if (!smsService.isValidPhoneNumberFormat(memberApplicationForm.getPhoneNumber())) {
            violations.put("phoneNumber", "format");
        }
        if (!StringUtils.hasText(memberApplicationForm.getEmailConfirmationCode())) {
            violations.put("emailConfirmationCode", "missing");
            throw new ElmoValidationException(violations); // going ahead would cause DB failure
        } else if (memberApplicationForm.getEmailConfirmationCode().trim().length() > 4) {
            violations.put("emailConfirmationCode", "format");
            throw new ElmoValidationException(violations); // going ahead would cause DB failure
        } else {
            memberApplicationForm.setEmailConfirmationCode(
                    memberApplicationForm.getEmailConfirmationCode().trim());
        }
        if (!StringUtils.hasText(memberApplicationForm.getPhoneConfirmationCode())) {
            violations.put("phoneConfirmationCode", "missing");
            throw new ElmoValidationException(violations); // going ahead would cause DB failure
        } else if (memberApplicationForm.getPhoneConfirmationCode().trim().length() > 4) {
            violations.put("phoneConfirmationCode", "format");
            throw new ElmoValidationException(violations); // going ahead would cause DB failure
        } else {
            memberApplicationForm.setPhoneConfirmationCode(
                    memberApplicationForm.getPhoneConfirmationCode().trim());
        }

        final var referNotificationsPerSms =
                memberApplicationForm.getPreferNotificationsPerSms() != null
                ? memberApplicationForm.getPreferNotificationsPerSms().booleanValue()
                : false;

        memberOnboarding.processMemberApplicationInformation(
                memberApplicationForm.getApplicationId(),
                memberApplicationForm.getTaskId(),
                MemberApplicationUpdate.REQUEST,
                violations,
                memberApplicationForm.getMemberId(),
                memberApplicationForm.getTitle(),
                memberApplicationForm.getFirstName(),
                memberApplicationForm.getLastName(),
                memberApplicationForm.getBirthdate() == null ? null
                        : LocalDate.parse(memberApplicationForm.getBirthdate()),
                mapper.toDomain(memberApplicationForm.getSex()),
                memberApplicationForm.getZip(),
                memberApplicationForm.getCity(),
                memberApplicationForm.getStreet(),
                memberApplicationForm.getStreetNumber(),
                memberApplicationForm.getEmail(),
                memberApplicationForm.getEmailConfirmationCode(),
                memberApplicationForm.getPhoneNumber(),
                memberApplicationForm.getPhoneConfirmationCode(),
                referNotificationsPerSms,
                memberApplicationForm.getComment(),
                memberApplicationForm.getApplicationComment(),
                null);

        if (!violations.isEmpty()) {
            throw new ElmoValidationException(violations);
        }

        return ResponseEntity.ok().build();

    }

}
