package at.elmo.member.onboarding;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import at.elmo.config.ElmoProperties;
import at.elmo.member.Member;
import at.elmo.member.Member.Role;
import at.elmo.member.MemberRepository;
import at.elmo.member.login.ElmoOAuth2User;
import at.elmo.member.login.OAuth2Identifier;
import at.elmo.member.onboarding.MemberApplication.Status;
import at.elmo.util.UserContext;
import at.elmo.util.config.ConfigValue;
import at.elmo.util.config.ConfigValueRepository;
import at.elmo.util.email.EmailService;
import at.elmo.util.exceptions.ElmoException;
import at.elmo.util.exceptions.ElmoForbiddenException;
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
    private UserContext userContext;

    @Autowired
    private ElmoProperties properties;

    @Autowired
    private ProcessService<MemberApplication> processService;

    @Autowired
    private EmailService emailService;
    
    @Autowired
    private MemberApplicationRepository memberApplications;
    
    @Autowired
    private MemberRepository members;
    
    @Autowired
    private ConfigValueRepository configValues;

    public void doOnboarding(final ElmoOAuth2User oauth2User) throws Exception {

        final String oauth2Id = oauth2User.getOAuth2Id();

        final var memberApplication = memberApplications.findByOauth2Id_Id(oauth2Id);
        if (memberApplication.isPresent()) {
            return;
        }

        final var newOAuth2Id = new OAuth2Identifier();
        newOAuth2Id.setId(oauth2Id);
        newOAuth2Id.setProvider(oauth2User.getProvider());

        // configured administrator will get admin-role
        if (oauth2User.getEmail().equals(properties.getAdminIdentificationEmailAddress())) {

            final var admin = new Member();

            newOAuth2Id.setOwner(admin);

            admin.setOauth2Ids(List.of(newOAuth2Id));
            admin.setId(UUID.randomUUID().toString());
            admin.setEmail(oauth2User.getEmail());
            admin.setStatus(at.elmo.member.Member.Status.ACTIVE);
            admin.setLastName(oauth2User.getName());
            admin.setFirstName(oauth2User.getFirstName());

            admin.addRole(Role.ADMIN);

            members.saveAndFlush(admin);
            return; // no onboarding configured administrator

        }

        final var newApplication = new MemberApplication();
        newOAuth2Id.setOwner(newApplication);

        newApplication.setOauth2Id(newOAuth2Id);
        newApplication.setId(UUID.randomUUID().toString());
        newApplication.setEmail(oauth2User.getEmail());
        newApplication.setStatus(Status.NEW);
        newApplication.setLastName(oauth2User.getName());
        newApplication.setFirstName(oauth2User.getFirstName());

        final var application = memberApplications.saveAndFlush(newApplication);

        processService.startWorkflow(application);

    }

    public Optional<MemberApplication> getMemberApplicationByOAuth2User(
            final String oauth2Id) {
        
        return memberApplications.findByOauth2Id_Id(oauth2Id);
        
    }
    
    public void takeoverMemberApplicationByApplicant(final String applicationId, final String taskId) {

        final var application = memberApplications.getById(applicationId);

        application.setStatus(Status.DATA_INVALID);

        takeOver(application, taskId);

    }

    public void takeoverMemberApplicationByManagementComitee(
            final String applicationId,
            final String taskId) {

        final var application = memberApplications.getById(applicationId);
        
        application.setStatus(Status.APPLICATION_SUBMITTED);

        takeOver(application, taskId);
        
    }

    public void takeOver(
            final MemberApplication application, final String taskId) {

        validateMemberForApplicationInformationProcessing(taskId, application);

        processService.correlateMessage(application, "TakeOver");

    }

    public void validateMemberForApplicationInformationProcessing(
            final String taskId,
            final MemberApplication application) {

        if (!userContext.hasRole(Role.MANAGER)
                && !application.getId().equals(userContext.getLoggedInMemberApplication().getId())) {

            throw new ElmoForbiddenException("Not allowed");

        }

        if (!taskId.equals(application.getUserTaskId())) {

            throw new ElmoException("Application form of '" + application.getId() + "' expired!");

        }

    }
    
    @WorkflowTask
    public void setMemberStatusToDataInvalid(
            final MemberApplication application) throws Exception {

        application.setStatus(Status.DATA_INVALID);

    }
    
    @WorkflowTask
    public void notifyApplicant(
            final MemberApplication application) throws Exception {
        
        emailService.sendEmail(
                "onboarding/remind-applicant-about-missing-information",
                application.getEmail(),
                application);
        
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
        
        application.setStatus(Status.DATA_INVALID);
        
        processService.completeUserTask(application, taskId);
        
    }

    public void completeUserValidationFormAsDuplicate(
            final MemberApplication application,
            final String taskId) {
        
        application.setStatus(Status.DUPLICATE);
        
        processService.completeUserTask(application, taskId);
        
    }

    public void completeUserValidationFormAsRejected(
            final MemberApplication application,
            final String taskId) {
        
        application.setStatus(Status.REJECTED);
        
        processService.completeUserTask(application, taskId);
        
    }

    public void completeUserValidationFormAsAccepted(
            final MemberApplication application,
            final String taskId) {
        
        application.setStatus(Status.ACCEPTED);
        
        processService.completeUserTask(application, taskId);
        
    }

    public void completeUserRegistrationForm(
            final MemberApplication application,
            final String taskId) {
        
        application.setStatus(Status.APPLICATION_SUBMITTED);
        
        processService.completeUserTask(application, taskId);
        
    }

    @WorkflowTask
    public void deleteUserDueToAbortOfOnboarding() {

    }

    @WorkflowTask
    public void setMemberStatusApplicationSubmitted(
            final MemberApplication application) {

        application.setStatus(Status.APPLICATION_SUBMITTED);

    }

    @WorkflowTask
    public void createMember(
            final MemberApplication application) {

        final var lastMemberId = configValues
                .findById(ConfigValue.LAST_MEMBER_ID)
                .orElse(new ConfigValue(ConfigValue.LAST_MEMBER_ID, "0"));

        final var newMemberId = Integer.parseInt(lastMemberId.getValue()) + 1;

        lastMemberId.setValue(Integer.toString(newMemberId));
        configValues.save(lastMemberId);

        final var member = new Member();
        member.setId(UUID.randomUUID().toString());
        member.setMemberId(newMemberId);
        member.setStatus(at.elmo.member.Member.Status.ACTIVE);
        member.setOauth2Ids(List.of(application.getOauth2Id()));
        member.addRole(Role.PASSANGER);

        member.setBirthdate(application.getBirthdate());
        member.setCity(application.getCity());
        member.setComment(application.getComment());
        member.setEmail(application.getEmail());
        member.setFirstName(application.getFirstName());
        member.setLastName(application.getLastName());
        member.setPhoneNumber(application.getPhoneNumber());
        member.setPreferNotificationsPerSms(application.isPreferNotificationsPerSms());
        member.setSex(application.getSex());
        member.setStreet(application.getStreet());
        member.setStreetNumber(application.getStreetNumber());
        member.setZip(application.getZip());

        members.saveAndFlush(member);

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
