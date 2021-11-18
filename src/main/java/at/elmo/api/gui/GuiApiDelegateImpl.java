package at.elmo.api.gui;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

import at.elmo.api.gui.v1.GuiApiDelegate;
import at.elmo.api.gui.v1.Role;
import at.elmo.api.gui.v1.User;

@Component
public class GuiApiDelegateImpl implements GuiApiDelegate {

    @Override
    public ResponseEntity<User> currentUser() {

        return ResponseEntity
                .ok(new User()
                        .email("stephan.pelikan@phactum.at")
                        .name("Stephan")
                        .surname("Pelikan")
                        .memberId("47")
                        .active(true)
                        .hasAvatar(false)
                        .addRolesItem(Role.ADMIN));

    }

}
