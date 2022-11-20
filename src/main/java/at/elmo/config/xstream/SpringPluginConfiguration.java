package at.elmo.config.xstream;

import java.util.List;

import org.camunda.bpm.spring.boot.starter.configuration.Ordering;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.core.annotation.Order;

@ConfigurationProperties(prefix = "camunda.xstream-serialization")
public class SpringPluginConfiguration {

    @Value("${encoding:UTF-8}")
    private String encoding;

    private List<String> allowedTypes;

    private List<String> converters;

    @Bean(name = "xstreamProcessEnginePlugin")
    @Order(Ordering.DEFAULT_ORDER + 1)
    public ProcessEnginePlugin xstreamProcessEnginePlugin() {

        final at.elmo.config.xstream.ProcessEnginePlugin plugin =
                new at.elmo.config.xstream.ProcessEnginePlugin();
        if (encoding != null) {
            plugin.setEncoding(encoding);
        }
        if (allowedTypes != null) {
            plugin.setAllowedTypes(String.join(",", allowedTypes));
        }
        if (converters != null) {
            plugin.setConverters(String.join(",", converters));
        }
        return plugin;
        
    }
    
    public void setAllowedTypes(List<String> allowedTypes) {
        this.allowedTypes = allowedTypes;
    }
    
    public void setConverters(List<String> converters) {
        this.converters = converters;
    }
    
}
