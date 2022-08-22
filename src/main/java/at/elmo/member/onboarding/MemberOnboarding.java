package at.elmo.member.onboarding;

import java.io.File;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.slf4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.util.Pair;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import at.elmo.config.ElmoProperties;
import at.elmo.member.Member;
import at.elmo.member.MemberBase;
import at.elmo.member.MemberBase.Sex;
import at.elmo.member.MemberRepository;
import at.elmo.member.MemberService.MemberApplicationUpdate;
import at.elmo.member.Role;
import at.elmo.member.login.ElmoOAuth2User;
import at.elmo.member.login.OAuth2Identifier;
import at.elmo.member.onboarding.MemberApplication.Status;
import at.elmo.util.UserContext;
import at.elmo.util.config.ConfigValue;
import at.elmo.util.config.ConfigValueRepository;
import at.elmo.util.email.EmailService;
import at.elmo.util.email.NamedObject;
import at.elmo.util.exceptions.ElmoException;
import at.elmo.util.exceptions.ElmoForbiddenException;
import at.elmo.util.exceptions.ElmoValidationException;
import at.elmo.util.pdf.fillin.PdfFillIn;
import at.elmo.util.pdf.fillin.processors.FreemarkerCsvProcessor;
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
    private Logger logger;
    
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
            admin.setMemberId(properties.getAdminMemberId());
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

    @Transactional(noRollbackFor = ElmoValidationException.class)
    public MemberApplication processMemberApplicationInformation(
            final String applicationId,
            final String taskId,
            final MemberApplicationUpdate action,
            final Map<String, String> violations,
            final Integer memberId,
            final String title,
            final String firstName,
            final String lastName,
            final LocalDate birthdate,
            final Sex sex,
            final String zip,
            final String city,
            final String street,
            final String streetNumber,
            final String email,
            final String emailConfirmationCode,
            final String phoneNumber,
            final String phoneConfirmationCode,
            final boolean preferNotificationsPerSms,
            final String comment,
            final String applicationComment,
            final Role initialRole) {

        final var application = memberApplications
                .getById(applicationId);
        validateMemberForApplicationInformationProcessing(taskId, application);

        if (action == MemberApplicationUpdate.REQUEST) {

            if (application.getGeneratedEmailConfirmationCode() == null) {
                violations.put("emailConfirmationCode", "missing");
            } else if (!StringUtils.hasText(emailConfirmationCode)) {
                violations.put("emailConfirmationCode", "enter");
            } else if (!application.getGeneratedEmailConfirmationCode().equals(emailConfirmationCode)) {
                violations.put("emailConfirmationCode", "mismatch");
            } else if (!application.getEmail().equals(email)) {
                violations.put("emailConfirmationCode", "mismatch");
            }
            if (application.getGeneratedPhoneConfirmationCode() == null) {
                violations.put("phoneConfirmationCode", "missing");
            } else if (!StringUtils.hasText(phoneConfirmationCode)) {
                violations.put("phoneConfirmationCode", "enter");
            } else if (!application.getGeneratedPhoneConfirmationCode().equals(phoneConfirmationCode)) {
                violations.put("phoneConfirmationCode", "mismatch");
            } else if (!application.getPhoneNumber().equals(phoneNumber)) {
                violations.put("phoneConfirmationCode", "mismatch");
            }

        }

        application.setMemberId(memberId);
        application.setSex(sex);
        application.setTitle(title);
        application.setFirstName(firstName);
        application.setLastName(lastName);
        application.setBirthdate(birthdate);
        application.setZip(zip);
        application.setCity(city);
        application.setStreet(street);
        application.setStreetNumber(streetNumber);
        application.setEmail(email);
        if (emailConfirmationCode != null) {
            application.setGivenEmailConfirmationCode(emailConfirmationCode);
        }
        application.setPhoneNumber(phoneNumber);
        if (phoneConfirmationCode != null) {
            application.setGivenPhoneConfirmationCode(phoneConfirmationCode);
        }
        application.setPreferNotificationsPerSms(preferNotificationsPerSms);
        application.setComment(comment);
        application.setApplicationComment(applicationComment);
        if (initialRole != null) {
            application.setInitialRole(initialRole);
        }
        
        if (!violations.isEmpty()) {
            return application;
        }

        // configured administrator will become active immediately
        if (application.getEmail().equals(properties.getAdminIdentificationEmailAddress())) {
            throw new UnsupportedOperationException();
            // application.setStatus(Status.ACTIVE);
            // return null; // no onboarding configured administrator
        }
        
        if (action == MemberApplicationUpdate.REQUEST) {

            completeUserRegistrationForm(application, taskId);

        } else if (action == MemberApplicationUpdate.INQUIRY) {
            
            completeUserValidationFormForInvalidData(application, taskId);
            
        } else if (action == MemberApplicationUpdate.REJECT) {
            
            completeUserValidationFormAsRejected(application, taskId);
            
        } else if (action == MemberApplicationUpdate.ACCEPTED) {
            
            completeUserValidationFormAsAccepted(application, taskId);
            
        } else  if (action == MemberApplicationUpdate.SAVE) {

            return memberApplications.saveAndFlush(application);

        }

        return application;
        
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
    
    private int getNewMemberId() {
        
        final var lastMemberId = configValues
                .findById(ConfigValue.LAST_MEMBER_ID)
                .orElse(new ConfigValue(ConfigValue.LAST_MEMBER_ID,
                        Integer.toString(properties.getInitialNewMemberId() - 1)));

        final var newMemberId = Integer.parseInt(lastMemberId.getValue()) + 1;

        lastMemberId.setValue(Integer.toString(newMemberId));
        configValues.save(lastMemberId);

        return newMemberId;

    }

    @WorkflowTask
    public void createMember(
            final MemberApplication application) {

        final var newMemberId = getNewMemberId();
        
        application.setMemberId(newMemberId);

        final var member = new Member();
        member.setId(UUID.randomUUID().toString());
        member.setMemberId(newMemberId);
        member.setStatus(at.elmo.member.Member.Status.ACTIVE);
        member.setOauth2Ids(List.of(application.getOauth2Id()));
        member.addRole(application.getInitialRole());

        member.setBirthdate(application.getBirthdate());
        member.setCity(application.getCity());
        member.setComment(application.getComment());
        member.setEmail(application.getEmail());
        member.setTitle(application.getTitle());
        member.setFirstName(application.getFirstName());
        member.setLastName(application.getLastName());
        member.setPhoneNumber(application.getPhoneNumber());
        member.setPreferNotificationsPerSms(application.isPreferNotificationsPerSms());
        member.setSex(application.getSex());
        member.setStreet(application.getStreet());
        member.setStreetNumber(application.getStreetNumber());
        member.setZip(application.getZip());

        final var oauth2Id = application.getOauth2Id();
        oauth2Id.setOwner(member);

        members.saveAndFlush(member);

    }

    @WorkflowTask
    public void registerAdditionalSocialLogin() {

    }

    @WorkflowTask
    public void sendConfirmationOfApplicationAsADuplicate() {

    }

    @WorkflowTask
    public void informDriversAboutNewMember(
        final MemberApplication application) {

        members
                .findByRoles_Role(Role.DRIVER)
                .stream()
                .filter(driver -> !driver.getMemberId().equals(application.getMemberId()))
                .forEach(driver -> {
                    try {
                        emailService.sendEmail(
                                "onboarding/inform-drivers-about-new-member",
                                application.getEmail(),
                                application,
                                NamedObject.from(driver).as("driver"));
                    } catch (Exception e) {
                        logger.warn("Could not inform driver about new member by email!", e);
                    }
                });
        
    }

    @WorkflowTask
    public void sendConfirmationOfApplication(
            final MemberApplication application) throws Exception {

        final NamedObject agreement;
        if (application.getInitialRole() == Role.PASSANGER) {
            final var dir = new File(properties.getPassangerAgreementPdfDirectory());
            agreement = buildAgreementPdf(
                    application,
                    dir,
                    Role.PASSANGER.name());
        } else if (application.getInitialRole() == Role.DRIVER) {
            final var dir = new File(properties.getDriverAgreementPdfDirectory());
            agreement = buildAgreementPdf(
                    application,
                    dir,
                    Role.DRIVER.name());
        } else {
            agreement = null;
        }
        
        try {
            
            emailService.sendEmail(
                    "onboarding/confirmation-of-application",
                    application.getEmail(),
                    application,
                    agreement);
            
        } finally {

            if (agreement != null) {
                ((File) agreement.getObject()).delete();
            }
            
        }

    }

    public NamedObject buildAgreementPdf(
            final MemberBase application,
            final File dir,
            final String role) throws Exception {

        final var configuration = new File(dir, "config.csv");
        final var result = File.createTempFile("elmo", role + "-agreement_" + application.getMemberId());
        final var template = new File(dir, "template.pdf");
        
        final var data = new HashMap<String, Object>();
        Arrays
                .stream(MemberBase.class.getDeclaredFields())
                .map(field -> {
                    Object value;
                    try {
                        field.setAccessible(true); // access private fields
                        value = field.get(application);
                    } catch (Exception e) {
                        logger.warn(
                                "Could not access field '{}' of '{}'",
                                field.getName(),
                                application.getClass().getName(),
                                e);
                        value = null;
                    }
                    return Pair.of(field.getName(), Optional.ofNullable(value));
                })
                .forEach(pair -> data.put(pair.getFirst(), pair.getSecond().orElse(null)));

        final var pdfProcessor = new FreemarkerCsvProcessor(configuration);
        result.createNewFile();
        pdfProcessor.process(template, data, PdfFillIn.CSV_ENCODING, result);

        return NamedObject.from(result).as("Agreement.pdf");

    }

    @WorkflowTask
    public void sendRejectionOfApplication(
            final MemberApplication application) throws Exception {

        emailService.sendEmail(
                "onboarding/rejection-of-application",
                application.getEmail(),
                application);

    }
    
    public Optional<MemberApplication> getMemberApplication(
            final String applicationId) {

        return memberApplications.findById(applicationId);
        
    }

    public Page<MemberApplication> getMemberApplications(
            final int page,
            final int amount) {
        
        return memberApplications.findAll(
                Pageable.ofSize(amount).withPage(page));
        
    }

    public int getCountOfInprogressMemberApplications() {
        
        return (int) memberApplications.countByStatus(
                at.elmo.member.onboarding.MemberApplication.Status.APPLICATION_SUBMITTED);
        
    }
    
}
