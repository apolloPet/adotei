FROM gradle:8.14-jdk21-alpine AS build
WORKDIR /app
COPY build.gradle settings.gradle ./
COPY src ./src
RUN gradle bootJar --no-daemon -x test

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
RUN apk add --no-cache wget \
    && addgroup -S spring && adduser -S spring -G spring
USER spring:spring
COPY --from=build /app/build/libs/*.jar app.jar
EXPOSE 8080
HEALTHCHECK --interval=10s --timeout=5s --start-period=60s --retries=6 \
  CMD wget -q -O- http://localhost:8080/actuator/health | grep -q '"status":"UP"' || exit 1
ENTRYPOINT ["java", "-jar", "app.jar"]
