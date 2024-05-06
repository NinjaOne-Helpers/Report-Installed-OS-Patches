// ENTER YOUR API CREDENTIALS
const clientId = "";
const clientSecret = "";
// DEFINE YOUR REGION (eu = Europe, app = US)
const accountRegion = "eu";
// DEFINE DATE RANGE (today, yesterday, currentWeek, lastWeek, currentMonth, lastMonth)
const dateRange = "currentWeek";
const customDateRange = "";
// DEFINE OUTPUT FORMAT (pdf or csv)
const outputFormat = "pdf";

const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");

if (dateRange && customDateRange) {
  throw new Error(
    "ERROR: Both dateRange and customDateRange are defined, but only one of them can be used at a time."
  );
}

async function main() {
  const fetch = (await import("node-fetch")).default;

  const url = `https://${accountRegion}.rmmservice.${accountRegion}/ws/oauth/token`;
  const options = {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
      scope: "monitoring",
    }),
  };

  try {
    const response = await fetch(url, options);
    const data = await response.json();

    let installedAfter, installedBefore;

    switch (dateRange) {
      case "today":
        installedAfter = new Date();
        installedAfter.setHours(0, 0, 0, 0);
        installedBefore = new Date();
        installedBefore.setHours(23, 59, 59, 999);
        break;
      case "yesterday":
        installedAfter = new Date();
        installedAfter.setDate(installedAfter.getDate() - 1);
        installedAfter.setHours(0, 0, 0, 0);
        installedBefore = new Date(installedAfter);
        installedBefore.setHours(23, 59, 59, 999);
        break;
      case "currentWeek":
        installedAfter = new Date();
        installedAfter.setDate(
          installedAfter.getDate() - installedAfter.getDay()
        );
        installedAfter.setHours(0, 0, 0, 0);
        installedBefore = new Date(installedAfter);
        installedBefore.setDate(installedAfter.getDate() + 6);
        installedBefore.setHours(23, 59, 59, 999);
        break;
      case "lastWeek":
        installedAfter = new Date();
        installedAfter.setDate(
          installedAfter.getDate() - installedAfter.getDay() - 6 - 7
        );
        installedAfter.setHours(0, 0, 0, 0);
        installedBefore = new Date(installedAfter);
        installedBefore.setDate(installedAfter.getDate() + 6);
        installedBefore.setHours(23, 59, 59, 999);
        break;
      case "currentMonth":
        installedAfter = new Date();
        installedAfter.setDate(1);
        installedAfter.setHours(0, 0, 0, 0);
        installedBefore = new Date();
        installedBefore.setMonth(installedBefore.getMonth() + 1);
        installedBefore.setDate(0);
        installedBefore.setHours(23, 59, 59, 999);
        break;
      case "lastMonth":
        installedAfter = new Date();
        installedAfter.setDate(1);
        installedAfter.setMonth(installedAfter.getMonth() - 1);
        installedAfter.setHours(0, 0, 0, 0);
        installedBefore = new Date(installedAfter);
        installedBefore.setMonth(installedBefore.getMonth() + 1);
        installedBefore.setDate(0);
        installedBefore.setHours(23, 59, 59, 999);
        break;
      default:
        throw new Error(
          `No valid format for dateRange. Following formats are supported: today, yesterday, currentWeek, lastWeek, currentMonth, lastMonth - But not "${dateRange}" as you entered`
        );
    }

    const getAllOrganizationsUrl = `https://${accountRegion}.rmmservice.${accountRegion}/v2/organizations`;
    const getAllOrganizationsOptions = {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${data.access_token}`,
      },
    };

    const organizationsResponse = await fetch(
      getAllOrganizationsUrl,
      getAllOrganizationsOptions
    );
    const organizationsData = await organizationsResponse.json();

    if (!Array.isArray(organizationsData)) {
      console.log(organizationsData);
      throw new Error("Invalid Format");
    }

    for (const org of organizationsData) {
      const getInstalledOSPatchesUrl = `https://${accountRegion}.ninjarmm.com/v2/queries/os-patch-installs?df=org=${
        org.id
      }&installedAfter=${installedAfter.toISOString()}&installedBefore=${installedBefore.toISOString()}`;
      const getInstalledOSoptions = {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${data.access_token}`,
        },
      };

      const response2 = await fetch(
        getInstalledOSPatchesUrl,
        getInstalledOSoptions
      );
      const jsonData = await response2.json();

      if (outputFormat === "csv") {
        generateCSV(org, jsonData);
      } else if (outputFormat === "pdf") {
        await generatePDF(org, jsonData);
      } else {
        throw new Error(`Invalid output format: ${outputFormat}`);
      }
    }

    console.log("All reports successfully generated.");
  } catch (error) {
    console.error(error);
  }
}

async function generateCSV(org, jsonData) {
  try {
    // For debugging only
    // console.log(`Generating CSV for ${org.name}...`);

    if (jsonData.results && jsonData.results.length > 0) {
      const headers = Object.keys(jsonData.results[0]).filter(
        (header) => header !== "id"
      );

      const csvData = [];
      csvData.push(["Organization", ...headers]);

      jsonData.results.forEach((obj) => {
        const values = headers.map((header) => {
          let value = obj[header];
          if (header === "timestamp" || header === "installedAt") {
            value = new Date(value * 1000)
              .toISOString()
              .replace(/T/, " ")
              .replace(/\..+/, "");
          }
          return typeof value === "string" && value.includes(",")
            ? `"${value}"`
            : value;
        });

        csvData.push([org.name, ...values]);
      });

      const downloadDir = process.env.HOME || process.env.USERPROFILE;
      const csvFilePath = path.join(downloadDir, `${org.name}.csv`);
      fs.writeFileSync(
        csvFilePath,
        csvData.map((row) => row.join(",")).join("\n")
      );

      console.log(`CSV generated for ${org.name}.`);
    } else {
      // For debuggin only
      // console.log(
      //   `No data available for ${org.name}. Skipping CSV generation.`
      // );
    }
  } catch (error) {
    console.error(`Error generating CSV for ${org.name}:`, error);
  }
}

async function generatePDF(org, jsonData) {
  try {
    // For debugging only
    // console.log(`Generating PDF for ${org.name}...`);

    if (jsonData.results && jsonData.results.length > 0) {
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      const content = generatePDFContent(org, jsonData);
      await page.setContent(content);
      const downloadDir = process.env.HOME || process.env.USERPROFILE;
      const pdfPath = path.join(downloadDir, `${org.name}.pdf`);
      await page.pdf({ path: pdfPath, format: "A4" });

      console.log(`PDF generated for ${org.name}.`);
      await browser.close();
    } else {
      // For debugging only
      // console.log(
      //   `No data available for ${org.name}. Skipping PDF generation.`
      // );
    }
  } catch (error) {
    console.error(`Error generating PDF for ${org.name}:`, error);
  }
}

function generatePDFContent(org, jsonData) {
  const headers = Object.keys(jsonData.results[0]).filter(
    (header) => header !== "id"
  );
  const rows = [];

  jsonData.results.forEach((obj) => {
    const values = headers.map((header) => {
      let value = obj[header];
      if (header === "timestamp" || header === "installedAt") {
        value = new Date(value * 1000)
          .toISOString()
          .replace(/T/, " ")
          .replace(/\..+/, "");
      }
      return typeof value === "string" && value.includes(",")
        ? `"${value}"`
        : value;
    });

    rows.push(
      `<tr><td style="font-family: Arial, sans-serif">${
        org.name
      }</td><td>${values.join("</td><td>")}</td></tr>`
    );
  });

  return `
    <html>
      <head>
        <style>
          table {
            font-family: Arial, sans-serif;
            border-collapse: collapse;
            width: 100%;
          }
          th {
            background-color: #f2f2f2;
          }
          th, td {
            border: 1px solid #dddddd;
            text-align: left;
            padding: 8px;
          }
        </style>
      </head>
      <body>
        <h2>${org.name}</h2>
        <table>
          <tr><th>Organization</th><th>${headers.join("</th><th>")}</th></tr>
          ${rows.join("")}
        </table>
      </body>
    </html>
  `;
}

main();
