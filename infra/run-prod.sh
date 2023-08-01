docker-compose -f \
${PWD}/docker-compose.production.yml --env-file \
${PWD}/production/.env up --build -d