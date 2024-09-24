<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

# Description

Backend server for Cuban Engineer technical test. Created by Onier Crestelo Ojeda

# Database information

I use here MariaDB inside the docker network so MariaDB is free and it is better MySql solution today.
The Network is created between the cuban-server app and cuban-mariadb (database runnning).

# Steps to running the server on development mode

1. Create the `.env` file and set the environment variables
2. Run and start the container image with the command `docker compose -f docker-compose.dev.yml up -d`
3. Enter to cuban-server container
4. Inside the container run this command to generate entities in database `npm run migration:run`

## Installations

1. @nestjs/config so can use ConfigModule

```
npm i @nestjs/config
```

2. @nestjs/typeorm and typeorm

```
npm i @nestjs/typeorm typeorm
```

3. mysql

```
npm i mysql
```

4. class-validator class-transformer ( to validate all data passed by Frontend )

```
npm i class-validator class-transformer
```

5. uuid // This uuid require a second installation to works

```
npm i uuid
```

```
npm i --save-dev @types/uuid
```

6. To enable better type safety, let’s install the multer types package.

```
npm i -D @types/multer
```

8. To create encrypted passwords in Authentication of Users

```
npm i bcryptjs
```

```
npm i -D @types/bcryptjs
```

9. Passport in Nestjs and passport from npm

```
npm i @nestjs/passport passport
```

10. passport with JWT and nestjs with jwt to handle secure authentication and authrization

```
npm i @nestjs/jwt passport-jwt
```

11. types of passport-jwt

```
npm i -D @types/passport-jwt
```

13. Mapped Types to update a dto

```
npm i @nestjs/mapped-types
```

14. Archiver to generate zip files

```
npm install archiver
```

```
npm i --save-dev @types/archiver
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```
