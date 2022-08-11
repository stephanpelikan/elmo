package at.elmo.util.email;

import java.util.List;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.lang.NonNull;

@ConfigurationProperties(prefix = "elmo.email", ignoreUnknownFields = false)
public class EmailProperties {

    @NonNull
    private String sender;

    private String redirectAllTo;

    private List<String> dontRedirect = List.of();

    public String getRedirectAllTo() {
        return redirectAllTo;
    }

    public void setRedirectAllTo(String redirectAllTo) {
        this.redirectAllTo = redirectAllTo;
    }

    public List<String> getDontRedirect() {
        return dontRedirect;
    }

    public void setDontRedirect(List<String> dontRedirect) {
        this.dontRedirect = dontRedirect;
    }

    public String getSender() {
        return sender;
    }

    public void setSender(String sender) {
        this.sender = sender;
    }

}
