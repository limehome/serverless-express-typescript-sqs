# serverless-express-typescript-sqs

This project provides a full starter kit for a [serverless](https://www.serverless.com/) producer consumer queue setup implemented with [AWS Lambda](https://aws.amazon.com/lambda) and [SQS](https://aws.amazon.com/sqs/).
The goal is that you can use this code base to add your domain logic on top of it. 

- [serverless-express-typescript-sqs](#serverless-express-typescript-sqs)
  - [Abstract overview](#abstract-overview)
    - [Producer function](#producer-function)
    - [Consumer function](#consumer-function)
  - [Purpose](#purpose)
  - [Content](#content)
  - [Project structure](#project-structure)
  - [Development guides](#development-guides)
    - [Create a new service or controller](#create-a-new-service-or-controller)
    - [Add a new http endpoint](#add-a-new-http-endpoint)
    - [Define message processing logic](#define-message-processing-logic)
    - [Change Dead Letter Queue behavior](#change-dead-letter-queue-behavior)
    - [Change message processing retry interval time](#change-message-processing-retry-interval-time)
    - [Add a new serverless function](#add-a-new-serverless-function)
    - [Change handling of unexpected errors during endpoint access](#change-handling-of-unexpected-errors-during-endpoint-access)
    - [Change validation error response format](#change-validation-error-response-format)
    - [Define environment variables (local)](#define-environment-variables-local)
    - [Define secrets (AWS Lambda)](#define-secrets-aws-lambda)
  - [Run locally](#run-locally)
    - [Install and start project](#install-and-start-project)
    - [Produce message](#produce-message)
    - [Consume messages](#consume-messages)
    - [Run tests](#run-tests)
    - [Format](#format)
  - [Deploy on AWS](#deploy-on-aws)
  - [Known issues](#known-issues)
  - [Contribution](#contribution)

## Abstract overview
The project consists out of two serverless functions:

### Producer function 
1. Provides **http endpoints** that can be called to produce messages
2. Producer endpoints will **enqueue** messages into a queue

### Consumer function
1. Will be **triggered** when a message was passed to the queue 
2. Payload of the functions are enqueued messages
3. Each message will be processed (e.g. by sending to another http api)
4. Proccessing can lead to two kind of errors:
    - **Retriable errors**
    - **Non retriable errors**
5. If processing of a message leads to a **retriable error** the message will **stay** in the queue
6. If processing of a message leads to a **non retriable error** the message will be **deleted** from the queue
7. If processing of a message was **successful** the message will be also **deleted** from the queue
8. After a message caused **n** times a **retriable error** it will be moved to a so called **Dead Letter Queue** 
    - Message will stay in that queue for a specific time (Maximum 7 days) and will not be processed anymore

## Purpose
There are scenarios in which the processing of a message in the consumer could fail unexpectedly. For the example an api could become temporarly unavailable. This queue architecture makes sure that the messages will be kept and processing retried multiple times.

## Content
The project was created with TypeScript and Node.js. It contains the following content:

- Serverless setup for AWS Lambda with [Serverless](https://www.npmjs.com/package/serverless) framework
- SQS interaction with [AWS SDK](https://www.npmjs.com/package/aws-sdk)
- Queue error handling setup with [AWS SDK](https://www.npmjs.com/package/aws-sdk)
- Http server setup with [Express](https://www.npmjs.com/package/express)
- Request validation with [Express validator](https://www.npmjs.com/package/express-validator)
- Swagger setup with [Swagger UI Express](https://www.npmjs.com/package/swagger-ui-express)
- Unit test setup with [Jest](https://www.npmjs.com/package/jest)
- Formatting setup with [Prettier](https://www.npmjs.com/package/prettier)

## Project structure

**Configuration files**
| Path                     | Description                                                 |
| ------------------------ | :---------------------------------------------------------- |
| `.env.example`           | Example environment variable configuration                  |
| `.prettierignore`        | Files to exclude from formatting                            |
| `.prettierrc`            | Prettier formatting config                                  |
| `jest.config.js`         | Jest config file for unit tests                             |
| `secrets.yml.example`    | Example secret configuration to run functions on AWS Lambda |
| `serverless.offline.yml` | Serverless configuration to run functions locally           |
| `serverless.yml`         | Servlerless configuration to run functions on AWS Lambda    |
| `tsconfig.json`          | TypeScript configuration file                               |

**`/docs` folder**
- `/docs` contains everything that has to do with documentation about the project
- `/docs/api-spec.yml` contains the swagger specification for the http app

**`/test` folder**
- `/test` contains all unit tests executed with Jest
- Has also similar folder structure to `src`
- `env.test` contains environment variable setup for tests

**`/src` folder**
- `/src` contains the main source code of the project.
- Folder structure similar to typical Express projects

## Development guides
The following section provides you a short guide on how to change or add functionalities. 
You can also read the comments in the source code of the files to get more information about the specific implementation.

### Create a new service or controller
1. Create a new folder with the service or controller name (e.g `/src/services/log`)
2. Create a file for the class (e.g `/src/services/log/log.service.ts`)
    - You can use dependency injection to access other services
3. Create a file that contains an exported instance of that class (e.g `/src/services/index.ts`).
    - Here you then can import exported instances of other services or controllers to inject them
4. Create a unit test file (e.g `/test/services/log.service.spec.ts`)

### Add a new http endpoint
1. Create a new router or add a route to an existing router in `/src/routers`
2. Create a new validator for that route in `/src/validators` and use it as middleware for that route
   - Do not forget to always add the validation check middleware (`/src/validator.middleware.ts`) right after you used a new validation middleware
3. Add a controller as shown in the section before that will be called from the new route
4. Add a service as shown in the section before that will called from the new controller
5. Register the router in `/src/http-app.ts`
6. Update the swagger documentation in `/docs/api-spec.yml`

### Define message processing logic
1. Go to file `/src/services/event/event.service.ts`
2. In the function `processMessage : (message: DequeuedMessage) => Promise<void>` of class `EventService` you can define how to process the message
3. Or you can create also a seperate service for message processing and use it with dependency injection
4. Check out the file for more specific information

### Change Dead Letter Queue behavior
1. Go to file `serverless.yml` into section `resources.Resources`
2. `resources.Resources.MessagesQueue.Properties.RedrivePolicy.maxReceiveCount` represents the number of times a message that caused a retriable error should be retried
3. `resources.Resources.DeadLetterMessagesQueue.Properties.MessageRetentionPeriod` represents the maximum time in seconds a message should be stored in the dead letter queue

### Change message processing retry interval time
1. Go to file `serverless.yml` into section `resources.Resources.MessagesQueue.Properties`
2. After a minimum time of `VisibilityTimeout - consumer execution time` (in seconds) the consumer will pick up a failed message that should be retried again

### Add a new serverless function
1. Add a new file with the function in `src` (e.g `/src/example-function.ts`)
2. To call a service you can import an exported instance
3. Add the serverless function to `functions` section in `serverless.yml`

### Change handling of unexpected errors during endpoint access
1. Modify the function in `/src/middlewares/error.middleware.ts`

### Change validation error response format
1. Modify the function in `/src/middlewares/validator.middleware.ts` 

### Define environment variables (local)
1. Add the new environment variable to `.env` file (and also to `.env.example` as reference)
2. Add the variable to `/test/.env.test`
3. Use the variable in the `provider.environment` section in `serverless.offline.yml`
4. Use the variable in `/src/constants/environment.constants.ts`

### Define secrets (AWS Lambda)
1. Follow the steps which are explained in the local section
2. Add the variable to `secrets.yml` file for the different stages (and also to `secrets.yml.example` as reference)
3. Use the variable in the `provider.environment` section in `serverless.yml`

## Run locally
Right now there is no configuration setup to run this project in the exact same way as on AWS.
You can check out [LocalStack](https://github.com/localstack/localstack) to simulate AWS services on your local computer.
When running the project locally without LocalStack there is no automatic triggering of serverless functions. So you have to call the functions manually to test them. If you run the project with `ENVIRONMENT=local` every interaction with SQS will be realized with a mocked queue service (`/services/queue/local-queue.service.ts`). You can change that behavior in `/services/queue/index.ts` to always use the real service (`/services/queue/sqs-queue.service.ts`). 

### Install and start project
1. Clone the repository
2. Move into cloned directory
3. Run `npm i` to install all packages
4. Create a `.env` file based on `.env.example`
5. Run `npm run start:serverless` to start the serverless offline application

### Produce message
1. Open `http://localhost:3000/local/apispec/` in browser
2. Use the endpoint `/produce-message` to enqueue a message

### Consume messages
1. Install the [AWS CLI](https://aws.amazon.com/cli/)
2. Create a payload file that can contains mocked queue messages
```json
{
    "Records": [
        {
            "messageId": "message-id1",
            "receiptHandle": "message-handle1",
            "body": "{\"payload\":\"message-payload1\"}"
        }
    ]
}

```
3. Run the following command to send the mocked messages to the consumer:
```
aws lambda invoke \
  --output json {absolute output file path} \
  --endpoint-url http://localhost:3100 \
  --function-name serverless-express-typescript-sqs-local-serverless-consumer \s
  --payload file://{relative payload file path} \
  --cli-binary-format raw-in-base64-out
```

### Run tests
1. Run `npm run test` to run all tests
2. Run `npm run test:watch` to tests in interactive mode

### Format
1. Run `npm run format` to format all files with Prettier
2. Run `npm run format:check` if all files are formatted correctly

## Deploy on AWS
1. Read about [serverless deploying](https://www.serverless.com/framework/docs/providers/aws/guide/deploying/)
2. Create a `secrects.yml` file based on `secrects.yml.example`
3. Run `npm run serverless -- deploy --stage={stage to deploy for}` to deploy on AWS

## Known issues
- TypeScript compiling on changes is quite slow ([Check out this GitHub issue](https://github.com/prisma-labs/serverless-plugin-typescript/issues/220))

## Contribution
Feel free to open an issue if you found any error or to create a pull request if want to add additional content.
