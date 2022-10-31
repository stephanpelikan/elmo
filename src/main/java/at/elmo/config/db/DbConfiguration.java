package at.elmo.config.db;

import com.zaxxer.hikari.HikariDataSource;
import org.springframework.boot.autoconfigure.AutoConfigureBefore;
import org.springframework.boot.autoconfigure.AutoConfigureOrder;
import org.springframework.boot.autoconfigure.condition.ConditionalOnClass;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;
import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.boot.autoconfigure.liquibase.LiquibaseAutoConfiguration;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.util.StringUtils;

import javax.sql.DataSource;

/**
 * Extends DataSourceAutoConfiguration because it is annotated by
 * @ConditionalOnMissingBean(type = "io.r2dbc.spi.ConnectionFactory")
 * which prevents running jdbc and r2dbc in parallel
 */
@AutoConfigureOrder(Ordered.HIGHEST_PRECEDENCE)
@AutoConfigureBefore(LiquibaseAutoConfiguration.class)
public class DbConfiguration extends DataSourceAutoConfiguration {
    
    /**
     * Hikari DataSource configuration.
     * 
     * Elmo extends behavior of connection-pool by initializing
     * DB notifications if pool has connections and tearing down
     * DB notifications once pool gets empty. This is for cloud
     * installations to release all connections if app is idle
     * to safe money in time-based charging cloud environments.
     */
    @Configuration(proxyBeanMethods = false)
    @ConditionalOnClass(HikariDataSource.class)
    @ConditionalOnMissingBean(DataSource.class)
    @ConditionalOnProperty(
            name = "spring.datasource.type",
            havingValue = "at.elmo.config.db.NotificationsAwareHikariDataSource",
            matchIfMissing = true)
    public static class NotificationsAware {

        @ConditionalOnProperty(
                prefix = "spring.jpa",
                name = "database-platform",
                havingValue = "org.hibernate.dialect.PostgreSQL10Dialect")
        @Bean
        public PostgreSQLNotifications postgresqlNotifications() {
            
            return new PostgreSQLNotifications();
            
        }

        @Bean
        @ConfigurationProperties(prefix = "spring.datasource.hikari")
        public HikariDataSource dataSource(
                final PostgreSQLNotifications notifications,
                final DataSourceProperties properties) {
            
            final var dataSource = properties
                    .initializeDataSourceBuilder()
                    .type(NotificationsAwareHikariDataSource.class)
                    .build();
            dataSource.setPostgreSQLNotifications(notifications);
            if (StringUtils.hasText(properties.getName())) {
                dataSource.setPoolName(properties.getName());
            }
            return dataSource;
            
        }

    }

    @ConditionalOnProperty(
            prefix = "spring.jpa",
            name = "database-platform",
            havingValue = "org.hibernate.dialect.H2Dialect")
    @Bean
    public H2Notifications h2Notifications() {
        
        return new H2Notifications();
        
    }

}
