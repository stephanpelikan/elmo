package at.elmo.config.db;

import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;
import org.springframework.context.annotation.Configuration;

/**
 * Extends DataSourceAutoConfiguration because it is annotated by
 * @ConditionalOnMissingBean(type = "io.r2dbc.spi.ConnectionFactory")
 * which prevents running jdbc and r2dbc in parallel
 */
@Configuration
public class DbConfiguration extends DataSourceAutoConfiguration {

}
