var fs = require('fs');
var https = require('https');
var request = require('request');
//
// [1] Load SSL certificate and private key from files
//
var privateKey  = fs.readFileSync('key.pem', 'utf8');
var certificate = fs.readFileSync('cert.pem', 'utf8');
var credentials = {key: privateKey, cert: certificate};
 
var express = require('express');
var app = express();
//
// [2] Start a secure web server and listen on port 8443
//
var httpsServer = https.createServer(credentials, app);
console.log("Listening on port 8443...");
httpsServer.listen(8443);
//
// [3] Handle HTTPS GET requests at https://localhost:8443
//
app.get('/', function(req, res){
    console.log('New request');
 
    let httpStatusCode = undefined;
    let httpErrorMsg = undefined;
    let oAuthCode = req.query.code; // get the OAuth 2.0 code from the request URL
    let oAuthReply = undefined;
    // 
    // [4] POST request for obtaining OAuth 2.0 access token with code
    //
    var options = {
        url: 'https://api.tdameritrade.com/v1/oauth2/token',
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        form: {
            'grant_type': 'authorization_code',
            'access_type': 'offline',
            'code': oAuthCode, 
            'client_id': '0KANALZUCCXNILS2YWZPKFWT2CXQ77DA@AMER.OAUTHAP',
            'redirect_uri': 'https://localhost:8443'
        }
    }
    // 
    // [5] Make POST request
    //
    request(options, function(error, response, body) {
        httpStatusCode = (response === undefined) ? 0 : response.statusCode;
        httpErrorMsg = error;
        css = "style=\"overflow-wrap: break-word; width: 800px;\"";
 
        if (response.statusCode == 200) {
            oAuthReply = JSON.parse(body);
        }
        //
        // [6] Return view, showing the OAuth 2.0 code and access token
        //
        let html = 
        "<html><body style=\"font-family: monospace;\"><table>" +
          "<tr><td width=\"150\">Status</td><td>" + httpStatusCode + "</td></tr>" +
          "<tr><td>OAuth 2.0 Code</td><td><div " + css + ">" + oAuthCode + "</div></td></tr>" +
          //"<tr><td>OAuth 2.0 Token</td><td><div " + css + ">" + oAuthReply.access_token + "</div></td></tr>" +
          "<tr><td>Full Response</td><td><div " + css + ">" + JSON.stringify(oAuthReply, null, 4) + "</div></td></tr>" +
        "</table></body></html>";
 
        res.send(html);
    });
 
    function errorHandler (err, req, res, next) {
        res.status(500)
        res.render('error', { error: err })
    }
});