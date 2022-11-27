package at.elmo.util;

import at.elmo.car.Car;
import at.elmo.car.CarRepository;
import at.elmo.member.Member;
import at.elmo.member.MemberRepository;
import at.elmo.member.Role;
import at.elmo.member.login.ElmoOAuth2User;
import at.elmo.member.onboarding.MemberApplication;
import at.elmo.member.onboarding.MemberApplicationRepository;
import at.elmo.util.exceptions.ElmoException;
import at.elmo.util.exceptions.ElmoForbiddenException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class UserContext {

    @Autowired
    private MemberRepository members;

    @Autowired
    private MemberApplicationRepository memberApplications;
    
    @Autowired
    private CarRepository cars;

    public Car getLoggedInCar() {

        final var authentication = SecurityContextHolder
                .getContext()
                .getAuthentication();
        
        if (authentication == null) {
            throw new ElmoForbiddenException("No security context");
        }
        if (!authentication.isAuthenticated()) {
            throw new ElmoForbiddenException("Car not logged in");
        }

        if (!(authentication.getPrincipal() instanceof ElmoOAuth2User)) {
            throw new ElmoForbiddenException("Car logged in not of instance '" + ElmoOAuth2User.class + "'");
        }

        final var oauth2User = (ElmoOAuth2User) authentication.getPrincipal();
        if (oauth2User.getElmoId() == null) {
            return null;
        }

        final var result = cars.findById(oauth2User.getElmoId());
        if (result.isEmpty()) {
            return null;
        }
        
        return result.get();

    }

    public Member getLoggedInMember() {

        final var authentication = SecurityContextHolder
                .getContext()
                .getAuthentication();
        
        if (authentication == null) {
            throw new ElmoForbiddenException("No security context");
        }
        if (!authentication.isAuthenticated()) {
            throw new ElmoForbiddenException("User anonymous");
        }

        if (!(authentication.getPrincipal() instanceof ElmoOAuth2User)) {
            throw new ElmoForbiddenException("User logged in not of instance '" + ElmoOAuth2User.class + "'");
        }

        final var oauth2User = (ElmoOAuth2User) authentication.getPrincipal();
        if (oauth2User.getElmoId() == null) {
            return null;
        }

        final var result = members.findById(oauth2User.getElmoId());
        if (result.isEmpty()) {
            return null;
        }
        
        return result.get();

    }

    public MemberApplication getLoggedInMemberApplication() {

        final var authentication = SecurityContextHolder
                .getContext()
                .getAuthentication();
        
        if (authentication == null) {
            throw new ElmoForbiddenException("No security context");
        }
        if (!authentication.isAuthenticated()) {
            throw new ElmoForbiddenException("User anonymous");
        }
        if (!(authentication.getPrincipal() instanceof ElmoOAuth2User)) {
            throw new ElmoForbiddenException("User logged in not of instance '" + ElmoOAuth2User.class + "'");
        }

        final var oauth2User = (ElmoOAuth2User) authentication.getPrincipal();

        final var result = memberApplications.findById(oauth2User.getMemberApplicationId());
        if (result.isEmpty()) {
            throw new ElmoException(
                    "There is no member-application-record for user logged '" + oauth2User.getOAuth2Id() + "'");
        }

        return result.get();

    }

    public boolean hasRole(
            final Role minimalConstraint) {
        
        final var member = getLoggedInMember();
        if (member == null) {
            return false;
        }
        
        for (final var role : Role.orderedByConstraint(minimalConstraint)) {
            if (member.hasRole(role)) {
                return true;
            }
        }

        return false;
        
    }
    
}
