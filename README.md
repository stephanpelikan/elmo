# ELMO

*ELMO* is an acronym for *El*ectro *Mo*bile. It is software for organizing regional social transport services using electric vehicles.

It is meant to
1. fill the gap of local public transportations in areas in which buses cannot be operated in the frequency needed.
1. be used by non-profit organizations.
1. use electric vehicles for transportation services.

### It supports organizations which apply to these rules:

1. An organization has at least one electric vehicle used for passenger services at business times.
1. Beside the times of passenger service cars can be used for car-sharing.
1. People can join as a passenger:
     1. Members can order cars to pick them up at a certain point and time and bring them to an individual destination.
     1. Only one ride and return can be ordered in advance to keep slots free for a fair distribution of the available capacity.
     1. Destinations are limited to local areas (e.g. community).
1. People can join as a driver:
     1. Once a week a driver takes over a shift of passenger service (e.g. 3 hours).
     1. In the same amount of doing passenger service a driver can rent a car for individual usage (car-sharing)
     1. Car-sharing is not limited to local areas but is limited in time for a fair distribution of the available capacity (e.g. maximum of 48 hours at once).
1. People can join as a both passenger and driver at once:
      1. Typically, passengers are charged a flat fee.
      1. Drivers who also use the passenger service pay a lower fee.

Fees are not calculated by the system, but statistics are provided to support charging passengers and drivers.

### Features available:

*Hint:* At the moment the software is not ready to be used in production! Soon all features required for a base usage should be available. Watch the repository to keep up to date.

1. Member management:
    1. Onboarding
    1. Administration
    1. Bulk imports
    1. Self-management (avatar, email-address, phone-number, personal settings)
1. Car management:
    1. Define cars
    1. Define car's roles (car-sharing, passenger-service)
1. Passenger service:
    1. Rule based shift planning
    1. Taking over shifts by drivers
1. Car-sharing:
    1. Planning of rides
    1. Doing rides
1. User-interface
    1. Optimized for phones, tablets and PCs
    1. Organisation's details can be defined by configuration: brand-colors, icon, name, homepage, etc.
    1. Social login (currently available: Google, Amazon; planned: Apple)

### Planned features:

1. Passenger service:
    1. Manual shift planning
    1. Statistics for billing
    1. Management of rides by drivers
    1. Self-management of rides by passengers
1. Car-sharing:
    1. Change car-sharing by administrators (e.g. in case of car outages)
    1. Statistics for billing
1. App-Wrapper:
    1. For Android and iOS
    1. Special mode for tablets used in cars:
        1. Optimized to support drivers during the shift
        1. Used as an SMS gateway to not be dependent on expensive text service providers.
    1. Not yet scheduled: Recording GPS to calculate accurate durations of rides planned.
1. Multilingual user-interface
   2. English
   3. German
    
## Screenshots

- [Login page](./screenshots/login.png) ([mobile version](./screenshots/login_mobile.png))
- [Drivers dashboard](./screenshots/driver.png) ([english version](./screenshots/driver_english.png))
- [Planner view](./screenshots/planner.png), showing three cars:
   - Elmo 1 & 2 are used for car-sharing, Elmo 3 is used for passenger-service
   - Elmo 1 shows a temporary/interactive selection used for defining periods of car-sharing
   - Elmo 2 shows an already reserved car-sharing
   - Elmo 3 shows shifts of passenger-service
- [Administration](./screenshots/administration.png)
- Emails
   - [Welcome](./screenshots/email_welcome.png)
   - [Driver's reminder to claim a shift](./screenshots/email_shifts_of_next_week.png)

*Hint:* Screenshots show German language

## Production

### Build

```sh
MAVEN_OPTS=--add-opens=java.base/java.util=ALL-UNNAMED mvn -Dorg.slf4j.simpleLogger.log.org.openapitools.codegen.TemplateManager=WARN -P release
```

### Run

```sh
java -Dspring.active.profile=production -jar target/elmo-*-runnable.jar
```

Define a Spring profile `production` similar to the development profile [local](./src/main/resources/config/application-local.yaml). Change existing values and add properties for social login, mailing and SMS texting as shown in section [development](#development).

Open in browser: [http://localhost:8080](http://localhost:8080)

Hint: Social login on localhost only works using Webpack development server (see below) because
service and webapp have to use different hostnames what applies for development server since
UI is started for localhost:3000 but Spring Boot container runs on localhost:8080.

### Configure

Possible configuration attributes you can provide in a file `application-production.yaml` in the directory from which you start the application.

Checkout the sections `elmo` and `translations` in the files [application.yaml](./src/main/resources/config/application.yaml) and [application-local.yaml](./src/main/resources/config/application-local.yaml). Most thing are self-explaining. For the rest read the listing underneath:

1. `elmo.gateway-url`: The public URL which point to the Elmo application (e.g. `https://app.elmo.com`)
1. `elmo.sms.support`: Whether to use a drivers cell-phone to send SMS (see App-Wrapper).
1. `elmo.passenger-service-phone-number`: The drivers cell-phone's number.
1. `elmo.admin-identification-email-address`: Once a new social login is registers having this email address, the account is created without onboarding and admin-permissions are given out.
1. `elmo.admin-member-id`: A predefined member id of the administrator.
1. `elmo.email.sender`: The sender address for emails sent (e.g. no-reply@address.com)
1. `elmo.general-email-address`: The organisation's email address (e.g. your@address.com)

#### Social login configuration:

Spring Boot's built in mechanism is used for social logins. For each you have to provide these properties:

1. Google:
    1. `spring.security.oauth2.client.registration.google.client-id`: see [https://console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials)
    1. `spring.security.oauth2.client.registration.google.client-secret`: see [https://console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials)
    1. `spring.security.oauth2.client.registration.google.redirect-uri`: Use `${elmo.gateway-url}/{action}/oauth2/code/{registrationId}`
    1. `spring.security.oauth2.client.registration.google.scope`: Use `["email", "profile"]`
1. Amazon 
    1. `spring.security.oauth2.client.registration.amazon.client-name`: Use  `Amazon`
    1. `spring.security.oauth2.client.registration.amazon.client-id`: see [https://developer.amazon.com/loginwithamazon/console/site/lwa/overview.html](https://developer.amazon.com/loginwithamazon/console/site/lwa/overview.html)
    1. `spring.security.oauth2.client.registration.amazon.client-secret`: see [https://developer.amazon.com/loginwithamazon/console/site/lwa/overview.html](https://developer.amazon.com/loginwithamazon/console/site/lwa/overview.html)
    1. `spring.security.oauth2.client.registration.amazon.authorization-grant-type`: Use `authorization_code`
    1. `spring.security.oauth2.client.registration.amazon.redirect-uri`: Use `${elmo.gateway-url}/{action}/oauth2/code/{registrationId}`
    1. `spring.security.oauth2.client.registration.amazon.scope`: Use `["profile"]`

For some providers, like Amazon-Login, the are no default-values known by Spring Boot so, also the provider's properties need to be set:

1. Amazon:
    1. `spring.security.oauth2.client.provider.amazon.id`: Use `amazon`
    1. `spring.security.oauth2.client.provider.amazon.authorization-uri`: Use `https://www.amazon.com/ap/oa`
    1. `spring.security.oauth2.client.provider.amazon.token-uri`: Use `https://api.amazon.co.uk/auth/o2/token`
    1. `spring.security.oauth2.client.provider.amazon.user-info-uri`: Use `https://api.amazon.com/user/profile`
    1. `spring.security.oauth2.client.provider.amazon.userNameAttribute`: Use `name`


### Building PDF templates

As a last step of the passenger registration a confirmation email is sent which also includes a passenger agreement to be signed and sent to the organisation's leader board. It is provided as a prefilled PDF attachment.

Two PDF files has to be created manually, one for passenger registrations and one for driver registrations. This PDF should have spaces in which the registree has to fill her/his personal data. To prefill theses spaces with data recording during the online registration a CSV file has to be created containing descriptions were to put which data into the PDF.

To test this, run this command:

```sh
MAVEN_OPTS=--add-opens=java.base/java.util=ALL-UNNAMED mvn -Dcamunda-edition=ce clean package -P pdf
java -jar target/pdf-tool.jar src/test/attachments/passenger-agreement/configuration.csv src/test/attachments/passenger-agreement/data.csv src/test/attachments/passenger-agreement/template.pdf ~/Desktop/test.pdf
```

*Hint:* If you have limited space to place a certain text into PDF then you can limit the size
by using the 'config.csv' column 'max_length'. Do test the limits use a very long value in the 'data.csv'.

Provide the directories containing the configuration files by using this properties:

1. `elmo.passenger-agreement-pdf-directory`
1. `elmo.driver-agreement-pdf-directory`

## Development

### Workflows:

This software's architecture is based on [BPMN processes](https://www.google.com/search?q=bpmn). To view [the models](./src/main/resources/processes) use [an online viewer](https://demo.bpmn.io/).

To run the workflows the Open-Source BPMN engine [Camunda Platform 7](https://docs.camunda.org) is used which is loose coupled by using [VanillaBP](https://vanillabp.io). For editing the models [Camunda's free modeler](https://camunda.com/de/download/modeler/) is available.

### Run

Run class `at.elmo.ElmoApplication` from your favorite IDE and add JVM parameters like this:

```
-Dspring.security.oauth2.client.registration.google.client-id=XXXXXXX
-Dspring.security.oauth2.client.registration.google.client-secret=XXXXXXX
-Dspring.security.oauth2.client.registration.amazon.client-id=YYYYYYY
-Dspring.security.oauth2.client.registration.amazon.client-secret=YYYYYYY
-Delmo.passenger-agreement-pdf-directory=/media/sf_Shared/elmo/passenger-agreement
-Delmo.driver-agreement-pdf-directory=/media/sf_Shared/elmo/driver-agreement
-Delmo.email.sender=your@address.com
-Delmo.general-email-address=your@address.com
-Delmo.email.redirect-all-to=your@address.com
-Delmo.admin-identification-email-address=your@address.com
-Delmo.initial-new-member-id=2
-Delmo.admin-member-id=1
-Delmo.sms.redirect-all-to='+436661234567'
-Delmo.sms.dont-redirect='+436661234567,+436661234567'
-Dspring.mail.host=my-smtp-host
-Dspring.mail.port=25
```

Values `XXXXXXX` can be configured at [https://console.cloud.google.com](https://console.cloud.google.com) and for `YYYYYYY` at [https://developer.amazon.com/apps-and-games/login-with-amazon](https://developer.amazon.com/apps-and-games/login-with-amazon).


Run Webpack development server:

```sh
cd src/main/webapp
npm run start
```

Open in browser: [http://localhost:3000](http://localhost:3000)

Hot module replacement is active. All requests having pathes matching `/api`, `*oauth2*`, `/logout` will be proxied to `http://localhost:8080/`.

## OpenRouteService:

The free tool [OpenRouteService](https://openrouteservice.org/) is used to plan rides.

### Swagger-URL

https://openrouteservice.org/wp-json/ors-api/v1/api-doc/source/V2

# Noteworthy & Contributors

*ELMO* was developed by Stephan Pelikan to support the non-profit organization [ElektroMobil Gänserndorf](https://www.elektromobil-gf.at).

If you need support to operate the system, feel free to create an Github issue having a label `help wanted`. If you don't have the technical skills to operate this system get in contact with [Phactum Softwareentwicklung GmbH](https://phactum.at/) which is a supporter of the project.

# License

Copyright 2023 Stephan Pelikan

Licensed under the Apache License, Version 2.0