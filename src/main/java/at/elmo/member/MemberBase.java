package at.elmo.member;

import java.time.LocalDate;
import java.time.OffsetDateTime;

import javax.persistence.Column;
import javax.persistence.DiscriminatorColumn;
import javax.persistence.DiscriminatorType;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.Id;
import javax.persistence.Inheritance;
import javax.persistence.InheritanceType;
import javax.persistence.Table;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Entity
@Table(name = "ELMO_MEMBER")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "TYPE", discriminatorType = DiscriminatorType.STRING)
public abstract class MemberBase {

    public static enum Sex {
        FEMALE, MALE, OTHER
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

    @Column(name = "MEMBER_ID")
    private Integer memberId;

    @Column(name = "EMAIL")
    private String email;

    @Column(name = "LAST_NAME")
    private String lastName;

    @Column(name = "FIRST_NAME")
    private String firstName;

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

    @Column(name = "NOTIFY_PER_SMS")
    private boolean preferNotificationsPerSms;

    @Column(name = "COMMENT")
    private String comment;

    @Column(name = "GENERATED_EMAIL_CODE")
    private String generatedEmailConfirmationCode;

    @Column(name = "GIVEN_EMAIL_CODE")
    private String givenEmailConfirmationCode;

    @Column(name = "GENERATED_PHONE_CODE")
    private String generatedPhoneConfirmationCode;

    @Column(name = "GIVEN_PHONE_CODE")
    private String givenPhoneConfirmationCode;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
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

    public Integer getMemberId() {
        return memberId;
    }

    public void setMemberId(Integer memberId) {
        this.memberId = memberId;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
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

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public String getGeneratedEmailConfirmationCode() {
        return generatedEmailConfirmationCode;
    }

    public void setGeneratedEmailConfirmationCode(String generatedEmailConfirmationCode) {
        this.generatedEmailConfirmationCode = generatedEmailConfirmationCode;
    }

    public String getGivenEmailConfirmationCode() {
        return givenEmailConfirmationCode;
    }

    public void setGivenEmailConfirmationCode(String givenEmailConfirmationCode) {
        this.givenEmailConfirmationCode = givenEmailConfirmationCode;
    }

    public String getGeneratedPhoneConfirmationCode() {
        return generatedPhoneConfirmationCode;
    }

    public void setGeneratedPhoneConfirmationCode(String generatedPhoneConfirmationCode) {
        this.generatedPhoneConfirmationCode = generatedPhoneConfirmationCode;
    }

    public String getGivenPhoneConfirmationCode() {
        return givenPhoneConfirmationCode;
    }

    public void setGivenPhoneConfirmationCode(String givenPhoneConfirmationCode) {
        this.givenPhoneConfirmationCode = givenPhoneConfirmationCode;
    }

}
