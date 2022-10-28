package at.elmo.config.db;

import com.zaxxer.hikari.HikariDataSource;

import java.sql.Connection;
import java.sql.SQLException;
import java.util.HashSet;
import java.util.Set;

public class NotificationsAwareHikariDataSource extends HikariDataSource {

    interface ConnectionSupplier {
        Connection get() throws SQLException;
    }
    
    private static Set<Connection> pooledConnections = new HashSet<>();
    
    private PostgreSQLNotifications notification;
    
    public void setPostgreSQLNotifications(
            final PostgreSQLNotifications notification) {
        
        this.notification = notification;
        
    }
    
    public void connectionClosed(
            final Connection connection) {
        
        synchronized (pooledConnections) {

            if (!pooledConnections.remove(connection)) {
                return;
            }
            
            if (pooledConnections.isEmpty()) {
                notification.destroy();
            }
            
        }
        
    }
    
    public void connectionAboutToCreate(
        final Connection connection) {
        
        if (pooledConnections.isEmpty()) {
            notification.initialize();
        }

        pooledConnections.add(connection);

    }
    
    @Override
    public Connection getConnection(String username, String password) throws SQLException {
        
        return getConnection(() -> super.getConnection(username, password));
        
    }
    
    @Override
    public Connection getConnection() throws SQLException {
        
        return getConnection(() -> super.getConnection());
        
    }
    
    private Connection getConnection(
            final ConnectionSupplier connectionSupplier) throws SQLException {

        synchronized (pooledConnections) {

            if (getDataSource() == null) {
                setDataSource(
                        new NotificationsAwareDataSource(
                                this,
                                getJdbcUrl(),
                                getDriverClassName(),
                                getDataSourceProperties(),
                                getUsername(),
                                getPassword()));
            }
            
        }
        
        return connectionSupplier.get();
        
    }
    
}
