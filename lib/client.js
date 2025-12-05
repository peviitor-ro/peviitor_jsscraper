const axios = require("axios");

class Client {
  constructor(email = undefined) {
    this.token = process.env.TOKEN || null;
    this.email = email;

    this.config = {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36",
      },
    };
  }

  #setHeader(key, value) {
    this.config.headers[key] = value;
  }

  async get_token() {
    const primary = "https://api.peviitor.ro/v5/get_token/";
    const backup = "https://api.laurentiumarian.ro/get_token";
    const data = { email: this.email };

    try {
      const response = await axios.post(primary, data, {
        headers: { "Content-Type": "application/json;charset=UTF-8" },
      });
      return response.data;
    } catch (err) {
      console.warn("Primary token failed → trying backup...");
      const backupResponse = await axios.post(backup, data, {
        headers: { "Content-Type": "application/json" },
      });
      return backupResponse.data;
    }
  }

  async ensureToken() {
    if (!this.token) {
      const response = await this.get_token();

      this.token = response.access || response.token;

      if (!this.token) {
        console.error("❌ Token invalid primit:", response);
        throw new Error("Token invalid primit de la server");
      }

      this.#setHeader("Authorization", `Bearer ${this.token}`);
    }
  }

  async postWithBackup(primaryUrl, backupUrl, data) {
    await this.ensureToken();

    try {
      return await axios.post(primaryUrl, data, this.config);
    } catch (error) {
      console.warn("Primary POST failed → trying backup...");
      return await axios.post(backupUrl, data, this.config);
    }
  }

  async post(url, data) {
    await this.ensureToken();
    return axios.post(url, data, this.config);
  }

  async get(url) {
    await this.ensureToken();
    const response = await axios.get(url, this.config);
    return response.data;
  }

  async insertJobs(jobs, company, options = {}) {
    const {
      url = "https://api.peviitor.ro/v5/add/",
      backup = "https://api.laurentiumarian.ro/jobs/add/",
      contentType = "application/json",
    } = options;

    this.#setHeader("Content-Type", contentType);

    try {
      const response = await this.postWithBackup(url, backup, jobs);
      console.log(`✅ Inserted ${jobs.length} jobs for ${company}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Both primary & backup failed for ${company}`);
      throw error;
    }
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
