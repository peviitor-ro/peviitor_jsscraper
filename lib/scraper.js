const axios = require("axios");
const Jssoup = require("jssoup").default;

class Scraper {
  constructor(url) {
    this.url = url;
    this.config = {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36",
      },
    };
  }

  /**
   * @summary Wrapper for jssoup & axios.
   * @param {("HTML"|"JSON")} type Type of data received
   * @returns {(jssoup|response.data)}
   * @example
   * // HTML
   * const url = "https://www.sync.ro/jobs.html";
   * const scraper = new Scraper(url);
   * const type = "HTML";
   * const soup = await scraper.get_soup(type);
   * // JSON
   * const url =
   * "https://careers.abbvie.com/en/search-jobs/results?ActiveFacetID=798549-683504&CurrentPage=1&RecordsPerPage=100&Distance=100&RadiusUnitType=0&ShowRadius=False&IsPagination=False&FacetTerm=798549&FacetType=2&FacetFilters%5B0%5D.ID=798549&FacetFilters%5B0%5D.FacetType=2&FacetFilters%5B0%5D.Count=7&FacetFilters%5B0%5D.Display=Romania&FacetFilters%5B0%5D.IsApplied=true&FacetFilters%5B0%5D.FieldName=&SearchResultsModuleName=Search+Results&SearchFiltersModuleName=Search+Filters&SortCriteria=0&SortDirection=0&SearchType=3&OrganizationIds=14&ResultsType=0";
   * const scraper = new Scraper(url);
   * const additionalHeaders = {
   *   "Content-Type": "application/json",
   *   Accept: "application/json",
   *   "Accept-Language": "en-GB,en;q=0.9",
   * };
   * scraper.config.headers = { ...scraper.config.headers, ...additionalHeaders };
   * const type = "JSON";
   * const res = await scraper.get_soup(type);
   * const html = res.results;
   * const soup = new Jssoup(html);
   */
  async get_soup(type) {
    let soup;
    const typeFormatted = type.replace(/\s/g, "").toUpperCase();
    switch (typeFormatted) {
      case "HTML":
        await axios
          .get(this.url, this.config)
          .then((response) => {
            soup = new Jssoup(response.data);
          })
          .catch((error) => {
            console.error(`Couldn't get soup from ${this.url}`);
            throw new Error(error);
          });
        return soup;
      case "JSON":
        await axios
          .get(this.url, this.config)
          .then((response) => {
            soup = response.data;
          })
          .catch((error) => {
            console.error(`Couldn't get soup from ${this.url}`);
            throw new Error(error);
          });
        return soup;
      default:
        throw new Error(`Invalid soup type: ${typeFormatted}`);
    }
  }

  /**
   * @summary Wrapper for axios
   * @param {Object} data
   * @returns {response.data}
   * @example
   * const url =
   * "https://adient.wd3.myworkdayjobs.com/wday/cxs/adient/External/jobs";
   * const scraper = new Scraper(url);
   * const additionalHeaders = {
   * "Content-Type": "application/json",
   * Accept: "application/json",
   * };
   * scraper.config.headers = { ...scraper.config.headers, ...additionalHeaders };
   * const data = {
   *  appliedFacets: { Location_Country: ["f2e609fe92974a55a05fc1cdc2852122"] },
   *  limit: 20,
   *  offset: 0,
   *  searchText: "",
   * };
   * const soup = await scraper.post(data);
   */
  async post(data) {
    let soup;
    await axios
      .post(this.url, data, this.headers)
      .then((response) => {
        soup = response.data;
      })
      .catch((error) => {
        console.error(`Couldn't get soup from ${this.url}`);
        throw new Error(error);
      });
    return soup;
  }
}

module.exports = Scraper;
