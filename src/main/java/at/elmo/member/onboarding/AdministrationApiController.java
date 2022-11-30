package at.elmo.member.onboarding;

import at.elmo.administration.api.v1.CountOfInprogressMemberOnboardings;
import at.elmo.administration.api.v1.MemberApplication;
import at.elmo.administration.api.v1.MemberApplicationUpdate;
import at.elmo.administration.api.v1.MemberOnboardingApplications;
import at.elmo.administration.api.v1.OnboardingApi;
import at.elmo.administration.api.v1.TakeoverMemberOnboardingApplicationRequest;
import at.elmo.administration.api.v1.UpdateMemberOnboarding;
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

@RestController("onboardingAdministrationApiController")
@RequestMapping("/api/v1")
public class AdministrationApiController implements OnboardingApi {

    @Autowired
    private MemberOnboarding memberOnboarding;

    @Autowired
    private AdministrationApiMapper mapper;

    @Autowired
    private EmailService emailService;

    @Autowired
    private SmsService smsService;

    @Override
    public ResponseEntity<MemberOnboardingApplications> getMemberOnboardingApplications(
            final Integer pageNumber,
            final Integer pageSize) {

        final var applications = memberOnboarding.getMemberApplications(pageNumber, pageSize);

        final var result = new MemberOnboardingApplications();
        result.setApplications(
                mapper.toApi(applications.getContent()));
        result.setPage(
                mapper.toApi(applications));

        return ResponseEntity.ok(result);

    }

    @Override
    public ResponseEntity<CountOfInprogressMemberOnboardings> getCountOfInprogressMemberOnboardings() {

        final var count = memberOnboarding.getCountOfInprogressMemberApplications();

        return ResponseEntity.ok(new CountOfInprogressMemberOnboardings().count(count));

    }

    @Override
    public ResponseEntity<Void> takeoverMemberOnboardingApplication(
            final String applicationId,
            final TakeoverMemberOnboardingApplicationRequest usertask) {

        memberOnboarding.takeoverMemberApplicationByManagementComitee(
                applicationId,
                usertask.getTaskId());

        return ResponseEntity.ok().build();

    }

    @Override
    public ResponseEntity<MemberApplication> updateMemberOnboardingApplication(
            final String applicationId,
            final UpdateMemberOnboarding updateMemberOnboarding) {

        final var application = updateMemberOnboarding
                .getMemberApplication();

        final var violations = new HashMap<String, String>();

        if (updateMemberOnboarding.getAction() == MemberApplicationUpdate.ACCEPTED) {

            if (application.getMemberId() == null) {
                if (!StringUtils.hasText(application.getFirstName())) {
                    violations.put("firstName", "missing");
                }
                if (!StringUtils.hasText(application.getLastName())) {
                    violations.put("lastName", "missing");
                }
                if (application.getBirthdate() == null) {
                    violations.put("birthdate", "missing");
                }
                if (application.getSex() == null) {
                    violations.put("sex", "missing");
                }
                if (!StringUtils.hasText(application.getZip())) {
                    violations.put("zip", "missing");
                }
                if (!StringUtils.hasText(application.getCity())) {
                    violations.put("city", "missing");
                }
                if (!StringUtils.hasText(application.getStreet())) {
                    violations.put("street", "missing");
                }
                if (!StringUtils.hasText(application.getStreetNumber())) {
                    violations.put("streetNumber", "missing");
                }
            }

            if (!StringUtils.hasText(application.getEmail())) {
                violations.put("email", "missing");
            } else if (!emailService.isValidEmailAddressFormat(application.getEmail())) {
                violations.put("email", "format");
            }
            if (!StringUtils.hasText(application.getPhoneNumber())) {
                violations.put("phoneNumber", "missing");
            } else if (!smsService.isValidPhoneNumberFormat(application.getPhoneNumber())) {
                violations.put("phoneNumber", "format");
            }
            if (!violations.isEmpty()) {
                throw new ElmoValidationException(violations);
            }

        } else if (updateMemberOnboarding.getAction() == MemberApplicationUpdate.REJECT) {

            if (!StringUtils.hasText(updateMemberOnboarding.getMemberApplication().getComment())) {
                throw new ElmoValidationException("comment", "missing");
            }

        }

        final var updated = memberOnboarding.processMemberApplicationInformation(
                applicationId,
                updateMemberOnboarding.getTaskId(),
                mapper.toDomain(updateMemberOnboarding.getAction()),
                violations,
                application.getMemberId(),
                application.getTitle(),
                application.getFirstName(),
                application.getLastName(),
                application.getBirthdate() == null ? null : LocalDate.parse(application.getBirthdate()),
                mapper.toDomain(application.getSex()),
                application.getZip(),
                application.getCity(),
                application.getStreet(),
                application.getStreetNumber(),
                application.getEmail(),
                null,
                application.getPhoneNumber(),
                null,
                application.getPreferNotificationsPerSms(),
                application.getComment(),
                application.getApplicationComment(),
                mapper.toDomain(application.getInitialRole()));

        final var result = mapper.toApi(updated);

        return ResponseEntity.ok(result);

    }

    @Override
    public ResponseEntity<MemberApplication> getMemberOnboardingApplication(
            final String applicationId) {

        final var application = memberOnboarding.getMemberApplication(applicationId);
        if (application.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(
                mapper.toApi(application.get()));

    }

}
