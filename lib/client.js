const axios = require("axios");

class Client {
  constructor(email = undefined) {
    this.email = email;
    this.token = process.env.TOKEN || null;

    this.config = {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36",
        "Content-Type": "application/json",
      },
      timeout: 30000,
    };
  }

  // =============================
  // Private helpers
  // =============================

  #setHeader(key, value) {
    this.config.headers[key] = value;
  }

  #setAuthHeader() {
    if (!this.token) return;
    this.#setHeader("Authorization", `Bearer ${this.token}`);
  }

  // =============================
  // Token management
  // =============================

  async get_token() {
    const primary = "https://api.peviitor.ro/v5/get_token/";
    const backup = "https://api.laurentiumarian.ro/get_token";

    const data = { email: this.email };

    try {
      const response = await axios.post(primary, data, {
        headers: { "Content-Type": "application/json" },
      });

      return response.data;
    } catch (err) {
      console.warn("⚠️ Primary token failed → trying backup");

      const response = await axios.post(backup, data, {
        headers: { "Content-Type": "application/json" },
      });

      return response.data;
    }
  }

  async ensureToken(forceRefresh = false) {
    if (!this.token || forceRefresh) {
      const response = await this.get_token();
      this.token = response.access || response.token;

      if (!this.token) {
        console.error("❌ Invalid token response:", response);
        throw new Error("Token invalid");
      }
    }

    this.#setAuthHeader();
  }

  // =============================
  // Request helpers
  // =============================

  async safePost(url, data) {
    await this.ensureToken();

    try {
      return await axios.post(url, data, this.config);
    } catch (err) {
      // Dacă token expirat → refresh + retry
      if (err.response?.status === 401 || err.response?.status === 403) {
        console.warn("🔄 Token might be expired → refreshing...");

        await this.ensureToken(true);

        return await axios.post(url, data, this.config);
      }

      throw err;
    }
  }

  async postWithBackup(primaryUrl, backupUrl, data) {
    try {
      return await this.safePost(primaryUrl, data);
    } catch (err) {
      console.warn("⚠️ Primary POST failed → trying backup");

      return await this.safePost(backupUrl, data);
    }
  }

  // =============================
  // Public API
  // =============================

  async post(url, data) {
    return this.safePost(url, data);
  }

  async get(url) {
    await this.ensureToken();

    try {
      const res = await axios.get(url, this.config);
      return res.data;
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        await this.ensureToken(true);
        const res = await axios.get(url, this.config);
        return res.data;
      }

      throw err;
    }
  }

  async insertJobs(jobs, company, options = {}) {
    const {
      url = "https://api.peviitor.ro/v5/add/",
      backup = "https://api.laurentiumarian.ro/jobs/add/",
    } = options;

    try {
      const response = await this.postWithBackup(url, backup, jobs);

      console.log(`✅ Inserted ${jobs.length} jobs for ${company}`);

      return response.data;
    } catch (err) {
      console.error(`❌ Insert failed for ${company}`);
      console.error("Status:", err.response?.status);
      console.error("Data:", err.response?.data);
      throw err;
    }
  }

  async postLogo(logo, company, options = {}) {
    const { url = "https://api.peviitor.ro/v3/logo/add/" } = options;

    const data = [{ id: company, logo }];

    try {
      await this.post(url, data);
      console.log(`✅ Logo inserted for ${company}`);
    } catch (err) {
      console.error(`❌ Logo insert failed for ${company}`);
      throw err;
    }
  }
}

module.exports = { Client };
