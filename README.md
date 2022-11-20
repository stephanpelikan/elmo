# ELMO

## production

### build

```sh
MAVEN_OPTS=--add-opens=java.base/java.util=ALL-UNNAMED mvn -Dorg.slf4j.simpleLogger.log.org.openapitools.codegen.TemplateManager=WARN -Dcamunda-edition=ce package -P release
```

### run

```sh
java -jar target/elmo-*-runnable.jar
```

Open in browser: [http://localhost:8080](http://localhost:8080)

Hint: Social login on localhost only works using Webpack development server (see below) because
service and webapp have to use different hostnames what applies for development server since
UI is started for localhost:3000 but Spring Boot container runs on localhost:8080.

## Building PDF templates

To fill PDFs (e.g. passanger agreement) one has to provide the PDF template and a CSV file
containing descriptions were to put which field into the PDF template.

To test this, run this command:

```sh
MAVEN_OPTS=--add-opens=java.base/java.util=ALL-UNNAMED mvn -Dcamunda-edition=ce clean package -P pdf
java -jar target/pdf-tool.jar src/test/attachments/passanger-agreement/configuration.csv src/test/attachments/passanger-agreement/data.csv src/test/attachments/passanger-agreement/template.pdf ~/Desktop/test.pdf
```

*Hint:* If you have limited space to place a certain text into PDF then you can limit the size
by using the 'configuration.csv' column 'maximale Laenge'. Do test the limits use a very long value in the 'data.csv'.

## development

### run

Run class `at.elmo.ElmoApplication` from your favorite IDE.

Run Webpack development server:
```sh
cd src/main/webapp
npm run start
```

Open in browser: [http://localhost:3000](http://localhost:3000)

Hot module replacement is active. All requests having not `Accept: text/html` will be proxied to `http://localhost:8080/`.

## OpenRouteService:

### Swagger-URL

https://openrouteservice.org/wp-json/ors-api/v1/api-doc/source/V2
