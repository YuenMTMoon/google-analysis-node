'use strict';
function main(propertyId = '', requestTitle = '') {
  process.env.GOOGLE_APPLICATION_CREDENTIALS="./"
  propertyId = '';
  requestTitle = '';

  const {BetaAnalyticsDataClient} = require('@google-analytics/data');

  const analyticsDataClient = new BetaAnalyticsDataClient();

  async function runBatchReport() {
    const [response] = await analyticsDataClient.batchRunReports({
        property: `properties/${propertyId}`,
        requests: [
          {
            dimensions: [
              {
                name: 'dateHourMinute',
                name: 'country',
              },
            ],
            metrics: [
              {
                name: 'activeUsers',
              },
            ],
            dateRanges: [
              {
                startDate: '30daysAgo',
                endDate: 'today',
              },
            ],
            dimensionFilter: {
                filter:{
                  fieldName:"pageTitle",
                  stringFilter:{
                    value:`${requestTitle}`,
                  }
              }
            }
          },
          {
            dimensions: [
              {
                name: 'country',
              },
            ],
            metrics: [
              {
                name: 'activeUsers',
              },
            ],
            dateRanges: [
              {
                startDate: '90daysAgo',
                endDate: 'today',
              },
            ],
            dimensionFilter: {
                filter:{
                  fieldName:"pageTitle",
                  stringFilter:{
                    value:`${requestTitle}`,
                  }
              }
            }
          },
        ],
      });
  

    console.log('Batch report results:');
    response.reports.forEach(report => {
      printRunReportResponse(report);
    });
  }

  runBatchReport();

  // Prints results of a runReport call.
  function printRunReportResponse(response) {
    //[START analyticsdata_print_run_report_response_header]
    console.log(`${response.rowCount} rows received`);
    response.dimensionHeaders.forEach(dimensionHeader => {
      console.log(`Dimension header name: ${dimensionHeader.name}`);
    });
    response.metricHeaders.forEach(metricHeader => {
      console.log(
        `Metric header name: ${metricHeader.name} (${metricHeader.type})`
      );
    });
    //[END analyticsdata_print_run_report_response_header]

    // [START analyticsdata_print_run_report_response_rows]
    console.log('Report result:');
    response.rows.forEach(row => {
      console.log(
        `${row.dimensionValues[0].value}, ${row.metricValues[0].value}`
      );
    });
    // [END analyticsdata_print_run_report_response_rows]
  }
  // [END analyticsdata_run_batch_report]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
main(...process.argv.slice(2));