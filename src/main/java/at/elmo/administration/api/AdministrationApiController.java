package at.elmo.administration.api;

import java.io.File;
import java.io.FileOutputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map.Entry;
import java.util.stream.Collectors;

import javax.validation.Valid;

import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.slf4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import at.elmo.administration.api.v1.AdministrationApi;
import at.elmo.administration.api.v1.CountOfActiveMembers;
import at.elmo.administration.api.v1.CountOfInprogressMemberOnboardings;
import at.elmo.administration.api.v1.MemberApplication;
import at.elmo.administration.api.v1.MemberApplicationUpdate;
import at.elmo.administration.api.v1.MemberOnboardingApplications;
import at.elmo.administration.api.v1.Members;
import at.elmo.administration.api.v1.TakeoverMemberOnboardingApplicationRequest;
import at.elmo.administration.api.v1.UpdateMemberOnboarding;
import at.elmo.config.ElmoProperties;
import at.elmo.config.TranslationProperties;
import at.elmo.member.Member;
import at.elmo.member.MemberBase.Payment;
import at.elmo.member.MemberBase.Sex;
import at.elmo.member.MemberService;
import at.elmo.member.onboarding.MemberOnboarding;
import at.elmo.util.email.EmailService;
import at.elmo.util.exceptions.ElmoValidationException;
import at.elmo.util.sms.SmsService;
import at.elmo.util.spring.FileCleanupInterceptor;

@RestController
@RequestMapping("/api/v1")
public class AdministrationApiController implements AdministrationApi {

    @Autowired
    private Logger logger;
    
    @Autowired
    private MemberService memberService;
    
    @Autowired
    private MemberOnboarding memberOnboarding;

    @Autowired
    private AdministrationMapper mapper;

    @Autowired
    private EmailService emailService;

    @Autowired
    private SmsService smsService;
    
    @Autowired
    private TranslationProperties translations;

    @Autowired
    private ElmoProperties properties;

    @Override
    public ResponseEntity<MemberOnboardingApplications> getMemberOnboardingApplications(
            final @Valid Integer pageNumber,
            final @Valid Integer pageSize) {

        final var applications = memberOnboarding.getMemberApplications(pageNumber, pageSize);

        final var result = new MemberOnboardingApplications();
        result.setApplications(
                mapper.toApplicationApi(applications.getContent()));
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
    public ResponseEntity<CountOfActiveMembers> getCountOfActiveMembers() {

        final var count = memberService.getCountOfActiveMembers();

        return ResponseEntity.ok(new CountOfActiveMembers().count(count));

    }

    @Override
    public ResponseEntity<Void> takeoverMemberOnboardingApplication(
            final String applicationId,
            final @Valid TakeoverMemberOnboardingApplicationRequest usertask) {

        memberOnboarding.takeoverMemberApplicationByManagementComitee(
                applicationId,
                usertask.getTaskId());

        return ResponseEntity.ok().build();

    }
    
    @Override
    public ResponseEntity<MemberApplication> updateMemberOnboardingApplication(
            final String applicationId,
            final @Valid UpdateMemberOnboarding updateMemberOnboarding) {

        final var application = updateMemberOnboarding
                .getMemberApplication();

        final var violations = new HashMap<String, String>();

        if (updateMemberOnboarding.getAction() == MemberApplicationUpdate.ACCEPTED) {

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
                application.getBirthdate(),
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
    public ResponseEntity<Members> getMembers(
            final @Valid Integer pageNumber,
            final @Valid Integer pageSize) {

        final var members = memberService.getMembers(pageNumber, pageSize);

        final var result = new Members();
        result.setMembers(
                mapper.toMemberApi(members.getContent()));
        result.setPage(
                mapper.toApi(members));

        return ResponseEntity.ok(result);

    }
    
    @Override
    public ResponseEntity<Void> uploadMembersExcelFile(
            final Resource body) {
        
        final var gTranslation = translations.getGeneral().get("de");
        
        try (final var wb = new XSSFWorkbook(body.getInputStream())) {
            
            final var sheet = wb.getSheetAt(0);
            for (final var row : sheet) {
                
                final int memberId;
                try {
                    memberId = (int) Math.floor(row.getCell(0).getNumericCellValue());
                } catch (Exception e) {
                    logger.info("Expecting member-id in first cell of row {} in uploaded Excel",
                            row.getRowNum());
                    continue;
                }
                
                try {
                    logger.info("About to import member {} from uploaded Excel",
                            memberId);
                    
                    final var typeValue = row.getCell(1).getStringCellValue();
                    final var roles = gTranslation
                            .getRoleShortcuts()
                            .entrySet()
                            .stream()
                            .filter(entry -> typeValue.contains(entry.getValue()))
                            .map(Entry::getKey)
                            .collect(Collectors.toList());
                    final var salutation = row.getCell(2).getStringCellValue();
                    final var sex = gTranslation
                            .getSalutation()
                            .entrySet()
                            .stream()
                            .filter(entry -> entry.getValue().equals(salutation))
                            .findFirst()
                            .map(Entry::getKey)
                            .orElse(Sex.OTHER);
                    final var title = row.getCell(3).getStringCellValue();
                    final var lastName = row.getCell(4).getStringCellValue();
                    final var firstName = row.getCell(5).getStringCellValue();
                    final var birthdate = row.getCell(6).getCellType() == CellType.NUMERIC
                            ? row.getCell(6).getLocalDateTimeCellValue().toLocalDate()
                            : row.getCell(6).getStringCellValue().equals("-")
                            ? null
                            : LocalDate.parse(
                                    row.getCell(6).getStringCellValue(),
                                    DateTimeFormatter.ofPattern(gTranslation.getDateFormat()));
                    final var streetValue = row.getCell(7).getStringCellValue();
                    final var streetNumber = streetValue != null
                            ? streetValue.replaceFirst("^\\D+", "")
                            : null;
                    final var street = streetValue != null
                            ? streetValue.substring(0, streetValue.length() - streetNumber.length())
                            : null;
                    final var zip = row.getCell(8).getCellType() == CellType.NUMERIC
                            ? Integer.toString((int) Math.floor(row.getCell(8).getNumericCellValue()))
                            : row.getCell(8).getStringCellValue();
                    final var city = row.getCell(9).getStringCellValue();
                    final var email = row.getCell(10).getStringCellValue();
                    final var phoneNumberValue = row.getCell(11).getStringCellValue();
                    final String phoneNumber;
                    if (!StringUtils.hasText(phoneNumberValue)) {
                        phoneNumber = null;
                    } else if (phoneNumberValue.trim().startsWith("+")) {
                        phoneNumber = phoneNumberValue.trim().replaceAll("[-\\/\\s]+", "");
                    } else if (phoneNumberValue.trim().startsWith("0")) {
                        phoneNumber = properties.getDefaultPhoneCountry()
                                + phoneNumberValue.trim().replaceAll("[-\\/\\s]+", "").substring(1);
                    } else {
                        phoneNumber = properties.getDefaultPhoneCountry()
                                + phoneNumberValue.trim().replaceAll("[-\\/\\s]+", "");
                    }
                    final var comment = row.getCell(12).getStringCellValue();
                    final var iban = row.getCell(13).getStringCellValue();
                    final var paymentValue = row.getCell(14).getStringCellValue();
                    final var payment = gTranslation
                            .getPayment()
                            .entrySet()
                            .stream()
                            .filter(entry -> entry.getValue().equals(paymentValue))
                            .findFirst()
                            .map(Entry::getKey)
                            .orElse(Payment.MONTHLY);
                    
                    memberService.createMember(
                            memberId,
                            roles,
                            sex,
                            title,
                            lastName,
                            firstName,
                            birthdate,
                            street,
                            streetNumber,
                            zip,
                            city,
                            email,
                            phoneNumber,
                            comment,
                            iban,
                            payment);
                    
                } catch (Exception e) {
                    
                    logger.info("Could not import member {} from uploaded Excel",
                            memberId,
                            e);

                }
                
            }
            
            return ResponseEntity.ok().build();
            
        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        
    }
    
    @Override
    public ResponseEntity<Resource> generateMembersExcelFile() {
        
        final var translation = translations.getDownloadMembers().get("de");
        final var gTranslation = translations.getGeneral().get("de");
        
        final File tempFile;
        try  {
            
            tempFile = File.createTempFile("members", "download");
            FileCleanupInterceptor.setDownloadFile(tempFile);
            
            try (final var wb = new XSSFWorkbook()) {

                final var dateStyle = wb.createCellStyle();
                dateStyle.setDataFormat(
                        wb.getCreationHelper()
                                .createDataFormat()
                                .getFormat(gTranslation.getDateFormat()));
                
                final var sheet = wb.createSheet(translation.getMembers());
                int rowNo = 0;
    
                // header
                final var headerRow = sheet.createRow(rowNo);
                headerRow.createCell(0).setCellValue(translation.getMemberId());
                headerRow.createCell(1).setCellValue(translation.getType());
                headerRow.createCell(2).setCellValue(translation.getSalutation());
                headerRow.createCell(3).setCellValue(translation.getTitle());
                headerRow.createCell(4).setCellValue(translation.getLastName());
                headerRow.createCell(5).setCellValue(translation.getFirstName());
                headerRow.createCell(6).setCellValue(translation.getBirthdate());
                headerRow.createCell(7).setCellValue(translation.getStreet());
                headerRow.createCell(8).setCellValue(translation.getZip());
                headerRow.createCell(9).setCellValue(translation.getCity());
                headerRow.createCell(10).setCellValue(translation.getEmail());
                headerRow.createCell(11).setCellValue(translation.getPhoneNumber());
                headerRow.createCell(12).setCellValue(translation.getComment());
                headerRow.createCell(13).setCellValue(translation.getIban());
                headerRow.createCell(14).setCellValue(translation.getPayment());
    
                int pageNo = 0;
                Page<Member> page;
                while ((page = memberService.getMembers(pageNo, 10)).getNumberOfElements() != 0) {

                    for (final var member : page.getContent()) {
                        
                        ++rowNo;
                        final var dataRow = sheet.createRow(rowNo);
                        dataRow.createCell(0).setCellValue(member.getMemberId());
                        dataRow.createCell(1).setCellValue(member
                                .getRoles()
                                .stream()
                                .map(roleMembership -> roleMembership.getRole())
                                .map(role -> gTranslation.getRoleShortcuts().get(role))
                                .collect(Collectors.joining()));
                        dataRow.createCell(2).setCellValue(
                                gTranslation.getSalutation().get(member.getSex()));
                        dataRow.createCell(3).setCellValue(member.getTitle());
                        dataRow.createCell(4).setCellValue(member.getLastName());
                        dataRow.createCell(5).setCellValue(member.getFirstName());
                        final var birthdate = dataRow.createCell(6);
                        birthdate.setCellValue(member.getBirthdate());
                        birthdate.setCellStyle(dateStyle);
                        dataRow.createCell(7).setCellValue(
                                member.getStreet() + " " + member.getStreetNumber());
                        dataRow.createCell(8).setCellValue(member.getZip());
                        dataRow.createCell(9).setCellValue(member.getCity());
                        dataRow.createCell(10).setCellValue(member.getEmail());
                        dataRow.createCell(11).setCellValue(member.getPhoneNumber());
                        dataRow.createCell(12).setCellValue(member.getComment());
                        dataRow.createCell(13).setCellValue(member.getIban());
                        dataRow.createCell(14).setCellValue(
                                gTranslation.getPayment().get(member.getPayment()));
                        
                    }
                    
                    ++pageNo;

                }
                
                try (final var fileOut = new FileOutputStream(tempFile)) {
                    wb.write(fileOut);
                }
                
            }
            
            return ResponseEntity
                    .ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=" + translation.getMembers() + ".xlsx")
                    .contentType(new MediaType("application", "vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                    .body(new FileSystemResource(tempFile));
            
        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException(e);
        }

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
