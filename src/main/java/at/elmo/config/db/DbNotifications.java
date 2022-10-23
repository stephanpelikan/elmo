package at.elmo.config.db;

import io.r2dbc.postgresql.api.PostgresqlConnection;
import io.r2dbc.postgresql.api.PostgresqlResult;
import io.r2dbc.spi.ConnectionFactory;
import org.slf4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.io.IOException;

import javax.annotation.PostConstruct;
import javax.annotation.PreDestroy;

@Component
public class DbNotifications {

    public static enum Action { INSERT, UPDATE, DELETE };

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
                        return Flux.just(new DbNotification(notification));
                    } catch (IOException e) {
                        logger.error("Could not deserialize DB notification '{}'", notification, e);
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
