# ELMO poc

## production

### build

```sh
mvn generate-sources
cd src/main/webapp
npm install
npm run build
cd -
mvn package
```

*Camunda:* If you don't have a licence key or want to use
Camunda's community edition then you have to add `-Dcamunda-edition=ce`
to every `mvn`-command.

### run

```sh
java -jar target/*.jar
```

Open in browser: [http://localhost:8080](http://localhost:8080)

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
