package at.elmo.config.db;

import com.fasterxml.jackson.core.TreeNode;
import org.springframework.context.ApplicationEvent;

import java.io.IOException;

public class DbNotification extends ApplicationEvent {

    private static final long serialVersionUID = 1L;

    public static enum Action { INSERT, UPDATE, DELETE };

    private final Action action;
    
    private final String table;
    
    private final TreeNode record;

    private final TreeNode old;

    public DbNotification(
            final Object source,
            final Action action,
            final String table,
            final TreeNode record,
            final TreeNode old) throws IOException {
        
        super(source);
        this.action = action;
        this.table = table;
        this.record = record;
        this.old = old;
        
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