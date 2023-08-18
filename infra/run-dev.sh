docker compose -f ${PWD}/docker-compose.yml -f \
${PWD}/docker-compose.development.yml --env-file \
${PWD}/.env up --build 