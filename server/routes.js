'use strict';

const path = require('path')
const errors = require('./components/errors')
const request = require('request')
const cors = require('cors')
const parseString = require('xml2js').parseString

module.exports = function (app) {

   app.use(cors())

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
       // https://tidesandcurrents.noaa.gov/api/datagetter?begin_date=20130101 10:00&end_date=20130101 10:24&station=8454000&product=high_low&datum=mllw&units=metric&time_zone=gmt&application=web_services&format=xml

       var q = req.query; // station: 8454000; begin_date: 20130808 15:00; end_date=20130808 15:06;
       var requestURL = `https://tidesandcurrents.noaa.gov/api/datagetter`
       var params = {
           begin_date: q.begin_date,
           end_date: q.end_date,
           station: q.station,
           product: 'predictions',
           units: 'english',
           interval: 'hilo',
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
