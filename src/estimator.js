
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
  const factor = Math.floor(periodInDays / 3);

  impact.currentlyInfected = data.reportedCases * 10;
  severeImpact.currentlyInfected = data.reportedCases * 50;

  impact.infectionsByRequestedTime = impact.currentlyInfected * (2 ** factor);
  severeImpact.infectionsByRequestedTime = severeImpact.currentlyInfected * (2 ** factor);

  impact.severeCasesByRequestedTime = (impact.infectionsByRequestedTime * 15) / 100;
  severeImpact.severeCasesByRequestedTime = (severeImpact.infectionsByRequestedTime * 15) / 100;

  impact.hospitalBedsByRequestedTime = (
    (data.totalHospitalBeds * 35) / 100 - impact.severeCasesByRequestedTime);
  severeImpact.hospitalBedsByRequestedTime = (
    (data.totalHospitalBeds * 35) / 100 - severeImpact.severeCasesByRequestedTime);

  impact.casesForICUByRequestedTime = (impact.infectionsByRequestedTime * 5) / 100;
  severeImpact.casesForICUByRequestedTime = (severeImpact.infectionsByRequestedTime * 5) / 100;

  impact.casesForVentilatorsByRequestedTime = (
    impact.infectionsByRequestedTime * 2) / 100;
  severeImpact.casesForVentilatorsByRequestedTime = (
    severeImpact.infectionsByRequestedTime * 2) / 100;

  impact.dollarsInFlight = (
    (impact.infectionsByRequestedTime * data.region.avgDailyIncomePopulation)
    * data.region.avgDailyIncomeInUSD)
    * periodInDays;
  severeImpact.dollarsInFlight = (
    (severeImpact.infectionsByRequestedTime * data.region.avgDailyIncomePopulation)
        * data.region.avgDailyIncomeInUSD)
        * periodInDays;
  return { data, impact, severeImpact };
};
export default covid19ImpactEstimator;
