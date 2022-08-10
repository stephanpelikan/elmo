package at.elmo.member.onboarding;

import java.time.OffsetDateTime;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.OneToOne;
import javax.persistence.Table;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import at.elmo.member.Member;

@Entity
@Table(name = "ELMO_MEMBER_APPLICATIONS")
public class MemberApplication {

    public static enum Status {
        IN_PROGRESS,
        DONE,
        REJECTED,
        DUPLICATE
    };

    @Id
    @Column(name = "ID")
    private String id;
    
    @OneToOne(cascade = { CascadeType.PERSIST })
    @JoinColumn(name = "MEMBER", referencedColumnName = "ID")
    private Member member;
    
    @CreationTimestamp
    @Column(name = "CREATED_AT", nullable = false, updatable = false, columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "UPDATED_AT", nullable = false, columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private OffsetDateTime updatedAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "STATUS")
    private Status status;

    @Column(name = "USERTASK")
    private String userTaskId;

    @Column(name = "EMAIL")
    private String email;

    @Column(name = "LAST_EMAIL_CODE")
    private String lastEmailConfirmationCode;

    @Column(name = "PHONE_NUMBER")
    private String phoneNumber;

    @Column(name = "LAST_PHONE_CODE")
    private String lastPhoneConfirmationCode;

    public boolean isEmailVerified() {

        return member.getStatus() == Member.Status.EMAIL_VERIFIED;

    }

    public boolean isUserInformationInvalid() {

        return member.getStatus() == Member.Status.DATA_INVALID;

    }

    public boolean isAccepted() {

        return status == Status.DONE;

    }

    public boolean isRejected() {

        return status == Status.REJECTED;

    }

    public boolean isDuplicate() {

        return status == Status.DUPLICATE;

    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Member getMember() {
        return member;
    }

    public void setMember(Member member) {
        this.member = member;
    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
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

    public String getUserTaskId() {
        return userTaskId;
    }

    public void setUserTaskId(String userTaskId) {
        this.userTaskId = userTaskId;
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

}
