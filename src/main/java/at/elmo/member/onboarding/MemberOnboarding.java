package at.elmo.member.onboarding;

import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import at.elmo.member.Member;
import at.elmo.member.Member.Status;
import at.elmo.util.email.EmailService;
import at.phactum.bp.blueprint.process.ProcessService;
import at.phactum.bp.blueprint.service.WorkflowService;
import at.phactum.bp.blueprint.service.WorkflowTask;

@Service
@WorkflowService(workflowAggregateClass = MemberApplication.class)
@Transactional
public class MemberOnboarding {

    @Autowired
    private ProcessService<MemberApplication> processService;

    @Autowired
    private EmailService emailService;
    
    public void doOnboarding(
            final Member member) throws Exception {
        
        final var application = new MemberApplication();
        application.setId(UUID.randomUUID().toString());
        application.setMember(member);
        application.setStatus(MemberApplication.Status.IN_PROGRESS);
        
        processService.startWorkflow(application);

    }
    
    @WorkflowTask
    public void setUserStatusToEmailVerified(
            final MemberApplication application) throws Exception {
        
        final var member = application.getMember();
        member.setStatus(Status.EMAIL_VERIFIED);

    }
    
    @WorkflowTask
    public void notifyApplicant(
            final MemberApplication application) throws Exception {
        
        emailService.sendEmail(
                "onboarding/remind-applicant-about-missing-information",
                application.getMember().getEmail(),
                application.getMember());
        
    }

    @WorkflowTask
    public void deleteUserDueToAbortOfOnboarding() {

    }

    @WorkflowTask
    public void setUserStatusAccordingToValidation() {

    }

    @WorkflowTask
    public void setUserStatusToDataMissing() {

    }

    @WorkflowTask
    public void registerAdditionalSocialLogin() {

    }

    @WorkflowTask
    public void sendConfirmationOfApplicationAsADuplicate() {

    }

    @WorkflowTask
    public void informDriversAboutNewMember() {

    }

    @WorkflowTask
    public void sendConfirmationOfApplication() {

    }

    @WorkflowTask
    public void sendRejectionOfApplication() {

    }
    
}
