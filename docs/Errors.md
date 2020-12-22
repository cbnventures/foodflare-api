Error Messages
===============
If you have received an error message, chances are that you have run into an issue. When an error occurs, the API will specify the current `action` where it received an error.

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

---

### Action Types
On each given error response, there will be an `action` key which will explain where the error occurred first.

| Action Key       | Description                                                 |
|------------------|-------------------------------------------------------------|
| `API_GATEWAY`    | While the API is authenticating through Amazon Web Services |
| `AUTHORIZATION`  | While you are accessing the `/auth/session` endpoint        |
| `FUSION_SEARCH`  | While you are accessing the `/fusion/search` endpoint       |
| `FUSION_DETAILS` | While you are accessing the `/fusion/details` endpoint      |
| `FUSION_REVIEWS` | While you are accessing the `/fusion/reviews` endpoint      |
| `GEOCODE_LOCATE` | While you are accessing the `/geocode/locate` endpoint      |
| `PLACES_SEARCH`  | While you are accessing the `/places/search` endpoint       |
| `PLACES_DETAILS` | While you are accessing the `/places/details` endpoint      |
| `PLACES_PHOTO`   | While you are accessing the `/places/photo` endpoint        |

### Status Codes and Description
Every error object given should include a `status` and `description`. If a `description` does not exist, it should return an empty string.

| Status Code          | Description                                                                  | Derived From    |
|----------------------|------------------------------------------------------------------------------|-----------------|
| `SYSTEM_ERROR`       | When a malicious object is received, or when Node receives a system error    | `foodflare-api` |
| `SYNTAX_ERROR`       | When an endpoint receives an invalid or incorrectly formatted payload        | `foodflare-api` |
| `INVALID_API_KEY`    | The gateway responded with an invalid API key when accessing the endpoint    | `api-gateway`   |
| `QUOTA_EXCEEDED`     | The set quota limit for the usage plan is exceeded                           | `api-gateway`   |
| `THROTTLED`          | When usage plan-, method-, stage-, or account-level throttling limits exceed | `api-gateway`   |
| `UNAUTHORIZED`       | Authorization key is missing or incorrect                                    | `api-gateway`   |
| `ZERO_RESULTS`       | When the endpoint is successful, but returned no results                     | `google`        |
| `INVALID_REQUEST`    | When the request is invalid because of missing parameters                    | `google`        |
| `BAD_REQUEST`        | When the endpoint receives a 400 error, or missing parameters                | `api`, `google` |
| `FORBIDDEN`          | When the endpoint receives a 403 error                                       | `api`           |
| `NOT_FOUND`          | When the endpoint receives a 404 error                                       | `api`           |
| `CONNECTION_REFUSED` | The endpoint has a network issue and is unable to retrieve the source        | `api`           |
| `UNKNOWN_ERROR`      | An unknown server is occurred                                                | `api`           |
