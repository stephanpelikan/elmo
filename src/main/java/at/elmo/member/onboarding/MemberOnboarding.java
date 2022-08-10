package at.elmo.member.onboarding;

import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import at.elmo.member.Member;
import at.elmo.member.Member.Status;
import at.elmo.util.email.EmailService;
import at.phactum.bp.blueprint.process.ProcessService;
import at.phactum.bp.blueprint.service.TaskEvent;
import at.phactum.bp.blueprint.service.TaskEvent.Event;
import at.phactum.bp.blueprint.service.TaskId;
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
        application.setEmail(member.getEmail());
        
        processService.startWorkflow(application);

    }
    
    public void takeOver(
            final MemberApplication application) {

        processService.correlateMessage(application, "TakeOver");

    }
    
    @WorkflowTask
    public void setMemberStatusToDataInvalid(
            final MemberApplication application) throws Exception {
        
        final var member = application.getMember();
        member.setStatus(Status.DATA_INVALID);

    }
    
    @WorkflowTask
    public void notifyApplicant(
            final MemberApplication application) throws Exception {
        
        emailService.sendEmail(
                "onboarding/remind-applicant-about-missing-information",
                application.getMember().getEmail(),
                application.getMember());
        
    }
    
    @WorkflowTask(taskDefinition = "userRegistrationForm")
    public void userRegistrationForm(
            final MemberApplication application,
            final @TaskId String taskId,
            final @TaskEvent Event event) {
        
        if (event == Event.CREATED) {
            application.setUserTaskId(taskId);
        } else {
            application.setUserTaskId(null);
        }
        
    }
    
    @WorkflowTask(taskDefinition = "userValidationForm")
    public void userValidationForm(
            final MemberApplication application,
            final @TaskId String taskId,
            final @TaskEvent Event event) {
        
        if (event == Event.CREATED) {
            application.setUserTaskId(taskId);
        } else {
            application.setUserTaskId(null);
        }
        
    }
    
    public void completeUserValidationFormForInvalidData(
            final MemberApplication application,
            final String taskId) {
        
        application.getMember().setStatus(Status.DATA_INVALID);
        
        processService.completeUserTask(application, taskId);
        
    }

    public void completeUserValidationFormAsDuplicate(
            final MemberApplication application,
            final String taskId) {
        
        application.setStatus(at.elmo.member.onboarding.MemberApplication.Status.DUPLICATE);
        
        processService.completeUserTask(application, taskId);
        
    }

    public void completeUserValidationFormAsRejected(
            final MemberApplication application,
            final String taskId) {
        
        application.setStatus(at.elmo.member.onboarding.MemberApplication.Status.REJECTED);
        
        processService.completeUserTask(application, taskId);
        
    }

    public void completeUserValidationFormAsAccepted(
            final MemberApplication application,
            final String taskId) {
        
        application.setStatus(at.elmo.member.onboarding.MemberApplication.Status.DONE);
        
        processService.completeUserTask(application, taskId);
        
    }
    
    @WorkflowTask
    public void setMemberStatusAccordingToValidation(
            final MemberApplication application) {
        
        final var status = application.getStatus();
        
        if (status == at.elmo.member.onboarding.MemberApplication.Status.DONE) {
            application.getMember().setStatus(Status.ACTIVE);
        } else if (status == at.elmo.member.onboarding.MemberApplication.Status.REJECTED) {
            application.getMember().setStatus(Status.REJECTED);
        } else if (status == at.elmo.member.onboarding.MemberApplication.Status.DUPLICATE) {
            application.getMember().setStatus(Status.DUPLICATE);
        }
        
    }

    @WorkflowTask
    public void deleteUserDueToAbortOfOnboarding() {

    }

    @WorkflowTask
    public void setMemberStatusApplicationSubmitted(
            final MemberApplication application) {

        final var member = application.getMember();
        member.setStatus(Status.APPLICATION_SUBMITTED);

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
