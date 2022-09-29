package at.elmo.car;

import at.elmo.util.spring.PersistenceBase;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

@Entity
@Table(name = "ELMO_CAR")
public class Car extends PersistenceBase<String> {

    @Id
    @Column(name = "ID")
    private String id;

    @Column(name = "NAME")
    private String name;

    @Column(name = "SHORTCUT")
    private String shortcut;

    @Column(name = "PHONE_NUMBER")
    private String phoneNumber;

    @Column(name = "PASSANGER_SERVICE")
    private boolean passangerService;

    @Column(name = "CAR_SHARING")
    private boolean carSharing;

    @Column(name = "APP_ACTIVE")
    private boolean appActive;

    @CreationTimestamp
    @Column(name = "CREATED_AT", nullable = false, updatable = false, columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "UPDATED_AT", nullable = false, columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private LocalDateTime updatedAt;

    @Override
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getShortcut() {
        return shortcut;
    }

    public void setShortcut(String shortcut) {
        this.shortcut = shortcut;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public boolean isPassangerService() {
        return passangerService;
    }

    public void setPassangerService(boolean passangerService) {
        this.passangerService = passangerService;
    }

    public boolean isCarSharing() {
        return carSharing;
    }

    public void setCarSharing(boolean carSharing) {
        this.carSharing = carSharing;
    }

    public boolean isAppActive() {
        return appActive;
    }

    public void setAppActive(boolean appActive) {
        this.appActive = appActive;
    }

}
