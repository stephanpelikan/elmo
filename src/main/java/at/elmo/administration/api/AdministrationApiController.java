package at.elmo.administration.api;

import java.util.HashMap;

import javax.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import at.elmo.administration.api.v1.AdministrationApi;
import at.elmo.administration.api.v1.CountOfInprogressMemberOnboardings;
import at.elmo.administration.api.v1.MemberApplication;
import at.elmo.administration.api.v1.MemberApplicationUpdate;
import at.elmo.administration.api.v1.MemberOnboardingApplications;
import at.elmo.administration.api.v1.TakeoverMemberOnboardingApplicationRequest;
import at.elmo.administration.api.v1.UpdateMemberOnboarding;
import at.elmo.member.MemberService;
import at.elmo.util.email.EmailService;
import at.elmo.util.exceptions.ElmoValidationException;

@RestController
@RequestMapping("/api/v1")
public class AdministrationApiController implements AdministrationApi {

    @Autowired
    private MemberService memberService;
    
    @Autowired
    private AdministrationMapper mapper;

    @Autowired
    private EmailService emailService;

    @Override
    public ResponseEntity<MemberOnboardingApplications> getMemberOnboardingApplications(
            final @Valid Integer pageNumber,
            final @Valid Integer pageSize) {

        final var applications = memberService.getMemberApplications(pageNumber, pageSize);

        final var result = new MemberOnboardingApplications();
        result.setApplications(
                mapper.toApi(applications.getContent()));
        result.setPage(
                mapper.toApi(applications));

        return ResponseEntity.ok(result);

    }

    @Override
    public ResponseEntity<CountOfInprogressMemberOnboardings> getCountOfInprogressMemberOnboardings() {

        final var count = memberService.getCountOfInprogressMemberApplications();

        return ResponseEntity.ok(new CountOfInprogressMemberOnboardings().count(count));

    }

    @Override
    public ResponseEntity<Void> takeoverMemberOnboardingApplication(
            final String applicationId,
            final @Valid TakeoverMemberOnboardingApplicationRequest usertask) {

        memberService.takeoverMemberApplication(
                applicationId,
                usertask.getTaskId());

        return ResponseEntity.ok().build();

    }
    
    @Override
    public ResponseEntity<MemberApplication> updateMemberOnboardingApplication(
            final String applicationId,
            final @Valid UpdateMemberOnboarding updateMemberOnboarding) {

        final var member = updateMemberOnboarding
                .getMember();
        
        if (updateMemberOnboarding.getAction() == MemberApplicationUpdate.DONE) {

            final var violations = new HashMap<String, String>();
            if (member.getMemberId() == null) {
                violations.put("memberId", "missing");
            }
            if (!StringUtils.hasText(member.getFirstName())) {
                violations.put("firstName", "missing");
            }
            if (!StringUtils.hasText(member.getLastName())) {
                violations.put("lastName", "missing");
            }
            if (member.getBirthdate() == null) {
                violations.put("birthdate", "missing");
            }
            if (member.getSex() == null) {
                violations.put("sex", "missing");
            }
            if (!StringUtils.hasText(member.getZip())) {
                violations.put("zip", "missing");
            }
            if (!StringUtils.hasText(member.getCity())) {
                violations.put("city", "missing");
            }
            if (!StringUtils.hasText(member.getStreet())) {
                violations.put("street", "missing");
            }
            if (!StringUtils.hasText(member.getStreetNumber())) {
                violations.put("streetNumber", "missing");
            }
            if (!StringUtils.hasText(member.getEmail())) {
                violations.put("email", "missing");
            } else if (!emailService.isValidEmailAddressFormat(member.getEmail())) {
                violations.put("email", "format");
            }
            if (!StringUtils.hasText(member.getPhoneNumber())) {
                violations.put("phoneNumber", "missing");
            } else if (!member.getPhoneNumber().startsWith("+")) {
                violations.put("phoneNumber", "format");
            }
            if (!violations.isEmpty()) {
                throw new ElmoValidationException(violations);
            }

        } else if (updateMemberOnboarding.getAction() == MemberApplicationUpdate.REJECT) {

            if (!StringUtils.hasText(updateMemberOnboarding.getMember().getComment())) {
                throw new ElmoValidationException("comment", "missing");
            }

        }

        final var updated = memberService.processMemberApplicationInformation(
                applicationId,
                updateMemberOnboarding.getTaskId(),
                mapper.toDomain(updateMemberOnboarding.getAction()),
                member.getMemberId(),
                member.getFirstName(),
                member.getLastName(),
                member.getBirthdate(),
                mapper.toDomain(member.getSex()),
                member.getZip(),
                member.getCity(),
                member.getStreet(),
                member.getStreetNumber(),
                member.getEmail(),
                null,
                member.getPhoneNumber(),
                null,
                member.getPreferNotificationsPerSms(),
                member.getComment());
        
        final var result = mapper.toApi(updated);
        
        return ResponseEntity.ok(result);

    }

    @Override
    public ResponseEntity<MemberApplication> getMemberOnboardingApplication(
            final String applicationId) {
        
        final var application = memberService.getMemberApplication(applicationId);
        if (application.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        return ResponseEntity.ok(
                mapper.toApi(application.get()));
    
    }
    
}
