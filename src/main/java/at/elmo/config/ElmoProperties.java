package at.elmo.config;

import at.elmo.car.CarProperties;
import at.elmo.config.async.AsyncProperties;
import at.elmo.config.async.AsyncPropertiesAware;
import at.elmo.reservation.carsharing.CarSharingProperties;
import at.elmo.reservation.passengerservice.PassengerServiceProperties;
import at.elmo.util.email.EmailProperties;
import at.elmo.util.sms.SmsProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.lang.NonNull;
import org.springframework.web.cors.CorsConfiguration;

import java.time.Duration;
import java.util.Arrays;
import java.util.Locale;

import javax.annotation.PostConstruct;

@ConfigurationProperties(prefix = "elmo", ignoreUnknownFields = false)
public class ElmoProperties implements AsyncPropertiesAware {

    private static final Logger logger = LoggerFactory.getLogger(ElmoProperties.class);

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
    private String brandColor;
    
    @NonNull
    private String accentColor;

    @NonNull
    private int adminMemberId;

    @NonNull
    private int initialNewMemberId;

    @NonNull
    private String passengerAgreementPdfDirectory;

    @NonNull
    private String driverAgreementPdfDirectory;

    @NonNull
    private String defaultLocale;

    @NonNull
    private String defaultPhoneCountry;

    private CorsConfiguration cors = new CorsConfiguration();

    private Duration accessTokenLifetime = Duration.ofHours(1);

    private Duration refreshTokenLifetime = Duration.ofDays(14);

    private SmsProperties sms;

    private EmailProperties email;

    private CarProperties cars;

    private PassengerServiceProperties passengerService;
    
    private CarSharingProperties carSharing;

    @NonNull
    private String passengerServicePhoneNumber;

    @Override
    public AsyncProperties getAsync() {
        return async;
    }

    public void setAsync(AsyncProperties async) {
        this.async = async;
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

    public String getPassengerServicePhoneNumber() {
        return passengerServicePhoneNumber;
    }

    public void setPassengerServicePhoneNumber(String passengerServicePhoneNumber) {
        this.passengerServicePhoneNumber = passengerServicePhoneNumber;
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

    public String getPassengerAgreementPdfDirectory() {
        return passengerAgreementPdfDirectory;
    }

    public void setPassengerAgreementPdfDirectory(String passengerAgreementPdfDirectory) {
        this.passengerAgreementPdfDirectory = passengerAgreementPdfDirectory;
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

    public PassengerServiceProperties getPassengerService() {
        return passengerService;
    }

    public void setPassengerService(PassengerServiceProperties passengerService) {
        this.passengerService = passengerService;
    }

    public CarSharingProperties getCarSharing() {
        return carSharing;
    }
    
    public void setCarSharing(CarSharingProperties carSharing) {
        this.carSharing = carSharing;
    }

    public String getBrandColor() {
        return brandColor;
    }
    
    public void setBrandColor(String brandColor) {
        this.brandColor = brandColor;
    }
    
    public String getAccentColor() {
        return accentColor;
    }
    
    public void setAccentColor(String accentColor) {
        this.accentColor = accentColor;
    }
    
    @PostConstruct
    public void setDefaultLocale() {
        
        final var allLocales = new StringBuilder();
        Arrays
                .stream(Locale.getAvailableLocales())
                .peek(l -> {
                            if (allLocales.length() != 0) {
                                allLocales.append(", ");
                            }
                            allLocales.append(l);
                        })
                .filter(l -> l.toString().equals(defaultLocale))
                .findFirst()
                .ifPresentOrElse(l -> {
                            Locale.setDefault(l);
                            logger.info("Setting default-locale according to property 'elmo.default-locale={}'.",
                                    Locale.getDefault());
                        }, () -> {
                            logger.info("Unknown locale given by property 'elmo.default-locale={}', using '{}' instead! Known locales are: {}",
                                    defaultLocale,
                                    Locale.getDefault(),
                                    allLocales);
                        });

        
    }
    
}
