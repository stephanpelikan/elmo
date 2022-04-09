package at.elmo.member.onboarding;

import java.time.OffsetDateTime;

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
        ACTIVE,
        REJECTED,
        DUPLICATE
    };

    @Id
    @Column(name = "ID")
    private String id;
    
    @OneToOne
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

    public boolean isEmailVerified() {

        return member.getStatus() == Member.Status.EMAIL_VERIFIED;

    }

    public boolean isUserInformationInvalid() {

        return member.getStatus() == Member.Status.DATA_INVALID;

    }

    public boolean isAccepted() {

        return status == Status.ACTIVE;

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

}
