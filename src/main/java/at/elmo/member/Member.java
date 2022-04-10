package at.elmo.member;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.FetchType;
import javax.persistence.Id;
import javax.persistence.OneToMany;
import javax.persistence.Table;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import at.elmo.member.login.OAuth2Identifier;

@Entity
@Table(name = "ELMO_MEMBERS")
public class Member {

    public static enum Sex {
        FEMALE, MALE, OTHER
    };

    public static enum Status {
        NEW,
        EMAIL_VERIFIED,
        APPLICATION_SUBMITTED,
        DATA_INVALID,
        ACTIVE,
        INACTIVE,
        TO_BE_DELETED,
        REJECTED,
        DUPLICATE
    };
    
    @Id
    @Column(name = "ID")
    private String id;
    
    @CreationTimestamp
    @Column(name = "CREATED_AT", nullable = false, updatable = false, columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "UPDATED_AT", nullable = false, columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private OffsetDateTime updatedAt;

    @OneToMany(mappedBy = "owner", fetch = FetchType.LAZY, cascade = { CascadeType.MERGE, CascadeType.PERSIST,
            CascadeType.DETACH })
    private List<OAuth2Identifier> oauth2Ids;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "STATUS")
    private Status status;

    @Column(name = "MEMBER_ID")
    private Integer memberId;

    @Column(name = "EMAIL")
    private String email;

    @Column(name = "LAST_NAME")
    private String lastName;

    @Column(name = "FIRST_NAME")
    private String firstName;

    @Column(name = "LAST_EMAIL_CODE")
    private String lastEmailConfirmationCode;

    @Column(name = "BIRTHDATE", columnDefinition = "DATE")
    private LocalDate birthdate;

    @Enumerated(EnumType.STRING)
    @Column(name = "SEX")
    private Sex sex;

    @Column(name = "ZIP")
    private String zip;

    @Column(name = "CITY")
    private String city;

    @Column(name = "STREET")
    private String street;

    @Column(name = "STREET_NUMBER")
    private String streetNumber;

    @Column(name = "PHONE_NUMBER")
    private String phoneNumber;

    @Column(name = "LAST_PHONE_CODE")
    private String lastPhoneConfirmationCode;

    @Column(name = "NOTIFY_PER_SMS")
    private boolean preferNotificationsPerSms;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public List<OAuth2Identifier> getOauth2Ids() {
        return oauth2Ids;
    }

    public void setOauth2Ids(List<OAuth2Identifier> oauth2Ids) {
        this.oauth2Ids = oauth2Ids;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public Integer getMemberId() {
        return memberId;
    }

    public void setMemberId(Integer memberId) {
        this.memberId = memberId;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public OffsetDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(OffsetDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public LocalDate getBirthdate() {
        return birthdate;
    }

    public void setBirthdate(LocalDate birthdate) {
        this.birthdate = birthdate;
    }

    public Sex getSex() {
        return sex;
    }

    public void setSex(Sex sex) {
        this.sex = sex;
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

    public String getStreet() {
        return street;
    }

    public void setStreet(String street) {
        this.street = street;
    }

    public String getStreetNumber() {
        return streetNumber;
    }

    public void setStreetNumber(String streetNumber) {
        this.streetNumber = streetNumber;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public boolean isPreferNotificationsPerSms() {
        return preferNotificationsPerSms;
    }

    public void setPreferNotificationsPerSms(boolean preferNotificationsPerSms) {
        this.preferNotificationsPerSms = preferNotificationsPerSms;
    }

    public String getLastEmailConfirmationCode() {
        return lastEmailConfirmationCode;
    }

    public void setLastEmailConfirmationCode(String lastEmailConfirmationCode) {
        this.lastEmailConfirmationCode = lastEmailConfirmationCode;
    }

    public String getLastPhoneConfirmationCode() {
        return lastPhoneConfirmationCode;
    }

    public void setLastPhoneConfirmationCode(String lastPhoneConfirmationCode) {
        this.lastPhoneConfirmationCode = lastPhoneConfirmationCode;
    }
    
}
