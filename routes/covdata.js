/* eslint-disable consistent-return */
const errors = require('restify-errors');
const jsontoxmlconverter = require('jstoxml');
const Covdata = require('../models/covdata');

let logs = '';
const getPeriodInDays = (periodType, timeToElapse) => {
  let res;
  if (periodType === 'days') {
    res = timeToElapse;
  } else if (periodType === 'weeks') {
    res = timeToElapse * 7;
  } else {
    res = timeToElapse * 30;
  }
  return res;
};

const covid19ImpactEstimator = (data) => {
  const impact = {};
  const severeImpact = {};

  const periodInDays = getPeriodInDays(data.periodType, data.timeToElapse);
  const factor = Math.trunc(periodInDays / 3);

  impact.currentlyInfected = data.reportedCases * 10;
  severeImpact.currentlyInfected = data.reportedCases * 50;

  impact.infectionsByRequestedTime = impact.currentlyInfected * (2 ** factor);
  severeImpact.infectionsByRequestedTime = severeImpact.currentlyInfected * (2 ** factor);

  impact.severeCasesByRequestedTime = Math.trunc((impact.infectionsByRequestedTime * 15) / 100);
  severeImpact.severeCasesByRequestedTime = Math.trunc(
    (severeImpact.infectionsByRequestedTime * 15) / 100
  );

  impact.hospitalBedsByRequestedTime = Math.trunc((
    (data.totalHospitalBeds * 35) / 100 - impact.severeCasesByRequestedTime));
  severeImpact.hospitalBedsByRequestedTime = Math.trunc((
    (data.totalHospitalBeds * 35) / 100 - severeImpact.severeCasesByRequestedTime));

  impact.casesForICUByRequestedTime = Math.trunc((impact.infectionsByRequestedTime * 5) / 100);
  severeImpact.casesForICUByRequestedTime = Math.trunc(
    (severeImpact.infectionsByRequestedTime * 5) / 100
  );

  impact.casesForVentilatorsByRequestedTime = Math.trunc((
    impact.infectionsByRequestedTime * 2) / 100);
  severeImpact.casesForVentilatorsByRequestedTime = Math.trunc((
    severeImpact.infectionsByRequestedTime * 2) / 100);

  impact.dollarsInFlight = Math.trunc((
    (impact.infectionsByRequestedTime * data.region.avgDailyIncomePopulation)
        * data.region.avgDailyIncomeInUSD)
        / periodInDays);
  severeImpact.dollarsInFlight = Math.trunc((
    (severeImpact.infectionsByRequestedTime * data.region.avgDailyIncomePopulation)
            * data.region.avgDailyIncomeInUSD)
            / periodInDays);
  return { data, impact, severeImpact };
};


module.exports = (server) => {
  // Get Covdatas
  server.get('/', async (req, res, next) => {
    try {
      const covdatas = await Covdata.find({});
      res.send(covdatas);
      next();
    } catch (err) {
      return next(new errors.InvalidContentError(err));
    }
  });
  // Get logs
  server.get('/api/v1/on-covid-19/logs', async (req, res, next) => {
    try {
      res.setHeader('content-type', 'text/plain');
      res.sendRaw(logs);
      next();
    } catch (err) {
      return next(new errors.InvalidContentError(err));
    }
  });
  // Add Covdata
  server.post(
    '/api/v1/on-covid-19',
    async (req, res, next) => {
      const requestStart = Date.now();
      // Check for JSON
      if (!req.is('application/json')) {
        return next(
          new errors.InvalidContentError("Expects 'application/json'")
        );
      }

      const {
        population, timeToElapse, reportedCases, totalHospitalBeds, periodType, region
      } = req.body;

      const covdata = new Covdata({
        population, timeToElapse, reportedCases, totalHospitalBeds, periodType, region
      });

      const rep = covid19ImpactEstimator(covdata);
      try {
        await covdata.save();
        res.send(rep);
        next();
      } catch (err) {
        return next(new errors.InternalError(err.message));
      }
      res.on('finish', () => {
        const tlog = `${Date.now()}     ${req.url.substring(4)} done in ${((Date.now() - requestStart) / 1000).toFixed(2)} seconds`;
        logs += (`${tlog}`); logs += '\n';
        console.log(tlog);
      });
    }
  );

  // Add Covdata Json
  server.post(
    '/api/v1/on-covid-19/json',
    async (req, res, next) => {
      const requestStart = Date.now();
      // Check for JSON
      if (!req.is('application/json')) {
        return next(
          new errors.InvalidContentError("Expects 'application/json'")
        );
      }

      const {
        population, timeToElapse, reportedCases, totalHospitalBeds, periodType, region
      } = req.body;

      const covdata = new Covdata({
        population, timeToElapse, reportedCases, totalHospitalBeds, periodType, region
      });

      const rep = covid19ImpactEstimator(covdata);
      try {
        await covdata.save();
        res.send(rep);
        next();
      } catch (err) {
        return next(new errors.InternalError(err.message));
      }
      res.on('finish', () => {
        const tlog = `${Date.now()}\t\t${req.url.substring(4)}\t\tdone in ${((Date.now() - requestStart) / 1000).toFixed(2)} seconds`;
        logs += (`${tlog}`); logs += '\n';
        console.log(tlog);
      });
    }
  );

  // Add Covdata Xml
  server.post(
    '/api/v1/on-covid-19/xml',
    async (req, res, next) => {
      const requestStart = Date.now();
      // Check for JSON
      if (!req.is('application/json')) {
        return next(
          new errors.InvalidContentError("Expects 'application/json'")
        );
      }

      const {
        population, timeToElapse, reportedCases, totalHospitalBeds, periodType, region
      } = req.body;

      const covdata = new Covdata({
        population, timeToElapse, reportedCases, totalHospitalBeds, periodType, region
      });
      const data = {
        population, timeToElapse, reportedCases, totalHospitalBeds, periodType, region
      };

      const rep = covid19ImpactEstimator(covdata);
      const { impact, severeImpact } = rep;

      const repFin = { data, impact, severeImpact };
      try {
        // await covdata.save();
        res.setHeader('content-type', 'application/xml');
        res.sendRaw(jsontoxmlconverter.toXML(repFin));
        next();
      } catch (err) {
        return next(new errors.InternalError(err.message));
      }
      res.on('finish', () => {
        const tlog = `${Date.now()}\t\t${req.url.substring(4)}\t\tdone in ${((Date.now() - requestStart) / 1000).toFixed(2)} seconds`;
        logs += (`${tlog}`); logs += '\n';
        console.log(tlog);
      });
    }
  );
};
