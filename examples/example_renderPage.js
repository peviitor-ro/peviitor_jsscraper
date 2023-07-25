const { Scraper, postApiPeViitor } = require("../index");

const url =
  "https://careers.celestica.com/search/?createNewAlert=false&q=&locationsearch=Romania&startrow=10";

  const generateJob = (job_title, job_link, city) => ({
    job_title,
    job_link,
    country: "Romania",
    city,
  })

const getJobs = async () => {
    const scraper = new Scraper(url);
    const soup = await scraper.render_page();
    const tbody = soup.find("tbody");
    const trs = tbody.findAll("tr");

    const jobs = [];

    trs.forEach((tr) => {
        const job_title = tr.find("a").text;
        const job_link = "https://careers.celestica.com" + tr.find("a").attrs.href;
        const city = tr.find("span", { class: "jobLocation" }).text.split(",")[0].trim();
        const job = generateJob(job_title, job_link, city);
        jobs.push(job);
    });

    return jobs;
};

const getParams = () => {
    const company = "Celestica";
    const logo = "https://rmkcdn.successfactors.com/bcf7807a/f4737f7e-31d4-4348-963c-8.png";
    const apikey = process.env.LAURENTIU;
    const params = {
        company,
        logo,
        apikey,
    };
    return params;
};

const run = async () => {
    const jobs = await getJobs();
    const params = getParams();
    await postApiPeViitor(jobs, params);
};

if (require.main === module) {
  run();
}

module.exports = { run, getJobs, getParams }; // this is needed for our unit test job
