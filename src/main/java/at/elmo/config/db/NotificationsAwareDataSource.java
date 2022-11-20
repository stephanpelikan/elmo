package at.elmo.config.db;

import com.zaxxer.hikari.util.DriverDataSource;

import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.ConnectionBuilder;
import java.sql.SQLException;
import java.sql.SQLFeatureNotSupportedException;
import java.sql.ShardingKeyBuilder;
import java.util.Properties;
import java.util.logging.Logger;

import javax.sql.DataSource;

public class NotificationsAwareDataSource implements DataSource {
    
    private final NotificationsAwareHikariDataSource owner;
    
    private final DataSource wrappedDataSource;

    public NotificationsAwareDataSource(
            final NotificationsAwareHikariDataSource owner,
            final String jdbcUrl,
            final String driverClassName,
            final Properties properties,
            final String username,
            final String password) {
        
        this.owner = owner;
        wrappedDataSource = new DriverDataSource(
                jdbcUrl,
                driverClassName,
                properties,
                username,
                password);
        
    }

    public <T> T unwrap(Class<T> iface) throws SQLException {
        return wrappedDataSource.unwrap(iface);
    }

    public boolean isWrapperFor(Class<?> iface) throws SQLException {
        return wrappedDataSource.isWrapperFor(iface);
    }

    public Connection getConnection() throws SQLException {
        return new NotificationsAwareConnection(
                owner,
                wrappedDataSource.getConnection());
    }

    public Connection getConnection(String username, String password) throws SQLException {
        return new NotificationsAwareConnection(
                owner,
                wrappedDataSource.getConnection(username, password));
    }

    public Logger getParentLogger() throws SQLFeatureNotSupportedException {
        return wrappedDataSource.getParentLogger();
    }

    public PrintWriter getLogWriter() throws SQLException {
        return wrappedDataSource.getLogWriter();
    }

    public void setLogWriter(PrintWriter out) throws SQLException {
        wrappedDataSource.setLogWriter(out);
    }

    public void setLoginTimeout(int seconds) throws SQLException {
        wrappedDataSource.setLoginTimeout(seconds);
    }

    public int getLoginTimeout() throws SQLException {
        return wrappedDataSource.getLoginTimeout();
    }

    public ConnectionBuilder createConnectionBuilder() throws SQLException {
        return wrappedDataSource.createConnectionBuilder();
    }

    public ShardingKeyBuilder createShardingKeyBuilder() throws SQLException {
        return wrappedDataSource.createShardingKeyBuilder();
    }
    
}
