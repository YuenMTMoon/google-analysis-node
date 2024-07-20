'use strict';

const express = require('express');
const { BetaAnalyticsDataClient } = require('@google-analytics/data');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors())

// Configure Google Analytics Data Client
process.env.GOOGLE_APPLICATION_CREDENTIALS = "./";
const propertyId = '';
const analyticsDataClient = new BetaAnalyticsDataClient();

// Define route handler for receiving pageTitle parameter
app.post('/websiteAccess', async (req, res) => {
    const { requestURL, startDay } = req.body;
    try {
        const response = await runReportWebAccess(requestURL, startDay);
        res.json(response);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// Route for handling event list request
app.post('/eventlist', async (req, res) => {
    const { requestURL, startDay } = req.body;
    try {
        const response = await runReporteventlist(requestURL, startDay);
        res.json(response);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// Function to run Google Analytics report with multiple dimensions
async function runReportWebAccess(requestPath, startDay) {

    const [response] = analyticsDataClient.runReport({
        property: `properties/${propertyId}`,
        dimensions: [
            { name: 'country' },
            { name: 'date' },
            { name: 'pagePath' },
        ],
        metrics: [{ name: 'activeUsers' }],
        dateRanges: [{ startDate: startDay, endDate: 'today' }],
        orderBys: [{ dimension: { orderType: "ALPHANUMERIC", dimensionName: "date" } }],
        dimensionFilter: {
            filter: {
                fieldName: "pagePath",
                matchType: "EXACT",
                stringFilter: { value: `/page/${requestPath}` }
            }
        },
    });

    const reportResult = {
        rowCount: response.rowCount,
        dimensionHeaders: response.dimensionHeaders.map(header => header.name),
        metricHeaders: response.metricHeaders.map(header => ({ name: header.name, type: header.type })),
        rows: response.rows.map(row => ({
            country: row.dimensionValues[0].value,
            date: row.dimensionValues[1].value,
            pagePath: row.dimensionValues[2].value,
            activeUsers: row.metricValues[0].value
        }))
    };

    return reportResult;
}

async function runReporteventlist(requestPath, startDay) {
    const [response] = analyticsDataClient.runReport({
        property: `properties/${propertyId}`,
        dimensions: [
            { name: 'eventName' },
            { name: 'pagePath' },
        ],
        metrics: [{ name: 'eventCount' }],
        dateRanges: [{ startDate: startDay, endDate: 'today' }],
        dimensionFilter: {
            filter: {
                fieldName: "pagePath",
                matchType: "EXACT",
                stringFilter: { value: `/page/${requestPath}` }
            }
        },
    });

    const reportResult = {
        rowCount: response.rowCount,
        dimensionHeaders: response.dimensionHeaders.map(header => header.name),
        metricHeaders: response.metricHeaders.map(header => ({ name: header.name, type: header.type })),
        rows: response.rows.map(row => ({
            eventName: row.dimensionValues[0].value,
            pageTitle: row.dimensionValues[1].value,
            eventCount: row.metricValues[0].value
        }))
    };

    return reportResult;
}

app.post('/homePageGArequest', async (req, res) => {
    try {
        const response = await runReportHomePage();
        res.json(response);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

async function runReportHomePage() {
    const dateRanges = [{ startDate: '90daysAgo', endDate: 'yesterday' }];
    const demoPagePaths = ["20231229", "designPw1"];

    const [response] = await analyticsDataClient.runReport({
        property: `properties/${propertyId}`,
        dimensions: [
            { name: 'country' },
            { name: 'dateHourMinute' },
            { name: 'pagePath' },
        ],
        metrics: [{ name: 'activeUsers' }],
        dateRanges,
        dimensionFilter: {
            filter: {
                fieldName: "pagePath",
                inListFilter: { values: demoPagePaths }
            }
        },
    });

    const reportResult = {
        rowCount: response.rowCount,
        dimensionHeaders: response.dimensionHeaders.map(header => header.name),
        metricHeaders: response.metricHeaders.map(header => ({ name: header.name, type: header.type })),
        rows: response.rows.map(row => ({
            country: row.dimensionValues[0].value,
            dateHourMinute: row.dimensionValues[1].value,
            pagePath: row.dimensionValues[2].value,
            activeUsers: row.metricValues[0].value
        }))
    };

    return reportResult;
}

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
