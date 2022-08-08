package at.elmo.config.web;

import javax.annotation.Resource;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.security.web.util.matcher.RequestMatcher;
import org.springframework.session.jdbc.config.annotation.web.http.EnableJdbcHttpSession;

import at.elmo.config.ElmoProperties;
import at.elmo.member.Member.Role;
import at.elmo.member.MemberService;
import at.elmo.member.login.OAuth2UserService;

@Configuration
@EnableWebSecurity
@EnableJdbcHttpSession
public class WebSecurityConfiguration extends WebSecurityConfigurerAdapter {
    
    @Value("${camunda.bpm.admin-user.id}")
    private String adminUserId;

    @Value("${camunda.bpm.admin-user.password}")
    private String adminUserPassword;
    
    @Autowired
    private ElmoProperties properties;

    @Autowired
    private MemberService memberService;
    
    @Resource
    private ClientRegistrationRepository repo;

    @Resource
    private JdbcTemplate jdbcTemplate;
    
	@Override
    protected void configure(final HttpSecurity http) throws Exception {

		final RequestMatcher[] unprotectedGuiApi = new RequestMatcher[] {
                new AntPathRequestMatcher("/api/v*/gui/current-user"),
                new AntPathRequestMatcher("/api/v*/gui/oauth2-clients"),
		};

		final RequestMatcher[] administrationApi = new RequestMatcher[] {
		        new AntPathRequestMatcher("/api/v*/administration/**")
		};
		
        final RequestMatcher[] guiApi = new RequestMatcher[] {
                new AntPathRequestMatcher("/api/v*/**"),
                new AntPathRequestMatcher("/logout"),
                new AntPathRequestMatcher("/**/oauth2/**"),
		};

		http
                .requestMatchers()
                    .requestMatchers(guiApi)
                    .and()
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
                .sessionCreationPolicy(SessionCreationPolicy.NEVER)
    		        .and()
    			.authorizeRequests()
    	            .antMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                    .antMatchers("**/websocket/**").permitAll()
                    .requestMatchers(unprotectedGuiApi).permitAll()
                    .requestMatchers(administrationApi).hasRole(Role.ADMIN.name())
                    .anyRequest().authenticated()
    				.and()
    			.logout()
    				.permitAll()
    				.logoutSuccessUrl(properties.getGatewayUrl())
    				.and()
                .oauth2Login()
                    .loginPage(properties.getGatewayUrl() + "/login")
                    .authorizedClientService(oAuth2AuthorizedClientService())
                    .userInfoEndpoint()
                        .userService(oauth2UserService())
                        .and()
                    .successHandler(authenticationSuccessHandler());

	}

    @Bean
    public AuthenticationSuccessHandler authenticationSuccessHandler() {

        return new at.elmo.member.login.AuthenticationSuccessHandler(properties, memberService);

    }

    @Bean
    public OAuth2UserService oauth2UserService() {

        return new OAuth2UserService(memberService);

    }

    @Bean
    public OAuth2AuthorizedClientService oAuth2AuthorizedClientService() {
        
        return new TransactionalJdbcOAuth2AuthorizedClientService(jdbcTemplate, repo);
        
    }
    
}
