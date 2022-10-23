package at.elmo.config.web;

import at.elmo.config.ElmoProperties;
import at.elmo.member.MemberService;
import at.elmo.member.Role;
import at.elmo.member.login.OAuth2UserService;
import at.elmo.member.onboarding.MemberOnboarding;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.web.AuthorizationRequestRepository;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.security.web.authentication.logout.LogoutFilter;
import org.springframework.security.web.authentication.ui.DefaultLoginPageGeneratingFilter;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.security.web.util.matcher.RequestMatcher;

import javax.annotation.Resource;

@Configuration
@EnableWebSecurity
@EnableGlobalMethodSecurity(jsr250Enabled = true)
public class WebSecurityConfiguration extends WebSecurityConfigurerAdapter {

    @Value("${camunda.bpm.admin-user.id}")
    private String adminUserId;

    @Value("${camunda.bpm.admin-user.password}")
    private String adminUserPassword;

    @Autowired
    private ElmoProperties properties;

    @Autowired
    private MemberService memberService;

    @Autowired
    private MemberOnboarding memberOnboarding;

    @Resource
    private ClientRegistrationRepository repo;

    //@Resource
    //private JdbcTemplate jdbcTemplate;

    @Override
    protected void configure(final HttpSecurity http) throws Exception {

        final RequestMatcher[] unprotectedGuiApi = new RequestMatcher[] {
                new AntPathRequestMatcher("/api/v*/gui/app-info"),
                new AntPathRequestMatcher("/api/v*/gui/current-user"),
                new AntPathRequestMatcher("/api/v*/app/text-messages-notification/*"),
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
                    .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                    .and()
                .authorizeRequests()
                    .antMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                    .requestMatchers(unprotectedGuiApi).permitAll()
                    .requestMatchers(administrationApi).hasRole(Role.ADMIN.name())
                    .anyRequest().authenticated()
                    .and()
                .exceptionHandling()
                    .defaultAccessDeniedHandlerFor((request, response, exception) -> {
                            response.sendError(HttpStatus.UNAUTHORIZED.value());
                        },
                        request -> request.getRequestURI().startsWith("/api/v"))
                    .authenticationEntryPoint(null)
                    .and()
                .logout()
                    .permitAll()
                    .clearAuthentication(false)
                    .logoutSuccessHandler(logoutSuccessHandler())
                    .and()
                .oauth2Login()
                    .loginPage(properties.getGatewayUrl() + DefaultLoginPageGeneratingFilter.DEFAULT_LOGIN_PAGE_URL)
                    .authorizationEndpoint()
                        .authorizationRequestRepository(authorizationRequestRepository())
                        .and()
                    //.authorizedClientService(oAuth2AuthorizedClientService())
                    .userInfoEndpoint()
                        .userService(oauth2UserService())
                        .and()
                    .successHandler(authenticationSuccessHandler())
                    .and()
                .addFilterBefore(jwtSecurityFilter(), LogoutFilter.class);

    }

    @Bean
    public LogoutSuccessHandler logoutSuccessHandler() {

        return new LogoutSuccessHandler();
    }

    @Bean
    public JwtSecurityFilter jwtSecurityFilter() {

        return new JwtSecurityFilter();

    }

    @Bean
    public AuthenticationSuccessHandler authenticationSuccessHandler() {

        return new at.elmo.member.login.AuthenticationSuccessHandler(
                properties,
                memberOnboarding);

    }

    @Bean
    public OAuth2UserService oauth2UserService() {

        return new OAuth2UserService(
                memberOnboarding, memberService);

    }

//    @Bean
//    public OAuth2AuthorizedClientService oAuth2AuthorizedClientService() {
//
//        return new TransactionalJdbcOAuth2AuthorizedClientService(jdbcTemplate, repo);
//
//    }

    /**
     * Used instead of HttpSession based implementation to avoid creating
     * HttpSession for every request.
     */
    @Bean
    public AuthorizationRequestRepository<OAuth2AuthorizationRequest> authorizationRequestRepository() {

        return new HttpCookieAuthorizationRequestRepository();

    }

}
