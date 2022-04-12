package at.elmo.administration.api;

import javax.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import at.elmo.administration.api.v1.AdministrationApi;
import at.elmo.administration.api.v1.MemberApplications;
import at.elmo.member.MemberService;

@RestController
@RequestMapping("/api/v1")
public class AdministrationApiController implements AdministrationApi {

    @Autowired
    private MemberService memberService;
    
    @Autowired
    private AdministrationMapper mapper;

    @Override
    public ResponseEntity<MemberApplications> getMemberApplications(final @Valid Integer pageNumber,
            final @Valid Integer pageSize) {

        final var applications = memberService.getMemberApplications(pageNumber, pageSize);

        final var result = new MemberApplications();
        result.setApplications(
                mapper.toApi(applications.getContent()));
        result.setPage(
                mapper.toApi(applications));

        return ResponseEntity.ok(result);

    }

}
