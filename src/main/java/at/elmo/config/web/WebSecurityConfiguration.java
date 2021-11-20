package at.elmo.config.web;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.security.web.util.matcher.RequestMatcher;

@Configuration
@EnableWebSecurity
public class WebSecurityConfiguration extends WebSecurityConfigurerAdapter {

    public static final String ADMIN_GROUP = "ADMIN";
    
    @Value("${camunda.bpm.admin-user.id}")
    private String adminUserId;

    @Value("${camunda.bpm.admin-user.password}")
    private String adminUserPassword;
	
	@Override
    protected void configure(final HttpSecurity http) throws Exception {

	       final RequestMatcher[] swaggerUiMatchers = new RequestMatcher[] {
	                new AntPathRequestMatcher("/swagger-ui/**"),
                    new AntPathRequestMatcher("/swagger-resources/**"),
                    new AntPathRequestMatcher("/swagger-resources"),
                    new AntPathRequestMatcher("/v2/api-docs"),
	        };

		final RequestMatcher[] unprotectedApiMatchers = new RequestMatcher[] {
                new AntPathRequestMatcher("/api/v*/gui/currentUser")
		};

        final RequestMatcher[] camundaMatchers = new RequestMatcher[] {
                new AntPathRequestMatcher("/camunda/**")
        };

		final RequestMatcher[] guiApiMatchers = new RequestMatcher[] {
				new AntPathRequestMatcher("/api/v*/gui/**")
		};

		http
    			.csrf()
    				.disable()
    				.cors()
    				.and()
    			.headers()
    				.contentTypeOptions().disable()
    		        .frameOptions().disable()
    		        .and()
                .sessionManagement()
    	            .sessionCreationPolicy(SessionCreationPolicy.NEVER)
    		        .and()
    			.authorizeRequests()
    	            .antMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                    .antMatchers("**/websocket/**").permitAll()
                    .requestMatchers(unprotectedApiMatchers).permitAll()
                    .requestMatchers(camundaMatchers).hasAuthority(ADMIN_GROUP)
                    .requestMatchers(swaggerUiMatchers).hasAuthority(ADMIN_GROUP)
    	            .requestMatchers(guiApiMatchers).authenticated()
    				.anyRequest().permitAll()
    				.and()
    			.logout()
    				.permitAll()
    				.and()
    			.httpBasic();

	}

	@Override
	protected void configure(AuthenticationManagerBuilder auth) throws Exception {
	    
	    auth
				.inMemoryAuthentication()
					.withUser(User.builder()
						.username(adminUserId)
                        .password("{noop}" + adminUserPassword)
						.authorities(ADMIN_GROUP));
	    // add any other user source here
		// auth
		//	    .authenticationProvider(activeDirectoryAuthenticationProvider());
		
	}

}
