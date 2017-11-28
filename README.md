## ionic_oauth
------------------

a simple ionic app using pod oauth.

## about sso
------------------
In this sample app authorization code flow is implemented,first you redirect to /oauth2/authorize endpoint with parameters
like table below to input their username and password:


Request | Response (redirect)
------- | --------
https://auth2server.com/oauth2/authorize | https://example.com/oauth/callback
?client_id=client_id | ?code=code
&response_type=code |  
&redirect_uri=redirect_uri |

For prompting sign up form just add prompt=signup parameter to the above request.                               
Then you must use the returned code to request token, this time you send a request to _/oauth2/token_ endpoint like table below:

 
Request | Response
------- | --------
POST https://auth2server.com/oauth2/token | {
  ?grant_type=authorization_code | "access_token": 'access_token',
  &code=code | "token_type": "Bearer",
  &redirect_uri=redirect_uri | "expires_in": 3600,
  &client_id=client_id | "scope": "profile email",
  &client_secret=client_secret |  "refresh_token": 'refresh_token',
  &nbsp;| "id_token": "jwt_token"
   &nbsp;| }

You can use the retrieved token to access user information by sending GET request to the _/user_ endpoint: 

```http
https://auth2server.com/user
```
the token must be sent using header like this:

Key | Value
--- | -----
Authorization | Bearer _THE_TOKEN_STRING_

for study more about Oauth2 concept see the link below:
https://aaronparecki.com/oauth-2-simplified/ 


How to use this project
-----------------------

This project is built using ionic framework. After cloning or downloading this project you must run `npm install` in the main directory of it then must run `ionic cordova platform add android` in the main directory of it then you have to edit config.ts and insert real values in right place:

```typescript
    
export class ConfigModule{
    sso_service:string = '__http://SERVICE.ENDPOINT/_';
    sso:string= '__http://SERVICE.ENDPOINT/oauth__';
    client_id:string = '__CLIENT_ID__';
    redirect_uri:string = 'http://example.com';
    client_secret:string = '__CLIENT_SECRET__';
    constructor(){

    }
}

```
