# Homebase Assignment - Product Management

# Introduction
Welcome to the Product Management System project! This system offers a robust solution for managing products and staff. Tailored for administrators, it features a suite of tools for efficient personnel management and product oversight. The system includes various functionalities designed to streamline the management process, ensuring a smooth operation for both inventory control and human resources. This document serves as an API and software specification, detailing the features and operations of the Product Management System.

# 🚀 Features
1. User and Product Management: The system facilitates two primary roles: standard users and administrators. Standard users can interact with the product catalog, while administrators have comprehensive control over user accounts and product listings, ensuring efficient management of both human resources and inventory.
2. Versatile APIs: The system offers a range of APIs tailored to various needs. Public APIs are available for guests (non-logged-in users) to retrieve essential product information, with features like filtering, sorting, and text-based searches. Additional APIs are accessible to registered users, offering enhanced functionalities and detailed interactions with the product database.
3. Administrator Dashboard: An intuitive admin panel is provided for system administrators. This dashboard enables the creation and management of user accounts and product entries. Admins can also oversee and confirm product-related transactions, ensuring smooth and efficient operational flow.

# 🚀 Technical Stack
The Product Management System incorporates the following technologies:
- NestJS: A progressive Node.js framework for building efficient and scalable server-side applications.
- Node.js (v16): A JavaScript runtime environment that executes server-side code.
- Yarn: A fast and reliable package manager for managing project dependencies.
- MongoDB: A NoSQL database used to store and manage data for the system.
- Django: Added to bolster the Admin management system, Django is a high-level Python Web framework that encourages rapid development and clean, pragmatic design. It's employed specifically for its robust administrative interface, security features, and the ability to manage user accounts and product data effectively.
- Third-Party Tools: Typegoose, Lerna, Nx, and Husky are employed to enhance development workflows.
- Other Stacks: The system integrates with storage solutions such as S3 or Minio. Docker and Docker Compose are used for containerization, while Redis is employed for caching purposes.

# 🗒️ Installation
Before getting started with the project, ensure you have the following software and tools installed
- Node.js v16 or higher
- Yarn package manager
- Lerna and Nx
- Docker and Docker Compose
- Django v5

## Docker setup
Inside the source already have a docker-compose.yml file. You can use this file to set up all stacks. Or you can follow step by step if you want setup to start from scratch

Create a `docker-compose.yml` file in your project directory and add the following content
```yaml
version: '3.8'

services:
  mongo:
    container_name: homebase-mongo
    image: mongo:4.4.18
    env_file: docker.env
    ports:
      - '27017:27017'
    volumes:
      - .docker/mongo/data:/data/db
      - .docker/mongo/backup:/data/backup
    environment:
      MONGO_INITDB_ROOT_USERNAME: ${DB_USER_ROOT}
      MONGO_INITDB_ROOT_PASSWORD: ${DB_PASS_ROOT}
      MONGO_INITDB_DATABASE: ${DB_SAMPLE_DATABASE}
      MONGODB_USER: ${DB_USER}
      MONGODB_PASS: ${DB_PASS}
      MONGODB_DATABASE: ${DB_SAMPLE_DATABASE}
    networks:
      - homebase-network
    restart: always
    healthcheck:
      test: echo 'db.runCommand("ping").ok' | mongo db:27017/speech-api --quiet
      interval: 30s
      timeout: 10s
      retries: 5

  minio:
    container_name: homebase-minio
    image: minio/minio
    env_file: docker.env
    volumes:
      - .docker/minio/data:/data
    ports:
      - "9000:9000"
      - '9090:9090'
    environment:
      MINIO_ROOT_USER: ${STORAGE_USER}
      MINIO_ROOT_PASSWORD: ${STORAGE_PASSWORD}
      MINIO_ACCESS_KEY: ${STORAGE_ACCESS_KEY}
      MINIO_SECRET_KEY: ${STORAGE_SECRET_KEY}
      MINIO_DEFAULT_BUCKETS: ${STORAGE_DEFAULT_BUCKETS}
    restart: always
    networks:
      - homebase-network
    command: server /data --console-address ":9090"

# Docker Networks
networks:
  homebase-network:
    name: homebase-network
    driver: bridge

# Docker Volumes
volumes:
  .docker:
```
In this configuration, we're using the official MongoDB Docker image, exposing port 27017, and setting the root username and password. Make sure to change the password to a secure value in a production environment.

This will download the MongoDB image (if not already present) and start the container in the background.

Once the MongoDB container is running, execute the following command to create a user and database:

```shell
docker exec -it my-mongodb-container mongo admin -u root -p example --eval "db.createUser({ user: 'homebase_user', pwd: 'homebase_pass', roles: [{ role: 'readWrite', db: 'homebase_db' }] })";
```

This command will connect to the MongoDB container, authenticate as the root user, and create a new user with read-write access to the specified database.

## Monorepo Setup
This project is organized as a monorepo using Lerna and Nx. A monorepo allows you to manage multiple related projects in a single repository. Lerna is a tool for managing JavaScript projects with multiple packages, while Nx is a set of extensible dev tools for monorepo development.

To learn more about monorepos, Lerna, and Nx, you can refer to the following resources:

- [Monorepo Explained](https://monorepo.tools)
- [Lerna Documentation](https://lerna.js.org/docs/getting-started)
- [Nx Documentation](https://nx.dev/getting-started/intro)

Beside that, you can discovery my library for monorepo development at: JokTec Monorepo

> JokTec is a powerful and easy-to-use library designed to approach microservice architecture. It offers a skeleton that can be extendable and is compatible with NestJS framework. Whether you're a beginner or an experienced developer, JokTec can help you to organize and architect microservice simply and quickly.

## Django Setup
Here's a brief tutorial on setting up Django for your development environment

- Python installed on your system (Python 3.6 or higher is recommended).
- Pip (Python package installer) for installing packages.

Create a Virtual Environment

Before installing Django, it's a good practice to create a virtual environment. A virtual environment is a self-contained directory that contains a Python installation for a particular version of Python, plus a number of additional packages.

- Open your command line interface (CLI).
- Navigate to the directory where you want to create your project.
- Run the following command:

```shell
python -m venv myenv
# Or
python3 -m venv myenv
```

Replace myenv with your preferred environment name.

Activate the Virtual Environment

Activate the virtual environment to isolate your project's dependencies from the global Python installation.

```shell
# On Window
myenv\Scripts\activate

# On Unix or MacOS
source myenv/bin/activate
```

With the virtual environment activated, you can install Django.

Run the following command:

```shell
pip install django
# Or
pip3 install django
```

## Getting Started
### Backend (NestJS)

To get the project up and running on your local machine, follow these steps

Clone the repository:
```shell
git clone git@github.com:trangiabao1203/homebase_api.git
```

Install project dependencies:
```shell
yarn install
```

Configuration

Setup environment variables

Open file `apps/admin-api/config.yml` and edit with your config

```yaml
gateway:
  port: 9010
  swagger:
    server: http://localhost:9010
    auth:
      username: admin
      password: admin

log:
  format: pretty
  level: info

misc:
  cdnUrl: http://127.0.0.1:9000/homebase

guard:
  pending: 30
  limit: 5
  secretKey: mySecretKey
  refreshKey: myRefreshKey
  expired: 30 days
  skipOtp: true

mongo:
  host: localhost
  port: 27017
  username: homebase_user
  password: homebase_pass
  database: homebase_db
  connectTimeout: 20000
  directConnection: true
  debug: false

storage:
  region: ap-southeast-1
  accessKey: accesskey
  secretKey: secretkey
  bucket: homebase
  endpoint: http://127.0.0.1:9000
  useSSL: false
  s3ForcePathStyle: true
  linkFormat: http://127.0.0.1:9000/homebase/<key>
```

Running the Project

In this project structure, you will see in /apps directory:
- `admin-api`: This is the backend API server develop with NestJS

All of packages are using Lerna and Nx to manage workspace, so you can run the following command to start the project:
```shell
yarn dev --scope @hb/admin-api
```

Explaining the command:
- Each packages have a `package.json` file, and have a name with format `@hb/<package_name>`
- In the root of `package.json` file, there is a script with name dev, this script will run the command yarn dev as parallel for any packages have the same name script
- You can also specify the package name to run the command, for example: `yarn dev --scope @hb/admin-api`
- You can do a similar thing with other scripts, for example: `yarn build --scope @hb/admin-api`

> Expanding on the existing architecture using a monorepo, the system can evolve into a microservices-oriented structure. Services like `@hb/auth-api`, `@hb/product-api`, and `@hb/user-api` can be developed and scaled independently, allowing for focused and efficient management. Utilizing tools like Nx or Lerna enhances script execution and dependency management across these services. This modular approach not only accelerates development and deployment cycles but also improves fault isolation and allows for technology-specific optimizations within each service.

After running the project, you can access the API application at: http://localhost:9010

You can also access the API documentation at: http://localhost:9010/swagger
> You can use the credentials above to access swagger
user: `admin`
pass: `admin`

You can test API direct on Swagger UI, or you can import it on Postman from link: http://localhost:9010/swagger-json 

### Frontend (Django)

To get the project up and running on your local machine, follow these steps

Clone the repository:
```shell
git clone git@github.com:trangiabao1203/homebase_admin.git
```

Install Required Libraries
```shell
pip install -r requirements.txt
```

Configuration
```shell
cp .env.example .env
```

Running the Project
```shell
python manage.py runserver
```

Access the Application

Open a web browser and go to http://127.0.0.1:8000/admin or http://localhost:8000/admin. You should see the Django welcome page or your project's home page if you've set up a custom one.

> You can use the credentials above to access admin dashboard
user: `admin`
pass: `admin`

# Technical Dept
In your project, there are areas of technical debt that need to be addressed for enhanced stability and functionality. Here's a revised outline of the issues:
- Refine Django Admin Form Validation: The project requires improved validation mechanisms within Django admin forms to prevent data inconsistencies and ensure reliable data input.
- Enhance API Exception Handling: The project needs advanced API exception handling to provide clear, informative error responses, improving the debugging process and user interaction with the API.

# Integration
After successfully accessing the admin page at http://localhost:8000/admin, you can use it to query or create data from the dashboard pages. Due to the missing validation and exception handling mentioned earlier, to facilitate easy operation, I will provide some dummy data samples for you to work with.

You can test both API Postman/Swagger or in Admin Dashboard
```json5
// Users
{
    "fullName": "John Doe",
    "phone": "+84966877382", // Vietnam phone format
    "email": "john.doe@gmail.com",
    "role": "user",
    "gender": "male",
    "birthday": "2024-01-01T00:00:00.000Z",
    "image": null,
    "thumbnail": null,
    "status": "activated",
    "password": "Abc@123"
}
```

```json5
// Product
{
    "code": "PRODUCT_CODE",
    "title": "Product name",
    "subhead": null,
    "description": null,
    "type": "default",
    "image": null,
    "thumbnail": null,
    "order": 1,
    "price": 20000,
    "stock": 30,
    "status": "activated"
}
```
