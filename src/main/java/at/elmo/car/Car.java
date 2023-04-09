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

    @Column(name = "PASSENGER_SERVICE")
    private boolean passengerService;

    @Column(name = "CAR_SHARING")
    private boolean carSharing;

    @Column(name = "APP_ACTIVE")
    private boolean appActive;
    
    @Column(name = "KM")
    private int km;
    
    @Column(name = "KM_CONFIRMED")
    private boolean kmConfirmed;
    
    @Column(name = "KM_CONFIRMED_AT")
    private LocalDateTime kmConfirmedAt;
    
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

    public boolean isPassengerService() {
        return passengerService;
    }

    public void setPassengerService(boolean passengerService) {
        this.passengerService = passengerService;
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

    public int getKm() {
        return km;
    }

    public void setKm(int km) {
        this.km = km;
    }

    public boolean isKmConfirmed() {
        return kmConfirmed;
    }

    public void setKmConfirmed(boolean kmConfirmed) {
        this.kmConfirmed = kmConfirmed;
    }

    public LocalDateTime getKmConfirmedAt() {
        return kmConfirmedAt;
    }

    public void setKmConfirmedAt(LocalDateTime kmConfirmedAt) {
        this.kmConfirmedAt = kmConfirmedAt;
    }

}
