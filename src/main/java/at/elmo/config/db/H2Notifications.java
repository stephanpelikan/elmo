package at.elmo.config.db;

import at.elmo.config.db.DbNotification.Action;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.h2.tools.TriggerAdapter;
import org.slf4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEvent;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;

import javax.annotation.PostConstruct;

public class H2Notifications extends TriggerAdapter {

    static class H2PostTxNotificationEvent extends ApplicationEvent {
        
        private static final long serialVersionUID = 1L;

        public H2PostTxNotificationEvent(
                final DbNotification notification) {
            super(notification);
        }
        
        public DbNotification getNotification() {
            return (DbNotification) getSource();
        }
        
    }
    
    @Autowired
    private Logger logger;
    
    @Autowired
    private ApplicationEventPublisher applicationEventPublisher;
    
    @Autowired
    private H2NotificationSender sender;
    
    private static Logger eventLogger;
    
    private static ApplicationEventPublisher eventPublisher;
    
    @PostConstruct
    public void init() {
        
        H2Notifications.eventPublisher = applicationEventPublisher;
        H2Notifications.eventLogger = logger;
        
    }
    
    /**
     * For PostgreSQL notifications fire after the transaction. We
     * simulated this by waiting until the end of the transaction,
     * sending asynchronously and sleeping a little bit.
     * 
     * @see https://www.postgresql.org/docs/current/sql-notify.html
     */
    @TransactionalEventListener(
            phase = TransactionPhase.AFTER_COMMIT,
            fallbackExecution = true)
    public void sendNotificationAfterTx(
            final H2PostTxNotificationEvent event) throws Exception {
        
        sender.send(event.getNotification());
        
    }
    
    @Override
    public void fire(
            final Connection conn,
            final ResultSet oldRow,
            final ResultSet newRow) throws SQLException {
        
        final var table = super.tableName;
        final var action = switch (super.type) {
        case DELETE -> Action.DELETE;
        case UPDATE -> Action.UPDATE;
        case INSERT -> Action.INSERT;
        default -> null;
        };
        
        try {

            final var old = toTreeNode(oldRow);
            final var record = toTreeNode(newRow);

            final var notification = new DbNotification(
                H2Notifications.class,
                action,
                table,
                record,
                old);
            
            H2Notifications
                    .eventPublisher
                    .publishEvent(new H2PostTxNotificationEvent(notification));
            
        } catch (Exception e) {
            
            eventLogger.error("Could not build/publish DB notification '{}'", e);
            
        }
        
    }
    
    private JsonNode toTreeNode(
            final ResultSet row) throws SQLException {
        
        if (row == null) {
            return null;
        }
        
        final var objectMapper = new ObjectMapper();
        
        final var result = objectMapper.createObjectNode();
        for (int i = 1; i != row.getMetaData().getColumnCount(); ++i) {
            
            final var name = row.getMetaData().getColumnName(i).toLowerCase();
            final var type = row.getMetaData().getColumnType(i);
            switch (type) {
            case java.sql.Types.ARRAY: {
                final var value = row.getArray(i);
                if (value == null) {
                    result.put(name, (String) null);
                } else {
                    final var items = value.getResultSet();
                    final var array = result.putArray(name);
                    while (items.next()) {
                        final var item = toTreeNode(items);
                        array.add(item);
                    }
                }
                break;
            }
            case java.sql.Types.BIGINT: {
                result.put(name, row.getBigDecimal(i));
                break;
            }
            case java.sql.Types.CLOB:
            case java.sql.Types.BLOB:
            case java.sql.Types.BINARY: {
                eventLogger.debug("Unsupported type BINARY, ignoring column '{}'", name);
                break;
            }
            case java.sql.Types.BOOLEAN:
            case java.sql.Types.BIT: {
                result.put(name, row.getBoolean(i));
                break;
            }
            case java.sql.Types.DOUBLE:
            case java.sql.Types.NUMERIC:
            case java.sql.Types.DECIMAL: {
                result.put(name, row.getDouble(i));
                break;
            }
            case java.sql.Types.FLOAT: {
                result.put(name, row.getFloat(i));
                break;
            }
            case java.sql.Types.SMALLINT: {
                result.put(name, row.getInt(i));
                break;
            }
            case java.sql.Types.TINYINT: {
                result.put(name, row.getByte(i));
                break;
            }
            case java.sql.Types.DATE: {
                final var value = row.getDate(i);
                if (value == null) {
                    result.put(name, (String) null);
                } else {
                    result.put(name, value.toLocalDate().toString());
                }
                break;
            }
            case java.sql.Types.TIME:
            case java.sql.Types.TIME_WITH_TIMEZONE: {
                final var value = row.getTime(i);
                if (value == null) {
                    result.put(name, (String) null);
                } else {
                    result.put(name, value.toLocalTime().toString());
                }
                break;
            }
            case java.sql.Types.TIMESTAMP:
            case java.sql.Types.TIMESTAMP_WITH_TIMEZONE: {
                final var value = row.getTimestamp(i);
                if (value == null) {
                    result.put(name, (String) null);
                } else {
                    result.put(name, value.toLocalDateTime().toString());
                }
                break;
            }
            default: result.put(name, row.getString(i));
            }
            
        }
        
        return result;
        
    }
    
}
