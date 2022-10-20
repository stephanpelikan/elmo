package at.elmo.config;

import at.elmo.car.CarProperties;
import at.elmo.config.websockets.WebsocketProperties;
import at.elmo.reservation.carsharing.CarSharingProperties;
import at.elmo.reservation.passangerservice.PassangerServiceProperties;
import at.elmo.util.email.EmailProperties;
import at.elmo.util.sms.SmsProperties;
import at.phactum.bp.blueprint.async.AsyncProperties;
import at.phactum.bp.blueprint.async.AsyncPropertiesAware;
import at.phactum.bp.blueprint.modules.ModuleSpecificProperties;
import at.phactum.bp.blueprint.modules.WorkflowModuleIdAwareProperties;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.lang.NonNull;
import org.springframework.web.cors.CorsConfiguration;

import java.time.Duration;

@ConfigurationProperties(prefix = "elmo", ignoreUnknownFields = false)
public class ElmoProperties implements WorkflowModuleIdAwareProperties, AsyncPropertiesAware {

    private static final String WORKFLOW_MODULE_ID = "Elmo";

    @Bean
    public static ModuleSpecificProperties moduleProps() {

        return new ModuleSpecificProperties(ElmoProperties.class, WORKFLOW_MODULE_ID);

    }

    private AsyncProperties async = new AsyncProperties();

    @NonNull
    private String version;

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
    private int adminMemberId;

    @NonNull
    private int initialNewMemberId;

    @NonNull
    private String passangerAgreementPdfDirectory;

    @NonNull
    private String driverAgreementPdfDirectory;

    @NonNull
    private String defaultLocale;

    @NonNull
    private String defaultPhoneCountry;

    private CorsConfiguration cors = new CorsConfiguration();

    private WebsocketProperties websockets;

    private Duration accessTokenLifetime = Duration.ofHours(1);

    private Duration refreshTokenLifetime = Duration.ofDays(14);

    private SmsProperties sms;

    private EmailProperties email;

    private CarProperties cars;

    private PassangerServiceProperties passangerService;
    
    private CarSharingProperties carSharing;

    @NonNull
    private String passanagerServicePhoneNumber;

    @Override
    public AsyncProperties getAsync() {
        return async;
    }

    public void setAsync(AsyncProperties async) {
        this.async = async;
    }

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

    public String getPassanagerServicePhoneNumber() {
        return passanagerServicePhoneNumber;
    }

    public void setPassanagerServicePhoneNumber(String passanagerServicePhoneNumber) {
        this.passanagerServicePhoneNumber = passanagerServicePhoneNumber;
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

    public int getAdminMemberId() {
        return adminMemberId;
    }

    public void setAdminMemberId(int adminMemberId) {
        this.adminMemberId = adminMemberId;
    }

    public int getInitialNewMemberId() {
        return initialNewMemberId;
    }

    public void setInitialNewMemberId(int initialNewMemberId) {
        this.initialNewMemberId = initialNewMemberId;
    }

    public String getDefaultPhoneCountry() {
        return defaultPhoneCountry;
    }

    public void setDefaultPhoneCountry(String defaultPhoneCountry) {
        this.defaultPhoneCountry = defaultPhoneCountry;
    }

    public Duration getAccessTokenLifetime() {
        return accessTokenLifetime;
    }

    public void setAccessTokenLifetime(Duration accessTokenLifetime) {
        this.accessTokenLifetime = accessTokenLifetime;
    }

    public Duration getRefreshTokenLifetime() {
        return refreshTokenLifetime;
    }

    public void setRefreshTokenLifetime(Duration refreshTokenLifetime) {
        this.refreshTokenLifetime = refreshTokenLifetime;
    }

    public CarProperties getCars() {
        return cars;
    }

    public void setCars(CarProperties cars) {
        this.cars = cars;
    }

    public PassangerServiceProperties getPassangerService() {
        return passangerService;
    }

    public void setPassangerService(PassangerServiceProperties passangerService) {
        this.passangerService = passangerService;
    }

    public CarSharingProperties getCarSharing() {
		return carSharing;
	}
    
    public void setCarSharing(CarSharingProperties carSharing) {
		this.carSharing = carSharing;
	}
    
}
