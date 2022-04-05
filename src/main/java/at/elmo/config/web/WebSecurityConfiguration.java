package at.elmo.config.web;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.security.web.util.matcher.RequestMatcher;

import at.elmo.config.ElmoProperties;
import at.elmo.user.AuthenticationSuccessHandler;
import at.elmo.user.OAuth2UserService;

@Configuration
@EnableWebSecurity
public class WebSecurityConfiguration extends WebSecurityConfigurerAdapter {

    public static final String ADMIN_GROUP = "ADMIN";
    
    @Value("${camunda.bpm.admin-user.id}")
    private String adminUserId;

    @Value("${camunda.bpm.admin-user.password}")
    private String adminUserPassword;
    
    @Autowired
    private AuthenticationSuccessHandler successHandler;
    
    @Autowired
    private OAuth2UserService oauth2UserService;

    @Autowired
    private ElmoProperties properties;
	
	@Override
    protected void configure(final HttpSecurity http) throws Exception {

       final RequestMatcher[] swaggerUiMatchers = new RequestMatcher[] {
                new AntPathRequestMatcher("/swagger-ui/**"),
                new AntPathRequestMatcher("/swagger-resources/**"),
                new AntPathRequestMatcher("/swagger-resources"),
                new AntPathRequestMatcher("/v2/api-docs"),
        };

		final RequestMatcher[] unprotectedApiMatchers = new RequestMatcher[] {
                new AntPathRequestMatcher("/api/v*/gui/currentUser"),
                new AntPathRequestMatcher("/api/v*/gui/currentUser"),
                new AntPathRequestMatcher("/api/v*/gui/oauth2-clients"),
		};

        final RequestMatcher[] camundaMatchers = new RequestMatcher[] {
                new AntPathRequestMatcher("/camunda/**")
        };

        final RequestMatcher[] spaMatchers = new RequestMatcher[] {
                new AntPathRequestMatcher("/"),
                new AntPathRequestMatcher("/robots.txt"),
                new AntPathRequestMatcher("/assets/**"),
                new AntPathRequestMatcher("/static/**"),
                new AntPathRequestMatcher("/**/oauth2/**"),
		};

        final RequestMatcher[] h2Matchers = new RequestMatcher[] {
                new AntPathRequestMatcher("/h2"),
                new AntPathRequestMatcher("/h2/**")
        };

		http
    			.csrf()
    				.disable()
    				.cors()
    				.configurationSource(httpRequest -> properties.getCors())
    				.and()
    			.headers()
    				.contentTypeOptions().disable()
    		        .frameOptions().disable()
    		        .and()
                .sessionManagement()
    	            .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
    		        .and()
    			.authorizeRequests()
    	            .antMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                    .antMatchers("**/websocket/**").permitAll()
                    .requestMatchers(spaMatchers).permitAll()
                    .requestMatchers(h2Matchers).permitAll()
                    .requestMatchers(unprotectedApiMatchers).permitAll()
                    .requestMatchers(camundaMatchers).hasAuthority(ADMIN_GROUP)
                    .requestMatchers(swaggerUiMatchers).hasAuthority(ADMIN_GROUP)
                    .anyRequest().authenticated()
    				.and()
    			.logout()
    				.permitAll()
    				.logoutSuccessUrl(properties.getGatewayUrl())
    				.and()
                .oauth2Login()
                    .userInfoEndpoint()
                        .userService(oauth2UserService)
                        .and()
                    .successHandler(successHandler);

	}

//	@Override
//	protected void configure(AuthenticationManagerBuilder auth) throws Exception {
//	    
//	    auth
//				.inMemoryAuthentication()
//					.withUser(User.builder()
//						.username(adminUserId)
//                        .password("{noop}" + adminUserPassword)
//						.authorities(ADMIN_GROUP));
//	    // add any other user source here
//		// auth
//		//	    .authenticationProvider(activeDirectoryAuthenticationProvider());
//		
//	}

}
