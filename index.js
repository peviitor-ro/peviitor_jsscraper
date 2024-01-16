const { Scraper, Client } = require("./lib");

/**
 * @summary Application interface for posting new jobs to https://peviitor.ro/
 * @param {Array.<{job_title: String, job_link: String, country: String, city: String}>} jobs An array of "job" objects. Each job should contain:
 * - job_title: Position e.g "Software Engineer"
 * - job_link: Job url
 * - country: Country name
 * - city: City name
 * @param {Object} params Remaining parameters:
 * - params.company: Company name
 * - params.logo: Logo url
 * - params.apikey: Key fetched from https://dev.peviitor.ro/. Must be defined in github secrets, hence the use of process.env
 * @param {String} params.company
 * @param {String} params.logo
 * @param {String} params.apikey
 */
const postApiPeViitor = async (jobs, params) => {
  const { company, logo, apikey = process.env.APIKEY } = params;
  const client = new Client(apikey);

  if (jobs.length === 0) throw new Error(`Joblist for ${company} is empty`);
  for (let i = 0; i < jobs.length; i += 1) {
    const companyTrimmed = company.replace(/\s/g, ""); // Todo -> create a general purpose validator
    jobs[i] = { ...jobs[i], company: companyTrimmed };
  }

  console.log(`Joblist: ${JSON.stringify(jobs, null, 2)}`);
  await Client.postCompany(company);
  await client.deleteJobs(company);
  await client.insertJobs(jobs, company);
  await client.postLogo(logo, company);
  await client.postDataSet(company, jobs);
  console.log(`${company} SUCCESS!`);
};

/**
 * Helper function for pagination
 * @param {Number} start Usually 0
 * @param {Number} stop E.g: Total number of jobs
 * @param {Number} step E.g: Jobs per page
 * @returns
 */
const range = (start, stop, step) =>
  Array.from({ length: (stop - start) / step + 1 }, (_, i) => start + i * step);

module.exports = {
  Scraper,
  postApiPeViitor,
  range,
};
