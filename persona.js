const env = require('./env');
const util = require('util');
const https = require('https');

const VERIFIER_REQUEST_OPTS = {
  host: 'verifier.login.persona.org',
  path: '/verify',
  port: 443,
  method: 'POST'
};

function getAudience() {
  return env.get('origin');
}

function makeRequestOptions(postData) {
  const opts = Object.create(VERIFIER_REQUEST_OPTS);
  opts.headers = {
    'Content-Length': postData.length,
    'Content-Type': 'application/json',
    'User-Agent': 'Persona Login Thingy'
  };
  return opts;
}

exports.verify = function verify(assertion, callback) {
  const audience = getAudience();
  const postData = JSON.stringify({
    assertion: assertion,
    audience: audience
  });

  const options = makeRequestOptions(postData);
  https.request(options, function (res) {
    var body = Buffer(0);
    var err, response;
    res.on('data', function (buf) { body = Buffer.concat([body, buf]); });
    res.on('end', function () {
      response = JSON.parse(body.toString());
      if (response.status !== 'okay') {
        err = new Error(response.reason);
        return callback(err);
      }
      if (!response.email) {
        err = new Error('could not get email from supposedly okay response');
        return callback(err);
      }
      return callback(null, response.email);
    });
  }).on('error', function (err) {
    return callback(err);
  }).end(postData);
};