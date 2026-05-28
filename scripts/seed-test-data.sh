#!/usr/bin/env bash
# Limpa cadastros e recria dados de teste (local). Reinicie o backend apos rodar.
set -euo pipefail
cd "$(dirname "$0")/../backend"
export SPRING_PROFILES_ACTIVE=local
export SEED_TEST_DATA=true
export SEED_TEST_DATA_PASSWORD="${SEED_TEST_DATA_PASSWORD:-senha123}"

echo "Executando seed de dados de teste (porta 8082, encerra ao concluir)..."
mvn -q spring-boot:run -Dspring-boot.run.arguments="--server.port=8082" &
PID=$!
trap 'kill "$PID" 2>/dev/null || true' EXIT

for _ in $(seq 1 60); do
  if curl -sf http://localhost:8082/actuator/health >/dev/null 2>&1; then
    sleep 3
    break
  fi
  sleep 2
done

kill "$PID" 2>/dev/null || true
wait "$PID" 2>/dev/null || true
echo "Seed finalizado. Reinicie o backend na porta habitual (8080/8081)."
