docker-compose -f \
${PWD}/docker-compose.yml -f \
${PWD}/docker-compose.local.yml --env-file \
${PWD}/development/.env up --build