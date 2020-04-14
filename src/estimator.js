
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
export default covid19ImpactEstimator;
