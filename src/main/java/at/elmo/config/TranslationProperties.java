package at.elmo.config;

import at.elmo.member.MemberBase.Payment;
import at.elmo.member.MemberBase.Sex;
import at.elmo.member.Role;
import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.Map;

@ConfigurationProperties(prefix = "translations", ignoreUnknownFields = false)
public class TranslationProperties {

    private Map<String, General> general;

    private Map<String, DownloadMembers> downloadMembers;
    
    public static class DownloadMembers {

        private String members;
        private String memberId;
        private String type;
        private String salutation;
        private String title;
        private String lastName;
        private String firstName;
        private String birthdate;
        private String street;
        private String zip;
        private String city;
        private String email;
        private String phoneNumber;
        private String comment;
        private String iban;
        private String payment;
        private String hoursServedPassengerService;
        private String hoursConsumedCarSharing;

        public String getMembers() {
            return members;
        }

        public void setMembers(String members) {
            this.members = members;
        }

        public String getMemberId() {
            return memberId;
        }

        public void setMemberId(String memberId) {
            this.memberId = memberId;
        }

        public String getType() {
            return type;
        }

        public void setType(String type) {
            this.type = type;
        }

        public String getSalutation() {
            return salutation;
        }

        public void setSalutation(String salutation) {
            this.salutation = salutation;
        }

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public String getLastName() {
            return lastName;
        }

        public void setLastName(String lastName) {
            this.lastName = lastName;
        }

        public String getFirstName() {
            return firstName;
        }

        public void setFirstName(String firstName) {
            this.firstName = firstName;
        }

        public String getBirthdate() {
            return birthdate;
        }

        public void setBirthdate(String birthdate) {
            this.birthdate = birthdate;
        }

        public String getStreet() {
            return street;
        }

        public void setStreet(String street) {
            this.street = street;
        }

        public String getZip() {
            return zip;
        }

        public void setZip(String zip) {
            this.zip = zip;
        }

        public String getCity() {
            return city;
        }

        public void setCity(String city) {
            this.city = city;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getPhoneNumber() {
            return phoneNumber;
        }

        public void setPhoneNumber(String phoneNumber) {
            this.phoneNumber = phoneNumber;
        }

        public String getComment() {
            return comment;
        }

        public void setComment(String comment) {
            this.comment = comment;
        }

        public String getIban() {
            return iban;
        }

        public void setIban(String iban) {
            this.iban = iban;
        }

        public String getPayment() {
            return payment;
        }

        public void setPayment(String payment) {
            this.payment = payment;
        }

        public String getHoursConsumedCarSharing() {
            return hoursConsumedCarSharing;
        }

        public void setHoursConsumedCarSharing(String hoursConsumedCarSharing) {
            this.hoursConsumedCarSharing = hoursConsumedCarSharing;
        }

        public String getHoursServedPassengerService() {
            return hoursServedPassengerService;
        }

        public void setHoursServedPassengerService(String hoursServedPassengerService) {
            this.hoursServedPassengerService = hoursServedPassengerService;
        }

    }

    public static class General {

        private String passengerAgreement;
        private String driverAgreement;
        private Map<Sex, String> salutation;
        private Map<Payment, String> payment;
        private Map<Role, String> roleShortcuts;
        private String dateFormat;

        public String getPassengerAgreement() {
            return passengerAgreement;
        }

        public void setPassengerAgreement(String passengerAgreement) {
            this.passengerAgreement = passengerAgreement;
        }

        public String getDriverAgreement() {
            return driverAgreement;
        }

        public void setDriverAgreement(String driverAgreement) {
            this.driverAgreement = driverAgreement;
        }

        public Map<Sex, String> getSalutation() {
            return salutation;
        }

        public void setSalutation(Map<Sex, String> salutation) {
            this.salutation = salutation;
        }

        public Map<Payment, String> getPayment() {
            return payment;
        }

        public void setPayment(Map<Payment, String> payment) {
            this.payment = payment;
        }

        public String getDateFormat() {
            return dateFormat;
        }

        public void setDateFormat(String dateFormat) {
            this.dateFormat = dateFormat;
        }

        public Map<Role, String> getRoleShortcuts() {
            return roleShortcuts;
        }

        public void setRoleShortcuts(Map<Role, String> roleShortcuts) {
            this.roleShortcuts = roleShortcuts;
        }

    }

    public Map<String, General> getGeneral() {
        return general;
    }

    public void setGeneral(Map<String, General> general) {
        this.general = general;
    }

    public Map<String, DownloadMembers> getDownloadMembers() {
        return downloadMembers;
    }

    public void setDownloadMembers(Map<String, DownloadMembers> downloadMembers) {
        this.downloadMembers = downloadMembers;
    }
    
}
