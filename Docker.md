# Information about docker commands to use on this backend server

# Commands Needed in Development and Production

1. Build the docker image of this App (For DEVELOPMENT )
   `docker compose -f docker-compose.dev.yml build --no-cache`

1. Build the docker image of this App (For PRODUCTION )
   `docker compose -f docker-compose.yml build --no-cache`

1. Up the container for this image created before (For DEVELOPMENT )
   `docker compose -f docker-compose.dev.yml up -d`

1. Up the container for this image created before (For PRODUCTION )
   `docker compose -f docker-compose.yml up -d`

1. Make the containers down
   `docker-compose down`

# Configuration of Docker Service in VPS

**Docker service will both start and set to start automatically when your VPS reboots**
**Note** With both commands below the VPS always will have Docker Service activated  
`sudo systemctl start docker`

`sudo systemctl enable docker`

1. How to check status of some service like Docker
   `sudo systemctl status <name-server>`
