const dotenv = require('dotenv');

dotenv.config();    

const EMAIL = process.env.EMAIL;

const generateJob = (
    job_title,
    job_link,
    country,
    city = [],
    county = [],
    remote = []
) => ({
    job_title,
    job_link,
    country,
    city,
    county,
    remote,
});

const getParams = (company, logo, email=null) => {

    const params = {
        company,
        logo,
        email: email || EMAIL,
    };
   
    return params;
};

module.exports = {
    generateJob,
    getParams,
};