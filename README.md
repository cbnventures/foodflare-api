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

| __Variable__     | __Specification__                                               | __Accepted Values__                                                                                                |
|------------------|-----------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------|
| `AUTHORIZER_TTL` | Set policy caching for the `foodflare-auth` responses.          | An integer written in seconds. For example, 5 minutes would be `300`.                                              |
| `GOOGLE_API_KEY` | A valid API key to access the Google endpoints.                 |                                                                                                                    |
| `JWT_ALGORITHM`  | The algorithm JSON Web Token will use to read your private key. | `RS256`, `RS384`, `RS512`, `ES256`, `ES384`, `ES512`, `PS256`, `PS384`, and `PS512`.                               |
| `JWT_EXPIRES_IN` | The maximum age allowed for JWT tokens to be valid.             | A string describing a time span. The string is interpreted with the [zeit/ms](https://github.com/zeit/ms) library. |
| `YELP_API_KEY`   | A valid API key to access the Yelp Fusion endpoints.            |                                                                                                                    |

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

## API Usage and Responses
Before any endpoints are accessed, an [API key is required](https://github.com/cbnventures/foodflare-api#5-setup-amazon-api-key-and-usage-plan). Once the API key is retrieved, a [session token](https://github.com/cbnventures/foodflare-api#1-generate-session-token-authsession) will need to be generated prior to accessing the rest of the endpoints.

### 1. Generate Session Token (`/auth/session`)
Generate a session token to access the other endpoints. Token expiration will follow the `JWT_EXPIRES_IN` and `JWT_MAX_AGE` environment variables. __All fields are required.__

| Keys       | Accepted Values                                                                                                            | Type     |
|------------|----------------------------------------------------------------------------------------------------------------------------|----------|
| `platform` | If a web application is querying, use `web`. If a mobile application is querying, use `mobile`. _For user analytics only._ | `string` |

__Usage:__
```json
{
    "platform": "mobile"
}
```

__Example Response:__
```json
{
    "action": "AUTHORIZATION",
    "success": true,
    "info": {
        "token": "12345"
    }
}
```

### 2. Yelp Fusion Business Search (`/fusion/search`)
Retrieve a list of businesses from Yelp. Businesses with no reviews will not be displayed from this endpoint. __All fields are required.__

| Keys         | Acceptable Values                                                                                                        | Type       |
|--------------|--------------------------------------------------------------------------------------------------------------------------|------------|
| `term`       | The term for your Yelp search query                                                                                      | `string`   |
| `latitude`   | Latitude for current location                                                                                            | `number`   |
| `longitude`  | Longitude for current location                                                                                           | `number`   |
| `category`   | Filter businesses based on [these categories](https://www.yelp.com/developers/documentation/v3/all_category_list)        | `string[]` |
| `sort`       | Sort businesses by `distance`, `least_expensive`, or `most_reviewed`                                                     | `string`   |
| `price`      | Show businesses that meet these price range(s). For example, `[1, 3]` for `$` and `$$$`. To show all, use `[1, 2, 3, 4]` | `number[]` |
| `min_rating` | Show businesses that meet these minimum rating(s). For example, `3.5` for 3.5 stars or higher. To show all, use `0`      | `number`   |
| `open_now`   | Show businesses that are open right now                                                                                  | `boolean`  |

__Usage:__
```json
{
    "term": "food",
    "latitude": 40.714224,
    "longitude": -73.961452,
    "category": ["restaurant"],
    "sort": "distance",
    "price": [1, 2, 3, 4],
    "min_rating": 0,
    "open_now": true
}
```

__Example Response:__
```json
{
    "action": "FUSION_SEARCH",
    "success": true,
    "info": [
        {
            "source": "yelp",
            "id": "1A2B3C4D5E6F7G8H9I0J",
            "name": "Awesome Food",
            "price": 2,
            "rating": 4.5,
            "review_count": 100,
            "distance": 20
        }
    ]
}
```

### 3. Yelp Fusion Business Details (`/fusion/details`)
Retrieve detailed information about a business from Yelp. Businesses with no reviews will not be displayed from this endpoint. __All fields are required.__

| Keys        | Acceptable Values                                                                                                                                                                  | Type     |
|-------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------|
| `id`        | The Yelp business ID. Retrieve the ID by using the [Yelp Fusion Business Search](https://github.com/cbnventures/foodflare-api#2-yelp-fusion-business-search-fusionsearch) endpoint | `string` |
| `latitude`  | Latitude for current location                                                                                                                                                      | `number` |
| `longitude` | Longitude for current location                                                                                                                                                     | `number` |

__Usage:__
```json
{
    "id": "1A2B3C4D5E6F7G8H9I0J",
    "latitude": 40.714224,
    "longitude": -73.961452
}
```

__Example Response:__
```json
{
    "action": "FUSION_DETAILS",
    "success": true,
    "info": {
        "source": "yelp",
        "id": "1A2B3C4D5E6F7G8H9I0J",
        "name": "Awesome Food",
        "price": 2,
        "rating": 4.5,
        "review_count": 100,
        "categories": [
            {
                "tag": "juicebars",
                "name": "Juice Bars & Smoothies"
            },
            {
                "tag": "burgers",
                "name": "Burgers"
            }
        ],
        "services": [
            {
                "tag": "takeout",
                "name": "Takeout"
            },
            {
                "tag": "delivery",
                "name": "Delivery"
            }
        ],
        "address": "123 Sample Ave, Brooklyn, NY 12345",
        "coordinates": {
            "latitude": 40.71403,
            "longitude": -73.96147
        },
        "distance": 20,
        "url": "https://www.yelp.com/biz/awesome-food?adjust_creative=AAA",
        "phone": {
            "display": "(888) 000-1234",
            "raw": "+18880001234"
        },
        "hours": {
            "open_now": true,
            "open_days": [
                {
                    "day": 0,
                    "start": "1100",
                    "end": "2130",
                    "is_overnight": false
                },
                {
                    "day": 1,
                    "start": "1100",
                    "end": "2130",
                    "is_overnight": false
                },
                {
                    "day": 2,
                    "start": "1100",
                    "end": "2130",
                    "is_overnight": false
                },
                {
                    "day": 3,
                    "start": "1100",
                    "end": "2130",
                    "is_overnight": false
                },
                {
                    "day": 4,
                    "start": "1100",
                    "end": "2130",
                    "is_overnight": false
                },
                {
                    "day": 5,
                    "start": "1100",
                    "end": "2130",
                    "is_overnight": false
                },
                {
                    "day": 6,
                    "start": "1100",
                    "end": "2130",
                    "is_overnight": false
                }
            ]
        },
        "photos": [
            {
                "url": "https://yelp.com/photo-1.jpg"
            },
            {
                "url": "https://yelp.com/photo-2.jpg"
            },
            {
                "url": "https://yelp.com/photo-3.jpg"
            }
        ],
        "reviews": []
    }
}
```

### 4. Yelp Fusion Reviews (`/fusion/reviews`)
Retrieve three review excerpts from a business in Yelp. Businesses with no reviews will not be displayed from this endpoint. __All fields are required.__

| Keys | Acceptable Values                                                                                                                                                                  | Type     |
|------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------|
| `id` | The Yelp business ID. Retrieve the ID by using the [Yelp Fusion Business Search](https://github.com/cbnventures/foodflare-api#2-yelp-fusion-business-search-fusionsearch) endpoint | `string` |

__Usage:__
```json
{
    "id": "1A2B3C4D5E6F7G8H9I0J"
}
```

__Example Response:__
```json
{
    "action": "FUSION_REVIEWS",
    "success": true,
    "info": {
        "reviews": [
            {
                "text": "Lorem ipsum dolor sit a...",
                "url": "https://www.yelp.com/biz/business?adjust_creative=AAA&hrid=BBB",
                "rating": 5,
                "time": "2020-06-12T15:25:36Z",
                "user": {
                    "name": "John D.",
                    "image_url": "https://yelp.com/photo.jpg"
                }
            },
            {
                "text": "Lorem ipsum dolor sit a...",
                "url": "https://www.yelp.com/biz/business?adjust_creative=AAA&hrid=BBB",
                "rating": 5,
                "time": "2020-08-02T23:17:30Z",
                "user": {
                    "name": "Jane D.",
                    "image_url": "https://yelp.com/photo.jpg"
                }
            },
            {
                "text": "Lorem ipsum dolor sit a...",
                "url": "https://www.yelp.com/biz/business?adjust_creative=AAA&hrid=BBB",
                "rating": 5,
                "time": "2020-10-18T01:10:20Z",
                "user": {
                    "name": "Jack D.",
                    "image_url": "https://yelp.com/photo.jpg"
                }
            }
        ]
    }
}
```

### 5. Google Geocoding (`/geocode/locate`)
Convert location coordinates into their respected named locations. __All fields are required.__

| Keys        | Acceptable Values              | Type     |
|-------------|--------------------------------|----------|
| `latitude`  | Latitude for current location  | `number` |
| `longitude` | Longitude for current location | `number` |

__Usage:__
```json
{
    "latitude": 40.714224,
    "longitude": -73.961452
}
```

__Example Response:__
```json
{
    "action": "GEOCODE_LOCATE",
    "success": true,
    "info": {
        "neighborhood": "Williamsburg",
        "sublocality_level_1": "Brooklyn",
        "locality": "",
        "administrative_area_level_1": "New York",
        "country": "United States"
    }
}
```

### 6. Google Places Nearby Search (`/places/search`)
Retrieve a list of businesses from Google Places. Businesses that have a free price range will not be supported in this endpoint. __All fields are required.__

| Keys         | Acceptable Values                                                                                                         | Type       |
|--------------|---------------------------------------------------------------------------------------------------------------------------|------------|
| `term`       | The term for your Google search query                                                                                     | `string`   |
| `latitude`   | Latitude for current location                                                                                             | `number`   |
| `longitude`  | Longitude for current location                                                                                            | `number`   |
| `category`   | Filter businesses based on [these types](https://developers.google.com/places/web-service/supported_types#table1)         | `string[]` |
| `sort`       | Sort businesses by `distance`, `least_expensive`, or `most_reviewed`                                                      | `string`   |
| `price`      | Show businesses that meet these price range(s). For example, `[1, 3]` for `$`, `$$`, and `$$$`. To show all, use `[1, 4]` | `number[]` |
| `min_rating` | Show businesses that meet these minimum rating(s). For example, `3.5` for 3.5 stars or higher. To show all, use `0`       | `number`   |
| `open_now`   | Show businesses that are open right now                                                                                   | `boolean`  |

__Usage:__
```json
{
    "term": "food",
    "latitude": 40.714224,
    "longitude": -73.961452,
    "category": ["restaurant"],
    "sort": "distance",
    "price": [1, 2, 3, 4],
    "min_rating": 0,
    "open_now": true
}
```

__Example Response:__
```json
{
    "action": "PLACES_SEARCH",
    "success": true,
    "info": [
        {
            "source": "google",
            "id": "1A2B3C4D5E6F7G8H9I0J",
            "name": "Awesome Food",
            "price": 2,
            "rating": 4.5,
            "review_count": 100,
            "distance": 20
        }
    ]
}
```

### 7. Google Places Details (`/places/details`)
Retrieve detailed information about a business from Google Places. __All fields are required.__

| Keys        | Acceptable Values                                                                                                                                                                    | Type     |
|-------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------|
| `id`        | The Google business ID. Retrieve the ID by using the [Google Places Nearby Search](https://github.com/cbnventures/foodflare-api#6-google-places-nearby-search-placessearch) endpoint | `string` |
| `latitude`  | Latitude for current location                                                                                                                                                        | `number` |
| `longitude` | Longitude for current location                                                                                                                                                       | `number` |

__Usage:__
```json
{
    "id": "1A2B3C4D5E6F7G8H9I0J",
    "latitude": 40.714224,
    "longitude": -73.961452
}
```

__Example Response:__
```json
{
    "action": "PLACES_DETAILS",
    "success": true,
    "info": {
        "source": "google",
        "id": "1A2B3C4D5E6F7G8H9I0J",
        "name": "Awesome Food",
        "price": 2,
        "rating": 4.5,
        "review_count": 100,
        "categories": [
            {
                "tag": "restaurant",
                "name": "Restaurant"
            }
        ],
        "services": [
            {
                "tag": "delivery",
                "name": "Delivery"
            }
        ],
        "address": "123 Sample Ave, Brooklyn, NY 12345",
        "coordinates": {
            "latitude": 40.7140037,
            "longitude": -73.9614436
        },
        "distance": 20,
        "url": "https://maps.google.com/?cid=11111111111111111111",
        "phone": {
            "display": "(888) 000-1234",
            "raw": "+18880001234"
        },
        "hours": {
            "open_now": true,
            "open_days": [
                {
                    "day": 0,
                    "start": "1100",
                    "end": "2115",
                    "is_overnight": false
                },
                {
                    "day": 1,
                    "start": "1100",
                    "end": "2115",
                    "is_overnight": false
                },
                {
                    "day": 2,
                    "start": "1100",
                    "end": "2115",
                    "is_overnight": false
                },
                {
                    "day": 3,
                    "start": "1100",
                    "end": "2115",
                    "is_overnight": false
                },
                {
                    "day": 4,
                    "start": "1100",
                    "end": "2115",
                    "is_overnight": false
                },
                {
                    "day": 5,
                    "start": "1100",
                    "end": "2115",
                    "is_overnight": false
                },
                {
                    "day": 6,
                    "start": "1100",
                    "end": "2115",
                    "is_overnight": false
                }
            ]
        },
        "photos": [
            {
                "reference": "1A2B3C4D5E6F7G8H9I0J",
                "width": 1024,
                "height": 768
            }
        ],
        "reviews": [
            {
                "text": "Lorem ipsum dolor sit amet.",
                "url": "",
                "rating": 5,
                "time": "2020-09-09T02:13:14Z",
                "user": {
                    "name": "John Doe",
                    "image_url": "https://google.com/photo.jpg"
                }
            },
            {
                "text": "Lorem ipsum dolor sit amet.",
                "url": "",
                "rating": 5,
                "time": "2020-09-03T02:32:06Z",
                "user": {
                    "name": "Jane Doe",
                    "image_url": "https://google.com/photo.jpg"
                }
            },
            {
                "text": "Lorem ipsum dolor sit amet.",
                "url": "",
                "rating": 5,
                "time": "2020-08-25T02:17:28Z",
                "user": {
                    "name": "Jack Doe",
                    "image_url": "https://google.com/photo.jpg"
                }
            }
        ]
    }
}
```

### 8. Google Places Photo (`/places/photo`)
Retrieve a single `base64` formatted photo from Google Places. __All fields are required.__

| Keys         | Acceptable Values                                                                                                                                                               | Type     |
|--------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------|
| `reference`  | Photo reference. Retrieve the photo reference by using the [Google Places Details](https://github.com/cbnventures/foodflare-api#7-google-places-details-placesdetails) endpoint | `string` |
| `max_width`  | Photo maximum width                                                                                                                                                             | `number` |
| `max_height` | Photo maximum height                                                                                                                                                            | `number` |

__Usage:__
```json
{
    "reference": "1A2B3C4D5E6F7G8H9I0J",
    "max_width": 1024,
    "max_height": 768
}
```

__Example Response:__
```json
{
    "action": "PLACES_PHOTO",
    "success": true,
    "info": {
        "data_url": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z/C/HgAGgwJ/lK3Q6wAAAABJRU5ErkJggg=="
    }
}
```

## Error Messages
If you have received an error message, chances are that you have run into an issue. When an error occurs, the API will specify the current `action` where it received an error. Example below:

```json
{
    "action": "API_GATEWAY",
    "success": false,
    "info": {
        "status": "INVALID_API_KEY",
        "description": "Forbidden"
    }
}
```

In the error response, there are several useful factors in determining where the error occurred from:

__First__, focus on the `action` value. This helps you understand what you were doing prior to receiving the error. In this instance, it is an `API_GATEWAY` error, meaning the generated error came from AWS.

__Second__, when you see the `info` object, you will realize that errors will only include `status` and `description`. When the `description` is unavailable, it will be an empty string.
