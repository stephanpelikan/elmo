package at.elmo.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.lang.NonNull;
import org.springframework.web.cors.CorsConfiguration;

import at.elmo.config.websockets.WebsocketProperties;
import at.elmo.util.email.EmailProperties;
import at.elmo.util.sms.SmsProperties;
import at.phactum.bp.blueprint.modules.ModuleSpecificProperties;
import at.phactum.bp.blueprint.modules.WorkflowModuleIdAwareProperties;

import java.util.List;

@ConfigurationProperties(prefix = "elmo", ignoreUnknownFields = false)
public class ElmoProperties implements WorkflowModuleIdAwareProperties {

    private static final String WORKFLOW_MODULE_ID = "Elmo";

    @Bean
    public static ModuleSpecificProperties moduleProps() {

        return new ModuleSpecificProperties(ElmoProperties.class, WORKFLOW_MODULE_ID);

    }

    public static class Shift {
        private String start;
        private String end;
        private List<Integer> days;

        public String getStart() {return start;}
        public void setStart(String start) {this.start = start;}
        public String getEnd() {return end;}
        public void setEnd(String end) {this.end = end;}
        public List<Integer> getDays() {return days;}
        public void setDays(List<Integer> days) {this.days = days;}
    }

    private List<Shift> shifts;

    @NonNull
    private String version;

    private Integer DaysForInitialShiftCreation;

    @NonNull
    private String titleShort;

    @NonNull
    private String titleLong;

    @NonNull
    private String generalEmailAddress;

    @NonNull
    private String homepageUrl;

    @NonNull
    private String homepageServiceConditionsUrl;

    @NonNull
    private String gatewayUrl;

    @NonNull
    private String adminIdentificationEmailAddress;

    @NonNull
    private String passangerAgreementPdfDirectory;

    @NonNull
    private String driverAgreementPdfDirectory;

    @NonNull
    private String defaultLocale;

    private CorsConfiguration cors = new CorsConfiguration();

    private WebsocketProperties websockets;

    private SmsProperties sms;

    private EmailProperties email;

    @NonNull
    private String transportServiceCarName;

    @NonNull
    private String transportServicePhoneNumber;

    public WebsocketProperties getWebsockets() {
        return websockets;
    }

    public void setWebsockets(WebsocketProperties websockets) {
        this.websockets = websockets;
    }

    public CorsConfiguration getCors() {
        return cors;
    }

    public void setCors(CorsConfiguration cors) {
        this.cors = cors;
    }

    public String getTitleShort() {
        return titleShort;
    }

    public void setTitleShort(String titleShort) {
        this.titleShort = titleShort;
    }

    public String getTitleLong() {
        return titleLong;
    }

    public void setTitleLong(String titleLong) {
        this.titleLong = titleLong;
    }

    public String getGatewayUrl() {
        return gatewayUrl;
    }

    public void setGatewayUrl(String gatewayUrl) {
        this.gatewayUrl = gatewayUrl;
    }

    @Override
    public String getWorkflowModuleId() {
        return WORKFLOW_MODULE_ID;
    }

    public String getHomepageUrl() {
        return homepageUrl;
    }

    public void setHomepageUrl(String homepageUrl) {
        this.homepageUrl = homepageUrl;
    }

    public String getHomepageServiceConditionsUrl() {
        return homepageServiceConditionsUrl;
    }

    public void setHomepageServiceConditionsUrl(String homepageServiceConditionsUrl) {
        this.homepageServiceConditionsUrl = homepageServiceConditionsUrl;
    }

    public String getDefaultLocale() {
        return defaultLocale;
    }

    public void setDefaultLocale(String defaultLocale) {
        this.defaultLocale = defaultLocale;
    }

    public String getAdminIdentificationEmailAddress() {
        return adminIdentificationEmailAddress;
    }

    public void setAdminIdentificationEmailAddress(String adminIdentificationEmailAddress) {
        this.adminIdentificationEmailAddress = adminIdentificationEmailAddress;
    }

    public String getTransportServiceCarName() {
        return transportServiceCarName;
    }

    public void setTransportServiceCarName(String transportServiceCarName) {
        this.transportServiceCarName = transportServiceCarName;
    }

    public String getTransportServicePhoneNumber() {
        return transportServicePhoneNumber;
    }

    public void setTransportServicePhoneNumber(String transportServicePhoneNumber) {
        this.transportServicePhoneNumber = transportServicePhoneNumber;
    }

    public String getVersion() {
        return version;
    }

    public void setVersion(String version) {
        this.version = version;
    }

    public EmailProperties getEmail() {
        return email;
    }

    public void setEmail(EmailProperties email) {
        this.email = email;
    }

    public SmsProperties getSms() {
        return sms;
    }

    public void setSms(SmsProperties sms) {
        this.sms = sms;
    }

    public String getPassangerAgreementPdfDirectory() {
        return passangerAgreementPdfDirectory;
    }

    public void setPassangerAgreementPdfDirectory(String passangerAgreementPdfDirectory) {
        this.passangerAgreementPdfDirectory = passangerAgreementPdfDirectory;
    }

    public String getGeneralEmailAddress() {
        return generalEmailAddress;
    }

    public void setGeneralEmailAddress(String generalEmailAddress) {
        this.generalEmailAddress = generalEmailAddress;
    }

    public String getDriverAgreementPdfDirectory() {
        return driverAgreementPdfDirectory;
    }

    public void setDriverAgreementPdfDirectory(String driverAgreementPdfDirectory) {
        this.driverAgreementPdfDirectory = driverAgreementPdfDirectory;
    }

    public List<Shift> getShifts() {return shifts;}

    public void setShifts(List<Shift> shifts) {this.shifts = shifts;}



    public Integer getDaysForInitialShiftCreation() {return DaysForInitialShiftCreation;}

    public void setDaysForInitialShiftCreation(Integer daysForInitialShiftCreation) {DaysForInitialShiftCreation = daysForInitialShiftCreation;}
}
