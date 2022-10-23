package at.elmo.config.db;

import at.elmo.config.db.DbNotifications.Action;
import com.fasterxml.jackson.core.TreeNode;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.r2dbc.postgresql.api.Notification;
import org.springframework.context.ApplicationEvent;

import java.io.IOException;

public class DbNotification extends ApplicationEvent {

    private static final long serialVersionUID = 1L;

    private Action action;
    
    private String table;
    
    private TreeNode record;

    private TreeNode old;

    public DbNotification(
            final Notification notification) throws IOException {
        
        super(DbNotifications.class);
        
        final var objectMapper = new ObjectMapper();
        final var tree = objectMapper
                .createParser(notification.getParameter())
                .readValueAsTree();
        
        action = Action.valueOf(((JsonNode) tree.get("action")).asText().toUpperCase());
        table = ((JsonNode) tree.get("identity")).asText().toUpperCase();
        record = tree.get("record");
        old = tree.get("old");
        
    }
    
    public Action getAction() {
        return action;
    }
    
    public String getTable() {
        return table;
    }
    
    public TreeNode getRecord() {
        return record;
    }
    
    public TreeNode getOld() {
        return old;
    }
    
}