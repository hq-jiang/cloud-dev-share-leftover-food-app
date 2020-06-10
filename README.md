# Share Leftover Food App


### How to authenticate in Postman

1. Go to the `Authorization` tab in the Postman collection. All requests will inherit this authorization method
2. Select Type `OAuth2.0` and `Request Headers`
![alt text](./docs/auth_instructions_0.png)
3. Select `Get New Access Token`
4. Enter the following information and click `Get New Access Token`
    - `Grant Type`: `Authorization Code`
    - `Callback Url`: http://localhost:3000/callback
    - Uncheck `Authorize using browser`
    - `Auth URL`: https://dev-kmdcgf-x.eu.auth0.com/authorize/
    - `Access Token Url`: https://dev-kmdcgf-x.eu.auth0.com/oauth/token
    - `Client ID`: aCwMOQJKS9BPJWDkyOe3Alc2KE6E9Qty
    - Leave `Client Secret` empty
    - `Scope`: openid
    - Leave `State` empty
    - For `Client Authentication` select `Send as Basic Auth header`
![alt text](./docs/auth_instructions_1.png)
5. You should be greeted with a login/registration page. Please register and login. Note: Clear cookies in Postman if there are cookies from previous sessions (https://stackoverflow.com/questions/28305273/how-to-delete-session-cookie-in-postman)
![alt text](./docs/auth_instructions_4.png)
7. **DO NOT CLICK `Use Token`**, it does not work. Instead, copy the `id_token` into the Access Token field.
![alt text](./docs/auth_instructions_2.png)
![alt text](./docs/auth_instructions_3.png)
8. Now you should be able to do all requests.