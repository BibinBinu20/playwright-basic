import {exec} from "node:child_process";
import util from "node:util";

const execPromise = util.promisify(exec);

// exec("ruby sample.rb", (error, stdout, stderr) => {
//     if (error) {
//         console.log(`error: ${error.message}`);
//         return;
//     }
//     if (stderr) {
//         console.log(`stderr: ${stderr}`);
//         return;
//     }
//     console.log(`stdout: ${stdout}`);
// });

  function shell_exec(cmd)
 { 
    console.log("started");
    return new Promise((resolve, reject)=> {
        exec(cmd, (error, stdout, stderr) => {
          if (error) {
             reject(error);
             return;
         }
         resolve(stdout)
        }); });
    }
async function my_fun(){
 await shell_exec("ruby sample.rb");
 console.log("done");
}
    
my_fun();




import * as http from "http"
import { Buffer } from 'node:buffer'

const payload=`<?xml version="1.0" encoding="UTF-8"?>
<order-header>
    <id type="integer">6413</id>
    <created-at type="dateTime">2025-01-08T02:14:54-08:00</created-at>
    <updated-at type="dateTime">2025-01-08T02:14:54-08:00</updated-at>
    <po-number>EXTPO-LL-Test701</po-number>
    <price-hidden type="boolean">false</price-hidden>
    <acknowledged-flag type="boolean">false</acknowledged-flag>
    <acknowledged-at nil="true"/>
    <status>draft</status>
    <transmission-status nil="true"/>
    <version type="integer">1</version>
    <internal-revision nil="true"/>
    <last-exported-at nil="true"/>
    <payment-method>invoice</payment-method>
    <ship-to-attention>bibin_binu1</ship-to-attention>
    <coupa-accelerate-status nil="true"/>
    <change-type nil="true"/>
    <order-confirmation-level>line</order-confirmation-level>
    <allow-partial-confirmations type="boolean">true</allow-partial-confirmations>
    <exported type="boolean">false</exported>
    <requisition-header nil="true"/>
    <ship-to-address>
        <id type="integer">1726</id>
        <name>Address_20160317135916126</name>
        <location-code nil="true"/>
        <street1>2 W 5th Ave</street1>
        <street2>Suite 300</street2>
        <street3 nil="true"/>
        <street4 nil="true"/>
        <city>San Maeto</city>
        <state>CA</state>
        <postal-code>94404</postal-code>
        <attention nil="true"/>
        <active type="boolean">true</active>
        <business-group-name nil="true"/>
        <vat-number nil="true"/>
        <local-tax-number nil="true"/>
        <country>
            <code>US</code>
        </country>
        <vat-country nil="true"/>
    </ship-to-address>
    <ship-to-user>
        <id type="integer">1397</id>
        <login>bibin_binu1</login>
        <employee-number></employee-number>
    </ship-to-user>
    <supplier>
        <id type="integer">728</id>
        <name>BB_01_Supplier</name>
        <display-name>BB_01_Supplier</display-name>
        <number nil="true"/>
    </supplier>
    <supplier-site nil="true"/>
    <payment-term>
        <id type="integer">2</id>
        <code>Net 15</code>
        <description></description>
        <days-for-net-payment type="integer">15</days-for-net-payment>
        <days-for-discount-payment nil="true"/>
        <discount-rate nil="true"/>
        <active type="boolean">true</active>
    </payment-term>
    <shipping-term>
        <id type="integer">2</id>
        <code>UPS</code>
        <description></description>
        <active type="boolean">true</active>
    </shipping-term>
    <attachments type="array"/>
    <order-lines type="array">
        <order-line>
            <id type="integer">27509</id>
            <created-at type="dateTime">2025-01-08T02:14:54-08:00</created-at>
            <updated-at type="dateTime">2025-01-08T02:14:54-08:00</updated-at>
            <accounting-total type="decimal">500.00</accounting-total>
            <description>Test line 1</description>
            <supplier-site-id nil="true"/>
            <invoiced type="decimal">0.0</invoiced>
            <line-num>1</line-num>
            <need-by-date type="dateTime">2024-12-29T23:00:00-08:00</need-by-date>
            <order-header-id type="integer">6413</order-header-id>
            <order-header-number>EXTPO-LL-Test700</order-header-number>
            <price type="decimal">100.00</price>
            <quantity type="decimal">5.0</quantity>
            <receipt-required type="boolean">false</receipt-required>
            <source-part-num nil="true"/>
            <status>draft</status>
            <sub-line-num nil="true"/>
            <supp-aux-part-num nil="true"/>
            <total type="decimal">500.00</total>
            <type>OrderQuantityLine</type>
            <version type="integer">1</version>
            <savings-pct type="decimal">0.0</savings-pct>
            <reporting-total type="decimal">850.0</reporting-total>
            <supplier-order-number nil="true"/>
            <match-type nil="true"/>
            <service-type>non_service</service-type>
            <total-invoiced type="decimal">0.00</total-invoiced>
            <form-response nil="true"/>
            <rfq-form-response nil="true"/>
            <account>
                <id type="integer">13</id>
                <name>San Francisco - Marketing, Indirect</name>
                <code>SF-Marketing-Indirect</code>
            </account>
            <account-allocations type="array"/>
            <contract nil="true"/>
            <currency>
                <code>USD</code>
            </currency>
            <commodity nil="true"/>
            <department nil="true"/>
            <item nil="true"/>
            <requester>
                <id type="integer">1397</id>
                <login>bibin_binu1</login>
                <employee-number></employee-number>
            </requester>
            <supplier>
                <id type="integer">728</id>
                <name>BB_01_Supplier</name>
                <display-name>BB_01_Supplier</display-name>
                <number nil="true"/>
            </supplier>
            <uom>
                <code>EA</code>
            </uom>
            <asset-tags type="array"/>
            <attachments type="array"/>
            <period nil="true"/>
            <receiving-warehouse nil="true"/>
            <extra-line-attribute nil="true"/>
            <bulk-price nil="true"/>
            <created-by>
                <id type="integer">1395</id>
                <login>Bibin.Binu</login>
                <employee-number nil="true"/>
            </created-by>
            <updated-by>
                <id type="integer">1395</id>
                <login>Bibin.Binu</login>
                <employee-number nil="true"/>
            </updated-by>
            <custom-fields>
                <custom-textfield nil="true"/>
                <cfpo-line-date nil="true"/>
                <ms-approval-group nil="true"/>
                <big-money nil="true"/>
                <ms-user nil="true"/>
                <company-code nil="true"/>
                <custom-textbox></custom-textbox>
                <custom-dropdown nil="true"/>
                <custom-field-5 nil="true"/>
                <custom-radio nil="true"/>
                <custom-checkbox type="boolean">false</custom-checkbox>
                <cf-reqline-lookup-1000 nil="true"/>
                <ms-lookup nil="true"/>
                <ms-money nil="true"/>
                <search-text nil="true"/>
                <test-field-6 nil="true"/>
                <custom-field-7 nil="true"/>
                <custom-field-2 nil="true"/>
                <multi-select-1 nil="true"/>
            </custom-fields>
        </order-line>
        <order-line>
            <id type="integer">27510</id>
            <created-at type="dateTime">2025-01-08T02:14:54-08:00</created-at>
            <updated-at type="dateTime">2025-01-08T02:14:54-08:00</updated-at>
            <accounting-total type="decimal">500.00</accounting-total>
            <description>Test line 2</description>
            <supplier-site-id nil="true"/>
            <invoiced type="decimal">0.0</invoiced>
            <line-num>2</line-num>
            <need-by-date type="dateTime">2024-12-29T23:00:00-08:00</need-by-date>
            <order-header-id type="integer">6413</order-header-id>
            <order-header-number>EXTPO-LL-Test700</order-header-number>
            <price type="decimal">100.00</price>
            <quantity type="decimal">5.0</quantity>
            <receipt-required type="boolean">false</receipt-required>
            <source-part-num nil="true"/>
            <status>draft</status>
            <sub-line-num nil="true"/>
            <supp-aux-part-num nil="true"/>
            <total type="decimal">500.00</total>
            <type>OrderQuantityLine</type>
            <version type="integer">1</version>
            <savings-pct type="decimal">0.0</savings-pct>
            <reporting-total type="decimal">850.0</reporting-total>
            <supplier-order-number nil="true"/>
            <match-type nil="true"/>
            <service-type>non_service</service-type>
            <total-invoiced type="decimal">0.00</total-invoiced>
            <form-response nil="true"/>
            <rfq-form-response nil="true"/>
            <account>
                <id type="integer">13</id>
                <name>San Francisco - Marketing, Indirect</name>
                <code>SF-Marketing-Indirect</code>
            </account>
            <account-allocations type="array"/>
            <contract nil="true"/>
            <currency>
                <code>USD</code>
            </currency>
            <commodity nil="true"/>
            <department nil="true"/>
            <item nil="true"/>
            <requester>
                <id type="integer">1397</id>
                <login>bibin_binu1</login>
                <employee-number></employee-number>
            </requester>
            <supplier>
                <id type="integer">728</id>
                <name>BB_01_Supplier</name>
                <display-name>BB_01_Supplier</display-name>
                <number nil="true"/>
            </supplier>
            <uom>
                <code>EA</code>
            </uom>
            <asset-tags type="array"/>
            <attachments type="array"/>
            <period nil="true"/>
            <receiving-warehouse nil="true"/>
            <extra-line-attribute nil="true"/>
            <bulk-price nil="true"/>
            <created-by>
                <id type="integer">1395</id>
                <login>Bibin.Binu</login>
                <employee-number nil="true"/>
            </created-by>
            <updated-by>
                <id type="integer">1395</id>
                <login>Bibin.Binu</login>
                <employee-number nil="true"/>
            </updated-by>
            <custom-fields>
                <custom-textfield nil="true"/>
                <cfpo-line-date nil="true"/>
                <ms-approval-group nil="true"/>
                <big-money nil="true"/>
                <ms-user nil="true"/>
                <company-code nil="true"/>
                <custom-textbox></custom-textbox>
                <custom-dropdown nil="true"/>
                <custom-field-5 nil="true"/>
                <custom-radio nil="true"/>
                <custom-checkbox type="boolean">false</custom-checkbox>
                <cf-reqline-lookup-1000 nil="true"/>
                <ms-lookup nil="true"/>
                <ms-money nil="true"/>
                <search-text nil="true"/>
                <test-field-6 nil="true"/>
                <custom-field-7 nil="true"/>
                <custom-field-2 nil="true"/>
                <multi-select-1 nil="true"/>
            </custom-fields>
        </order-line>
    </order-lines>
    <created-by>
        <id type="integer">1395</id>
        <login>Bibin.Binu</login>
        <employee-number nil="true"/>
    </created-by>
    <updated-by>
        <id type="integer">1395</id>
        <login>Bibin.Binu</login>
        <employee-number nil="true"/>
    </updated-by>
    <custom-fields>
        <po-cf-textfield nil="true"/>
        <po-cf-textbox></po-cf-textbox>
        <po-cf-number nil="true"/>
        <po-cf-user nil="true"/>
        <po-cf-money nil="true"/>
        <po-cf-date nil="true"/>
        <po-cf-dropdown></po-cf-dropdown>
        <po-cf-radio nil="true"/>
        <po-cf-checkbox type="boolean">false</po-cf-checkbox>
        <po-cf-lookup nil="true"/>
        <po-cf-multiselect nil="true"/>
        <po-cf-approvalgroup nil="true"/>
        <custom-field-5 nil="true"/>
    </custom-fields>
</order-header>`.replace(/\s+/g, " ").trim();

const options = {
  hostname: 'https://scc-master-partials.coupadev.com',
  path: '/api/purchase_orders',
  method: 'POST',
  headers: {
    'Content-Type': 'application/xml',
    'Accept': 'application/xml' ,
  }
};


// Update the options object with the data length
options.headers['Content-Length'] = payload.length;

// Create a request object
const request = http.request(options, (response) => {
  // Initialize a variable to store the response data
  let data = '';

  // Listen to the data event
  response.on('data', (chunk) => {
    // Append the chunk to the data variable
    data += chunk.toString();
  });

  response.on('end', () => {
 console.log("--------------RESPONSE----------------");
    console.log(`Status code: ${response.statusCode}`);
    console.log(data);
    console.log("--------------END----------------");
  });

  response.on('error', (error) => {
    throw error;
  });
});


request.write(payload);
request.end();


/////------

async function createOauthToken(clientId, scope, clientSecret) {
    let accessToken = "";
    const context = await playwright_core_1.request.newContext();
    const response = await context.post(`oauth2/token`, {
        form: {
            client_id: clientId,
            grant_type: "client_credentials",
            scope: scope,
            client_secret: clientSecret,
        },
    });
    const responseBody = await BaseAction.responseValidator(response, "oAuth2 token is not generated");
    accessToken = responseBody.access_token;
    return accessToken;
}