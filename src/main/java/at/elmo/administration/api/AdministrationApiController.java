package at.elmo.administration.api;

import javax.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import at.elmo.administration.api.v1.AdministrationApi;
import at.elmo.administration.api.v1.CountOfInprogressMemberOnboardings;
import at.elmo.administration.api.v1.MemberApplication;
import at.elmo.administration.api.v1.MemberOnboardingApplications;
import at.elmo.administration.api.v1.UpdateMemberOnboarding;
import at.elmo.member.Member.Status;
import at.elmo.member.MemberService;

@RestController
@RequestMapping("/api/v1")
public class AdministrationApiController implements AdministrationApi {

    @Autowired
    private MemberService memberService;
    
    @Autowired
    private AdministrationMapper mapper;

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
    public ResponseEntity<MemberApplication> updateMemberOnboardingApplication(
            final @Valid UpdateMemberOnboarding updateMemberOnboarding) {

        final var member = updateMemberOnboarding
                .getApplication()
                .getMember();
        
        final var updated = memberService.processMemberApplicationInformation(
                updateMemberOnboarding.getApplication().getId(),
                Status.valueOf(updateMemberOnboarding.getComplete()),
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
                member.getPreferNotificationsPerSms());
        
        final var result = mapper.toApi(updated);
        
        return ResponseEntity.ok(result);

    }

}
