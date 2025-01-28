import {test, expect,chromium } from '@playwright/test';
import { request, APIRequestContext } from '@playwright/test';
import { DOMParser } from '@xmldom/xmldom';
import { login } from '../helpers/login_helper';
import { wait_for_ajax } from '../helpers/hydration_wait';

let token='';
let base_url='https://scc-master-partials.coupadev.com'
async function createOauthToken(clientId, scope, clientSecret) {
    let accessToken = "";
    const apiContext: APIRequestContext = await request.newContext();

    let response = await apiContext.post(`${base_url}/oauth2/token`, {
        form: {
            client_id: clientId,
            grant_type: "client_credentials",
            scope: scope,
            client_secret: clientSecret,
        },
    });
    if(response.status()!=200)
    {
        throw new Error("Token Generation Failed");
    }
   return (await response.json()).access_token ;
    // accessToken = response.access_token;
    // return accessToken;
}

let scope=`core.purchase_order_change.assignment.read 
core.purchase_order_change.assignment.write 
core.purchase_order_change.read 
core.purchase_order_change.write 
core.purchase_order_only.read 
core.purchase_order_only.write 
core.purchase_order.assignment.read 
core.purchase_order.assignment.write 
core.purchase_order.read 
core.purchase_order.write 
core.requisition.assignment.read 
core.requisition.assignment.write 
core.requisition.read 
core.requisition.write`;


test.beforeAll(async () => {
   token= await createOauthToken('6043b1d6dbd364abd9e870ef52ff9f28',scope,'40334b710dbb6f1de2d127cd7b94c693b47a9aae2e2e0b97e77d7f80b8daef9d');
   //6043b1d6dbd364abd9e870ef52ff9f28
   //40334b710dbb6f1de2d127cd7b94c693b47a9aae2e2e0b97e77d7f80b8daef9d

    });

test('Create and Issue external PO @Bibin ', async ({request}) => {
    let po_id:number;
    let po_number : string='EXTPO-LL-Test-319';
  const payload=`<order-header>
   <type>ExternalOrderHeader</type>
   <version>1</version>
   <currency>
      <code>USD</code>
   </currency>
   <po-number>EXTPO-LL-Test-${new Date().getUTCMilliseconds()}</po-number>
   <order-confirmation-level>line</order-confirmation-level>
   <confirm-by-hrs>24</confirm-by-hrs>
   <supplier>
      <name>BB_01_Supplier</name>
   </supplier>
   <ship-to-address>
      <name>Address_20160317135916126</name>
   </ship-to-address>
   <ship-to-user>
      <login>bibin_binu1</login>
   </ship-to-user>
   <payment-method/>
   <ship-to-attention>bibin_binu1</ship-to-attention>
   <order-lines type="array">
      <order-line>
         <line-num>1</line-num>
         <need-by-date>2025-02-30T00:00:00-07:00</need-by-date>
         <description>Test line 1</description>
         <price type="decimal">100</price>
         <quantity type="decimal">5</quantity>
         <uom>
            <code>EA</code>
         </uom>
         <currency>
            <code>USD</code>
         </currency>
         <account>
            <name>San Francisco - Marketing, Indirect</name>
            <code>SF-Marketing-Indirect</code>
            <account-type>
               <name>Ace Corporate</name>
            </account-type>
         </account>
      </order-line>
      <order-line>
         <line-num>2</line-num>
         <need-by-date>2025-02-30T00:00:00-07:00</need-by-date>
         <description>Test line 2</description>
         <price type="decimal">100</price>
         <quantity type="decimal">5</quantity>
         <uom>
            <code>EA</code>
         </uom>
         <currency>
            <code>USD</code>
         </currency>
         <account>
            <name>San Francisco - Marketing, Indirect</name>
            <code>SF-Marketing-Indirect</code>
            <account-type>
               <name>Ace Corporate</name>
            </account-type>
         </account>
      </order-line>
   </order-lines>
</order-header>`.replace(/\s+/g, " ").trim();




let payload_header={
    'Authorization': `Bearer ${token}` ,
    'Content-Type': 'application/xml',
    'Accept': 'application/xml'
  };

    await test.step("Create a REQ using API ", async ()=>{
      const res = await request.post(`${base_url}/api/purchase_orders`,{
        headers: payload_header,
        data:payload
    });
    const responseBody = await res.text()
    console.log(responseBody);
    const parser = new DOMParser();
    const doc = parser.parseFromString(responseBody, 'application/xml');
    po_id=parseInt(doc.getElementsByTagName('id')[0].textContent || "");
    po_number=doc.getElementsByTagName('po-number')[0].textContent || "";
expect(res.status()).toBe(201);

    });


    await test.step("Issue the PO using API ", async ()=>{
        const res = await request.put(`${base_url}/api/purchase_orders/${po_id}/issue`,{
          headers: payload_header ,
          data:payload
      });
      const responseBody = await res.text()
    
  expect(res.status()).toBe(200);
  
      });

  //     await test.step(" CXML Action from Supplier Side ", async ()=>{
  //        const res = await request.put(`${base_url}/api/purchase_orders/${po_id}/issue`,{
  //          headers: payload_header ,
  //          data:payload
  //      });
  //      const responseBody = await res.text()
     
  //  expect(res.status()).toBe(200);
   
  //      });

  const cxml_payoad=`<?xml version="1.0" encoding="UTF-8"?>
  <!DOCTYPE cXML SYSTEM "http://xml.cXML.org/schemas/cXML/1.2.036/Fulfill.dtd">
  <cXML payloadID="i-am-a-payload-id"
        xml:lang="en-US" timestamp="2000-10-14T08:39:29-08:00">
    <Header>
      <From>
        <!-- domain attr is 'cxml_invoice_supplier_domain' -->
        <Credential domain="DUNS">
          <!-- Identity content is 'cxml_invoice_supplier_identity' -->
          <Identity>collab131</Identity>
        </Credential>
      </From>
      <To>
        <!-- This is not used by Coupa -->
        <Credential domain="DUNS">
          <!-- This is not used by Coupa -->
          <Identity>123-Coupa</Identity>
        </Credential>
      </To>
      <!-- The supplier -->
      <Sender>
        <!-- domain attr must match Header/From/Credential['domain'] attr -->
        <Credential domain="DUNS">
          <!-- Identity content is must match Header/From/Credential/Identity content -->
          <Identity>collab131</Identity>
          <!-- SharedSecret contents 'cxml_invoice_secret' -->
          <SharedSecret>abc</SharedSecret>
        </Credential>
        <!-- This is not used by Coupa -->
        <UserAgent>Random HTTP Agent</UserAgent>
      </Sender>
    </Header>
  <Request deploymentMode="production">
          <ConfirmationRequest>
              <!-- operations and type is used by coupa -->
              <!-- operations= update Coupa will error this out, given that we do not currently allow more than 1 back-and-forth -->
              <ConfirmationHeader type="detail"
                           noticeDate="2000-10-13T18:39:09-08:00"
                           operation="new"
                           invoiceID="I1102-10-13">
                  <!-- These elements are not used by Coupa -->
                  <DocumentReference payloadID="123coupa" />
                  <Total>
                      <Money currency="USD">10000.0</Money>
                  </Total>
                  <Shipping>
                      <Money currency="USD">2.5</Money>
                      <Description xml:lang="en-CA">FedEx 2-day</Description>
                  </Shipping>
                  <Tax>
                      <Money currency="USD">0.19</Money>
                      <Description xml:lang="en-US">CA Sales Tax</Description>
                  </Tax>
                  <Contact role="shipFrom">
                      <Name xml:lang="en-US">Workchairs, Vancouver</Name>
                      <PostalAddress>
                          <Street>432 Lake Drive</Street>
                          <City>Vancouver</City>
                          <State>BC</State>
                          <PostalCode>B3C 2G4</PostalCode>
                          <Country isoCountryCode="US">Canada</Country>
                      </PostalAddress>
                      <Phone>
                          <TelephoneNumber>
                              <CountryCode isoCountryCode="US">1</CountryCode>
                              <AreaOrCityCode>201</AreaOrCityCode>
                              <Number>9211132</Number>
                          </TelephoneNumber>
                      </Phone>
                  </Contact>
                  <Comments xml:lang="en-US">Look's great, but for the price.</Comments>
              </ConfirmationHeader>
              <!-- orderID attr is an OrderHeader ID number that will become associated to the OrderConfirmation::Line -->
              <OrderReference orderID="${po_number}" orderDate="2024-06-11T12:34:45Z">
                  <DocumentReference payloadID="456coupa" />
              </OrderReference>
              <!-- ConfirmationItem elements should be present to provide status information for individual line items in the order -->
          <ConfirmationItem lineNumber="1" quantity="5">
              <UnitOfMeasure>EA</UnitOfMeasure>
              <ConfirmationStatus quantity="5" type="accept" shipmentDate="2025-02-25"
                                  deliveryDate="2025-02-25">
                  <UnitOfMeasure>EA</UnitOfMeasure>
                  <UnitPrice>
                      <Money currency="USD">100.0</Money>
                  </UnitPrice>
                  <Comments xml:lang="en-US">Qty Updated</Comments>
              </ConfirmationStatus>
          </ConfirmationItem>
          <ConfirmationItem lineNumber="2" quantity="5">
              <UnitOfMeasure>EA</UnitOfMeasure>
              <ConfirmationStatus quantity="3" type="accept" shipmentDate="2025-02-25"
                                  deliveryDate="2025-02-25">
                  <UnitOfMeasure>EA</UnitOfMeasure>
                  <UnitPrice>
                  <Money currency="USD">100.0</Money>
                  </UnitPrice>
                  <Comments xml:lang="en-US">Comment for line 2 - quantity changed </Comments>
              </ConfirmationStatus>
                          <ConfirmationStatus quantity="2" type="reject" shipmentDate="2025-02-25"
                                  deliveryDate="2025-02-25">
                  <UnitOfMeasure>EA</UnitOfMeasure>
                  <UnitPrice>
                  <Money currency="USD">100.0</Money>
                  </UnitPrice>
                  <Comments xml:lang="en-US">Comment for line 2 - quantity changed </Comments>
              </ConfirmationStatus>
          </ConfirmationItem>
  
  
          </ConfirmationRequest>
      </Request>
  </cXML>`.replace(/\s+/g, " ").trim();
     
  await test.step(" Check if PO status is ISSUED ", async ()=>{
    const res = await request.get(`${base_url}/api/purchase_orders/${po_id}}`,{
      headers: payload_header ,
  });
  const responseBody = await res.text()
console.log(responseBody);
const parser = new DOMParser();
const doc = parser.parseFromString(responseBody, 'application/xml');
let po_status=doc.getElementsByTagName('status')[0].textContent || "";
expect(res.status()).toBe(200);
await expect(async ()=>{ 
  await expect(po_status).toBe("issued");
 }).toPass({
  intervals: [1_000, 2_000, 10_000],
  timeout: 20_000
})
  });

       await test.step(" CXML Action from Supplier Side ", async ()=>{
         const res = await request.post(`${base_url}/cxml/order_confirmation_request`,{
           headers: payload_header ,
           data:cxml_payoad
       });
       const responseBody = await res.text()
     console.log(responseBody);
   expect(res.status()).toBe(200);
       });


        //  let browser = await chromium.launch({ headless: false})
      //  let context = await browser.newContext();
      //  let page = await context.newPage();

      //  await test.step("User does the Login ", async ()=>{
      //    await login(page,"bibin_test","Coupa@2024");
      //   await wait_for_ajax(page);
      //       });

      //       await test.step("User go to the PO page and get confirmation ID ", async ()=>{
      //          await login(page,"bibin_test","Coupa@2024");
      //         await wait_for_ajax(page);
      //             });
});

