'use strict';

const path = require('path')
const errors = require('./components/errors')
const request = require('request')
const parseString = require('xml2js').parseString

module.exports = function (app) {

   app.get('/api/tides', function (req, res) {
       var q = req.query; // station: 8454000; begin_date: 20130808 15:00; end_date=20130808 15:06;
       var requestURL = `https://tidesandcurrents.noaa.gov/api/datagetter`
       var params = {
           begin_date: q.begin_date,
           end_date: q.end_date,
           station: q.station,
           product: q.product,
           units: 'english',
           time_zone: 'gmt',
           application: 'tideboard',
           format: 'json',
           datum: 'MLLW'
       }
       request({url:requestURL, qs:params}, function (error, response, body) {
           if (!error && response.statusCode == 200) {
               var result = JSON.parse(body)
               res.send(drawBody(result.predictions));
           }
       })
   })

   app.get('/api/highlow', function (req, res) {
       var q = req.query; // station: 8454000; begin_date: 20130808 15:00; end_date=20130808 15:06;
       var requestURL = `https://opendap.co-ops.nos.noaa.gov/axis/webservices/highlowtidepred/response.jsp`
       var params = {
           beginDate: q.begin_date,
           endDate: q.end_date,
           stationId: q.station,
           unit: 1,
           timeZone: '1',
           application: 'tideboard',
           format: 'xml',
           datum: 'MLLW'
       }
       request({url:requestURL, qs:params}, function (error, response, body) {

           if (!error && response.statusCode == 200) {
               parseString(body, function (err, result) {
                   res.send(JSON.stringify(result['soapenv:Envelope']['soapenv:Body'][0]['HighLowAndMetadata'][0]['HighLowValues'][0]['item']))
               });
           }
       })
   })


   // All undefined asset routes should return a 404
   app.route('/:url(app|components|bower_components)/*')
    .get(errors[404]);

  // All other routes should redirect to the index.html
  app.route('/*')
    .get(function (req, res) {
      res.sendFile(path.join(app.get('appPath'), 'index.html'));
    });
};

function drawBody(data){
    if (!data.error) {
        return `${JSON.stringify(data)}`
    }
    return `${data.error.message}`
}
