const mongoose = require('mongoose');

const CovdataSchema = new mongoose.Schema({
  periodType: {
    type: String,
    required: true,
    trim: true
  },
  timeToElapse: {
    type: Number,
    default: 0
  },
  reportedCases: {
    type: Number,
    default: 0
  },
  totalHospitalBeds: {
    type: Number,
    default: 0
  },
  population: {
    type: Number,
    default: 0
  },
  region: {
    type: Object
  }

});


const Customer = mongoose.model('Covdata', CovdataSchema);
module.exports = Customer;
