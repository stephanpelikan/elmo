package at.elmo.util.sms;

import java.util.List;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "elmo.sms", ignoreUnknownFields = false)
public class SmsProperties {

    private boolean supported;

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

    public boolean isSupported() {
        return supported;
    }

    public void setSupported(boolean supported) {
        this.supported = supported;
    }

}
