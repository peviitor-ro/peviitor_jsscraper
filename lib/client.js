const axios = require("axios");

class Client {
  constructor(apikey = undefined) {
    if (typeof apikey === "undefined")
      throw new Error("Error: apikey must be defined");
    this.config = {
      headers: {
        apikey,
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36",
      },
    };
  }

  #setHeader(key, value) {
    this.config.headers[key] = value;
  }

  async get(url, config = this.config) {
    const response = await axios.get(url, config);
    return response.data;
  }

  post(url, data, config = this.config) {
    const response = axios.post(url, data, config);
    return response; // Return the promise and handle errors. See insertJobs() for example
  }

  static async postCompany(
    company,
    url = "https://dev.laurentiumarian.ro/scraper/based_scraper_js/"
  ) {
    const resolveDataObject = { status: `${company.toLowerCase()}.js` };
    await axios
      .post(url, JSON.stringify(resolveDataObject))
      .then(console.log(`Uploaded refference for ${company}`))
      .catch((error) => {
        console.error(`Couldn't upload refference for ${company}`);
        throw new Error(error);
      });
  }

  async deleteJobs(company, options = {}) {
    const {
      url = "https://api.peviitor.ro/v4/clean/",
      contentType = "application/x-www-form-urlencoded",
    } = options;
    const dataObject = { company };
    const header = "Content-Type";
    this.#setHeader(header, contentType);
    await this.post(url, dataObject)
      .then(console.log(`Cleaned jobs for ${company}`))
      .catch((error) => {
        console.error(`Couldn't clean jobs for ${company}`);
        throw new Error(error);
      });
  }

  async insertJobs(jobs, company, options = {}) {
    const {
      url = "https://api.peviitor.ro/v4/update/",
      contentType = "application/json",
    } = options;
    const jobsNumber = jobs.length;
    const header = "Content-Type";
    this.#setHeader(header, contentType);
    await this.post(url, JSON.stringify(jobs))
      .then(console.log(`Inserted ${jobsNumber} jobs for ${company}`))
      .catch((error) => {
        console.error(`Couldn't insert jobs for ${company}`);
        throw new Error(error);
      });
  }

  async postLogo(logo, company, options = {}) {
    const {
      url = "https://api.peviitor.ro/v1/logo/add/",
      contentType = "application/json",
    } = options;
    const data = [{ id: company, logo }];
    const header = "Content-Type";
    this.#setHeader(header, contentType);
    await this.post(url, JSON.stringify(data))
      .then(console.log(`Inserted logo for ${company}`))
      .catch((error) => {
        console.error(`Couldn't insert logo for ${company}`);
        throw new Error(error);
      });
  }
}

module.exports = Client;
