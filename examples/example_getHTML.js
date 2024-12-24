const {
  Scraper,
  postApiPeViitor,
  generateJob,
  getParams,
} = require("../index");

const getJobs = async () => {
  const url = "https://www.sync.ro/jobs.html";
  const scraper = new Scraper(url);
  const type = "HTML";
  const soup = await scraper.get_soup(type);
  const divs = soup.findAll("div", { class: "job_title" });
  const jobs = [];
  divs.forEach((div) => {
    const job_title = div.text.replace(" New", "");
    const jumpTo = "#:~:text="; // all jobs are on same page -> we simply jump to the element containing the job name
    const href = job_title.split(" ").join("%20");
    const job_link = url + jumpTo + href;
    const country = "Romania";
    const city = "Craiova";
    const county = "Dolj";

    const job = generateJob(job_title, job_link, country, city, county);
    jobs.push(job);
  });
  return jobs;
};

const run = async () => {
  const company = "SyncROSoft";
  const logo =
    "https://www.sync.ro/oxygen-webhelp/template/resources/img/logo_syncrosoft.png";

  const jobs = await getJobs();
  const params = getParams(company, logo);
  await postApiPeViitor(jobs, params);
};

if (require.main === module) {
  run();
}

module.exports = { run, getJobs, getParams }; // this is needed for our unit test job
