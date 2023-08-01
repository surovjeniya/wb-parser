docker-compose -f \
${PWD}/docker-compose.production.yml -f \
${PWD}/docker-compose.development.yml --env-file \
${PWD}/development/.env up --build