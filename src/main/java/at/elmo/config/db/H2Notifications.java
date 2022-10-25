package at.elmo.config.db;

import at.elmo.config.db.DbNotification.Action;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.h2.tools.TriggerAdapter;
import org.slf4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;

import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;

import javax.annotation.PostConstruct;

public class H2Notifications extends TriggerAdapter {

    @Autowired
    private Logger logger;
    
    @Autowired
    private ApplicationEventPublisher applicationEventPublisher;
    
    private static Logger eventLogger;
    
    private static ApplicationEventPublisher eventPublisher;
    
    @PostConstruct
    public void init() {
        
        H2Notifications.eventPublisher = applicationEventPublisher;
        H2Notifications.eventLogger = logger;
        
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
                    .publishEvent(notification);
            
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
                final var items = row.getArray(i).getResultSet();
                final var array = result.putArray(name);
                while (items.next()) {
                    final var item = toTreeNode(items);
                    array.add(item);
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
                result.put(name, row.getDate(i).toString());
                break;
            }
            case java.sql.Types.TIME:
            case java.sql.Types.TIME_WITH_TIMEZONE: {
                result.put(name, row.getTime(i).toString());
                break;
            }
            case java.sql.Types.TIMESTAMP:
            case java.sql.Types.TIMESTAMP_WITH_TIMEZONE: {
                result.put(name, row.getTimestamp(i).toLocalDateTime().toString());
                break;
            }
            default: result.put(name, row.getString(i));
            }
            
        }
        
        return result;
        
    }
    
}
