# Getting Started
- Run `npm ci`
- `cd src`
- `node app.js` or `npm start`

## Adding ssl to the server

```bash
#Create key and certificate:
openssl req -newkey rsa:2048 -new -nodes -x509 -days 3650 -keyout key.pem -out cert.pem

# Create sslcert folder and move the files there:
mkdir sslcert && mv *.pem sslcert
```
