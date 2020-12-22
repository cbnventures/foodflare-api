API Usage and Responses
========================
This documentation will explain how to make use the FoodFlare API. For every request, an [API key is required](https://github.com/cbnventures/foodflare-api#5-setup-amazon-api-key-and-usage-plan). A [session token](https://github.com/cbnventures/foodflare-api/blob/master/docs/API.md#1-generate-session-token-post-authsession) will need to be generated prior to accessing the remaining endpoints.

Every request will require a `X-Api-Key` header. All endpoints (other than the [`/auth/session`](https://github.com/cbnventures/foodflare-api/blob/master/docs/API.md#1-generate-session-token-post-authsession) endpoint) will also require a `Authorization` header.

```http
X-Api-Key: <YOUR API KEY>
Authorization: Bearer <SESSION TOKEN FROM /AUTH/SESSION>
```

### Table of Contents
1. [Generate Session Token](https://github.com/cbnventures/foodflare-api/blob/master/docs/API.md#1-generate-session-token-post-authsession)  (`POST /auth/session`)
2. [Yelp Fusion Business Search](https://github.com/cbnventures/foodflare-api/blob/master/docs/API.md#2-yelp-fusion-business-search-post-fusionsearch) (`POST /fusion/search`)
3. [Yelp Fusion Business Details](https://github.com/cbnventures/foodflare-api/blob/master/docs/API.md#3-yelp-fusion-business-details-post-fusiondetails) (`POST /fusion/details`)
4. [Yelp Fusion Reviews](https://github.com/cbnventures/foodflare-api/blob/master/docs/API.md#4-yelp-fusion-reviews-post-fusionreviews) (`POST /fusion/reviews`)
5. [Google Geocoding](https://github.com/cbnventures/foodflare-api/blob/master/docs/API.md#5-google-geocoding-post-geocodelocate) (`POST /geocode/locate`)
6. [Google Places Nearby Search](https://github.com/cbnventures/foodflare-api/blob/master/docs/API.md#6-google-places-nearby-search-post-placessearch) (`POST /places/search`)
7. [Google Places Details](https://github.com/cbnventures/foodflare-api/blob/master/docs/API.md#7-google-places-details-post-placesdetails) (`POST /places/details`)
8. [Google Places Photo](https://github.com/cbnventures/foodflare-api/blob/master/docs/API.md#8-google-places-photo-post-placesphoto) (`POST /places/photo`)

---

#### 1. Generate Session Token (`POST /auth/session`)
Generate a session token to access the other endpoints. Token expiration will follow the `JWT_EXPIRES_IN` and `JWT_MAX_AGE` environment variables. __All fields are required.__

| __Key__    | __Type__ | __Description__                                                                | __Accepted Values__ |
|------------|----------|--------------------------------------------------------------------------------|---------------------|
| `platform` | `string` | Specify what client is requesting a session token. _For basic analytics only._ | `web` or `mobile`   |

```json
{
    "platform": "mobile"
}
```

__Example Response:__

| __Key__      | __Type__ | __Description__                                                                            |
|--------------|----------|--------------------------------------------------------------------------------------------|
| `info`       | `object` | Generated response body                                                                    |
| `info.token` | `string` | The generated JWT session token for use with other endpoints in the `Authorization` header |

```json
{
    "action": "AUTHORIZATION",
    "success": true,
    "info": {
        "token": "12345"
    }
}
```

---

#### 2. Yelp Fusion Business Search (`POST /fusion/search`)
Retrieve a list of businesses from Yelp. Businesses with no reviews will not be displayed from this endpoint. __All fields are required.__

| __Key__      | __Type__   | __Description__                                                | __Accepted Values__                                                                        |
|--------------|------------|----------------------------------------------------------------|--------------------------------------------------------------------------------------------|
| `term`       | `string`   | The term for your Yelp search query                            |                                                                                            |
| `latitude`   | `number`   | Latitude for current location                                  | `-90.0` to `90.0` degrees                                                                  |
| `longitude`  | `number`   | Longitude for current location                                 | `-180.0` to `180.0` degrees                                                                |
| `category`   | `string[]` | Filter businesses based on one or more Yelp categories         | [Yelp categories list](https://www.yelp.com/developers/documentation/v3/all_category_list) |
| `sort`       | `string`   | Sort businesses by Distance, Least Expensive, or Most Reviewed | `distance`, `least_expensive`, or `most_reviewed`                                          |
| `price`      | `number[]` | Show businesses that meet these price range(s)                 | For __$__ and __$$$__, use `[1, 3]`. To show all, use `[1, 2, 3, 4]`                       |
| `min_rating` | `number`   | Show businesses that meet these minimum rating(s)              | For __3.5 stars__ or higher, use `3.5`. To show all, use `0`                               |
| `open_now`   | `boolean`  | Show businesses that are open right now                        | `true` or `false`                                                                          |

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

| __Key__                | __Type__   | __Description__                                                                 |
|------------------------|------------|---------------------------------------------------------------------------------|
| `info`                 | `object[]` | Generated response body                                                         |
| `info[x].source`       | `string`   | The queried data source. In this endpoint, the source will always return `yelp` |
| `info[x].id`           | `string`   | The Yelp business ID                                                            |
| `info[x].name`         | `string`   | The name of the business                                                        |
| `info[x].price`        | `number`   | The price level of the business                                                 |
| `info[x].rating`       | `number`   | The rating of the business                                                      |
| `info[x].review_count` | `number`   | The review count of the business                                                |
| `info[x].distance`     | `number`   | The distance of the business based on the user's location                       |

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

---

#### 3. Yelp Fusion Business Details (`POST /fusion/details`)
Retrieve detailed information about a business from Yelp. Businesses with no reviews will not be displayed from this endpoint. __All fields are required.__

| __Key__     | __Type__ | __Description__                                                                                                                                                                                                 | __Accepted Values__         |
|-------------|----------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------|
| `id`        | `string` | The Yelp business ID. Retrieve the ID by using the [Yelp Fusion Business Search](https://github.com/cbnventures/foodflare-api/blob/master/docs/API.md#2-yelp-fusion-business-search-post-fusionsearch) endpoint | Yelp business ID            |
| `latitude`  | `number` | Latitude for current location                                                                                                                                                                                   | `-90.0` to `90.0` degrees   |
| `longitude` | `number` | Longitude for current location                                                                                                                                                                                  | `-180.0` to `180.0` degrees |

```json
{
    "id": "1A2B3C4D5E6F7G8H9I0J",
    "latitude": 40.714224,
    "longitude": -73.961452
}
```

__Example Response:__

| __Key__                                | __Type__   | __Description__                                                                                                                       |
|----------------------------------------|------------|---------------------------------------------------------------------------------------------------------------------------------------|
| `info`                                 | `object`   | Generated response body                                                                                                               |
| `info.source`                          | `string`   | The queried data source. In this endpoint, the source will always return `yelp`                                                       |
| `info.id`                              | `string`   | The Yelp business ID                                                                                                                  |
| `info.name`                            | `string`   | The name of the business                                                                                                              |
| `info.price`                           | `number`   | The price level of the business                                                                                                       |
| `info.rating`                          | `number`   | The rating of the business                                                                                                            |
| `info.review_count`                    | `number`   | The review count of the business                                                                                                      |
| `info.categories`                      | `object[]` | A list of categories the business provides                                                                                            |
| `info.categories[x].tag`               | `string`   | The category tag                                                                                                                      |
| `info.categories[x].name`              | `string`   | The category name                                                                                                                     |
| `info.services`                        | `object[]` | A list of services the business provides                                                                                              |
| `info.services[x].tag`                 | `string`   | The service tag                                                                                                                       |
| `info.services[x].name`                | `string`   | The service name                                                                                                                      |
| `info.address`                         | `string`   | The address of the business                                                                                                           |
| `info.coordinates`                     | `object`   | The GPS coordinates of the business                                                                                                   |
| `info.coordinates.latitude`            | `number`   | The latitude of the business                                                                                                          |
| `info.coordinates.longitude`           | `number`   | The longitude of the business                                                                                                         |
| `info.distance`                        | `number`   | The distance of the business based on the user's location                                                                             |
| `info.url`                             | `string`   | URL of the business listing                                                                                                           |
| `info.phone`                           | `object`   | The phone number of the business                                                                                                      |
| `info.phone.display`                   | `string`   | Formatted phone number                                                                                                                |
| `info.phone.raw`                       | `string`   | Raw phone number                                                                                                                      |
| `info.hours`                           | `object`   | The hours information of the business                                                                                                 |
| `info.hours.open_now`                  | `boolean`  | Displays if a business is currently opened or closed                                                                                  |
| `info.hours.open_days`                 | `object[]` | The detailed opening hours of each day in a week                                                                                      |
| `info.hours.open_days[x].day`          | `number`   | The day of the week. From Sunday (`0`) to Saturday (`6`)                                                                              |
| `info.hours.open_days[x].start`        | `string`   | Local time shown in [24-hour clock](https://en.wikipedia.org/wiki/24-hour_clock) notation when the business starts (`0000` to `2359`) |
| `info.hours.open_days[x].end`          | `string`   | Local time shown in [24-hour clock](https://en.wikipedia.org/wiki/24-hour_clock) notation when the business ends (`0000` to `2359`)   |
| `info.hours.open_days[x].is_overnight` | `boolean`  | If the business, for that day, is open past midnight                                                                                  |
| `info.photos`                          | `object[]` | A list of photos of the business                                                                                                      |
| `info.photos[x].url`                   | `string`   | The URL of the photo location                                                                                                         |
| `info.reviews`                         | `array`    | A list of reviews for the business. _This will always be a placeholder_                                                               |

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
                "tag": "burgers",
                "name": "Burgers"
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

---

#### 4. Yelp Fusion Reviews (`POST /fusion/reviews`)
Retrieve three review excerpts from a business in Yelp. Businesses with no reviews will not be displayed from this endpoint. __All fields are required.__

| __Key__ | __Type__ | __Description__                                                                                                                                                                                                 | __Accepted Values__ |
|---------|----------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------|
| `id`    | `string` | The Yelp business ID. Retrieve the ID by using the [Yelp Fusion Business Search](https://github.com/cbnventures/foodflare-api/blob/master/docs/API.md#2-yelp-fusion-business-search-post-fusionsearch) endpoint | Yelp business ID    |

```json
{
    "id": "1A2B3C4D5E6F7G8H9I0J"
}
```

__Example Response:__

| __Key__                          | __Type__   | __Description__                             |
|----------------------------------|------------|---------------------------------------------|
| `info`                           | `object`   | Generated response body                     |
| `info.reviews`                   | `object[]` | A list of Yelp reviews of the business      |
| `info.reviews[x].text`           | `string`   | An excerpt of the review                    |
| `info.reviews[x].url`            | `string`   | The URL to view the original Yelp review    |
| `info.reviews[x].rating`         | `number`   | The rating of the review                    |
| `info.reviews[x].time`           | `string`   | The UTC time of when the review was written |
| `info.reviews[x].user`           | `object`   | The author of the review                    |
| `info.reviews[x].user.name`      | `string`   | The author name of the review               |
| `info.reviews[x].user.image_url` | `string`   | The author avatar of the review             |

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
                "time": "2020-01-01T00:00:00Z",
                "user": {
                    "name": "John D.",
                    "image_url": "https://yelp.com/photo.jpg"
                }
            },
            {
                "text": "Lorem ipsum dolor sit a...",
                "url": "https://www.yelp.com/biz/business?adjust_creative=AAA&hrid=BBB",
                "rating": 5,
                "time": "2020-01-01T00:00:00Z",
                "user": {
                    "name": "John D.",
                    "image_url": "https://yelp.com/photo.jpg"
                }
            }
        ]
    }
}
```

---

#### 5. Google Geocoding (`POST /geocode/locate`)
Convert location coordinates into their respected named locations. __All fields are required.__

| __Key__     | __Type__ | __Description__                | __Accepted Values__         |
|-------------|----------|--------------------------------|-----------------------------|
| `latitude`  | `number` | Latitude for current location  | `-90.0` to `90.0` degrees   |
| `longitude` | `number` | Longitude for current location | `-180.0` to `180.0` degrees |

```json
{
    "latitude": 40.714224,
    "longitude": -73.961452
}
```

__Example Response:__

| __Key__                            | __Type__ | __Description__                                 |
|------------------------------------|----------|-------------------------------------------------|
| `info`                             | `object` | Generated response body                         |
| `info.neighborhood`                | `string` | The neighborhood of the current location        |
| `info.sublocality_level_1`         | `string` | The sublocality of the current location         |
| `info.locality`                    | `string` | The locality of the current location            |
| `info.administrative_area_level_1` | `string` | The administrative area of the current location |
| `info.country`                     | `string` | The country of the current location             |

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

---

#### 6. Google Places Nearby Search (`POST /places/search`)
Retrieve a list of businesses from Google Places. Businesses that have a free price range will not be supported in this endpoint. __All fields are required.__

| __Key__      | __Type__   | __Description__                                                | __Accepted Values__                                                                               |
|--------------|------------|--------------------------------------------------------------- |---------------------------------------------------------------------------------------------------|
| `term`       | `string`   | The term for your Google search query                          |                                                                                                   |
| `latitude`   | `number`   | Latitude for current location                                  | `-90.0` to `90.0` degrees                                                                         |
| `longitude`  | `number`   | Longitude for current location                                 | `-180.0` to `180.0` degrees                                                                       |
| `category`   | `string[]` | Filter businesses based on one Google supported type           | [Google supported types](https://developers.google.com/places/web-service/supported_types#table1) |
| `sort`       | `string`   | Sort businesses by Distance, Least Expensive, or Most Reviewed | `distance`, `least_expensive`, or `most_reviewed`                                                 |
| `price`      | `number[]` | Show businesses that meet these price range(s)                 | For __$__ to __$$$__, use `[1, 3]`. To show all, use `[1, 2, 3, 4]`                               |
| `min_rating` | `number`   | Show businesses that meet these minimum rating(s)              | For __3.5 stars__ or higher, use `3.5`. To show all, use `0`                                      |
| `open_now`   | `boolean`  | Show businesses that are open right now                        | `true` or `false`                                                                                 |

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

| __Key__                | __Type__   | __Description__                                                                   |
|------------------------|------------|-----------------------------------------------------------------------------------|
| `info`                 | `object[]` | Generated response body                                                           |
| `info[x].source`       | `string`   | The queried data source. In this endpoint, the source will always return `google` |
| `info[x].id`           | `string`   | The Google Places ID                                                              |
| `info[x].name`         | `string`   | The name of the business                                                          |
| `info[x].price`        | `number`   | The price level of the business                                                   |
| `info[x].rating`       | `number`   | The rating of the business                                                        |
| `info[x].review_count` | `number`   | The review count of the business                                                  |
| `info[x].distance`     | `number`   | The distance of the business based on the user's location                         |

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

---

#### 7. Google Places Details (`POST /places/details`)
Retrieve detailed information about a business from Google Places. __All fields are required.__

| __Key__     | __Type__ | __Description__                                                                                                                                                                                                   | __Accepted Values__         |
|-------------|----------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------|
| `id`        | `string` | The Google Places ID. Retrieve the ID by using the [Google Places Nearby Search](https://github.com/cbnventures/foodflare-api/blob/master/docs/API.md#6-google-places-nearby-search-post-placessearch) endpoint   | Google Places ID            |
| `latitude`  | `number` | Latitude for current location                                                                                                                                                                                     | `-90.0` to `90.0` degrees   |
| `longitude` | `number` | Longitude for current location                                                                                                                                                                                    | `-180.0` to `180.0` degrees |

```json
{
    "id": "1A2B3C4D5E6F7G8H9I0J",
    "latitude": 40.714224,
    "longitude": -73.961452
}
```

__Example Response:__

| __Key__                                | __Type__   | __Description__                                                                                                                                                                           |
|----------------------------------------|------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `info`                                 | `object`   | Generated response body                                                                                                                                                                   |
| `info.source`                          | `string`   | The queried data source. In this endpoint, the source will always return `google`                                                                                                         |
| `info.id`                              | `string`   | The Google Places ID                                                                                                                                                                      |
| `info.name`                            | `string`   | The name of the business                                                                                                                                                                  |
| `info.price`                           | `number`   | The price level of the business                                                                                                                                                           |
| `info.rating`                          | `number`   | The rating of the business                                                                                                                                                                |
| `info.review_count`                    | `number`   | The review count of the business                                                                                                                                                          |
| `info.categories`                      | `object[]` | A list of categories the business provides                                                                                                                                                |
| `info.categories[x].tag`               | `string`   | The category tag                                                                                                                                                                          |
| `info.categories[x].name`              | `string`   | The category name                                                                                                                                                                         |
| `info.services`                        | `object[]` | A list of services the business provides                                                                                                                                                  |
| `info.services[x].tag`                 | `string`   | The service tag                                                                                                                                                                           |
| `info.services[x].name`                | `string`   | The service name                                                                                                                                                                          |
| `info.address`                         | `string`   | The address of the business                                                                                                                                                               |
| `info.coordinates`                     | `object`   | The GPS coordinates of the business                                                                                                                                                       |
| `info.coordinates.latitude`            | `number`   | The latitude of the business                                                                                                                                                              |
| `info.coordinates.longitude`           | `number`   | The longitude of the business                                                                                                                                                             |
| `info.distance`                        | `number`   | The distance of the business based on the user's location                                                                                                                                 |
| `info.url`                             | `string`   | URL of the business listing                                                                                                                                                               |
| `info.phone`                           | `object`   | The phone number of the business                                                                                                                                                          |
| `info.phone.display`                   | `string`   | Formatted phone number                                                                                                                                                                    |
| `info.phone.raw`                       | `string`   | Raw phone number                                                                                                                                                                          |
| `info.hours`                           | `object`   | The hours information of the business                                                                                                                                                     |
| `info.hours.open_now`                  | `boolean`  | Displays if a business is currently opened or closed                                                                                                                                      |
| `info.hours.open_days`                 | `object[]` | The detailed opening hours of each day in a week                                                                                                                                          |
| `info.hours.open_days[x].day`          | `number`   | The day of the week. From Sunday (`0`) to Saturday (`6`)                                                                                                                                  |
| `info.hours.open_days[x].start`        | `string`   | Local time shown in [24-hour clock](https://en.wikipedia.org/wiki/24-hour_clock) notation when the business starts (`0000` to `2359`)                                                     |
| `info.hours.open_days[x].end`          | `string`   | Local time shown in [24-hour clock](https://en.wikipedia.org/wiki/24-hour_clock) notation when the business ends (`0000` to `2359`)                                                       |
| `info.hours.open_days[x].is_overnight` | `boolean`  | If the business, for that day, is open past midnight                                                                                                                                      |
| `info.photos`                          | `object[]` | A list of photos of the business                                                                                                                                                          |
| `info.photos[x].reference`             | `string`   | A reference ID to retrieve the photo from the [Google Places Photo](https://github.com/cbnventures/foodflare-api/blob/master/docs/API.md#8-google-places-photo-post-placesphoto) endpoint |
| `info.photos[x].width`                 | `number`   | Photo maximum width                                                                                                                                                                       |
| `info.photos[x].height`                | `number`   | Photo maximum height                                                                                                                                                                      |
| `info.reviews`                         | `object[]` | A list of reviews for the business                                                                                                                                                        |
| `info.reviews[x].text`                 | `string`   | An excerpt of the review                                                                                                                                                                  |
| `info.reviews[x].url`                  | `string`   | The URL to view the original Google Places review. _This will always be an empty string_                                                                                                  |
| `info.reviews[x].rating`               | `number`   | The rating of the review                                                                                                                                                                  |
| `info.reviews[x].time`                 | `string`   | The UTC time of when the review was written                                                                                                                                               |
| `info.reviews[x].user`                 | `object`   | The author of the review                                                                                                                                                                  |
| `info.reviews[x].user.name`            | `string`   | The author name of the review                                                                                                                                                             |
| `info.reviews[x].user.image_url`       | `string`   | The author avatar of the review                                                                                                                                                           |

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
            }
        ]
    }
}
```

---

#### 8. Google Places Photo (`POST /places/photo`)
Retrieve a single `base64` formatted photo from Google Places. __All fields are required.__

| __Key__      | __Type__ | __Description__                                                                                                                                                                                              | __Accepted Values__  |
|--------------|----------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------|
| `reference`  | `string` | Photo reference. Retrieve the photo reference by using the [Google Places Details](https://github.com/cbnventures/foodflare-api/blob/master/docs/API.md#7-google-places-details-post-placesdetails) endpoint | Photo reference ID   |
| `max_width`  | `number` | Photo maximum width                                                                                                                                                                                          | `1` to `1600` pixels |
| `max_height` | `number` | Photo maximum height                                                                                                                                                                                         | `1` to `1600` pixels |

```json
{
    "reference": "1A2B3C4D5E6F7G8H9I0J",
    "max_width": 1024,
    "max_height": 768
}
```

__Example Response:__

| __Key__         | __Type__ | __Description__                                       |
|-----------------|----------|-------------------------------------------------------|
| `info`          | `object` | Generated response body                               |
| `info.data_url` | `string` | The `base64` encoded data URL for the requested photo |

```json
{
    "action": "PLACES_PHOTO",
    "success": true,
    "info": {
        "data_url": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z/C/HgAGgwJ/lK3Q6wAAAABJRU5ErkJggg=="
    }
}
```
