const axios = require("axios");

class Client {
  constructor(email = undefined) {
    this.token = process.env.TOKEN ? process.env.TOKEN : process
    this.email = email;

    this.config = {
      headers: {
        Authorization: `Bearer ${this.token}`,
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36",
      },
    };
  }

  #setHeader(key, value) {
    this.config.headers[key] = value;
  }

  async get(url, config = this.config) {
    if (!this.token) {
      this.token = await this.get_token().then((response) => response.access);
      this.#setHeader("Authorization", `Bearer ${this.token}`);
    }
    const response = await axios.get(url, config);
    return response.data;
  }

  async post(url, data, config = this.config) {
    if (!this.token) {
      this.token = await this.get_token().then((response) => response.access);
      console.log(this.token);
      this.#setHeader("Authorization", `Bearer ${this.token}`);
    }
    const response = await axios.post(url, data, config);
    return response; // Return the promise and handle errors. See insertJobs() for example
  }

  async get_token() {
    const url = "https://api.peviitor.ro/v5/get_token/";
    const headers = {
      "Content-Type": "application/json, charset=utf-8",
    };
    const data = { email: this.email };
    const response = await axios.post(url, data, { headers });
    return response.data;
  }

  async insertJobs(jobs, company, options = {}) {
    const {
      url = "https://api.peviitor.ro/v5/add/",
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
      url = "https://api.peviitor.ro/v3/logo/add/",
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

module.exports = { Client };
