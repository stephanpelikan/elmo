# ELMO

*ELMO* is an acronym for *El*ectro *Mo*bile. It is software for organizing regional social transport services using electric vehicles.

### It implements these rules:

1. It is meant to
     1. fill the gap of local public transportations in areas in which buses cannot be operated in the frequency needed.
     1. be used by non-profit organizations.
     1. use electric vehicles for transportation services.
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

### Features available:

*Hint:* At the moment the software is not ready to be used in production! Soon all features required for a base usage should be available. Watch the repository to keep up to date.

1. Member management:
    1. Onboarding
    1. Administration
    1. Bulk imports
1. Passenger service:
    1. Rule based shift planning
    1. Taking over shifts by drivers
1. Car-sharing:
    1. Planning of rides
    1. Doing rides
    
### Planned features:

1. Passenger service:
    1. Manual shift planning
    1. Statistics for billing
    1. Management of rides by drivers
    1. Self management of rides by passengers
1. Car-sharing:
    1. Change car-sharings by administrators (e.g. in case of car outages)
    1. Statistics for billing
1. App-Wrapper:
    1. For Android and iOS
    1. Special mode for tablets used in cars:
        1. Optimized to support drivers during the shift
        1. Used as a SMS gateway to not be dependent on expensive text service providers.
    1. Not yet scheduled: Recording GPS to calculate accurate durations of rides planned.
    
### Workflows:

This software's architecture is based on [BPMN processes](https://www.google.com/search?q=bpmn). To view [the models](./tree/main/src/main/resources/processes) use [an online viewer](https://demo.bpmn.io/).

To run the workflows the Open-Source BPMN engine [Camunda Platform 7](https://docs.camunda.org) is used which is loose coupled by using [VanillaBP](https://vanillabp.io). For editing the models [Camunda's free modeler](https://camunda.com/de/download/modeler/) is available.

## Production

### Build

```sh
MAVEN_OPTS=--add-opens=java.base/java.util=ALL-UNNAMED mvn -Dorg.slf4j.simpleLogger.log.org.openapitools.codegen.TemplateManager=WARN -P release
```

### Run

```sh
java -jar target/elmo-*-runnable.jar
```

Open in browser: [http://localhost:8080](http://localhost:8080)

Hint: Social login on localhost only works using Webpack development server (see below) because
service and webapp have to use different hostnames what applies for development server since
UI is started for localhost:3000 but Spring Boot container runs on localhost:8080.

## Building PDF templates

To fill PDFs (e.g. passenger agreement) one has to provide the PDF template and a CSV file
containing descriptions were to put which field into the PDF template.

To test this, run this command:

```sh
MAVEN_OPTS=--add-opens=java.base/java.util=ALL-UNNAMED mvn -Dcamunda-edition=ce clean package -P pdf
java -jar target/pdf-tool.jar src/test/attachments/passenger-agreement/configuration.csv src/test/attachments/passenger-agreement/data.csv src/test/attachments/passenger-agreement/template.pdf ~/Desktop/test.pdf
```

*Hint:* If you have limited space to place a certain text into PDF then you can limit the size
by using the 'configuration.csv' column 'maximale Laenge'. Do test the limits use a very long value in the 'data.csv'.

## Development

### Run

Run class `at.elmo.ElmoApplication` from your favorite IDE.

Run Webpack development server:
```sh
cd src/main/webapp
npm run start
```

Open in browser: [http://localhost:3000](http://localhost:3000)

Hot module replacement is active. All requests having not `Accept: text/html` will be proxied to `http://localhost:8080/`.

## OpenRouteService:

The free tool [OpenRouteService](https://openrouteservice.org/) is used to plan rides.

### Swagger-URL

https://openrouteservice.org/wp-json/ors-api/v1/api-doc/source/V2
