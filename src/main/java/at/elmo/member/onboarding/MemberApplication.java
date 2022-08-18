package at.elmo.member.onboarding;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.DiscriminatorValue;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.FetchType;
import javax.persistence.OneToOne;

import at.elmo.member.MemberBase;
import at.elmo.member.login.OAuth2Identifier;

@Entity
@DiscriminatorValue("A")
public class MemberApplication extends MemberBase {

    public static enum Status {
        NEW,
        DATA_INVALID,
        APPLICATION_SUBMITTED,
        ACCEPTED,
        REJECTED,
        DUPLICATE
    };

    @OneToOne(mappedBy = "owner", fetch = FetchType.LAZY, cascade = { CascadeType.MERGE, CascadeType.PERSIST,
            CascadeType.DETACH })
    private OAuth2Identifier oauth2Id;

    @Enumerated(EnumType.STRING)
    @Column(name = "STATUS")
    private Status status;

    @Column(name = "APPLICATION_USERTASK")
    private String userTaskId;

    @Column(name = "APPLICATION_COMMENT")
    private String applicationComment;

    public boolean isUserInformationInvalid() {

        return getStatus() == Status.DATA_INVALID;

    }

    public boolean isAccepted() {

        return status == Status.ACCEPTED;

    }

    public boolean isRejected() {

        return status == Status.REJECTED;

    }

    public boolean isDuplicate() {

        return status == Status.DUPLICATE;

    }

//    public Member getMember() {
//        return member;
//    }
//
//    public void setMember(Member member) {
//        this.member = member;
//    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    public String getUserTaskId() {
        return userTaskId;
    }

    public void setUserTaskId(String userTaskId) {
        this.userTaskId = userTaskId;
    }

    public OAuth2Identifier getOauth2Id() {
        return oauth2Id;
    }

    public void setOauth2Id(OAuth2Identifier oauth2Id) {
        this.oauth2Id = oauth2Id;
    }

    public String getApplicationComment() {
        return applicationComment;
    }

    public void setApplicationComment(String applicationComment) {
        this.applicationComment = applicationComment;
    }

}
