const covid19ImpactEstimator = (data) => {
  const impact = {};
  const severeImpact = {};

  const periodInDays = data.periodType === 'days' ? data.timeToElapse : data.periodType === 'weeks' ? data.timeToElapse * 7 : data.timeToElapse * 30;
  const factor = periodInDays / 3;

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

const result = covid19ImpactEstimator({
  region: {
    name: 'Africa',
    avgAge: 19.7,
    avgDailyIncomeInUSD: 5,
    avgDailyIncomePopulation: 0.71
  },
  periodType: 'days',
  timeToElapse: 58,
  reportedCases: 674,
  population: 66622705,
  totalHospitalBeds: 1380614
});

//console.log(result);
export default covid19ImpactEstimator;
