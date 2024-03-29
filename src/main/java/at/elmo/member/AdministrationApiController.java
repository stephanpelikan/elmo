package at.elmo.member;

import at.elmo.administration.api.v1.CountOfActiveMembers;
import at.elmo.administration.api.v1.MemberApi;
import at.elmo.administration.api.v1.Members;
import at.elmo.config.ElmoProperties;
import at.elmo.config.TranslationProperties;
import at.elmo.member.MemberBase.Payment;
import at.elmo.member.MemberBase.Sex;
import at.elmo.util.email.EmailService;
import at.elmo.util.exceptions.ElmoValidationException;
import at.elmo.util.pos.NullableCell;
import at.elmo.util.sms.SmsService;
import at.elmo.util.spring.FileCleanupInterceptor;
import org.apache.poi.ss.usermodel.BorderStyle;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.xssf.usermodel.DefaultIndexedColorMap;
import org.apache.poi.xssf.usermodel.XSSFColor;
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

import java.io.File;
import java.io.FileOutputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;
import java.util.Map.Entry;
import java.util.stream.Collectors;

import javax.validation.Valid;

@RestController("memberAdministrationApiController")
@RequestMapping("/api/v1")
public class AdministrationApiController implements MemberApi {

    @Autowired
    private Logger logger;

    @Autowired
    private MemberService memberService;
    
    @Autowired
    private AdministrationApiMapper mapper;

    @Autowired
    private TranslationProperties translations;

    @Autowired
    private ElmoProperties properties;

    @Autowired
    private EmailService emailService;

    @Autowired
    private SmsService smsService;

    @Override
    public ResponseEntity<CountOfActiveMembers> getCountOfActiveMembers() {

        final var count = memberService.getCountOfActiveMembers();

        return ResponseEntity.ok(new CountOfActiveMembers().count(count));

    }

    @Override
    public ResponseEntity<Members> getMembers(
            final @Valid Integer pageNumber,
            final @Valid Integer pageSize,
            final @Valid String query) {

        final var members = memberService.getMembers(pageNumber, pageSize, query);

        final var result = new Members();
        result.setMembers(
                mapper.toMemberApi(members.getContent()));
        result.setPage(
                mapper.toApi(members));

        return ResponseEntity.ok(result);

    }

    @Override
    public ResponseEntity<at.elmo.administration.api.v1.Member> getMemberById(
            final Integer memberId) {

        final var member = memberService.getMember(memberId);
        if (member.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        final var result = mapper.toApi(member.get());
        return ResponseEntity.ok(result);

    }

    @Override
    public ResponseEntity<at.elmo.administration.api.v1.Member> saveMember(
            final Integer memberId,
            final at.elmo.administration.api.v1.@Valid Member member) {

        final var violations = new HashMap<String, String>();
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
        if (StringUtils.hasText(member.getEmail()) &&
                !emailService.isValidEmailAddressFormat(member.getEmail())) {
            violations.put("email", "format");
        }
        if (!StringUtils.hasText(member.getPhoneNumber())) {
            violations.put("phoneNumber", "missing");
        } else if (!smsService.isValidPhoneNumberFormat(member.getPhoneNumber())) {
            violations.put("phoneNumber", "format");
        }
        if (!violations.isEmpty()) {
            throw new ElmoValidationException(violations);
        }

        final var toBeSaved = mapper.toDomain(member);
        final var newRoles = mapper.toDomain(member.getRoles());

        final var savedId = memberService.saveMember(
                memberId == -1 ? null : memberId,
                false,
                toBeSaved,
                newRoles);
        if (savedId == null) {
            return ResponseEntity.badRequest().build();
        }
        if (savedId == -1) {
            throw new ElmoValidationException("roles", "last-admin");
        }

        return getMemberById(savedId);

    }

    @Override
    public ResponseEntity<Void> deleteMember(
            final Integer memberId) {

        final var deleted = memberService.deleteMember(memberId);
        if (!deleted) {
            return ResponseEntity.badRequest().build();
        }

        return ResponseEntity.ok().build();

    }

    @Override
    public ResponseEntity<Void> uploadMembersExcelFile(
            final Resource body) {

        final var translation = translations.getDownloadMembers().get("de");
        final var gTranslation = translations.getGeneral().get("de");

        try (final var wb = new XSSFWorkbook(body.getInputStream())) {

            final var sheet = wb.getSheetAt(0);
            if (sheet.getRow(0) == null) {
                throw new ElmoValidationException(Map.of("file", "wrong"));
            }
            final var memberIdHeader = sheet.getRow(0).getCell(0);
            if ((memberIdHeader == null)
                    || !memberIdHeader.getCellType().equals(CellType.STRING)
                    || !memberIdHeader.getStringCellValue().equals(translation.getMemberId())) {
                throw new ElmoValidationException(Map.of("file", "wrong"));
            }

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

                    final var typeValue = NullableCell.from(row.getCell(1)).getStringCellValue();
                    final var roles = gTranslation
                            .getRoleShortcuts()
                            .entrySet()
                            .stream()
                            .filter(entry -> typeValue.contains(entry.getValue()))
                            .map(Entry::getKey)
                            .collect(Collectors.toList());
                    final var salutation = NullableCell.from(row.getCell(2)).getStringCellValue();
                    final var sex = gTranslation
                            .getSalutation()
                            .entrySet()
                            .stream()
                            .filter(entry -> entry.getValue().equals(salutation))
                            .findFirst()
                            .map(Entry::getKey)
                            .orElse(Sex.OTHER);
                    final var title = NullableCell.from(row.getCell(3)).getStringCellValue();
                    final var lastName = NullableCell.from(row.getCell(4)).getStringCellValue();
                    final var firstName = NullableCell.from(row.getCell(5)).getStringCellValue();
                    final var birthdate = NullableCell.from(row.getCell(6)).getCellType() == CellType.NUMERIC
                            ? row.getCell(6).getLocalDateTimeCellValue().toLocalDate()
                            : row.getCell(6).getStringCellValue() == null
                            ? null
                            : row.getCell(6).getStringCellValue().equals("-")
                            ? null
                            : LocalDate.parse(
                                    row.getCell(6).getStringCellValue(),
                                    DateTimeFormatter.ofPattern(gTranslation.getDateFormat()));
                    final var streetValue = NullableCell.from(row.getCell(7)).getStringCellValue();
                    final var streetNumber = streetValue != null
                            ? streetValue.replaceFirst("^\\D+", "")
                            : null;
                    final var street = streetValue != null
                            ? streetValue.substring(0, streetValue.length() - streetNumber.length())
                            : null;
                    final var zip = NullableCell.from(row.getCell(8)).getCellType() == CellType.NUMERIC
                            ? Integer.toString((int) Math.floor(row.getCell(8).getNumericCellValue()))
                            : NullableCell.from(row.getCell(8)).getStringCellValue();
                    final var city = NullableCell.from(row.getCell(9)).getStringCellValue();
                    final var email = NullableCell.from(row.getCell(10)).getStringCellValue();
                    final var phoneNumberValue = NullableCell.from(row.getCell(11)).getStringCellValue();
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
                    final var comment = NullableCell.from(row.getCell(12)).getStringCellValue();
                    final var iban = NullableCell.from(row.getCell(13)).getStringCellValue();
                    final var paymentValue = NullableCell.from(row.getCell(14)).getStringCellValue();
                    final var payment = gTranslation
                            .getPayment()
                            .entrySet()
                            .stream()
                            .filter(entry -> entry.getValue().equals(paymentValue))
                            .findFirst()
                            .map(Entry::getKey)
                            .orElse(Payment.MONTHLY);
                    final Integer hoursServedPassengerServiceImportYear;
                    final var hoursServedPassengerServiceImportYearCell = NullableCell.from(row.getCell(15));
                    if ((hoursServedPassengerServiceImportYearCell.getCellType() != CellType.NUMERIC)
                            && !StringUtils.hasText(hoursServedPassengerServiceImportYearCell.getStringCellValue())) {
                        hoursServedPassengerServiceImportYear = null;
                    } else if (hoursServedPassengerServiceImportYearCell.getCellType() == CellType.NUMERIC) {
                        hoursServedPassengerServiceImportYear = (int) hoursServedPassengerServiceImportYearCell.getNumericCellValue();
                    } else {
                        hoursServedPassengerServiceImportYear = Integer
                                .parseInt(hoursServedPassengerServiceImportYearCell.getStringCellValue());
                    }
                    final Integer hoursServedPassengerServiceTotal;
                    final var hoursServedPassengerServiceTotalCell = NullableCell.from(row.getCell(16));
                    if ((hoursServedPassengerServiceTotalCell.getCellType() != CellType.NUMERIC)
                            && !StringUtils.hasText(hoursServedPassengerServiceTotalCell.getStringCellValue())) {
                        hoursServedPassengerServiceTotal = null;
                    } else if (hoursServedPassengerServiceTotalCell.getCellType() == CellType.NUMERIC) {
                        hoursServedPassengerServiceTotal = (int) hoursServedPassengerServiceTotalCell.getNumericCellValue();
                    } else {
                        hoursServedPassengerServiceTotal = Integer
                                .parseInt(hoursServedPassengerServiceTotalCell.getStringCellValue());
                    }
                    final Integer hoursConsumedCarSharingImportYear;
                    final var hoursConsumedCarSharingImportYearCell = NullableCell.from(row.getCell(17));
                    if ((hoursConsumedCarSharingImportYearCell.getCellType() != CellType.NUMERIC)
                            && !StringUtils.hasText(hoursConsumedCarSharingImportYearCell.getStringCellValue())) {
                        hoursConsumedCarSharingImportYear = null;
                    } else if (hoursConsumedCarSharingImportYearCell.getCellType() == CellType.NUMERIC) {
                        hoursConsumedCarSharingImportYear = (int) hoursConsumedCarSharingImportYearCell.getNumericCellValue();
                    } else {
                        hoursConsumedCarSharingImportYear = Integer.parseInt(hoursConsumedCarSharingImportYearCell.getStringCellValue());
                    }
                    final Integer hoursConsumedCarSharing;
                    final var hoursConsumedCarSharingCell = NullableCell.from(row.getCell(18));
                    if ((hoursConsumedCarSharingCell.getCellType() != CellType.NUMERIC)
                            && !StringUtils.hasText(hoursConsumedCarSharingCell.getStringCellValue())) {
                        hoursConsumedCarSharing = null;
                    } else if (hoursConsumedCarSharingCell.getCellType() == CellType.NUMERIC) {
                        hoursConsumedCarSharing = (int) hoursConsumedCarSharingCell.getNumericCellValue();
                    } else {
                        hoursConsumedCarSharing = Integer.parseInt(hoursConsumedCarSharingCell.getStringCellValue());
                    }

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
                            payment,
                            hoursServedPassengerServiceImportYear,
                            hoursServedPassengerServiceTotal,
                            hoursConsumedCarSharingImportYear,
                            hoursConsumedCarSharing);

                } catch (ElmoValidationException e) {
                    throw e;
                } catch (Exception e) {

                    logger.info("Could not import member {} from uploaded Excel",
                            memberId,
                            e);

                }

            }

            return ResponseEntity.ok().build();

        } catch (ElmoValidationException e) {
            throw e;
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

                final var headerStyle = wb.createCellStyle();
                headerStyle.setBorderBottom(BorderStyle.MEDIUM);
                headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
                headerStyle.setFillForegroundColor(
                        new XSSFColor(
                                new byte[] { (byte) 220, (byte) 220, (byte) 220 },
                                new DefaultIndexedColorMap()));
                final var italicFont = wb.createFont();
                italicFont.setItalic(true);
                headerStyle.setFont(italicFont);

                final var dateStyle = wb.createCellStyle();
                dateStyle.setDataFormat(
                        wb.getCreationHelper()
                                .createDataFormat()
                                .getFormat(gTranslation.getDateFormat()));

                final var sheet = wb.createSheet(translation.getMembers());
                sheet.setColumnWidth(0, 4200);
                sheet.setColumnWidth(1, 1800);
                sheet.setColumnWidth(2, 2000);
                sheet.setColumnWidth(3, 2000);
                sheet.setColumnWidth(4, 6000);
                sheet.setColumnWidth(5, 6000);
                sheet.setColumnWidth(6, 2800);
                sheet.setColumnWidth(7, 8000);
                sheet.setColumnWidth(8, 1800);
                sheet.setColumnWidth(9, 6000);
                sheet.setColumnWidth(10, 8000);
                sheet.setColumnWidth(11, 3800);
                sheet.setColumnWidth(12, 7000);
                sheet.setColumnWidth(13, 7000);
                sheet.setColumnWidth(14, 3000);
                sheet.setColumnWidth(15, 7000);
                sheet.setColumnWidth(16, 3500);
                sheet.setColumnWidth(17, 7000);
                sheet.setColumnWidth(18, 3500);
                sheet.createFreezePane(0, 1);

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
                headerRow.createCell(15).setCellValue(translation.getHoursServedPassengerServiceImportYear());
                headerRow.createCell(16).setCellValue(translation.getHoursServedPassengerService());
                headerRow.createCell(17).setCellValue(translation.getHoursConsumedCarSharingImportYear());
                headerRow.createCell(18).setCellValue(translation.getHoursConsumedCarSharing());
                for (short i = headerRow.getFirstCellNum(); i < headerRow.getLastCellNum(); ++i) {
                    headerRow.getCell(i).setCellStyle(headerStyle);
                }

                int pageNo = 0;
                Page<Member> page;
                while ((page = memberService.getMembers(pageNo, 10, null)).getNumberOfElements() != 0) {

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
                        if (member.getHoursServedPassengerServiceImportYear() != null) {
                            dataRow.createCell(15).setCellValue(member.getHoursServedPassengerServiceImportYear());
                        }
                        if (member.getHoursServedPassengerService() != 0) {
                            dataRow.createCell(16).setCellValue(member.getHoursServedPassengerService());
                        }
                        if (member.getHoursConsumedCarSharingImportYear() != null) {
                            dataRow.createCell(17).setCellValue(member.getHoursConsumedCarSharingImportYear());
                        }
                        if (member.getHoursConsumedCarSharing() != 0) {
                            dataRow.createCell(18).setCellValue(member.getHoursConsumedCarSharing());
                        }

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

}
