package at.elmo.config.db;

import at.elmo.config.db.DbNotification.Action;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.r2dbc.postgresql.api.PostgresqlConnection;
import io.r2dbc.postgresql.api.PostgresqlResult;
import io.r2dbc.spi.ConnectionFactory;
import org.slf4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.io.IOException;

import javax.annotation.PostConstruct;
import javax.annotation.PreDestroy;

public class PostgreSQLNotifications {

    @Autowired
    private Logger logger;
    
    @Autowired
    private ApplicationEventPublisher applicationEventPublisher;
    
    @Autowired
    private ConnectionFactory connectionFactory;
    
    private PostgresqlConnection receiver;

    @PostConstruct
    public void initialize() throws InterruptedException {

        receiver = Mono.from(connectionFactory.create())
                .cast(PostgresqlConnection.class)
                .block();
                
        receiver.createStatement("LISTEN record_event")
                .execute()
                .flatMap(PostgresqlResult::getRowsUpdated)
                .subscribe();

        receiver.getNotifications()
                .flatMap(notification -> {
                    try {
                        final var objectMapper = new ObjectMapper();
                        final var tree = objectMapper
                                .createParser(notification.getParameter())
                                .readValueAsTree();
                        
                        final var action = Action.valueOf(((JsonNode) tree.get("action")).asText().toUpperCase());
                        final var table = ((JsonNode) tree.get("identity")).asText().toUpperCase();
                        final var record = tree.get("record");
                        final var old = tree.get("old");
                        
                        return Flux.just(new DbNotification(
                                PostgreSQLNotifications.class,
                                action,
                                table,
                                record,
                                old));
                    } catch (IOException e) {
                        logger.error("Could not build DB notification '{}'", notification, e);
                        return Flux.empty();
                    }
                })
                .subscribe(applicationEventPublisher::publishEvent);
        
    }

    @PreDestroy
    public void destroy() {
        
        receiver
                .close()
                .subscribe();
        
    }
    
}
