# Refresh Token

Extends the expiration of a previously generated token.

**URL** : `/api/refreshToken`

**Method** : `GET`

**Auth required** : YES

**Headers**

```json
Authorization: Bearer <token>
```

## Success Response

**HTTP Status Code** : `200 OK`

**Content example**

```json
{
	"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
}
```

## Error Responses

**HTTP Status Code** : `400 Bad Request`

**Condition** : The token fails to be decoded.

**Content example**

```json
{
	"success": false,
	"message": "Given token could not be decoded."
}
```

OR

**HTTP Status Code** : `500 Internal Server Error`

**Condition** : The token is not refreshed due to a server error.

**Content example**

```json
{
	"success": false,
	"message": "Unable to refresh the given token."
}
```