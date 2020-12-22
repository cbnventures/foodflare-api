FoodFlare - API Server
=======================

[![GitHub Releases](https://img.shields.io/github/v/release/cbnventures/foodflare-api?style=flat-square&color=blue&sort=semver)](https://github.com/cbnventures/foodflare-api/releases)
[![GitHub Top Languages](https://img.shields.io/github/languages/top/cbnventures/foodflare-api?style=flat-square&color=success)](https://github.com/cbnventures/foodflare-api)
[![GitHub License](https://img.shields.io/github/license/cbnventures/foodflare-api?style=flat-square&color=yellow)](https://github.com/cbnventures/foodflare-api/blob/master/LICENSE)
[![Donate via PayPal](https://img.shields.io/badge/donate-paypal-blue?style=flat-square&color=orange)](https://cbnventures.io/paypal)

With so many restaurants, coffee shops, and dessert places, choosing one quickly turns into a huge responsibility. Through FoodFlare, these problems go away _fast_. Whether you're hungry or dying to visit a _newly open and hidden in the corner_ kind of shop, this app is for you.

__Not looking to develop FoodFlare? Download it now on the [App Store](https://itunes.apple.com/us/app/foodflare/id1398042619?ls=1&mt=8) and [Google Play](https://play.google.com/store/apps/details?id=io.cbnventures.foodflare).__

Before the initial setup, you will need:
1. A [Yelp](https://www.yelp.com/developers), [Google](https://cloud.google.com), and an [Amazon Web Services](https://aws.amazon.com) account
2. A computer that can run [Node.js](https://nodejs.org) on macOS or Linux OS (preferably)
3. To become a member of [Apple Developer](https://developer.apple.com/programs/) and [Google Play](https://play.google.com/apps/publish/)

## Table of Contents
With FoodFlare re-designed from the bottom up, we've decided to split the old v2 (privately-sourced) project into manageable chunks. Each repository will now have releases of its own.

1. [API Auth Server](https://github.com/cbnventures/foodflare-auth)
2. API Server
3. [iOS and Android App](https://github.com/cbnventures/foodflare-app)
4. [Web Application](https://github.com/cbnventures/foodflare-web)

## Instructions (Part 2 of 4)
Once the authentication server is up and running, the next set of instructions will guide you through installing, configuring, and deploying the API server.

### 1. Install Node Modules
To start, install the project dependencies. If you are using an IDE (Integrated Developer Environment), you may set up types and run the included tests.

```sh
npm install
```

### 2. Copy Private Certificate
With the generated certificate saved from the [previous set of instructions](https://github.com/cbnventures/foodflare-auth#instructions-part-1-of-4), add the `private.pem` file to the `certs` directory.

### 3. Configure Environment Variables
The settings below will allow you to configure how you want the API server to run. Don't forget to initialize the `.env` file with this command:

```sh
cp .env.sample .env
```

Once you initialize the `.env` file, modify the variables according to the specification below:

| __Variable__     | __Description__                                                      | __Accepted Values__                                                                                                |
|------------------|----------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------|
| `AUTHORIZER_TTL` | Set policy caching for the `foodflare-auth` responses.               | An integer written in seconds. For example, 5 minutes would be `300`.                                              |
| `GOOGLE_API_KEY` | A valid API key to access the Google Places and Geocoding endpoints. |                                                                                                                    |
| `JWT_ALGORITHM`  | The algorithm JSON Web Token will use to read your private key.      | `RS256`, `RS384`, `RS512`, `ES256`, `ES384`, `ES512`, `PS256`, `PS384`, and `PS512`.                               |
| `JWT_EXPIRES_IN` | The maximum age allowed for JWT tokens to be valid.                  | A string describing a time span. The string is interpreted with the [zeit/ms](https://github.com/zeit/ms) library. |
| `YELP_API_KEY`   | A valid API key to access the Yelp Fusion endpoints.                 |                                                                                                                    |

### 4. Deploy to Lambda
Run the command below to deploy the server on to Amazon Web Services. Once deployment is complete, take note of the development URL (`*.amazonaws.com/dev`) and production URL (`*.amazonaws.com/prod`). The URLs will be used for [setting up the API request tests](https://github.com/cbnventures/foodflare-api#6-setup-api-request-tests).

```sh
npm run create
```

__NOTE:__ The `create` command will upload your project into the `dev` and `prod` stages. While under development, use the `update:dev` command to update the development version and `update:prod` for production.

### 5. Setup Amazon API Key and Usage Plan
For the FoodFlare API to work, follow the directions below to create an API key. In this step, you will also be guided on creating a usage plan.

1. Visit the [API Gateway Console](https://console.aws.amazon.com/apigateway)
2. Under the list of __APIs__, click on __foodflareApi__
3. In the sidebar, click __Usage Plans__ and then the blue __Create__ button
4. Using the information below, create a usage plan:
    - __Name:__ Development
    - __Enable throttling:__ ✓
    - __Rate:__ 1 request per second
    - __Burst:__ 1 request
    - __Enable quota:__ ✗
5. Click the blue __Next__ button, and then __Add API Stage__
6. Under the __API__ dropdown, select __foodflareApi__
7. Under the __Stage__ dropdown, select __dev__
8. Click the circle check mark on the right, then click __Next__
9. Click the __Create API Key and add to Usage Plan__ button
10. In the __Name__ field, type in the Usage Plan name
11. Click the blue __Save__ button, and then the blue __Done__ button
12. Using the information below, repeat Steps 3 to 11:
    - __Name:__ Production
    - __Enable throttling:__ ✓
    - __Rate:__ 50 requests per second
    - __Burst:__ 1 request
    - __Enable quota:__ ✗
13. In the sidebar, click __API Keys__
14. Click either __Development__ or __Production__ under the __API Keys__ list
15. Click the blue __Show__ link next to __API key__
16. Copy the API key and store it for use in the [next step](https://github.com/cbnventures/foodflare-api#6-setup-api-request-tests)
17. Repeat Steps 13 to 16 for the next API key

### 6. Setup WebStorm HTTP Requests
With the URLs and API keys retrieved in previous steps, set up the HTTP client environment variables in WebStorm to test the API. First, run this command to populate the configuration files:

```sh
cp http-client.env.json.sample http-client.env.json && cp http-client.private.env.json.sample http-client.private.env.json
```

#### 6a. Configure `http-client.env.json`
1. Replace `YOUR_DEVELOPMENT_API_URL` with your Development URL (ends in `*.amazonaws.com/dev`)
2. Replace `YOUR_PRODUCTION_API_URL` with your Production URL (ends in `*.amazonaws.com/prod`)

#### 6b. Configure `http-client.private.env.json`
1. Replace `YOUR_DEVELOPMENT_API_KEY_HERE` with your Development API key
2. Replace `YOUR_PRODUCTION_API_KEY_HERE` with your Production API key

#### 6c. Open `api-test.http`
1. Run the `/auth/session` endpoint to authenticate (`development` or `production` environment)
2. Test other endpoints

__NOTE:__ If WebStorm is unavailable, you can skip this step or try to replicate the API requests using alternative test clients. We recommend using [Postman](https://www.postman.com).

### 7. Setup CloudWatch Logs
Finally, after testing the API server, cut server costs by configuring the server logs retention rate.

1. Visit the [CloudWatch Management Console](https://console.aws.amazon.com/cloudwatch)
2. In the sidebar, under __Logs__, click __Log groups__
3. Under the __Log group__ column, select __Never expire__ for the rows below:
    - `/aws/lambda/foodflareApi`
    - `/aws/lambda/foodflareAuth`
4. Under the dropdown, select __3 months (90 days)__
5. Then click the orange __Save__ button

## Documentation
For more information regarding API interactions, you may reference the [API.md](https://github.com/cbnventures/foodflare-api/blob/master/docs/API.md) and [Errors.md](https://github.com/cbnventures/foodflare-api/blob/master/docs/Errors.md) files. The documentations will feature a variety of examples and usage information.
