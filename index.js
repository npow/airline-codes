var airlinesJSON = require('./airlines.json');
var Backbone = require('backbone');

var airlines = new Backbone.Collection(airlinesJSON);

airlines.comparator = 'name';

module.exports = airlines;
