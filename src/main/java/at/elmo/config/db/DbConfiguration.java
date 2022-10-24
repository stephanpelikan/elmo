package at.elmo.config.db;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Extends DataSourceAutoConfiguration because it is annotated by
 * @ConditionalOnMissingBean(type = "io.r2dbc.spi.ConnectionFactory")
 * which prevents running jdbc and r2dbc in parallel
 */
@Configuration
public class DbConfiguration extends DataSourceAutoConfiguration {

    @ConditionalOnProperty(
            prefix = "spring.jpa",
            name = "database-platform",
            havingValue = "org.hibernate.dialect.PostgreSQL10Dialect")
    @Bean
    public Object postgresqlNotifications() {
        
        return new PostgreSQLNotifications();
        
    }

    @ConditionalOnProperty(
            prefix = "spring.jpa",
            name = "database-platform",
            havingValue = "org.hibernate.dialect.H2Dialect")
    @Bean
    public Object h2Notifications() {
        
        return new H2Notifications();
        
    }

}
