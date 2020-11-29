const axios = require('axios').default;
const jwt = require('jsonwebtoken');

const api = require('../index');

/**
 * Route handlers.
 *
 * @since 1.0.0
 */
describe('Route handlers', () => {
  let lambdaContext;
  let proxyRouterEvent;
  let responseCallback;
  let payloadObject;
  let axiosResponse;
  let consoleLogCount;
  let result;

  /**
   * Before each test.
   *
   * @since 1.0.0
   */
  beforeEach(() => {
    // Tracked/spied functions.
    console.error = jasmine.createSpy('error');
    console.log = jasmine.createSpy('log');
    lambdaContext = jasmine.createSpyObj('lambdaContext', ['done']);

    // Route to resource path.
    proxyRouterEvent = {
      requestContext: {
        resourcePath: '',
        httpMethod: 'POST',
        identity: {
          sourceIp: '1.1.1.1',
          userAgent: 'chrome',
        },
      },
      body: '',
    };

    // The response callback.
    responseCallback = {
      statusCode: 100,
      headers: {
        'Content-Type': 'application/json',
      },
      body: '',
    };
  });

  /**
   * Check for success response.
   *
   * @since 1.0.0
   */
  describe('Check for success response', () => {
    let successResponse;
    let bufferOutput;
    let jwtToken;

    /**
     * Define tests.
     *
     * @since 1.0.0
     */
    const validRequests = [
      {
        route: '/auth/session',
        test: 'payload with "app" as identifier',
        expect: 'a token',
        payload: {
          type: 'app',
        },
        types: ['empty', 'malicious', 'auth'],
        axiosHeaders: null,
        axiosData: null,
        bufferOutput: null,
        jwtToken: '12345',
        responseAction: 'AUTHORIZATION',
        responseData: { token: '12345' },
      },
      {
        route: '/auth/session',
        test: 'payload with "web" as identifier',
        expect: 'a token',
        payload: {
          type: 'web',
        },
        types: ['empty', 'malicious', 'auth'],
        axiosHeaders: null,
        axiosData: null,
        bufferOutput: null,
        jwtToken: '12345',
        responseAction: 'AUTHORIZATION',
        responseData: { token: '12345' },
      },
      {
        route: '/fusion/search',
        test: 'payload with search request sorted by "distance" with a minimum rating of 3',
        expect: 'a set of businesses sorted by "distance" with a minimum rating of 3',
        payload: {
          term: 'food',
          latitude: 40.714224,
          longitude: -73.961452,
          category: ['restaurant'],
          sort: 'distance',
          price: [1, 2, 3, 4],
          min_rating: 3,
          open_now: true,
        },
        types: ['empty', 'malicious', 'coordinates', 'search', 'fusion-search'],
        axiosHeaders: null,
        axiosData: {
          businesses: [
            {
              id: '11111111111111111111',
              name: 'Restaurant A',
              review_count: 516,
              rating: 2.5,
              coordinates: {
                latitude: 40.713795,
                longitude: -73.961983,
              },
              price: '$',
            },
            {
              id: '22222222222222222222',
              name: 'Restaurant B',
              review_count: 137,
              rating: 4.5,
              coordinates: {
                latitude: 40.71258,
                longitude: -73.96045,
              },
              price: '$$',
            },
            {
              id: '33333333333333333333',
              name: 'Restaurant C',
              review_count: 163,
              rating: 4.5,
              coordinates: {
                latitude: 40.71403,
                longitude: -73.96147,
              },
              price: '$$',
            },
          ],
        },
        bufferOutput: null,
        jwtToken: null,
        responseAction: 'FUSION_SEARCH',
        responseData: [
          {
            source: 'yelp',
            id: '33333333333333333333',
            name: 'Restaurant C',
            price: 2,
            rating: 4.5,
            review_count: 163,
            distance: 16.4210950155253,
          },
          {
            source: 'yelp',
            id: '22222222222222222222',
            name: 'Restaurant B',
            price: 2,
            rating: 4.5,
            review_count: 137,
            distance: 162.27058560044316,
          },
        ],
      },
      {
        route: '/fusion/search',
        test: 'payload with search request sorted by "least_expensive" with a minimum rating of 3',
        expect: 'a set of businesses sorted by "least_expensive" with a minimum rating of 3',
        payload: {
          term: 'food',
          latitude: 40.714224,
          longitude: -73.961452,
          category: ['restaurant'],
          sort: 'least_expensive',
          price: [1, 2, 3, 4],
          min_rating: 3,
          open_now: true,
        },
        types: ['empty', 'malicious', 'coordinates', 'search', 'fusion-search'],
        axiosHeaders: null,
        axiosData: {
          businesses: [
            {
              id: '44444444444444444444',
              name: 'Restaurant D',
              review_count: 33,
              rating: 4.5,
              coordinates: {
                latitude: 40.7128339,
                longitude: -73.9663587,
              },
              price: '$$',
            },
            {
              id: '55555555555555555555',
              name: 'Restaurant E',
              review_count: 621,
              rating: 2.0,
              coordinates: {
                latitude: 40.717772,
                longitude: -73.957384,
              },
              price: '$',
            },
            {
              id: '66666666666666666666',
              name: 'Restaurant F',
              review_count: 192,
              rating: 4.0,
              coordinates: {
                latitude: 40.71439,
                longitude: -73.9607,
              },
              price: '$$',
            },
          ],
        },
        bufferOutput: null,
        jwtToken: null,
        responseAction: 'FUSION_SEARCH',
        responseData: [
          {
            source: 'yelp',
            id: '66666666666666666666',
            name: 'Restaurant F',
            price: 2,
            rating: 4,
            review_count: 192,
            distance: 64.9063451105828,
          },
          {
            source: 'yelp',
            id: '44444444444444444444',
            name: 'Restaurant D',
            price: 2,
            rating: 4.5,
            review_count: 33,
            distance: 429.83035594055974,
          },
        ],
      },
      {
        route: '/fusion/search',
        test: 'payload with search request sorted by "most_reviewed" with a minimum rating of 3',
        expect: 'a set of businesses sorted by "most_reviewed" with a minimum rating of 3',
        payload: {
          term: 'food',
          latitude: 40.714224,
          longitude: -73.961452,
          category: ['restaurant'],
          sort: 'most_reviewed',
          price: [1, 2, 3, 4],
          min_rating: 3,
          open_now: true,
        },
        types: ['empty', 'malicious', 'coordinates', 'search', 'fusion-search'],
        axiosHeaders: null,
        axiosData: {
          businesses: [
            {
              id: '77777777777777777777',
              name: 'Restaurant G',
              review_count: 59,
              rating: 4.5,
              coordinates: {
                latitude: 40.7148695,
                longitude: -73.9625803,
              },
              price: '$$',
            },
            {
              id: '88888888888888888888',
              name: 'Restaurant H',
              review_count: 106,
              rating: 2.5,
              coordinates: {
                latitude: 40.7134488,
                longitude: -73.9513445,
              },
              price: '$$',
            },
            {
              id: '99999999999999999999',
              name: 'Restaurant I',
              review_count: 520,
              rating: 4.5,
              coordinates: {
                latitude: 40.71162,
                longitude: -73.95783,
              },
              price: '$',
            },
          ],
        },
        bufferOutput: null,
        jwtToken: null,
        responseAction: 'FUSION_SEARCH',
        responseData: [
          {
            source: 'yelp',
            id: '99999999999999999999',
            name: 'Restaurant I',
            price: 1,
            rating: 4.5,
            review_count: 520,
            distance: 375.9846688950322,
          },
          {
            source: 'yelp',
            id: '77777777777777777777',
            name: 'Restaurant G',
            price: 2,
            rating: 4.5,
            review_count: 59,
            distance: 109.55824783264184,
          },
        ],
      },
      {
        route: '/fusion/details',
        test: 'payload with a business details request that is always open',
        expect: 'a business that is always open',
        payload: {
          id: 'ABC123',
          latitude: 40.714224,
          longitude: -73.961452,
        },
        types: ['empty', 'malicious', 'coordinates', 'details', 'fusion-details'],
        axiosHeaders: null,
        axiosData: {
          id: '11111111111111111111',
          name: 'Business A',
          url: 'https://www.yelp.com/biz/business-a?adjust_creative=AAA&utm_campaign=BBB&hello=world&utm_medium=CCC&utm_source=DDD',
          phone: '+18880001234',
          display_phone: '(888) 000-1234',
          review_count: 100,
          categories: [
            {
              alias: 'cat',
              title: 'Category A',
            },
            {
              alias: 'kitty',
              title: 'Category B',
            },
          ],
          rating: 4.5,
          location: {
            display_address: [
              '123 Sample Ave',
              'Brooklyn, NY 12345',
            ],
          },
          coordinates: {
            latitude: 40.71403,
            longitude: -73.96147,
          },
          photos: [
            'https://yelp.com/photo-1.jpg',
            'https://yelp.com/photo-2.jpg',
            'https://yelp.com/photo-3.jpg',
          ],
          price: '$$',
          hours: [
            {
              open: [
                {
                  is_overnight: true,
                  start: '0000',
                  end: '0000',
                  day: 0,
                },
                {
                  is_overnight: true,
                  start: '0000',
                  end: '0000',
                  day: 1,
                },
                {
                  is_overnight: true,
                  start: '0000',
                  end: '0000',
                  day: 2,
                },
                {
                  is_overnight: true,
                  start: '0000',
                  end: '0000',
                  day: 3,
                },
                {
                  is_overnight: true,
                  start: '0000',
                  end: '0000',
                  day: 4,
                },
                {
                  is_overnight: true,
                  start: '0000',
                  end: '0000',
                  day: 5,
                },
                {
                  is_overnight: true,
                  start: '0900',
                  end: '0300',
                  day: 6,
                },
              ],
              is_open_now: true,
            },
          ],
          transactions: [
            'pickup',
            'delivery',
          ],
        },
        bufferOutput: null,
        jwtToken: null,
        responseAction: 'FUSION_DETAILS',
        responseData: {
          source: 'yelp',
          id: '11111111111111111111',
          name: 'Business A',
          price: 2,
          rating: 4.5,
          review_count: 100,
          categories: [
            {
              tag: 'cat',
              name: 'Category A',
            },
            {
              tag: 'kitty',
              name: 'Category B',
            },
          ],
          services: [
            {
              tag: 'takeout',
              name: 'Takeout',
            },
            {
              tag: 'delivery',
              name: 'Delivery',
            },
          ],
          address: '123 Sample Ave, Brooklyn, NY 12345',
          coordinates: {
            latitude: 40.71403,
            longitude: -73.96147,
          },
          distance: 16.4210950155253,
          url: 'https://www.yelp.com/biz/business-a?adjust_creative=AAA&hello=world',
          phone: {
            display: '(888) 000-1234',
            raw: '+18880001234',
          },
          hours: {
            open_now: true,
            open_days: [
              {
                day: 0,
                start: '0900',
                end: '0300',
                is_overnight: true,
              },
              {
                day: 1,
                start: '0000',
                end: '0000',
                is_overnight: true,
              },
              {
                day: 2,
                start: '0000',
                end: '0000',
                is_overnight: true,
              },
              {
                day: 3,
                start: '0000',
                end: '0000',
                is_overnight: true,
              },
              {
                day: 4,
                start: '0000',
                end: '0000',
                is_overnight: true,
              },
              {
                day: 5,
                start: '0000',
                end: '0000',
                is_overnight: true,
              },
              {
                day: 6,
                start: '0000',
                end: '0000',
                is_overnight: true,
              },
            ],
          },
          photos: [
            {
              url: 'https://yelp.com/photo-1.jpg',
            },
            {
              url: 'https://yelp.com/photo-2.jpg',
            },
            {
              url: 'https://yelp.com/photo-3.jpg',
            },
          ],
          reviews: [],
        },
      },
      {
        route: '/fusion/details',
        test: 'payload with a business details request that has mixed hours',
        expect: 'a business with mixed hours',
        payload: {
          id: 'ABC123',
          latitude: 40.714224,
          longitude: -73.961452,
        },
        types: ['empty', 'malicious', 'coordinates', 'details', 'fusion-details'],
        axiosHeaders: null,
        axiosData: {
          id: '22222222222222222222',
          name: 'Business B',
          url: 'https://www.yelp.com/biz/business-b?adjust_creative=AAA&utm_campaign=BBB&hello=world&utm_medium=CCC&utm_source=DDD',
          phone: '+18880001234',
          display_phone: '(888) 000-1234',
          review_count: 100,
          categories: [
            {
              alias: 'cat',
              title: 'Category A',
            },
            {
              alias: 'kitty',
              title: 'Category B',
            },
          ],
          rating: 4.5,
          location: {
            display_address: [
              '123 Sample Ave',
              'Brooklyn, NY 12345',
            ],
          },
          coordinates: {
            latitude: 40.71403,
            longitude: -73.96147,
          },
          photos: [
            'https://yelp.com/photo-1.jpg',
            'https://yelp.com/photo-2.jpg',
            'https://yelp.com/photo-3.jpg',
          ],
          price: '$$',
          hours: [
            {
              open: [
                {
                  is_overnight: true,
                  start: '1000',
                  end: '0300',
                  day: 0,
                },
                {
                  is_overnight: true,
                  start: '0000',
                  end: '0000',
                  day: 1,
                },
                {
                  is_overnight: true,
                  start: '0000',
                  end: '0000',
                  day: 2,
                },
                {
                  is_overnight: true,
                  start: '0000',
                  end: '0000',
                  day: 3,
                },
                {
                  is_overnight: false,
                  start: '0000',
                  end: '0700',
                  day: 4,
                },
                {
                  is_overnight: false,
                  start: '0900',
                  end: '1700',
                  day: 4,
                },
                {
                  is_overnight: true,
                  start: '0000',
                  end: '0000',
                  day: 5,
                },
                {
                  is_overnight: false,
                  start: '0000',
                  end: '0700',
                  day: 6,
                },
                {
                  is_overnight: false,
                  start: '0900',
                  end: '1700',
                  day: 6,
                },
              ],
              is_open_now: true,
            },
          ],
          transactions: [
            'pickup',
            'delivery',
          ],
        },
        bufferOutput: null,
        jwtToken: null,
        responseAction: 'FUSION_DETAILS',
        responseData: {
          source: 'yelp',
          id: '22222222222222222222',
          name: 'Business B',
          price: 2,
          rating: 4.5,
          review_count: 100,
          categories: [
            {
              tag: 'cat',
              name: 'Category A',
            },
            {
              tag: 'kitty',
              name: 'Category B',
            },
          ],
          services: [
            {
              tag: 'takeout',
              name: 'Takeout',
            },
            {
              tag: 'delivery',
              name: 'Delivery',
            },
          ],
          address: '123 Sample Ave, Brooklyn, NY 12345',
          coordinates: {
            latitude: 40.71403,
            longitude: -73.96147,
          },
          distance: 16.4210950155253,
          url: 'https://www.yelp.com/biz/business-b?adjust_creative=AAA&hello=world',
          phone: {
            display: '(888) 000-1234',
            raw: '+18880001234',
          },
          hours: {
            open_now: true,
            open_days: [
              {
                day: 0,
                start: '0000',
                end: '0700',
                is_overnight: false,
              },
              {
                day: 0,
                start: '0900',
                end: '1700',
                is_overnight: false,
              },
              {
                day: 1,
                start: '1000',
                end: '0300',
                is_overnight: true,
              },
              {
                day: 2,
                start: '0000',
                end: '0000',
                is_overnight: true,
              },
              {
                day: 3,
                start: '0000',
                end: '0000',
                is_overnight: true,
              },
              {
                day: 4,
                start: '0000',
                end: '0000',
                is_overnight: true,
              },
              {
                day: 5,
                start: '0000',
                end: '0700',
                is_overnight: false,
              },
              {
                day: 5,
                start: '0900',
                end: '1700',
                is_overnight: false,
              },
              {
                day: 6,
                start: '0000',
                end: '0000',
                is_overnight: true,
              },
            ],
          },
          photos: [
            {
              url: 'https://yelp.com/photo-1.jpg',
            },
            {
              url: 'https://yelp.com/photo-2.jpg',
            },
            {
              url: 'https://yelp.com/photo-3.jpg',
            },
          ],
          reviews: [],
        },
      },
      {
        route: '/fusion/reviews',
        test: 'payload with reviews request',
        expect: 'a set of reviews',
        payload: {
          id: 'ABC123',
        },
        types: ['empty', 'malicious', 'reviews', 'fusion-reviews'],
        axiosHeaders: null,
        axiosData: {
          reviews: [
            {
              url: 'https://www.yelp.com/biz/business?adjust_creative=AAA&hrid=BBB&utm_campaign=CCC&hello=world&utm_medium=DDD&utm_source=EEE',
              text: 'Lorem ipsum dolor sit amet...',
              rating: 1,
              time_created: '2020-01-08 09:26:24',
              user: {
                image_url: 'https://yelp.com/photo.jpg',
                name: 'John D.',
              },
            },
            {
              url: 'https://www.yelp.com/biz/business?adjust_creative=AAA&hrid=BBB&utm_campaign=CCC&hello=world&utm_medium=DDD&utm_source=EEE',
              text: 'Lorem ipsum dolor sit amet...',
              rating: 3,
              time_created: '2020-04-16 08:20:26',
              user: {
                image_url: 'https://yelp.com/photo.jpg',
                name: 'Jane D.',
              },
            },
            {
              url: 'https://www.yelp.com/biz/business?adjust_creative=AAA&hrid=BBB&utm_campaign=CCC&hello=world&utm_medium=DDD&utm_source=EEE',
              text: 'Lorem ipsum dolor sit amet...',
              rating: 5,
              time_created: '2019-12-09 17:04:44',
              user: {
                image_url: 'https://yelp.com/photo.jpg',
                name: 'Jack D.',
              },
            },
          ],
        },
        bufferOutput: null,
        jwtToken: null,
        responseAction: 'FUSION_REVIEWS',
        responseData: {
          reviews: [
            {
              text: 'Lorem ipsum dolor sit amet...',
              url: 'https://www.yelp.com/biz/business?adjust_creative=AAA&hrid=BBB&hello=world',
              rating: 1,
              time: '2020-01-08T17:26:24Z',
              user: {
                name: 'John D.',
                image_url: 'https://yelp.com/photo.jpg',
              },
            },
            {
              text: 'Lorem ipsum dolor sit amet...',
              url: 'https://www.yelp.com/biz/business?adjust_creative=AAA&hrid=BBB&hello=world',
              rating: 3,
              time: '2020-04-16T15:20:26Z',
              user: {
                name: 'Jane D.',
                image_url: 'https://yelp.com/photo.jpg',
              },
            },
            {
              text: 'Lorem ipsum dolor sit amet...',
              url: 'https://www.yelp.com/biz/business?adjust_creative=AAA&hrid=BBB&hello=world',
              rating: 5,
              time: '2019-12-10T01:04:44Z',
              user: {
                name: 'Jack D.',
                image_url: 'https://yelp.com/photo.jpg',
              },
            },
          ],
        },
      },
      {
        route: '/geocode/locate',
        test: 'payload with negative coordinates',
        expect: 'an empty response',
        payload: {
          latitude: -90,
          longitude: -180,
        },
        types: ['empty', 'malicious', 'coordinates', 'geocode-locate'],
        axiosHeaders: null,
        axiosData: { status: 'OK' },
        bufferOutput: null,
        jwtToken: null,
        responseAction: 'GEOCODE_LOCATE',
        responseData: {},
      },
      {
        route: '/geocode/locate',
        test: 'payload with positive coordinates',
        expect: 'an empty response',
        payload: {
          latitude: 90,
          longitude: 180,
        },
        types: ['empty', 'malicious', 'coordinates', 'geocode-locate'],
        axiosHeaders: null,
        axiosData: { status: 'OK' },
        bufferOutput: null,
        jwtToken: null,
        responseAction: 'GEOCODE_LOCATE',
        responseData: {},
      },
      {
        route: '/geocode/locate',
        test: 'payload with center coordinates and sample address components',
        expect: 'an set of filtered address components',
        payload: {
          latitude: 0,
          longitude: 0,
        },
        types: ['empty', 'malicious', 'coordinates', 'geocode-locate'],
        axiosHeaders: null,
        axiosData: {
          results: [
            {
              address_components: [
                {
                  long_name: '277',
                  short_name: '277',
                  types: [
                    'street_number',
                  ],
                },
                {
                  long_name: 'Bedford Avenue',
                  short_name: 'Bedford Ave',
                  types: [
                    'route',
                  ],
                },
                {
                  long_name: 'Williamsburg',
                  short_name: 'Williamsburg',
                  types: [
                    'neighborhood',
                    'political',
                  ],
                },
                {
                  long_name: 'Brooklyn',
                  short_name: 'Brooklyn',
                  types: [
                    'political',
                    'sublocality',
                    'sublocality_level_1',
                  ],
                },
                {
                  long_name: 'Kings County',
                  short_name: 'Kings County',
                  types: [
                    'administrative_area_level_2',
                    'political',
                  ],
                },
                {
                  long_name: 'New York',
                  short_name: 'NY',
                  types: [
                    'administrative_area_level_1',
                    'political',
                  ],
                },
                {
                  long_name: 'United States',
                  short_name: 'US',
                  types: [
                    'country',
                    'political',
                  ],
                },
                {
                  long_name: '11211',
                  short_name: '11211',
                  types: [
                    'postal_code',
                  ],
                },
              ],
            },
          ],
          status: 'OK',
        },
        bufferOutput: null,
        jwtToken: null,
        responseAction: 'GEOCODE_LOCATE',
        responseData: {
          neighborhood: 'Williamsburg',
          sublocality_level_1: 'Brooklyn',
          administrative_area_level_1: 'New York',
          country: 'United States',
        },
      },
      {
        route: '/places/search',
        test: 'payload with search request sorted by "distance" with a minimum rating of 3',
        expect: 'a set of places sorted by "distance" with a minimum rating of 3',
        payload: {
          term: 'food',
          latitude: 40.714224,
          longitude: -73.961452,
          category: ['restaurant'],
          sort: 'distance',
          price: [1, 2, 3, 4],
          min_rating: 3,
          open_now: true,
        },
        types: ['empty', 'malicious', 'coordinates', 'search', 'places-search'],
        axiosHeaders: null,
        axiosData: {
          results: [
            {
              geometry: {
                location: {
                  lat: 40.7142687,
                  lng: -73.96166459999999,
                },
              },
              name: 'Restaurant A',
              place_id: '111111111111111111111111111',
              price_level: 3,
              rating: 4.6,
              user_ratings_total: 1135,
            },
            {
              geometry: {
                location: {
                  lat: 40.7143529,
                  lng: -73.96125239999999,
                },
              },
              name: 'Restaurant B',
              place_id: '222222222222222222222222222',
              price_level: 1,
              rating: 2.8,
              user_ratings_total: 96,
            },
            {
              geometry: {
                location: {
                  lat: 40.7140037,
                  lng: -73.9614436,
                },
              },
              name: 'Restaurant C',
              place_id: '333333333333333333333333333',
              price_level: 2,
              rating: 4.5,
              user_ratings_total: 150,
            },
          ],
          status: 'OK',
        },
        bufferOutput: null,
        jwtToken: null,
        responseAction: 'PLACES_SEARCH',
        responseData: [
          {
            source: 'google',
            id: '111111111111111111111111111',
            name: 'Restaurant A',
            price: 3,
            rating: 4.6,
            review_count: 1135,
            distance: 18.310269672965283,
          },
          {
            source: 'google',
            id: '333333333333333333333333333',
            name: 'Restaurant C',
            price: 2,
            rating: 4.5,
            review_count: 150,
            distance: 18.580999538944226,
          },
        ],
      },
      {
        route: '/places/search',
        test: 'payload with search request sorted by "least_expensive" with a minimum rating of 3',
        expect: 'a set of places sorted by "least_expensive" with a minimum rating of 3',
        payload: {
          term: 'food',
          latitude: 40.714224,
          longitude: -73.961452,
          category: ['restaurant'],
          sort: 'least_expensive',
          price: [1, 2, 3, 4],
          min_rating: 3,
          open_now: true,
        },
        types: ['empty', 'malicious', 'coordinates', 'search', 'places-search'],
        axiosHeaders: null,
        axiosData: {
          results: [
            {
              geometry: {
                location: {
                  lat: 40.7139811,
                  lng: -73.9613801,
                },
              },
              name: 'Restaurant D',
              place_id: '444444444444444444444444444',
              price_level: 1,
              rating: 4.3,
              user_ratings_total: 116,
            },
            {
              geometry: {
                location: {
                  lat: 40.7144292,
                  lng: -73.9607618,
                },
              },
              name: 'Restaurant E',
              place_id: '555555555555555555555555555',
              price_level: 2,
              rating: 2.2,
              user_ratings_total: 270,
            },
            {
              geometry: {
                location: {
                  lat: 40.7138022,
                  lng: -73.96196209999999,
                },
              },
              name: 'Restaurant F',
              place_id: '666666666666666666666666666',
              price_level: 1,
              rating: 4.3,
              user_ratings_total: 810,
            },
          ],
          status: 'OK',
        },
        bufferOutput: null,
        jwtToken: null,
        responseAction: 'PLACES_SEARCH',
        responseData: [
          {
            source: 'google',
            id: '444444444444444444444444444',
            name: 'Restaurant D',
            price: 1,
            rating: 4.3,
            review_count: 116,
            distance: 21.350362784723185,
          },
          {
            source: 'google',
            id: '666666666666666666666666666',
            name: 'Restaurant F',
            price: 1,
            rating: 4.3,
            review_count: 810,
            distance: 55.7872471669158,
          },
        ],
      },
      {
        route: '/places/search',
        test: 'payload with search request sorted by "most_reviewed" with a minimum rating of 3',
        expect: 'a set of places sorted by "most_reviewed" with a minimum rating of 3',
        payload: {
          term: 'food',
          latitude: 40.714224,
          longitude: -73.961452,
          category: ['restaurant'],
          sort: 'most_reviewed',
          price: [1, 2, 3, 4],
          min_rating: 3,
          open_now: true,
        },
        types: ['empty', 'malicious', 'coordinates', 'search', 'places-search'],
        axiosHeaders: null,
        axiosData: {
          results: [
            {
              geometry: {
                location: {
                  lat: 40.7143448,
                  lng: -73.96050769999999,
                },
              },
              name: 'Restaurant G',
              place_id: '777777777777777777777777777',
              price_level: 2,
              rating: 4.4,
              user_ratings_total: 500,
            },
            {
              geometry: {
                location: {
                  lat: 40.7136369,
                  lng: -73.9622261,
                },
              },
              name: 'Restaurant H',
              place_id: '888888888888888888888888888',
              price_level: 2,
              rating: 2.9,
              user_ratings_total: 62,
            },
            {
              geometry: {
                location: {
                  lat: 40.7133009,
                  lng: -73.9619098,
                },
              },
              name: 'Restaurant I',
              place_id: '999999999999999999999999999',
              price_level: 2,
              rating: 4.2,
              user_ratings_total: 89,
            },
          ],
          status: 'OK',
        },
        bufferOutput: null,
        jwtToken: null,
        responseAction: 'PLACES_SEARCH',
        responseData: [
          {
            source: 'google',
            id: '777777777777777777777777777',
            name: 'Restaurant G',
            price: 2,
            rating: 4.4,
            review_count: 500,
            distance: 80.23665380882964,
          },
          {
            source: 'google',
            id: '999999999999999999999999999',
            name: 'Restaurant I',
            price: 2,
            rating: 4.2,
            review_count: 89,
            distance: 86.84426893665658,
          },
        ],
      },
      {
        route: '/places/details',
        test: 'payload with a business details request that is always open',
        expect: 'a business that is always open',
        payload: {
          id: 'ABC123',
          latitude: 40.714224,
          longitude: -73.961452,
        },
        types: ['empty', 'malicious', 'coordinates', 'details', 'places-details'],
        axiosHeaders: null,
        axiosData: {
          result: {
            formatted_address: '123 Sample Ave, Brooklyn, NY 12345, USA',
            formatted_phone_number: '(888) 000-1234',
            geometry: {
              location: {
                lat: 40.7140037,
                lng: -73.9614436,
              },
            },
            international_phone_number: '+1 888-000-1234',
            name: 'Business A',
            opening_hours: {
              open_now: true,
              periods: [
                {
                  open: {
                    day: 0,
                    time: '0000',
                  },
                },
              ],
            },
            photos: [
              {
                height: 256,
                photo_reference: 'AAA',
                width: 256,
              },
              {
                height: 512,
                photo_reference: 'BBB',
                width: 512,
              },
              {
                height: 1024,
                photo_reference: 'CCC',
                width: 1024,
              },
            ],
            place_id: '11111111111111111111',
            price_level: 2,
            rating: 4.5,
            reviews: [
              {
                author_name: 'John Doe',
                profile_photo_url: 'https://google.com/photo.jpg',
                rating: 3,
                text: 'Lorem ipsum dolor sit amet.',
                time: 1584054117,
              },
              {
                author_name: 'Jane Doe',
                profile_photo_url: 'https://google.com/photo.jpg',
                rating: 5,
                text: 'Lorem ipsum dolor sit amet.',
                time: 1590267484,
              },
              {
                author_name: 'Jack Doe',
                profile_photo_url: 'https://google.com/photo.jpg',
                rating: 5,
                text: 'Lorem ipsum dolor sit amet.',
                time: 1583000246,
              },
            ],
            types: [
              'meal_delivery',
              'meal_takeaway',
              'bakery',
              'bar',
              'cafe',
              'night_club',
              'restaurant',
              'food',
              'point_of_interest',
              'establishment',
            ],
            url: 'https://maps.google.com/?cid=11111111111111111111',
            user_ratings_total: 100,
          },
          status: 'OK',
        },
        bufferOutput: null,
        jwtToken: null,
        responseAction: 'PLACES_DETAILS',
        responseData: {
          source: 'google',
          id: '11111111111111111111',
          name: 'Business A',
          price: 2,
          rating: 4.5,
          review_count: 100,
          categories: [
            {
              tag: 'bakery',
              name: 'Bakery',
            },
            {
              tag: 'bar',
              name: 'Bar',
            },
            {
              tag: 'cafe',
              name: 'Cafe',
            },
            {
              tag: 'night_club',
              name: 'Night Club',
            },
            {
              tag: 'restaurant',
              name: 'Restaurant',
            },
          ],
          services: [
            {
              tag: 'delivery',
              name: 'Delivery',
            },
            {
              tag: 'takeout',
              name: 'Takeout',
            },
          ],
          address: '123 Sample Ave, Brooklyn, NY 12345',
          coordinates: {
            latitude: 40.7140037,
            longitude: -73.9614436,
          },
          distance: 18.580999538944226,
          url: 'https://maps.google.com/?cid=11111111111111111111',
          phone: {
            display: '(888) 000-1234',
            raw: '+18880001234',
          },
          hours: {
            open_now: true,
            open_days: [
              {
                day: 0,
                start: '0000',
                end: '0000',
                is_overnight: true,
              },
              {
                day: 1,
                start: '0000',
                end: '0000',
                is_overnight: true,
              },
              {
                day: 2,
                start: '0000',
                end: '0000',
                is_overnight: true,
              },
              {
                day: 3,
                start: '0000',
                end: '0000',
                is_overnight: true,
              },
              {
                day: 4,
                start: '0000',
                end: '0000',
                is_overnight: true,
              },
              {
                day: 5,
                start: '0000',
                end: '0000',
                is_overnight: true,
              },
              {
                day: 6,
                start: '0000',
                end: '0000',
                is_overnight: true,
              },
            ],
          },
          photos: [
            {
              reference: 'AAA',
              width: 256,
              height: 256,
            },
          ],
          reviews: [
            {
              text: 'Lorem ipsum dolor sit amet.',
              url: '',
              rating: 3,
              time: '2020-03-12T23:01:57Z',
              user: {
                name: 'John Doe',
                image_url: 'https://google.com/photo.jpg',
              },
            },
            {
              text: 'Lorem ipsum dolor sit amet.',
              url: '',
              rating: 5,
              time: '2020-05-23T20:58:04Z',
              user: {
                name: 'Jane Doe',
                image_url: 'https://google.com/photo.jpg',
              },
            },
            {
              text: 'Lorem ipsum dolor sit amet.',
              url: '',
              rating: 5,
              time: '2020-02-29T18:17:26Z',
              user: {
                name: 'Jack Doe',
                image_url: 'https://google.com/photo.jpg',
              },
            },
          ],
        },
      },
      {
        route: '/places/details',
        test: 'payload with a business details request that has mixed hours',
        expect: 'a business with mixed hours',
        payload: {
          id: 'ABC123',
          latitude: 40.714224,
          longitude: -73.961452,
        },
        types: ['empty', 'malicious', 'coordinates', 'details', 'places-details'],
        axiosHeaders: null,
        axiosData: {
          result: {
            formatted_address: '123 Sample Ave, Brooklyn, NY 12345, USA',
            formatted_phone_number: '(888) 000-1234',
            geometry: {
              location: {
                lat: 40.7140037,
                lng: -73.9614436,
              },
            },
            international_phone_number: '+1 888-000-1234',
            name: 'Business B',
            opening_hours: {
              open_now: true,
              periods: [
                {
                  close: {
                    day: 0,
                    time: '1700',
                  },
                  open: {
                    day: 0,
                    time: '0900',
                  },
                },
                {
                  close: {
                    day: 2,
                    time: '0300',
                  },
                  open: {
                    day: 1,
                    time: '0900',
                  },
                },
                {
                  close: {
                    day: 5,
                    time: '0700',
                  },
                  open: {
                    day: 2,
                    time: '0000',
                  },
                },
                {
                  close: {
                    day: 5,
                    time: '1700',
                  },
                  open: {
                    day: 5,
                    time: '0900',
                  },
                },
                {
                  close: {
                    day: 0,
                    time: '0700',
                  },
                  open: {
                    day: 6,
                    time: '0000',
                  },
                },
              ],
            },
            photos: [
              {
                height: 256,
                photo_reference: 'AAA',
                width: 256,
              },
              {
                height: 512,
                photo_reference: 'BBB',
                width: 512,
              },
              {
                height: 1024,
                photo_reference: 'CCC',
                width: 1024,
              },
            ],
            place_id: '22222222222222222222',
            price_level: 2,
            rating: 4.5,
            reviews: [
              {
                author_name: 'John Doe',
                profile_photo_url: 'https://google.com/photo.jpg',
                rating: 3,
                text: 'Lorem ipsum dolor sit amet.',
                time: 1584054117,
              },
              {
                author_name: 'Jane Doe',
                profile_photo_url: 'https://google.com/photo.jpg',
                rating: 5,
                text: 'Lorem ipsum dolor sit amet.',
                time: 1590267484,
              },
              {
                author_name: 'Jack Doe',
                profile_photo_url: 'https://google.com/photo.jpg',
                rating: 5,
                text: 'Lorem ipsum dolor sit amet.',
                time: 1583000246,
              },
            ],
            types: [
              'meal_delivery',
              'meal_takeaway',
              'bakery',
              'bar',
              'cafe',
              'night_club',
              'restaurant',
              'food',
              'point_of_interest',
              'establishment',
            ],
            url: 'https://maps.google.com/?cid=22222222222222222222',
            user_ratings_total: 100,
          },
          status: 'OK',
        },
        bufferOutput: null,
        jwtToken: null,
        responseAction: 'PLACES_DETAILS',
        responseData: {
          source: 'google',
          id: '22222222222222222222',
          name: 'Business B',
          price: 2,
          rating: 4.5,
          review_count: 100,
          categories: [
            {
              tag: 'bakery',
              name: 'Bakery',
            },
            {
              tag: 'bar',
              name: 'Bar',
            },
            {
              tag: 'cafe',
              name: 'Cafe',
            },
            {
              tag: 'night_club',
              name: 'Night Club',
            },
            {
              tag: 'restaurant',
              name: 'Restaurant',
            },
          ],
          services: [
            {
              tag: 'delivery',
              name: 'Delivery',
            },
            {
              tag: 'takeout',
              name: 'Takeout',
            },
          ],
          address: '123 Sample Ave, Brooklyn, NY 12345',
          coordinates: {
            latitude: 40.7140037,
            longitude: -73.9614436,
          },
          distance: 18.580999538944226,
          url: 'https://maps.google.com/?cid=22222222222222222222',
          phone: {
            display: '(888) 000-1234',
            raw: '+18880001234',
          },
          hours: {
            open_now: true,
            open_days: [
              {
                day: 0,
                start: '0000',
                end: '0700',
                is_overnight: false,
              },
              {
                day: 0,
                start: '0900',
                end: '1700',
                is_overnight: false,
              },
              {
                day: 1,
                start: '0900',
                end: '0300',
                is_overnight: true,
              },
              {
                day: 2,
                start: '0000',
                end: '0000',
                is_overnight: true,
              },
              {
                day: 3,
                start: '0000',
                end: '0000',
                is_overnight: true,
              },
              {
                day: 4,
                start: '0000',
                end: '0000',
                is_overnight: true,
              },
              {
                day: 5,
                start: '0000',
                end: '0700',
                is_overnight: false,
              },
              {
                day: 5,
                start: '0900',
                end: '1700',
                is_overnight: false,
              },
              {
                day: 6,
                start: '0000',
                end: '0000',
                is_overnight: true,
              },
            ],
          },
          photos: [
            {
              reference: 'AAA',
              width: 256,
              height: 256,
            },
          ],
          reviews: [
            {
              text: 'Lorem ipsum dolor sit amet.',
              url: '',
              rating: 3,
              time: '2020-03-12T23:01:57Z',
              user: {
                name: 'John Doe',
                image_url: 'https://google.com/photo.jpg',
              },
            },
            {
              text: 'Lorem ipsum dolor sit amet.',
              url: '',
              rating: 5,
              time: '2020-05-23T20:58:04Z',
              user: {
                name: 'Jane Doe',
                image_url: 'https://google.com/photo.jpg',
              },
            },
            {
              text: 'Lorem ipsum dolor sit amet.',
              url: '',
              rating: 5,
              time: '2020-02-29T18:17:26Z',
              user: {
                name: 'Jack Doe',
                image_url: 'https://google.com/photo.jpg',
              },
            },
          ],
        },
      },
      {
        route: '/places/photo',
        test: 'payload with photo request',
        expect: 'a base64 encoded photo',
        payload: {
          reference: 'ABC123',
          max_width: 512,
          max_height: 512,
        },
        types: ['empty', 'malicious', 'photo', 'places-photo'],
        axiosHeaders: {
          'content-type': 'image/jpeg',
        },
        axiosData: null,
        bufferOutput: '1234567890',
        jwtToken: null,
        responseAction: 'PLACES_PHOTO',
        responseData: {
          data_url: 'data:image/jpeg;base64,1234567890',
        },
      },
    ];

    /**
     * Run tests.
     *
     * @since 1.0.0
     */
    validRequests.forEach((validRequest) => {
      /**
       * If ${validRequest.route} (${validRequest.test}) is valid, ${validRequest.expect} should be returned.
       *
       * @since 1.0.0
       */
      it(`If ${validRequest.route} (${validRequest.test}) is valid, ${validRequest.expect} should be returned`, async () => {
        // Arrange.
        payloadObject = validRequest.payload;
        successResponse = validRequest.responseData;
        axiosResponse = {
          statusText: 'OK',
          headers: validRequest.axiosHeaders,
          data: validRequest.axiosData,
        };
        bufferOutput = validRequest.bufferOutput;
        jwtToken = validRequest.jwtToken;
        consoleLogCount = 1;
        proxyRouterEvent.requestContext.resourcePath = validRequest.route;
        proxyRouterEvent.body = JSON.stringify(payloadObject);
        responseCallback.statusCode = 200;
        responseCallback.body = JSON.stringify({
          action: validRequest.responseAction,
          success: true,
          info: successResponse,
        });

        spyOn(axios, 'get').and.returnValue(Promise.resolve(axiosResponse));
        spyOn(Buffer, 'from').and.returnValue(bufferOutput);
        spyOn(jwt, 'sign').and.returnValue(jwtToken);

        // Act.
        result = await api.proxyRouter(proxyRouterEvent, lambdaContext);

        // Assert.
        if (validRequest.types.includes('empty')) {
          expect(console.log).toHaveBeenCalledWith(`${validRequest.route} checkIfEmptyOrInvalid`, payloadObject);
          consoleLogCount += 1;
        }

        if (validRequest.types.includes('malicious')) {
          expect(console.log).toHaveBeenCalledWith(`${validRequest.route} checkIfMalicious`, payloadObject);
          consoleLogCount += 1;
        }

        if (validRequest.types.includes('auth')) {
          expect(console.log).toHaveBeenCalledWith(`${validRequest.route} checkForAuth`, payloadObject);
          consoleLogCount += 1;
        }

        if (validRequest.types.includes('coordinates')) {
          expect(console.log).toHaveBeenCalledWith(`${validRequest.route} checkForCoordinates`, payloadObject);
          consoleLogCount += 1;
        }

        if (validRequest.types.includes('search')) {
          expect(console.log).toHaveBeenCalledWith(`${validRequest.route} checkForSearch`, payloadObject);
          consoleLogCount += 1;
        }

        if (validRequest.types.includes('details')) {
          expect(console.log).toHaveBeenCalledWith(`${validRequest.route} checkForDetails`, payloadObject);
          consoleLogCount += 1;
        }

        if (validRequest.types.includes('reviews')) {
          expect(console.log).toHaveBeenCalledWith(`${validRequest.route} checkForReviews`, payloadObject);
          consoleLogCount += 1;
        }

        if (validRequest.types.includes('photo')) {
          expect(console.log).toHaveBeenCalledWith(`${validRequest.route} checkForPhoto`, payloadObject);
          consoleLogCount += 1;
        }

        if (validRequest.types.includes('fusion-search')) {
          expect(console.log).toHaveBeenCalledWith(`${validRequest.route} fetchYelpFusionSearch`, axiosResponse);
          consoleLogCount += 1;
        }

        if (validRequest.types.includes('fusion-details')) {
          expect(console.log).toHaveBeenCalledWith(`${validRequest.route} fetchYelpFusionDetails`, axiosResponse);
          consoleLogCount += 1;
        }

        if (validRequest.types.includes('fusion-reviews')) {
          expect(console.log).toHaveBeenCalledWith(`${validRequest.route} fetchYelpFusionReviews`, axiosResponse);
          consoleLogCount += 1;
        }

        if (validRequest.types.includes('geocode-locate')) {
          expect(console.log).toHaveBeenCalledWith(`${validRequest.route} fetchGoogleGeocode`, axiosResponse);
          consoleLogCount += 1;
        }

        if (validRequest.types.includes('places-search')) {
          expect(console.log).toHaveBeenCalledWith(`${validRequest.route} fetchGooglePlacesSearch`, axiosResponse);
          consoleLogCount += 1;
        }

        if (validRequest.types.includes('places-details')) {
          expect(console.log).toHaveBeenCalledWith(`${validRequest.route} fetchGooglePlacesDetails`, axiosResponse);
          consoleLogCount += 1;
        }

        if (validRequest.types.includes('places-photo')) {
          expect(console.log).toHaveBeenCalledWith(`${validRequest.route} fetchGooglePlacesPhoto`, axiosResponse);
          consoleLogCount += 1;
        }

        expect(console.log).toHaveBeenCalledWith(`${validRequest.route} successResponse`, successResponse);
        expect(console.log).toHaveBeenCalledTimes(consoleLogCount);
        expect(console.error).not.toHaveBeenCalled();
        expect(lambdaContext.done).toHaveBeenCalledWith(null, responseCallback);
        expect(result).toBeUndefined();
      });
    });
  });

  /**
   * Check for failed response.
   *
   * @since 1.0.0
   */
  describe('Check for failed response', () => {
    let failedResponse;
    let consoleErrorCount;

    /**
     * Define tests.
     *
     * @since 1.0.0
     */
    const invalidRequests = [
      {
        route: '/auth/session',
        test: 'payload is empty',
        payload: {},
        types: ['empty'],
        axiosResponse: null,
        responseAction: 'AUTHORIZATION',
        responseData: {
          status: 'SYNTAX_ERROR',
          description: 'The content is empty or invalid',
        },
      },
      {
        route: '/auth/session',
        test: 'payload is malicious',
        payload: {
          ip: '1.1.1.1',
          ua: 'chrome',
          iat: 99999,
          exp: 99999,
        },
        types: ['empty', 'malicious'],
        axiosResponse: null,
        responseAction: 'AUTHORIZATION',
        responseData: {
          status: 'SYSTEM_ERROR',
          description: 'The content is malicious',
        },
      },
      {
        route: '/auth/session',
        test: 'payload with invalid type',
        payload: {
          type: 'something',
        },
        types: ['empty', 'malicious', 'auth'],
        axiosResponse: null,
        responseAction: 'AUTHORIZATION',
        responseData: {
          status: 'SYNTAX_ERROR',
          description: 'The "type" key does not match expression',
        },
      },
      {
        route: '/fusion/search',
        test: 'payload is empty',
        payload: {},
        types: ['empty'],
        axiosResponse: null,
        responseAction: 'FUSION_SEARCH',
        responseData: {
          status: 'SYNTAX_ERROR',
          description: 'The content is empty or invalid',
        },
      },
      {
        route: '/fusion/search',
        test: 'payload is malicious',
        payload: {
          ip: '1.1.1.1',
          ua: 'chrome',
          iat: 99999,
          exp: 99999,
        },
        types: ['empty', 'malicious'],
        axiosResponse: null,
        responseAction: 'FUSION_SEARCH',
        responseData: {
          status: 'SYSTEM_ERROR',
          description: 'The content is malicious',
        },
      },
      {
        route: '/fusion/search',
        test: 'payload with string in latitude',
        payload: {
          latitude: '0',
          longitude: 0,
          term: 'something',
          category: ['food', 'restaurant'],
          sort: 'distance',
          price: [1, 2, 3, 4],
          min_rating: 4.5,
          open_now: true,
        },
        types: ['empty', 'malicious', 'coordinates'],
        axiosResponse: null,
        responseAction: 'FUSION_SEARCH',
        responseData: {
          status: 'SYNTAX_ERROR',
          description: 'The "latitude" key is not a finite number',
        },
      },
      {
        route: '/fusion/search',
        test: 'payload with string in longitude',
        payload: {
          latitude: 0,
          longitude: '0',
          term: 'something',
          category: ['food', 'restaurant'],
          sort: 'least_expensive',
          price: [1, 2, 3, 4],
          min_rating: 4.5,
          open_now: true,
        },
        types: ['empty', 'malicious', 'coordinates'],
        axiosResponse: null,
        responseAction: 'FUSION_SEARCH',
        responseData: {
          status: 'SYNTAX_ERROR',
          description: 'The "longitude" key is not a finite number',
        },
      },
      {
        route: '/fusion/search',
        test: 'payload with exceeded negative latitude and longitude value',
        payload: {
          latitude: -90.1,
          longitude: -180.1,
          term: 'something',
          category: ['food', 'restaurant'],
          sort: 'most_reviewed',
          price: [1, 2, 3, 4],
          min_rating: 4.5,
          open_now: true,
        },
        types: ['empty', 'malicious', 'coordinates'],
        axiosResponse: null,
        responseAction: 'FUSION_SEARCH',
        responseData: {
          status: 'SYNTAX_ERROR',
          description: 'The "latitude" or "longitude" key has exceeded the allowed value',
        },
      },
      {
        route: '/fusion/search',
        test: 'payload with exceeded positive latitude and longitude value',
        payload: {
          latitude: 90.1,
          longitude: 180.1,
          term: 'something',
          category: ['food', 'restaurant'],
          sort: 'distance',
          price: [1, 2, 3, 4],
          min_rating: 4.5,
          open_now: true,
        },
        types: ['empty', 'malicious', 'coordinates'],
        axiosResponse: null,
        responseAction: 'FUSION_SEARCH',
        responseData: {
          status: 'SYNTAX_ERROR',
          description: 'The "latitude" or "longitude" key has exceeded the allowed value',
        },
      },
      {
        route: '/fusion/search',
        test: 'payload with empty search term',
        payload: {
          latitude: 0,
          longitude: 0,
          term: '',
          category: ['food', 'restaurant'],
          sort: 'least_expensive',
          price: [1, 2, 3, 4],
          min_rating: 4.5,
          open_now: true,
        },
        types: ['empty', 'malicious', 'coordinates', 'search'],
        axiosResponse: null,
        responseAction: 'FUSION_SEARCH',
        responseData: {
          status: 'SYNTAX_ERROR',
          description: 'The "term" key is empty or not a string',
        },
      },
      {
        route: '/fusion/search',
        test: 'payload with non-string search term',
        payload: {
          latitude: 0,
          longitude: 0,
          term: 99999,
          category: ['food', 'restaurant'],
          sort: 'most_reviewed',
          price: [1, 2, 3, 4],
          min_rating: 4.5,
          open_now: true,
        },
        types: ['empty', 'malicious', 'coordinates', 'search'],
        axiosResponse: null,
        responseAction: 'FUSION_SEARCH',
        responseData: {
          status: 'SYNTAX_ERROR',
          description: 'The "term" key is empty or not a string',
        },
      },
      {
        route: '/fusion/search',
        test: 'payload with non-array category',
        payload: {
          latitude: 0,
          longitude: 0,
          term: 'something',
          category: {},
          sort: 'distance',
          price: [1, 2, 3, 4],
          min_rating: 4.5,
          open_now: true,
        },
        types: ['empty', 'malicious', 'coordinates', 'search'],
        axiosResponse: null,
        responseAction: 'FUSION_SEARCH',
        responseData: {
          status: 'SYNTAX_ERROR',
          description: 'The "category" key is not a string[] or wrong size',
        },
      },
      {
        route: '/fusion/search',
        test: 'payload with partial non-string array category',
        payload: {
          latitude: 0,
          longitude: 0,
          term: 'something',
          category: ['food', 'restaurant', 1, 2],
          sort: 'least_expensive',
          price: [1, 2, 3, 4],
          min_rating: 4.5,
          open_now: true,
        },
        types: ['empty', 'malicious', 'coordinates', 'search'],
        axiosResponse: null,
        responseAction: 'FUSION_SEARCH',
        responseData: {
          status: 'SYNTAX_ERROR',
          description: 'The "category" key is not a string[] or wrong size',
        },
      },
      {
        route: '/fusion/search',
        test: 'payload with partial empty string array category',
        payload: {
          latitude: 0,
          longitude: 0,
          term: 'something',
          category: ['food', 'restaurant', '', ''],
          sort: 'most_reviewed',
          price: [1, 2, 3, 4],
          min_rating: 4.5,
          open_now: true,
        },
        types: ['empty', 'malicious', 'coordinates', 'search'],
        axiosResponse: null,
        responseAction: 'FUSION_SEARCH',
        responseData: {
          status: 'SYNTAX_ERROR',
          description: 'The "category" key is not a string[] or wrong size',
        },
      },
      {
        route: '/fusion/search',
        test: 'payload with empty array category',
        payload: {
          latitude: 0,
          longitude: 0,
          term: 'something',
          category: [],
          sort: 'distance',
          price: [1, 2, 3, 4],
          min_rating: 4.5,
          open_now: true,
        },
        types: ['empty', 'malicious', 'coordinates', 'search'],
        axiosResponse: null,
        responseAction: 'FUSION_SEARCH',
        responseData: {
          status: 'SYNTAX_ERROR',
          description: 'The "category" key is not a string[] or wrong size',
        },
      },
      {
        route: '/fusion/search',
        test: 'payload with invalid sort',
        payload: {
          latitude: 0,
          longitude: 0,
          term: 'something',
          category: ['food', 'restaurant'],
          sort: 'something',
          price: [1, 2, 3, 4],
          min_rating: 4.5,
          open_now: true,
        },
        types: ['empty', 'malicious', 'coordinates', 'search'],
        axiosResponse: null,
        responseAction: 'FUSION_SEARCH',
        responseData: {
          status: 'SYNTAX_ERROR',
          description: 'The "sort" key does not match expression',
        },
      },
      {
        route: '/fusion/search',
        test: 'payload with non-array price',
        payload: {
          latitude: 0,
          longitude: 0,
          term: 'something',
          category: ['food', 'restaurant'],
          sort: 'least_expensive',
          price: {},
          min_rating: 4.5,
          open_now: true,
        },
        types: ['empty', 'malicious', 'coordinates', 'search'],
        axiosResponse: null,
        responseAction: 'FUSION_SEARCH',
        responseData: {
          status: 'SYNTAX_ERROR',
          description: 'The "price" key is not a finite number[] or wrong size',
        },
      },
      {
        route: '/fusion/search',
        test: 'payload with partial non-finite array price',
        payload: {
          latitude: 0,
          longitude: 0,
          term: 'something',
          category: ['food', 'restaurant'],
          sort: 'most_reviewed',
          price: [1, 2, '', ''],
          min_rating: 4.5,
          open_now: true,
        },
        types: ['empty', 'malicious', 'coordinates', 'search'],
        axiosResponse: null,
        responseAction: 'FUSION_SEARCH',
        responseData: {
          status: 'SYNTAX_ERROR',
          description: 'The "price" key is not a finite number[] or wrong size',
        },
      },
      {
        route: '/fusion/search',
        test: 'payload with empty array price',
        payload: {
          latitude: 0,
          longitude: 0,
          term: 'something',
          category: ['food', 'restaurant'],
          sort: 'distance',
          price: [],
          min_rating: 4.5,
          open_now: true,
        },
        types: ['empty', 'malicious', 'coordinates', 'search'],
        axiosResponse: null,
        responseAction: 'FUSION_SEARCH',
        responseData: {
          status: 'SYNTAX_ERROR',
          description: 'The "price" key is not a finite number[] or wrong size',
        },
      },
      {
        route: '/fusion/search',
        test: 'payload with exceeded array price',
        payload: {
          latitude: 0,
          longitude: 0,
          term: 'something',
          category: ['food', 'restaurant'],
          sort: 'least_expensive',
          price: [1, 2, 3, 4, 5, 6],
          min_rating: 4.5,
          open_now: true,
        },
        types: ['empty', 'malicious', 'coordinates', 'search'],
        axiosResponse: null,
        responseAction: 'FUSION_SEARCH',
        responseData: {
          status: 'SYNTAX_ERROR',
          description: 'The "price" key is not a finite number[] or wrong size',
        },
      },
      {
        route: '/fusion/search',
        test: 'payload with non-finite minimum rating',
        payload: {
          latitude: 0,
          longitude: 0,
          term: 'something',
          category: ['food', 'restaurant'],
          sort: 'most_reviewed',
          price: [1, 2, 3, 4],
          min_rating: '',
          open_now: true,
        },
        types: ['empty', 'malicious', 'coordinates', 'search'],
        axiosResponse: null,
        responseAction: 'FUSION_SEARCH',
        responseData: {
          status: 'SYNTAX_ERROR',
          description: 'The "min_rating" key is not a number',
        },
      },
      {
        route: '/fusion/search',
        test: 'payload with non-boolean open now',
        payload: {
          latitude: 0,
          longitude: 0,
          term: 'something',
          category: ['food', 'restaurant'],
          sort: 'distance',
          price: [1, 2, 3, 4],
          min_rating: 4.5,
          open_now: 99999,
        },
        types: ['empty', 'malicious', 'coordinates', 'search'],
        axiosResponse: null,
        responseAction: 'FUSION_SEARCH',
        responseData: {
          status: 'SYNTAX_ERROR',
          description: 'The "open_now" key is not a boolean',
        },
      },
      {
        route: '/fusion/search',
        test: 'API responds with network error',
        payload: {
          latitude: 0,
          longitude: 0,
          term: 'something',
          category: ['food', 'restaurant'],
          sort: 'distance',
          price: [1, 2, 3, 4],
          min_rating: 4.5,
          open_now: true,
        },
        types: ['empty', 'malicious', 'coordinates', 'search', 'fusion-search'],
        axiosResponse: {
          isAxiosError: true,
        },
        responseAction: 'FUSION_SEARCH',
        responseData: {
          status: 'CONNECTION_REFUSED',
          description: 'The requested resource cannot be reached due to a network issue',
        },
      },
      {
        route: '/fusion/search',
        test: 'API responds with http status 400 bad request',
        payload: {
          latitude: 0,
          longitude: 0,
          term: 'something',
          category: ['food', 'restaurant'],
          sort: 'distance',
          price: [1, 2, 3, 4],
          min_rating: 4.5,
          open_now: true,
        },
        types: ['empty', 'malicious', 'coordinates', 'search', 'fusion-search'],
        axiosResponse: {
          response: {
            status: 400,
          },
          isAxiosError: true,
        },
        responseAction: 'FUSION_SEARCH',
        responseData: {
          status: 'BAD_REQUEST',
          description: 'The requested resource cannot be accessed',
        },
      },
      {
        route: '/fusion/search',
        test: 'API responds with http status 403 forbidden',
        payload: {
          latitude: 0,
          longitude: 0,
          term: 'something',
          category: ['food', 'restaurant'],
          sort: 'distance',
          price: [1, 2, 3, 4],
          min_rating: 4.5,
          open_now: true,
        },
        types: ['empty', 'malicious', 'coordinates', 'search', 'fusion-search'],
        axiosResponse: {
          response: {
            status: 403,
          },
          isAxiosError: true,
        },
        responseAction: 'FUSION_SEARCH',
        responseData: {
          status: 'FORBIDDEN',
          description: 'You do not have permission to access the requested resource',
        },
      },
      {
        route: '/fusion/search',
        test: 'API responds with http status 404 not found',
        payload: {
          latitude: 0,
          longitude: 0,
          term: 'something',
          category: ['food', 'restaurant'],
          sort: 'distance',
          price: [1, 2, 3, 4],
          min_rating: 4.5,
          open_now: true,
        },
        types: ['empty', 'malicious', 'coordinates', 'search', 'fusion-search'],
        axiosResponse: {
          response: {
            status: 404,
          },
          isAxiosError: true,
        },
        responseAction: 'FUSION_SEARCH',
        responseData: {
          status: 'NOT_FOUND',
          description: 'The requested resource could not be found',
        },
      },
      {
        route: '/fusion/search',
        test: 'API responds with http status 410 gone',
        payload: {
          latitude: 0,
          longitude: 0,
          term: 'something',
          category: ['food', 'restaurant'],
          sort: 'distance',
          price: [1, 2, 3, 4],
          min_rating: 4.5,
          open_now: true,
        },
        types: ['empty', 'malicious', 'coordinates', 'search', 'fusion-search'],
        axiosResponse: {
          response: {
            status: 410,
          },
          isAxiosError: true,
        },
        responseAction: 'FUSION_SEARCH',
        responseData: {
          status: 'UNKNOWN_ERROR',
          description: 'An unknown server error has occurred',
        },
      },
      {
        route: '/fusion/search',
        test: 'API responds with Yelp sample error',
        payload: {
          latitude: 0,
          longitude: 0,
          term: 'something',
          category: ['food', 'restaurant'],
          sort: 'distance',
          price: [1, 2, 3, 4],
          min_rating: 4.5,
          open_now: true,
        },
        types: ['empty', 'malicious', 'coordinates', 'search', 'fusion-search'],
        axiosResponse: {
          response: {
            status: 418,
            data: {
              error: {
                code: 'SAMPLE_ERROR',
                description: 'This is a Yelp sample error',
              },
            },
          },
          isAxiosError: true,
        },
        responseAction: 'FUSION_SEARCH',
        responseData: {
          status: 'SAMPLE_ERROR',
          description: 'This is a Yelp sample error',
        },
      },
      {
        route: '/fusion/search',
        test: 'API responds with Yelp sample error with no description',
        payload: {
          latitude: 0,
          longitude: 0,
          term: 'something',
          category: ['food', 'restaurant'],
          sort: 'distance',
          price: [1, 2, 3, 4],
          min_rating: 4.5,
          open_now: true,
        },
        types: ['empty', 'malicious', 'coordinates', 'search', 'fusion-search'],
        axiosResponse: {
          response: {
            status: 418,
            data: {
              error: {
                code: 'NO_DESCRIPTION_ERROR',
              },
            },
          },
          isAxiosError: true,
        },
        responseAction: 'FUSION_SEARCH',
        responseData: {
          status: 'NO_DESCRIPTION_ERROR',
          description: '',
        },
      },
      {
        route: '/fusion/details',
        test: 'payload is empty',
        payload: {},
        types: ['empty'],
        axiosResponse: null,
        responseAction: 'FUSION_DETAILS',
        responseData: {
          status: 'SYNTAX_ERROR',
          description: 'The content is empty or invalid',
        },
      },
      {
        route: '/fusion/details',
        test: 'payload is malicious',
        payload: {
          ip: '1.1.1.1',
          ua: 'chrome',
          iat: 99999,
          exp: 99999,
        },
        types: ['empty', 'malicious'],
        axiosResponse: null,
        responseAction: 'FUSION_DETAILS',
        responseData: {
          status: 'SYSTEM_ERROR',
          description: 'The content is malicious',
        },
      },
      {
        route: '/fusion/details',
        test: 'payload with string in latitude',
        payload: {
          id: 'something',
          latitude: '0',
          longitude: 0,
        },
        types: ['empty', 'malicious', 'coordinates'],
        axiosResponse: null,
        responseAction: 'FUSION_DETAILS',
        responseData: {
          status: 'SYNTAX_ERROR',
          description: 'The "latitude" key is not a finite number',
        },
      },
      {
        route: '/fusion/details',
        test: 'payload with string in longitude',
        payload: {
          id: 'something',
          latitude: 0,
          longitude: '0',
        },
        types: ['empty', 'malicious', 'coordinates'],
        axiosResponse: null,
        responseAction: 'FUSION_DETAILS',
        responseData: {
          status: 'SYNTAX_ERROR',
          description: 'The "longitude" key is not a finite number',
        },
      },
      {
        route: '/fusion/details',
        test: 'payload with exceeded negative latitude and longitude value',
        payload: {
          id: 'something',
          latitude: -90.1,
          longitude: -180.1,
        },
        types: ['empty', 'malicious', 'coordinates'],
        axiosResponse: null,
        responseAction: 'FUSION_DETAILS',
        responseData: {
          status: 'SYNTAX_ERROR',
          description: 'The "latitude" or "longitude" key has exceeded the allowed value',
        },
      },
      {
        route: '/fusion/details',
        test: 'payload with exceeded positive latitude and longitude value',
        payload: {
          id: 'something',
          latitude: 90.1,
          longitude: 180.1,
        },
        types: ['empty', 'malicious', 'coordinates'],
        axiosResponse: null,
        responseAction: 'FUSION_DETAILS',
        responseData: {
          status: 'SYNTAX_ERROR',
          description: 'The "latitude" or "longitude" key has exceeded the allowed value',
        },
      },
      {
        route: '/fusion/details',
        test: 'payload with empty search term',
        payload: {
          id: '',
          latitude: 0,
          longitude: 0,
        },
        types: ['empty', 'malicious', 'coordinates', 'details'],
        axiosResponse: null,
        responseAction: 'FUSION_DETAILS',
        responseData: {
          status: 'SYNTAX_ERROR',
          description: 'The "id" key is empty or not a string',
        },
      },
      {
        route: '/fusion/details',
        test: 'payload with non-string search term',
        payload: {
          id: 99999,
          latitude: 0,
          longitude: 0,
        },
        types: ['empty', 'malicious', 'coordinates', 'details'],
        axiosResponse: null,
        responseAction: 'FUSION_DETAILS',
        responseData: {
          status: 'SYNTAX_ERROR',
          description: 'The "id" key is empty or not a string',
        },
      },
      {
        route: '/fusion/details',
        test: 'API responds with network error',
        payload: {
          id: 'something',
          latitude: 0,
          longitude: 0,
        },
        types: ['empty', 'malicious', 'coordinates', 'details', 'fusion-details'],
        axiosResponse: {
          isAxiosError: true,
        },
        responseAction: 'FUSION_DETAILS',
        responseData: {
          status: 'CONNECTION_REFUSED',
          description: 'The requested resource cannot be reached due to a network issue',
        },
      },
      {
        route: '/fusion/details',
        test: 'API responds with http status 400 bad request',
        payload: {
          id: 'something',
          latitude: 0,
          longitude: 0,
        },
        types: ['empty', 'malicious', 'coordinates', 'details', 'fusion-details'],
        axiosResponse: {
          response: {
            status: 400,
          },
          isAxiosError: true,
        },
        responseAction: 'FUSION_DETAILS',
        responseData: {
          status: 'BAD_REQUEST',
          description: 'The requested resource cannot be accessed',
        },
      },
      {
        route: '/fusion/details',
        test: 'API responds with http status 403 forbidden',
        payload: {
          id: 'something',
          latitude: 0,
          longitude: 0,
        },
        types: ['empty', 'malicious', 'coordinates', 'details', 'fusion-details'],
        axiosResponse: {
          response: {
            status: 403,
          },
          isAxiosError: true,
        },
        responseAction: 'FUSION_DETAILS',
        responseData: {
          status: 'FORBIDDEN',
          description: 'You do not have permission to access the requested resource',
        },
      },
      {
        route: '/fusion/details',
        test: 'API responds with http status 404 not found',
        payload: {
          id: 'something',
          latitude: 0,
          longitude: 0,
        },
        types: ['empty', 'malicious', 'coordinates', 'details', 'fusion-details'],
        axiosResponse: {
          response: {
            status: 404,
          },
          isAxiosError: true,
        },
        responseAction: 'FUSION_DETAILS',
        responseData: {
          status: 'NOT_FOUND',
          description: 'The requested resource could not be found',
        },
      },
      {
        route: '/fusion/details',
        test: 'API responds with http status 410 gone',
        payload: {
          id: 'something',
          latitude: 0,
          longitude: 0,
        },
        types: ['empty', 'malicious', 'coordinates', 'details', 'fusion-details'],
        axiosResponse: {
          response: {
            status: 410,
          },
          isAxiosError: true,
        },
        responseAction: 'FUSION_DETAILS',
        responseData: {
          status: 'UNKNOWN_ERROR',
          description: 'An unknown server error has occurred',
        },
      },
      {
        route: '/fusion/details',
        test: 'API responds with Yelp sample error',
        payload: {
          id: 'something',
          latitude: 0,
          longitude: 0,
        },
        types: ['empty', 'malicious', 'coordinates', 'details', 'fusion-details'],
        axiosResponse: {
          response: {
            status: 418,
            data: {
              error: {
                code: 'SAMPLE_ERROR',
                description: 'This is a Yelp sample error',
              },
            },
          },
          isAxiosError: true,
        },
        responseAction: 'FUSION_DETAILS',
        responseData: {
          status: 'SAMPLE_ERROR',
          description: 'This is a Yelp sample error',
        },
      },
      {
        route: '/fusion/details',
        test: 'API responds with Yelp sample error with no description',
        payload: {
          id: 'something',
          latitude: 0,
          longitude: 0,
        },
        types: ['empty', 'malicious', 'coordinates', 'details', 'fusion-details'],
        axiosResponse: {
          response: {
            status: 418,
            data: {
              error: {
                code: 'NO_DESCRIPTION_ERROR',
              },
            },
          },
          isAxiosError: true,
        },
        responseAction: 'FUSION_DETAILS',
        responseData: {
          status: 'NO_DESCRIPTION_ERROR',
          description: '',
        },
      },
      {
        route: '/fusion/reviews',
        test: 'payload is empty',
        payload: {},
        types: ['empty'],
        axiosResponse: null,
        responseAction: 'FUSION_REVIEWS',
        responseData: {
          status: 'SYNTAX_ERROR',
          description: 'The content is empty or invalid',
        },
      },
      {
        route: '/fusion/reviews',
        test: 'payload is malicious',
        payload: {
          ip: '1.1.1.1',
          ua: 'chrome',
          iat: 99999,
          exp: 99999,
        },
        types: ['empty', 'malicious'],
        axiosResponse: null,
        responseAction: 'FUSION_REVIEWS',
        responseData: {
          status: 'SYSTEM_ERROR',
          description: 'The content is malicious',
        },
      },
      {
        route: '/fusion/reviews',
        test: 'payload with empty search term',
        payload: {
          id: '',
        },
        types: ['empty', 'malicious', 'reviews'],
        axiosResponse: null,
        responseAction: 'FUSION_REVIEWS',
        responseData: {
          status: 'SYNTAX_ERROR',
          description: 'The "id" key is empty or not a string',
        },
      },
      {
        route: '/fusion/reviews',
        test: 'payload with non-string search term',
        payload: {
          id: 99999,
        },
        types: ['empty', 'malicious', 'reviews'],
        axiosResponse: null,
        responseAction: 'FUSION_REVIEWS',
        responseData: {
          status: 'SYNTAX_ERROR',
          description: 'The "id" key is empty or not a string',
        },
      },
      {
        route: '/fusion/reviews',
        test: 'API responds with network error',
        payload: {
          id: 'something',
        },
        types: ['empty', 'malicious', 'reviews', 'fusion-reviews'],
        axiosResponse: {
          isAxiosError: true,
        },
        responseAction: 'FUSION_REVIEWS',
        responseData: {
          status: 'CONNECTION_REFUSED',
          description: 'The requested resource cannot be reached due to a network issue',
        },
      },
      {
        route: '/fusion/reviews',
        test: 'API responds with http status 400 bad request',
        payload: {
          id: 'something',
        },
        types: ['empty', 'malicious', 'reviews', 'fusion-reviews'],
        axiosResponse: {
          response: {
            status: 400,
          },
          isAxiosError: true,
        },
        responseAction: 'FUSION_REVIEWS',
        responseData: {
          status: 'BAD_REQUEST',
          description: 'The requested resource cannot be accessed',
        },
      },
      {
        route: '/fusion/reviews',
        test: 'API responds with http status 403 forbidden',
        payload: {
          id: 'something',
        },
        types: ['empty', 'malicious', 'reviews', 'fusion-reviews'],
        axiosResponse: {
          response: {
            status: 403,
          },
          isAxiosError: true,
        },
        responseAction: 'FUSION_REVIEWS',
        responseData: {
          status: 'FORBIDDEN',
          description: 'You do not have permission to access the requested resource',
        },
      },
      {
        route: '/fusion/reviews',
        test: 'API responds with http status 404 not found',
        payload: {
          id: 'something',
        },
        types: ['empty', 'malicious', 'reviews', 'fusion-reviews'],
        axiosResponse: {
          response: {
            status: 404,
          },
          isAxiosError: true,
        },
        responseAction: 'FUSION_REVIEWS',
        responseData: {
          status: 'NOT_FOUND',
          description: 'The requested resource could not be found',
        },
      },
      {
        route: '/fusion/reviews',
        test: 'API responds with http status 410 gone',
        payload: {
          id: 'something',
        },
        types: ['empty', 'malicious', 'reviews', 'fusion-reviews'],
        axiosResponse: {
          response: {
            status: 410,
          },
          isAxiosError: true,
        },
        responseAction: 'FUSION_REVIEWS',
        responseData: {
          status: 'UNKNOWN_ERROR',
          description: 'An unknown server error has occurred',
        },
      },
      {
        route: '/fusion/reviews',
        test: 'API responds with Yelp sample error',
        payload: {
          id: 'something',
        },
        types: ['empty', 'malicious', 'reviews', 'fusion-reviews'],
        axiosResponse: {
          response: {
            status: 418,
            data: {
              error: {
                code: 'SAMPLE_ERROR',
                description: 'This is a Yelp sample error',
              },
            },
          },
          isAxiosError: true,
        },
        responseAction: 'FUSION_REVIEWS',
        responseData: {
          status: 'SAMPLE_ERROR',
          description: 'This is a Yelp sample error',
        },
      },
      {
        route: '/fusion/reviews',
        test: 'API responds with Yelp sample error with no description',
        payload: {
          id: 'something',
        },
        types: ['empty', 'malicious', 'reviews', 'fusion-reviews'],
        axiosResponse: {
          response: {
            status: 418,
            data: {
              error: {
                code: 'NO_DESCRIPTION_ERROR',
              },
            },
          },
          isAxiosError: true,
        },
        responseAction: 'FUSION_REVIEWS',
        responseData: {
          status: 'NO_DESCRIPTION_ERROR',
          description: '',
        },
      },
      {
        route: '/geocode/locate',
        test: 'payload is empty',
        payload: {},
        types: ['empty'],
        axiosResponse: null,
        responseAction: 'GEOCODE_LOCATE',
        responseData: {
          status: 'SYNTAX_ERROR',
          description: 'The content is empty or invalid',
        },
      },
      {
        route: '/geocode/locate',
        test: 'payload is malicious',
        payload: {
          ip: '1.1.1.1',
          ua: 'chrome',
          iat: 99999,
          exp: 99999,
        },
        types: ['empty', 'malicious'],
        axiosResponse: null,
        responseAction: 'GEOCODE_LOCATE',
        responseData: {
          status: 'SYSTEM_ERROR',
          description: 'The content is malicious',
        },
      },
      {
        route: '/geocode/locate',
        test: 'payload with string in latitude',
        payload: {
          latitude: '0',
          longitude: 0,
        },
        types: ['empty', 'malicious', 'coordinates'],
        axiosResponse: null,
        responseAction: 'GEOCODE_LOCATE',
        responseData: {
          status: 'SYNTAX_ERROR',
          description: 'The "latitude" key is not a finite number',
        },
      },
      {
        route: '/geocode/locate',
        test: 'payload with string in longitude',
        payload: {
          latitude: 0,
          longitude: '0',
        },
        types: ['empty', 'malicious', 'coordinates'],
        axiosResponse: null,
        responseAction: 'GEOCODE_LOCATE',
        responseData: {
          status: 'SYNTAX_ERROR',
          description: 'The "longitude" key is not a finite number',
        },
      },
      {
        route: '/geocode/locate',
        test: 'payload with exceeded negative latitude and longitude value',
        payload: {
          latitude: -90.1,
          longitude: -180.1,
        },
        types: ['empty', 'malicious', 'coordinates'],
        axiosResponse: null,
        responseAction: 'GEOCODE_LOCATE',
        responseData: {
          status: 'SYNTAX_ERROR',
          description: 'The "latitude" or "longitude" key has exceeded the allowed value',
        },
      },
      {
        route: '/geocode/locate',
        test: 'payload with exceeded positive latitude and longitude value',
        payload: {
          latitude: 90.1,
          longitude: 180.1,
        },
        types: ['empty', 'malicious', 'coordinates'],
        axiosResponse: null,
        responseAction: 'GEOCODE_LOCATE',
        responseData: {
          status: 'SYNTAX_ERROR',
          description: 'The "latitude" or "longitude" key has exceeded the allowed value',
        },
      },
      {
        route: '/geocode/locate',
        test: 'API responds with network error',
        payload: {
          latitude: 0,
          longitude: 0,
        },
        types: ['empty', 'malicious', 'coordinates', 'geocode-locate'],
        axiosResponse: {
          isAxiosError: true,
        },
        responseAction: 'GEOCODE_LOCATE',
        responseData: {
          status: 'CONNECTION_REFUSED',
          description: 'The requested resource cannot be reached due to a network issue',
        },
      },
      {
        route: '/geocode/locate',
        test: 'API responds with http status 400 bad request',
        payload: {
          latitude: 0,
          longitude: 0,
        },
        types: ['empty', 'malicious', 'coordinates', 'geocode-locate'],
        axiosResponse: {
          response: {
            status: 400,
          },
          isAxiosError: true,
        },
        responseAction: 'GEOCODE_LOCATE',
        responseData: {
          status: 'BAD_REQUEST',
          description: 'The requested resource cannot be accessed',
        },
      },
      {
        route: '/geocode/locate',
        test: 'API responds with http status 403 forbidden',
        payload: {
          latitude: 0,
          longitude: 0,
        },
        types: ['empty', 'malicious', 'coordinates', 'geocode-locate'],
        axiosResponse: {
          response: {
            status: 403,
          },
          isAxiosError: true,
        },
        responseAction: 'GEOCODE_LOCATE',
        responseData: {
          status: 'FORBIDDEN',
          description: 'You do not have permission to access the requested resource',
        },
      },
      {
        route: '/geocode/locate',
        test: 'API responds with http status 404 not found',
        payload: {
          latitude: 0,
          longitude: 0,
        },
        types: ['empty', 'malicious', 'coordinates', 'geocode-locate'],
        axiosResponse: {
          response: {
            status: 404,
          },
          isAxiosError: true,
        },
        responseAction: 'GEOCODE_LOCATE',
        responseData: {
          status: 'NOT_FOUND',
          description: 'The requested resource could not be found',
        },
      },
      {
        route: '/geocode/locate',
        test: 'API responds with http status 410 gone',
        payload: {
          latitude: 0,
          longitude: 0,
        },
        types: ['empty', 'malicious', 'coordinates', 'geocode-locate'],
        axiosResponse: {
          response: {
            status: 410,
          },
          isAxiosError: true,
        },
        responseAction: 'GEOCODE_LOCATE',
        responseData: {
          status: 'UNKNOWN_ERROR',
          description: 'An unknown server error has occurred',
        },
      },
      {
        route: '/geocode/locate',
        test: 'API responds with Google sample error',
        payload: {
          latitude: 0,
          longitude: 0,
        },
        types: ['empty', 'malicious', 'coordinates', 'geocode-locate'],
        axiosResponse: {
          response: {
            status: 418,
            data: {
              error_message: 'This is a Google sample error',
              results: [],
              status: 'SAMPLE_ERROR',
            },
          },
          isAxiosError: true,
        },
        responseAction: 'GEOCODE_LOCATE',
        responseData: {
          status: 'SAMPLE_ERROR',
          description: 'This is a Google sample error',
        },
      },
      {
        route: '/geocode/locate',
        test: 'API responds with Google sample error with no description',
        payload: {
          latitude: 0,
          longitude: 0,
        },
        types: ['empty', 'malicious', 'coordinates', 'geocode-locate'],
        axiosResponse: {
          response: {
            status: 418,
            data: {
              results: [],
              status: 'NO_DESCRIPTION_ERROR',
            },
          },
          isAxiosError: true,
        },
        responseAction: 'GEOCODE_LOCATE',
        responseData: {
          status: 'NO_DESCRIPTION_ERROR',
          description: '',
        },
      },
      {
        route: '/geocode/locate',
        test: 'API responds with Google zero results error',
        payload: {
          latitude: 0,
          longitude: 0,
        },
        types: ['empty', 'malicious', 'coordinates', 'geocode-locate'],
        axiosResponse: {
          response: {
            status: 200,
            data: {
              results: [],
              status: 'ZERO_RESULTS',
            },
          },
          isAxiosError: true,
        },
        responseAction: 'GEOCODE_LOCATE',
        responseData: {
          status: 'ZERO_RESULTS',
          description: 'The requested resource was found, but returned no results',
        },
      },
      {
        route: '/geocode/locate',
        test: 'API responds with Google invalid request error',
        payload: {
          latitude: 0,
          longitude: 0,
        },
        types: ['empty', 'malicious', 'coordinates', 'geocode-locate'],
        axiosResponse: {
          response: {
            status: 200,
            data: {
              html_attributions: [],
              results: [],
              status: 'INVALID_REQUEST',
            },
          },
          isAxiosError: true,
        },
        responseAction: 'GEOCODE_LOCATE',
        responseData: {
          status: 'INVALID_REQUEST',
          description: 'The requested resource is invalid because of missing parameters',
        },
      },
      {
        route: '/places/search',
        test: 'payload is empty',
        payload: {},
        types: ['empty'],
        axiosResponse: null,
        responseAction: 'PLACES_SEARCH',
        responseData: {
          status: 'SYNTAX_ERROR',
          description: 'The content is empty or invalid',
        },
      },
      {
        route: '/places/search',
        test: 'payload is malicious',
        payload: {
          ip: '1.1.1.1',
          ua: 'chrome',
          iat: 99999,
          exp: 99999,
        },
        types: ['empty', 'malicious'],
        axiosResponse: null,
        responseAction: 'PLACES_SEARCH',
        responseData: {
          status: 'SYSTEM_ERROR',
          description: 'The content is malicious',
        },
      },
      {
        route: '/places/search',
        test: 'payload with string in latitude',
        payload: {
          latitude: '0',
          longitude: 0,
          term: 'something',
          category: ['food', 'restaurant'],
          sort: 'most_reviewed',
          price: [1, 2, 3, 4],
          min_rating: 4.5,
          open_now: true,
        },
        types: ['empty', 'malicious', 'coordinates'],
        axiosResponse: null,
        responseAction: 'PLACES_SEARCH',
        responseData: {
          status: 'SYNTAX_ERROR',
          description: 'The "latitude" key is not a finite number',
        },
      },
      {
        route: '/places/search',
        test: 'payload with string in longitude',
        payload: {
          latitude: 0,
          longitude: '0',
          term: 'something',
          category: ['food', 'restaurant'],
          sort: 'most_reviewed',
          price: [1, 2, 3, 4],
          min_rating: 4.5,
          open_now: true,
        },
        types: ['empty', 'malicious', 'coordinates'],
        axiosResponse: null,
        responseAction: 'PLACES_SEARCH',
        responseData: {
          status: 'SYNTAX_ERROR',
          description: 'The "longitude" key is not a finite number',
        },
      },
      {
        route: '/places/search',
        test: 'payload with exceeded negative latitude and longitude value',
        payload: {
          latitude: -90.1,
          longitude: -180.1,
          term: 'something',
          category: ['food', 'restaurant'],
          sort: 'most_reviewed',
          price: [1, 2, 3, 4],
          min_rating: 4.5,
          open_now: true,
        },
        types: ['empty', 'malicious', 'coordinates'],
        axiosResponse: null,
        responseAction: 'PLACES_SEARCH',
        responseData: {
          status: 'SYNTAX_ERROR',
          description: 'The "latitude" or "longitude" key has exceeded the allowed value',
        },
      },
      {
        route: '/places/search',
        test: 'payload with exceeded positive latitude and longitude value',
        payload: {
          latitude: 90.1,
          longitude: 180.1,
          term: 'something',
          category: ['food', 'restaurant'],
          sort: 'most_reviewed',
          price: [1, 2, 3, 4],
          min_rating: 4.5,
          open_now: true,
        },
        types: ['empty', 'malicious', 'coordinates'],
        axiosResponse: null,
        responseAction: 'PLACES_SEARCH',
        responseData: {
          status: 'SYNTAX_ERROR',
          description: 'The "latitude" or "longitude" key has exceeded the allowed value',
        },
      },
      {
        route: '/places/search',
        test: 'payload with empty search term',
        payload: {
          latitude: 0,
          longitude: 0,
          term: '',
          category: ['food', 'restaurant'],
          sort: 'most_reviewed',
          price: [1, 2, 3, 4],
          min_rating: 4.5,
          open_now: true,
        },
        types: ['empty', 'malicious', 'coordinates', 'search'],
        axiosResponse: null,
        responseAction: 'PLACES_SEARCH',
        responseData: {
          status: 'SYNTAX_ERROR',
          description: 'The "term" key is empty or not a string',
        },
      },
      {
        route: '/places/search',
        test: 'payload with non-string search term',
        payload: {
          latitude: 0,
          longitude: 0,
          term: 99999,
          category: ['food', 'restaurant'],
          sort: 'most_reviewed',
          price: [1, 2, 3, 4],
          min_rating: 4.5,
          open_now: true,
        },
        types: ['empty', 'malicious', 'coordinates', 'search'],
        axiosResponse: null,
        responseAction: 'PLACES_SEARCH',
        responseData: {
          status: 'SYNTAX_ERROR',
          description: 'The "term" key is empty or not a string',
        },
      },
      {
        route: '/places/search',
        test: 'payload with non-array category',
        payload: {
          latitude: 0,
          longitude: 0,
          term: 'something',
          category: {},
          sort: 'most_reviewed',
          price: [1, 2, 3, 4],
          min_rating: 4.5,
          open_now: true,
        },
        types: ['empty', 'malicious', 'coordinates', 'search'],
        axiosResponse: null,
        responseAction: 'PLACES_SEARCH',
        responseData: {
          status: 'SYNTAX_ERROR',
          description: 'The "category" key is not a string[] or wrong size',
        },
      },
      {
        route: '/places/search',
        test: 'payload with partial non-string array category',
        payload: {
          latitude: 0,
          longitude: 0,
          term: 'something',
          category: ['food', 'restaurant', 1, 2],
          sort: 'most_reviewed',
          price: [1, 2, 3, 4],
          min_rating: 4.5,
          open_now: true,
        },
        types: ['empty', 'malicious', 'coordinates', 'search'],
        axiosResponse: null,
        responseAction: 'PLACES_SEARCH',
        responseData: {
          status: 'SYNTAX_ERROR',
          description: 'The "category" key is not a string[] or wrong size',
        },
      },
      {
        route: '/places/search',
        test: 'payload with partial empty string array category',
        payload: {
          latitude: 0,
          longitude: 0,
          term: 'something',
          category: ['food', 'restaurant', '', ''],
          sort: 'most_reviewed',
          price: [1, 2, 3, 4],
          min_rating: 4.5,
          open_now: true,
        },
        types: ['empty', 'malicious', 'coordinates', 'search'],
        axiosResponse: null,
        responseAction: 'PLACES_SEARCH',
        responseData: {
          status: 'SYNTAX_ERROR',
          description: 'The "category" key is not a string[] or wrong size',
        },
      },
      {
        route: '/places/search',
        test: 'payload with empty array category',
        payload: {
          latitude: 0,
          longitude: 0,
          term: 'something',
          category: [],
          sort: 'most_reviewed',
          price: [1, 2, 3, 4],
          min_rating: 4.5,
          open_now: true,
        },
        types: ['empty', 'malicious', 'coordinates', 'search'],
        axiosResponse: null,
        responseAction: 'PLACES_SEARCH',
        responseData: {
          status: 'SYNTAX_ERROR',
          description: 'The "category" key is not a string[] or wrong size',
        },
      },
      {
        route: '/places/search',
        test: 'payload with invalid sort',
        payload: {
          latitude: 0,
          longitude: 0,
          term: 'something',
          category: ['food', 'restaurant'],
          sort: 'something',
          price: [1, 2, 3, 4],
          min_rating: 4.5,
          open_now: true,
        },
        types: ['empty', 'malicious', 'coordinates', 'search'],
        axiosResponse: null,
        responseAction: 'PLACES_SEARCH',
        responseData: {
          status: 'SYNTAX_ERROR',
          description: 'The "sort" key does not match expression',
        },
      },
      {
        route: '/places/search',
        test: 'payload with non-array price',
        payload: {
          latitude: 0,
          longitude: 0,
          term: 'something',
          category: ['food', 'restaurant'],
          sort: 'distance',
          price: {},
          min_rating: 4.5,
          open_now: true,
        },
        types: ['empty', 'malicious', 'coordinates', 'search'],
        axiosResponse: null,
        responseAction: 'PLACES_SEARCH',
        responseData: {
          status: 'SYNTAX_ERROR',
          description: 'The "price" key is not a finite number[] or wrong size',
        },
      },
      {
        route: '/places/search',
        test: 'payload with partial non-finite array price',
        payload: {
          latitude: 0,
          longitude: 0,
          term: 'something',
          category: ['food', 'restaurant'],
          sort: 'least_expensive',
          price: [1, 2, '', ''],
          min_rating: 4.5,
          open_now: true,
        },
        types: ['empty', 'malicious', 'coordinates', 'search'],
        axiosResponse: null,
        responseAction: 'PLACES_SEARCH',
        responseData: {
          status: 'SYNTAX_ERROR',
          description: 'The "price" key is not a finite number[] or wrong size',
        },
      },
      {
        route: '/places/search',
        test: 'payload with empty array price',
        payload: {
          latitude: 0,
          longitude: 0,
          term: 'something',
          category: ['food', 'restaurant'],
          sort: 'most_reviewed',
          price: [],
          min_rating: 4.5,
          open_now: true,
        },
        types: ['empty', 'malicious', 'coordinates', 'search'],
        axiosResponse: null,
        responseAction: 'PLACES_SEARCH',
        responseData: {
          status: 'SYNTAX_ERROR',
          description: 'The "price" key is not a finite number[] or wrong size',
        },
      },
      {
        route: '/places/search',
        test: 'payload with exceeded array price',
        payload: {
          latitude: 0,
          longitude: 0,
          term: 'something',
          category: ['food', 'restaurant'],
          sort: 'distance',
          price: [1, 2, 3, 4, 5, 6],
          min_rating: 4.5,
          open_now: true,
        },
        types: ['empty', 'malicious', 'coordinates', 'search'],
        axiosResponse: null,
        responseAction: 'PLACES_SEARCH',
        responseData: {
          status: 'SYNTAX_ERROR',
          description: 'The "price" key is not a finite number[] or wrong size',
        },
      },
      {
        route: '/places/search',
        test: 'payload with non-finite minimum rating',
        payload: {
          latitude: 0,
          longitude: 0,
          term: 'something',
          category: ['food', 'restaurant'],
          sort: 'least_expensive',
          price: [1, 2, 3, 4],
          min_rating: '',
          open_now: true,
        },
        types: ['empty', 'malicious', 'coordinates', 'search'],
        axiosResponse: null,
        responseAction: 'PLACES_SEARCH',
        responseData: {
          status: 'SYNTAX_ERROR',
          description: 'The "min_rating" key is not a number',
        },
      },
      {
        route: '/places/search',
        test: 'payload with non-boolean open now',
        payload: {
          latitude: 0,
          longitude: 0,
          term: 'something',
          category: ['food', 'restaurant'],
          sort: 'most_reviewed',
          price: [1, 2, 3, 4],
          min_rating: 4.5,
          open_now: 99999,
        },
        types: ['empty', 'malicious', 'coordinates', 'search'],
        axiosResponse: null,
        responseAction: 'PLACES_SEARCH',
        responseData: {
          status: 'SYNTAX_ERROR',
          description: 'The "open_now" key is not a boolean',
        },
      },
      {
        route: '/places/search',
        test: 'API responds with network error',
        payload: {
          latitude: 0,
          longitude: 0,
          term: 'something',
          category: ['food', 'restaurant'],
          sort: 'distance',
          price: [1, 2, 3, 4],
          min_rating: 4.5,
          open_now: true,
        },
        types: ['empty', 'malicious', 'coordinates', 'search', 'places-search'],
        axiosResponse: {
          isAxiosError: true,
        },
        responseAction: 'PLACES_SEARCH',
        responseData: {
          status: 'CONNECTION_REFUSED',
          description: 'The requested resource cannot be reached due to a network issue',
        },
      },
      {
        route: '/places/search',
        test: 'API responds with http status 400 bad request',
        payload: {
          latitude: 0,
          longitude: 0,
          term: 'something',
          category: ['food', 'restaurant'],
          sort: 'distance',
          price: [1, 2, 3, 4],
          min_rating: 4.5,
          open_now: true,
        },
        types: ['empty', 'malicious', 'coordinates', 'search', 'places-search'],
        axiosResponse: {
          response: {
            status: 400,
          },
          isAxiosError: true,
        },
        responseAction: 'PLACES_SEARCH',
        responseData: {
          status: 'BAD_REQUEST',
          description: 'The requested resource cannot be accessed',
        },
      },
      {
        route: '/places/search',
        test: 'API responds with http status 403 forbidden',
        payload: {
          latitude: 0,
          longitude: 0,
          term: 'something',
          category: ['food', 'restaurant'],
          sort: 'distance',
          price: [1, 2, 3, 4],
          min_rating: 4.5,
          open_now: true,
        },
        types: ['empty', 'malicious', 'coordinates', 'search', 'places-search'],
        axiosResponse: {
          response: {
            status: 403,
          },
          isAxiosError: true,
        },
        responseAction: 'PLACES_SEARCH',
        responseData: {
          status: 'FORBIDDEN',
          description: 'You do not have permission to access the requested resource',
        },
      },
      {
        route: '/places/search',
        test: 'API responds with http status 404 not found',
        payload: {
          latitude: 0,
          longitude: 0,
          term: 'something',
          category: ['food', 'restaurant'],
          sort: 'distance',
          price: [1, 2, 3, 4],
          min_rating: 4.5,
          open_now: true,
        },
        types: ['empty', 'malicious', 'coordinates', 'search', 'places-search'],
        axiosResponse: {
          response: {
            status: 404,
          },
          isAxiosError: true,
        },
        responseAction: 'PLACES_SEARCH',
        responseData: {
          status: 'NOT_FOUND',
          description: 'The requested resource could not be found',
        },
      },
      {
        route: '/places/search',
        test: 'API responds with http status 410 gone',
        payload: {
          latitude: 0,
          longitude: 0,
          term: 'something',
          category: ['food', 'restaurant'],
          sort: 'distance',
          price: [1, 2, 3, 4],
          min_rating: 4.5,
          open_now: true,
        },
        types: ['empty', 'malicious', 'coordinates', 'search', 'places-search'],
        axiosResponse: {
          response: {
            status: 410,
          },
          isAxiosError: true,
        },
        responseAction: 'PLACES_SEARCH',
        responseData: {
          status: 'UNKNOWN_ERROR',
          description: 'An unknown server error has occurred',
        },
      },
      {
        route: '/places/search',
        test: 'API responds with Google sample error',
        payload: {
          latitude: 0,
          longitude: 0,
          term: 'something',
          category: ['food', 'restaurant'],
          sort: 'distance',
          price: [1, 2, 3, 4],
          min_rating: 4.5,
          open_now: true,
        },
        types: ['empty', 'malicious', 'coordinates', 'search', 'places-search'],
        axiosResponse: {
          response: {
            status: 418,
            data: {
              error_message: 'This is a Google sample error',
              results: [],
              status: 'SAMPLE_ERROR',
            },
          },
          isAxiosError: true,
        },
        responseAction: 'PLACES_SEARCH',
        responseData: {
          status: 'SAMPLE_ERROR',
          description: 'This is a Google sample error',
        },
      },
      {
        route: '/places/search',
        test: 'API responds with Google sample error with no description',
        payload: {
          latitude: 0,
          longitude: 0,
          term: 'something',
          category: ['food', 'restaurant'],
          sort: 'distance',
          price: [1, 2, 3, 4],
          min_rating: 4.5,
          open_now: true,
        },
        types: ['empty', 'malicious', 'coordinates', 'search', 'places-search'],
        axiosResponse: {
          response: {
            status: 418,
            data: {
              results: [],
              status: 'NO_DESCRIPTION_ERROR',
            },
          },
          isAxiosError: true,
        },
        responseAction: 'PLACES_SEARCH',
        responseData: {
          status: 'NO_DESCRIPTION_ERROR',
          description: '',
        },
      },
      {
        route: '/places/search',
        test: 'API responds with Google zero results error',
        payload: {
          latitude: 0,
          longitude: 0,
          term: 'something',
          category: ['food', 'restaurant'],
          sort: 'distance',
          price: [1, 2, 3, 4],
          min_rating: 4.5,
          open_now: true,
        },
        types: ['empty', 'malicious', 'coordinates', 'search', 'places-search'],
        axiosResponse: {
          response: {
            status: 200,
            data: {
              results: [],
              status: 'ZERO_RESULTS',
            },
          },
          isAxiosError: true,
        },
        responseAction: 'PLACES_SEARCH',
        responseData: {
          status: 'ZERO_RESULTS',
          description: 'The requested resource was found, but returned no results',
        },
      },
      {
        route: '/places/search',
        test: 'API responds with Google invalid request error',
        payload: {
          latitude: 0,
          longitude: 0,
          term: 'something',
          category: ['food', 'restaurant'],
          sort: 'distance',
          price: [1, 2, 3, 4],
          min_rating: 4.5,
          open_now: true,
        },
        types: ['empty', 'malicious', 'coordinates', 'search', 'places-search'],
        axiosResponse: {
          response: {
            status: 200,
            data: {
              html_attributions: [],
              results: [],
              status: 'INVALID_REQUEST',
            },
          },
          isAxiosError: true,
        },
        responseAction: 'PLACES_SEARCH',
        responseData: {
          status: 'INVALID_REQUEST',
          description: 'The requested resource is invalid because of missing parameters',
        },
      },
      {
        route: '/places/details',
        test: 'payload is empty',
        payload: {},
        types: ['empty'],
        axiosResponse: null,
        responseAction: 'PLACES_DETAILS',
        responseData: {
          status: 'SYNTAX_ERROR',
          description: 'The content is empty or invalid',
        },
      },
      {
        route: '/places/details',
        test: 'payload is malicious',
        payload: {
          ip: '1.1.1.1',
          ua: 'chrome',
          iat: 99999,
          exp: 99999,
        },
        types: ['empty', 'malicious'],
        axiosResponse: null,
        responseAction: 'PLACES_DETAILS',
        responseData: {
          status: 'SYSTEM_ERROR',
          description: 'The content is malicious',
        },
      },
      {
        route: '/places/details',
        test: 'payload with string in latitude',
        payload: {
          id: 'something',
          latitude: '0',
          longitude: 0,
        },
        types: ['empty', 'malicious', 'coordinates'],
        axiosResponse: null,
        responseAction: 'PLACES_DETAILS',
        responseData: {
          status: 'SYNTAX_ERROR',
          description: 'The "latitude" key is not a finite number',
        },
      },
      {
        route: '/places/details',
        test: 'payload with string in longitude',
        payload: {
          id: 'something',
          latitude: 0,
          longitude: '0',
        },
        types: ['empty', 'malicious', 'coordinates'],
        axiosResponse: null,
        responseAction: 'PLACES_DETAILS',
        responseData: {
          status: 'SYNTAX_ERROR',
          description: 'The "longitude" key is not a finite number',
        },
      },
      {
        route: '/places/details',
        test: 'payload with exceeded negative latitude and longitude value',
        payload: {
          id: 'something',
          latitude: -90.1,
          longitude: -180.1,
        },
        types: ['empty', 'malicious', 'coordinates'],
        axiosResponse: null,
        responseAction: 'PLACES_DETAILS',
        responseData: {
          status: 'SYNTAX_ERROR',
          description: 'The "latitude" or "longitude" key has exceeded the allowed value',
        },
      },
      {
        route: '/places/details',
        test: 'payload with exceeded positive latitude and longitude value',
        payload: {
          id: 'something',
          latitude: 90.1,
          longitude: 180.1,
        },
        types: ['empty', 'malicious', 'coordinates'],
        axiosResponse: null,
        responseAction: 'PLACES_DETAILS',
        responseData: {
          status: 'SYNTAX_ERROR',
          description: 'The "latitude" or "longitude" key has exceeded the allowed value',
        },
      },
      {
        route: '/places/details',
        test: 'payload with empty search term',
        payload: {
          id: '',
          latitude: 0,
          longitude: 0,
        },
        types: ['empty', 'malicious', 'coordinates', 'details'],
        axiosResponse: null,
        responseAction: 'PLACES_DETAILS',
        responseData: {
          status: 'SYNTAX_ERROR',
          description: 'The "id" key is empty or not a string',
        },
      },
      {
        route: '/places/details',
        test: 'payload with non-string search term',
        payload: {
          id: 99999,
          latitude: 0,
          longitude: 0,
        },
        types: ['empty', 'malicious', 'coordinates', 'details'],
        axiosResponse: null,
        responseAction: 'PLACES_DETAILS',
        responseData: {
          status: 'SYNTAX_ERROR',
          description: 'The "id" key is empty or not a string',
        },
      },
      {
        route: '/places/details',
        test: 'API responds with network error',
        payload: {
          id: 'something',
          latitude: 0,
          longitude: 0,
        },
        types: ['empty', 'malicious', 'coordinates', 'details', 'places-details'],
        axiosResponse: {
          isAxiosError: true,
        },
        responseAction: 'PLACES_DETAILS',
        responseData: {
          status: 'CONNECTION_REFUSED',
          description: 'The requested resource cannot be reached due to a network issue',
        },
      },
      {
        route: '/places/details',
        test: 'API responds with http status 400 bad request',
        payload: {
          id: 'something',
          latitude: 0,
          longitude: 0,
        },
        types: ['empty', 'malicious', 'coordinates', 'details', 'places-details'],
        axiosResponse: {
          response: {
            status: 400,
          },
          isAxiosError: true,
        },
        responseAction: 'PLACES_DETAILS',
        responseData: {
          status: 'BAD_REQUEST',
          description: 'The requested resource cannot be accessed',
        },
      },
      {
        route: '/places/details',
        test: 'API responds with http status 403 forbidden',
        payload: {
          id: 'something',
          latitude: 0,
          longitude: 0,
        },
        types: ['empty', 'malicious', 'coordinates', 'details', 'places-details'],
        axiosResponse: {
          response: {
            status: 403,
          },
          isAxiosError: true,
        },
        responseAction: 'PLACES_DETAILS',
        responseData: {
          status: 'FORBIDDEN',
          description: 'You do not have permission to access the requested resource',
        },
      },
      {
        route: '/places/details',
        test: 'API responds with http status 404 not found',
        payload: {
          id: 'something',
          latitude: 0,
          longitude: 0,
        },
        types: ['empty', 'malicious', 'coordinates', 'details', 'places-details'],
        axiosResponse: {
          response: {
            status: 404,
          },
          isAxiosError: true,
        },
        responseAction: 'PLACES_DETAILS',
        responseData: {
          status: 'NOT_FOUND',
          description: 'The requested resource could not be found',
        },
      },
      {
        route: '/places/details',
        test: 'API responds with http status 410 gone',
        payload: {
          id: 'something',
          latitude: 0,
          longitude: 0,
        },
        types: ['empty', 'malicious', 'coordinates', 'details', 'places-details'],
        axiosResponse: {
          response: {
            status: 410,
          },
          isAxiosError: true,
        },
        responseAction: 'PLACES_DETAILS',
        responseData: {
          status: 'UNKNOWN_ERROR',
          description: 'An unknown server error has occurred',
        },
      },
      {
        route: '/places/details',
        test: 'API responds with Google sample error',
        payload: {
          id: 'something',
          latitude: 0,
          longitude: 0,
        },
        types: ['empty', 'malicious', 'coordinates', 'details', 'places-details'],
        axiosResponse: {
          response: {
            status: 418,
            data: {
              error_message: 'This is a Google sample error',
              results: [],
              status: 'SAMPLE_ERROR',
            },
          },
          isAxiosError: true,
        },
        responseAction: 'PLACES_DETAILS',
        responseData: {
          status: 'SAMPLE_ERROR',
          description: 'This is a Google sample error',
        },
      },
      {
        route: '/places/details',
        test: 'API responds with Google sample error with no description',
        payload: {
          id: 'something',
          latitude: 0,
          longitude: 0,
        },
        types: ['empty', 'malicious', 'coordinates', 'details', 'places-details'],
        axiosResponse: {
          response: {
            status: 418,
            data: {
              results: [],
              status: 'NO_DESCRIPTION_ERROR',
            },
          },
          isAxiosError: true,
        },
        responseAction: 'PLACES_DETAILS',
        responseData: {
          status: 'NO_DESCRIPTION_ERROR',
          description: '',
        },
      },
      {
        route: '/places/details',
        test: 'API responds with Google zero results error',
        payload: {
          id: 'something',
          latitude: 0,
          longitude: 0,
        },
        types: ['empty', 'malicious', 'coordinates', 'details', 'places-details'],
        axiosResponse: {
          response: {
            status: 200,
            data: {
              results: [],
              status: 'ZERO_RESULTS',
            },
          },
          isAxiosError: true,
        },
        responseAction: 'PLACES_DETAILS',
        responseData: {
          status: 'ZERO_RESULTS',
          description: 'The requested resource was found, but returned no results',
        },
      },
      {
        route: '/places/details',
        test: 'API responds with Google invalid request error',
        payload: {
          id: 'something',
          latitude: 0,
          longitude: 0,
        },
        types: ['empty', 'malicious', 'coordinates', 'details', 'places-details'],
        axiosResponse: {
          response: {
            status: 200,
            data: {
              html_attributions: [],
              results: [],
              status: 'INVALID_REQUEST',
            },
          },
          isAxiosError: true,
        },
        responseAction: 'PLACES_DETAILS',
        responseData: {
          status: 'INVALID_REQUEST',
          description: 'The requested resource is invalid because of missing parameters',
        },
      },
      {
        route: '/places/photo',
        test: 'payload is empty',
        payload: {},
        types: ['empty'],
        axiosResponse: null,
        responseAction: 'PLACES_PHOTO',
        responseData: {
          status: 'SYNTAX_ERROR',
          description: 'The content is empty or invalid',
        },
      },
      {
        route: '/places/photo',
        test: 'payload is malicious',
        payload: {
          ip: '1.1.1.1',
          ua: 'chrome',
          iat: 99999,
          exp: 99999,
        },
        types: ['empty', 'malicious'],
        axiosResponse: null,
        responseAction: 'PLACES_PHOTO',
        responseData: {
          status: 'SYSTEM_ERROR',
          description: 'The content is malicious',
        },
      },
      {
        route: '/places/photo',
        test: 'payload with empty search term',
        payload: {
          reference: '',
          max_width: 1024,
          max_height: 1024,
        },
        types: ['empty', 'malicious', 'photo'],
        axiosResponse: null,
        responseAction: 'PLACES_PHOTO',
        responseData: {
          status: 'SYNTAX_ERROR',
          description: 'The "reference" key is empty or not a string',
        },
      },
      {
        route: '/places/photo',
        test: 'payload with non-string search term',
        payload: {
          reference: 99999,
          max_width: 1024,
          max_height: 1024,
        },
        types: ['empty', 'malicious', 'photo'],
        axiosResponse: null,
        responseAction: 'PLACES_PHOTO',
        responseData: {
          status: 'SYNTAX_ERROR',
          description: 'The "reference" key is empty or not a string',
        },
      },
      {
        route: '/places/photo',
        test: 'payload with non-finite max width',
        payload: {
          reference: 'something',
          max_width: '',
          max_height: 1024,
        },
        types: ['empty', 'malicious', 'photo'],
        axiosResponse: null,
        responseAction: 'PLACES_PHOTO',
        responseData: {
          status: 'SYNTAX_ERROR',
          description: 'The "max_width" key is not a number',
        },
      },
      {
        route: '/places/photo',
        test: 'payload with non-finite max height',
        payload: {
          reference: 'something',
          max_width: 1024,
          max_height: '',
        },
        types: ['empty', 'malicious', 'photo'],
        axiosResponse: null,
        responseAction: 'PLACES_PHOTO',
        responseData: {
          status: 'SYNTAX_ERROR',
          description: 'The "max_height" key is not a number',
        },
      },
      {
        route: '/places/photo',
        test: 'API responds with network error',
        payload: {
          reference: 'something',
          max_width: 1024,
          max_height: 1024,
        },
        types: ['empty', 'malicious', 'photo', 'places-photo'],
        axiosResponse: {
          isAxiosError: true,
        },
        responseAction: 'PLACES_PHOTO',
        responseData: {
          status: 'CONNECTION_REFUSED',
          description: 'The requested resource cannot be reached due to a network issue',
        },
      },
      {
        route: '/places/photo',
        test: 'API responds with http status 400 bad request',
        payload: {
          reference: 'something',
          max_width: 1024,
          max_height: 1024,
        },
        types: ['empty', 'malicious', 'photo', 'places-photo'],
        axiosResponse: {
          response: {
            status: 400,
          },
          isAxiosError: true,
        },
        responseAction: 'PLACES_PHOTO',
        responseData: {
          status: 'BAD_REQUEST',
          description: 'The requested resource cannot be accessed',
        },
      },
      {
        route: '/places/photo',
        test: 'API responds with http status 403 forbidden',
        payload: {
          reference: 'something',
          max_width: 1024,
          max_height: 1024,
        },
        types: ['empty', 'malicious', 'photo', 'places-photo'],
        axiosResponse: {
          response: {
            status: 403,
          },
          isAxiosError: true,
        },
        responseAction: 'PLACES_PHOTO',
        responseData: {
          status: 'FORBIDDEN',
          description: 'You do not have permission to access the requested resource',
        },
      },
      {
        route: '/places/photo',
        test: 'API responds with http status 404 not found',
        payload: {
          reference: 'something',
          max_width: 1024,
          max_height: 1024,
        },
        types: ['empty', 'malicious', 'photo', 'places-photo'],
        axiosResponse: {
          response: {
            status: 404,
          },
          isAxiosError: true,
        },
        responseAction: 'PLACES_PHOTO',
        responseData: {
          status: 'NOT_FOUND',
          description: 'The requested resource could not be found',
        },
      },
      {
        route: '/places/photo',
        test: 'API responds with http status 410 gone',
        payload: {
          reference: 'something',
          max_width: 1024,
          max_height: 1024,
        },
        types: ['empty', 'malicious', 'photo', 'places-photo'],
        axiosResponse: {
          response: {
            status: 410,
          },
          isAxiosError: true,
        },
        responseAction: 'PLACES_PHOTO',
        responseData: {
          status: 'UNKNOWN_ERROR',
          description: 'An unknown server error has occurred',
        },
      },
      {
        route: '/places/photo',
        test: 'API responds with Google no photo error',
        payload: {
          reference: 'something',
          max_width: 1024,
          max_height: 1024,
        },
        types: ['empty', 'malicious', 'photo', 'places-photo'],
        axiosResponse: {
          response: {
            status: 400,
            statusText: 'Bad Request',
            data: 'buffer data',
          },
          isAxiosError: true,
        },
        responseAction: 'PLACES_PHOTO',
        responseData: {
          status: 'BAD_REQUEST',
          description: 'The requested resource cannot be accessed',
        },
      },
    ];

    /**
     * Run tests.
     *
     * @since 1.0.0
     */
    invalidRequests.forEach((invalidRequest) => {
      /**
       * If ${invalidRequest.route} (${invalidRequest.test}) is invalid, an error should be thrown.
       *
       * @since 1.0.0
       */
      it(`If ${invalidRequest.route} (${invalidRequest.test}) is invalid, an error should be thrown.`, async () => {
        // Arrange.
        payloadObject = invalidRequest.payload;
        failedResponse = invalidRequest.responseData;
        axiosResponse = invalidRequest.axiosResponse;
        consoleLogCount = 0;
        consoleErrorCount = 1;
        proxyRouterEvent.requestContext.resourcePath = invalidRequest.route;
        proxyRouterEvent.body = JSON.stringify(payloadObject);
        responseCallback.statusCode = 400;
        responseCallback.body = JSON.stringify({
          action: invalidRequest.responseAction,
          success: false,
          info: failedResponse,
        });

        spyOn(axios, 'get').and.returnValue(Promise.resolve(axiosResponse));

        // Act.
        result = await api.proxyRouter(proxyRouterEvent, lambdaContext);

        // Assert.
        if (invalidRequest.types.includes('empty')) {
          expect(console.log).toHaveBeenCalledWith(`${invalidRequest.route} checkIfEmptyOrInvalid`, payloadObject);
          consoleLogCount += 1;
        }

        if (invalidRequest.types.includes('malicious')) {
          expect(console.log).toHaveBeenCalledWith(`${invalidRequest.route} checkIfMalicious`, payloadObject);
          consoleLogCount += 1;
        }

        if (invalidRequest.types.includes('auth')) {
          expect(console.log).toHaveBeenCalledWith(`${invalidRequest.route} checkForAuth`, payloadObject);
          consoleLogCount += 1;
        }

        if (invalidRequest.types.includes('coordinates')) {
          expect(console.log).toHaveBeenCalledWith(`${invalidRequest.route} checkForCoordinates`, payloadObject);
          consoleLogCount += 1;
        }

        if (invalidRequest.types.includes('search')) {
          expect(console.log).toHaveBeenCalledWith(`${invalidRequest.route} checkForSearch`, payloadObject);
          consoleLogCount += 1;
        }

        if (invalidRequest.types.includes('details')) {
          expect(console.log).toHaveBeenCalledWith(`${invalidRequest.route} checkForDetails`, payloadObject);
          consoleLogCount += 1;
        }

        if (invalidRequest.types.includes('reviews')) {
          expect(console.log).toHaveBeenCalledWith(`${invalidRequest.route} checkForReviews`, payloadObject);
          consoleLogCount += 1;
        }

        if (invalidRequest.types.includes('photo')) {
          expect(console.log).toHaveBeenCalledWith(`${invalidRequest.route} checkForPhoto`, payloadObject);
          consoleLogCount += 1;
        }

        if (invalidRequest.types.includes('fusion-search')) {
          expect(console.error).toHaveBeenCalledWith(`${invalidRequest.route} fetchYelpFusionSearch`, axiosResponse);
          consoleErrorCount += 1;
        }

        if (invalidRequest.types.includes('fusion-details')) {
          expect(console.error).toHaveBeenCalledWith(`${invalidRequest.route} fetchYelpFusionDetails`, axiosResponse);
          consoleErrorCount += 1;
        }

        if (invalidRequest.types.includes('fusion-reviews')) {
          expect(console.error).toHaveBeenCalledWith(`${invalidRequest.route} fetchYelpFusionReviews`, axiosResponse);
          consoleErrorCount += 1;
        }

        if (invalidRequest.types.includes('geocode-locate')) {
          expect(console.error).toHaveBeenCalledWith(`${invalidRequest.route} fetchGoogleGeocode`, axiosResponse);
          consoleErrorCount += 1;
        }

        if (invalidRequest.types.includes('places-search')) {
          expect(console.error).toHaveBeenCalledWith(`${invalidRequest.route} fetchGooglePlacesSearch`, axiosResponse);
          consoleErrorCount += 1;
        }

        if (invalidRequest.types.includes('places-details')) {
          expect(console.error).toHaveBeenCalledWith(`${invalidRequest.route} fetchGooglePlacesDetails`, axiosResponse);
          consoleErrorCount += 1;
        }

        if (invalidRequest.types.includes('places-photo')) {
          expect(console.error).toHaveBeenCalledWith(`${invalidRequest.route} fetchGooglePlacesPhoto`, axiosResponse);
          consoleErrorCount += 1;
        }

        expect(console.log).toHaveBeenCalledTimes(consoleLogCount);
        expect(console.error).toHaveBeenCalledWith(`${invalidRequest.route} failedResponse`, failedResponse);
        expect(console.error).toHaveBeenCalledTimes(consoleErrorCount);
        expect(lambdaContext.done).toHaveBeenCalledWith(null, responseCallback);
        expect(result).toBeUndefined();
      });
    });
  });
});
