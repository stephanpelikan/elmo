package at.elmo.config.async;

import org.springframework.aop.support.AopUtils;
import org.springframework.boot.autoconfigure.condition.ConditionMessage;
import org.springframework.boot.autoconfigure.condition.ConditionMessage.Style;
import org.springframework.boot.autoconfigure.condition.ConditionOutcome;
import org.springframework.boot.autoconfigure.condition.SpringBootCondition;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.ConditionContext;
import org.springframework.core.type.AnnotatedTypeMetadata;
import org.springframework.util.ClassUtils;

import java.util.Collection;
import java.util.List;

/**
 * Used to limit certain @Bean or @Configuration to containers which
 * provide a properties bean deriving {@link AsyncPropertiesAware}.
 */
public class HasAsyncAwareProperties extends SpringBootCondition {

    @Override
    public ConditionOutcome getMatchOutcome(
            final ConditionContext context,
            final AnnotatedTypeMetadata metadata) {

        final var message = ConditionMessage.forCondition("HasAsyncAwareProperties");

        return context
                .getBeanFactory()
                .getBeansWithAnnotation(ConfigurationProperties.class)
                .values()
                .stream()
                .peek(bean -> {
                    System.err.println(bean);
                })
                .map(this::targetClass)
                .filter(clasz -> AsyncPropertiesAware.class.isAssignableFrom(clasz))
                .map(clasz -> ConditionOutcome
                        .match(message.found("bean")
                                .items(Style.NORMAL, clasz.getName())))
                .findFirst()
                .orElseGet(() -> ConditionOutcome
                        .noMatch(message.didNotFind("bean", "beans")
                        .items(Style.NORMAL, nameOfMissingBeans())));

    }

    private Class<?> targetClass(
            final Object bean) {

        final var proxyClass = bean.getClass();
        final var result = AopUtils.getTargetClass(bean);
        if (result != proxyClass) {
            return result;
        }
        return ClassUtils.getUserClass(bean);

    }

    protected Collection<?> nameOfMissingBeans() {
        
        return List.of(AsyncPropertiesAware.class.getName());
        
    }

}
