package at.elmo.util.config;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ConfigValueRepository extends JpaRepository<ConfigValue, String> {

}
