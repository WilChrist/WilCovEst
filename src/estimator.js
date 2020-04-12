
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

  impact.severeCasesByRequestedTime = Math.floor((impact.infectionsByRequestedTime * 15) / 100);
  severeImpact.severeCasesByRequestedTime = Math.floor((severeImpact.infectionsByRequestedTime * 15) / 100);

  impact.hospitalBedsByRequestedTime = Math.floor((
    (data.totalHospitalBeds * 35) / 100 - impact.severeCasesByRequestedTime));
  severeImpact.hospitalBedsByRequestedTime = Math.floor((
    (data.totalHospitalBeds * 35) / 100 - severeImpact.severeCasesByRequestedTime));

  impact.casesForICUByRequestedTime = Math.floor((impact.infectionsByRequestedTime * 5) / 100);
  severeImpact.casesForICUByRequestedTime = Math.floor((severeImpact.infectionsByRequestedTime * 5) / 100);

  impact.casesForVentilatorsByRequestedTime = Math.floor((
    impact.infectionsByRequestedTime * 2) / 100);
  severeImpact.casesForVentilatorsByRequestedTime = Math.floor((
    severeImpact.infectionsByRequestedTime * 2) / 100);

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
