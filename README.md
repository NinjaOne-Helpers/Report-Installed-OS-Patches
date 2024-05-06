# Report-Installed-OS-Patches

This tool retrieves and generates reports on installed OS patches on organization level with one call. It also offers the flexibility to choose the output format as either CSV or PDF and to define a date range.

----------------------------------------------------------------------

<h3>👉 Prerequisites </h3>
Before using this code, ensure you have the following prerequisites installed:
</br>
</br>
</br>
**Node.js:** </br>
Ensure Node.js is installed on your system. You can download and install Node.js from the official Node.js website.
</br></br>
**node-fetch:** </br> Used to make HTTP requests to the NinjaRMM API.
</br></br>
**fs:** </br>
File system module for reading and writing files.
</br></br>
**path:** </br>
Module for handling file paths.
</br></br>
**puppeteer:** </br>
Headless Chrome Node.js API used to generate PDF reports.
</br></br>

----------------------------------------------------------------------

<h3>🚀 Usage</h3>
</br>
🔑 API Credentials <br>
You need to provide your NinjaOne API credentials, including the clientId and clientSecret. These credentials authenticate your access to the NinjaOne API.
</br></br>
🌎 Region <br>
Specify the region of your NinjaOne account. This could be something like "eu" for Europe or "app" for the US.
</br></br>

📅 Date Range <br>
Choose the desired date range for the report. Options include:
- today
- yesterday
- currentWeek
- lastWeek
- currentMonth
- lastMonth

</br></br>
💾 Output Format <br>
Decide whether you want the output in CSV or PDF format.
</br></br>

----------------------------------------------------------------------

<h3>👩🏽‍🏫 Instructions</h3>
</br>
⌨️ Install Dependencies</br>
After cloning or downloading the code, navigate to the project directory in your terminal.
Run npm install to install the required dependencies.
</br></br>
⚒️ Configure Settings </br>
Open the index.js file in your preferred code editor.
Fill in the required API credentials, region, date range, and output format at the top of the code.
</br></br>
💥 Execute the Script </br>
Run the script by executing "node getPatchOSInstallations.js" in your terminal.
The tool will fetch data from the NinjaOne API and generate reports based on your specified settings.
</br></br>

----------------------------------------------------------------------

<h3>⤵️ Outputs</h3>
</br>
CSV Output:</br> 
The tool generates a CSV file for each organization, containing details of installed OS patches.
Each CSV file is named after the respective organization.
The CSV file includes columns for organization name, patch status, installation timestamp, device ID, timestamp, and KB number.
</br></br>
PDF Output:</br>  
If PDF output is chosen, the tool generates a PDF report for each organization.
Similar to CSV, each PDF file is named after the organization.
The PDF report presents the same information as the CSV but in a formatted table within the document.
</br></br>

----------------------------------------------------------------------

<h3>🤖 Error Handling</h3>
The tool handles errors gracefully, providing clear messages for any encountered issues.
</br></br>

----------------------------------------------------------------------

<h3>📝 Note:</h3>
</br>
Ensure your system has Node.js installed and configured correctly to run the script.
Make sure you have the necessary permissions and access rights to fetch data from the NinjaRMM API.
