import {test, expect, chromium} from '@playwright/test';
import {wait_for_ajax, wait_for_load,wait_for_element, wait_for_page_to_load} from "../helpers/hydration_wait"
import {login,supplier_login,supplier_logout} from "../helpers/login_helper";
import {
    po_create,
    po_submit_for_approval,
    po_add_address,
    po_delete_all_lines,
    po_is_cart_empty,
    po_clear_cart,
    po_submit_changes,
    view_confirmation
} from "../helpers/PO_Buyer/po_operations";
import {line_action, line_add,line_add_billing} from "../helpers/PO_Buyer/line_operations";
import {bypass_approval} from "../helpers/PO_Buyer/bypass_approval";
import { get_iframe_url, select_instance } from '../helpers/PO_Supplier/conifguration_manager';
import playwrightConfig from '../playwright.config';
import { log } from 'console';
import path from 'path';
import * as fs from 'fs';
import { readFile } from 'node:fs';

test('PO_Supplier Creation FLow E2E @bibin', async () => {
let req_id : number=0;
let po_id : number=0;
    let browser = await chromium.launch({ headless: false})
    let context = await browser.newContext();
    let page = await context.newPage();

    await test.step("User does the Login ", async ()=>{
      await login(page,"bibin_test","Coupa@2024");
     await wait_for_ajax(page);
    });

    await test.step("Create the PO ", async ()=>{
await po_create(page);
if(! await po_is_cart_empty(page)) { 
    await po_clear_cart(page);
    const flash_message = await wait_for_element(page, '.s-pageFlashMessage')
}
        // await wait_for_ajax(page);
    });

    await test.step("Adding line 1 ", async ()=>{
      await line_add(page,1,"items001","BB_01_Supplier",10,3,"line","01/25/25");
        await wait_for_ajax(page)
        await line_add_billing(page,1)
        await wait_for_ajax(page)
    });



    await test.step("Adding line 2 ", async ()=>{
        await line_add(page,2,"items002","BB_01_Supplier",7,5,"line","01/20/25");
        await wait_for_ajax(page)
        await line_add_billing(page,2)
        await wait_for_ajax(page)

    });


    await test.step("select address", async ()=>{
        await po_add_address(page)
    });


    await test.step("submit for approval", async ()=>{
        req_id=await po_submit_for_approval(page);

    });

    await test.step("Bypass Approvals", async ()=>{
        await bypass_approval(page,req_id);
    });


    await test.step("Check if PO is Ordered", async ()=>{
        const flash_message= await wait_for_element(page,'.s-pageFlashMessage')
        await expect(flash_message).toContainText("Requisition ordered.")
        const po_id_div=await page.getByRole('link', { name: 'PO #' });
         var data = (await po_id_div.getAttribute('href'))?.match(/(\d+)/g) || "";
         po_id=parseInt(data[0]);
         console.log(po_id);
   
  
    });
  // await page.pause();


    await context.close();
     context = await browser.newContext();
     page = await context.newPage();
     await page.goto("https://supplier-master.coupadev.com/sessions/new");

    await test.step("Login to CSP", async ()=>{
        
       await supplier_login(page,"bibin.binu+test@coupa.com","Coupa@2024");

     });
 
  

     await page.goto("https://supplier-master.coupadev.com/orders/");

     await test.step("navigate to supplier url ", async ()=>{
       
        await wait_for_page_to_load(page);
       await select_instance(page,"SCC-Master-Partials") ;
       await wait_for_ajax(page);
       let url = await get_iframe_url(page);
        await page.goto(url);
        await wait_for_ajax(page);
      });
  
      await page.waitForURL(`${playwrightConfig.use?.baseURL}/supplier_order_headers/**`,{timeout:10000});

      await page.goto(`/order_confirmation/supplier_headers`)

      await wait_for_load(page);
// let fileContent="";
      await test.step("Creating csv to upload ", async ()=>{
//        await readFile("../files/templates/supplier_po.csv",(error,data)=>{
//       if(error)
//         console.error(error);
//   fileContent=data;

//         })bibin
let data=`"Header","${po_id}","line_level"
 "Line","1","Accept"
 "Line","2","Accept"`.replace(/ /g,"").trim();


 fs.copyFile('files/templates/supplier_po.csv', 'files/temp/supplier_po.csv', (err) => {
    if (err) throw err;
    console.log('source.txt was copied to destination.txt');
  });
var logStream = fs.createWriteStream('files/temp/supplier_po.csv', {flags: 'a'});
logStream.write(data);
logStream.end();  

      });

      await test.step("Select load from csv ", async ()=>{
       
        await wait_for_page_to_load(page);
        await page.pause();
     const options= await wait_for_element(page,".coupaActionsMenu__triggerActionBtn",12);
     await options.click();
     await wait_for_ajax(page);
     const load_from_file=await wait_for_element(page,".s-loadFromFileLink");
     await load_from_file.click();
      await wait_for_ajax(page);
      await page.waitForURL("**/order_confirmation/supplier_headers/bulk_loader**",{timeout:10000});
      const fileChooserPromise = page.waitForEvent('filechooser');
    const file_upload=await wait_for_element(page,"id=data_source_file");
     await file_upload.click();
    const fileChooser = await fileChooserPromise;
     await fileChooser.setFiles("files/temp/supplier_po.csv");
      const finish_upload=await wait_for_element(page,".button");
     await finish_upload.click();  
     await wait_for_ajax(page);

      await page.pause(); 
      });

     
      await test.step("check the status of the PO ", async ()=>{
       
        await page.goto(`/supplier_order_headers/${po_id}`);
        await wait_for_ajax(page);
        const confirmation_status=await wait_for_element(page,"id=confirmation_status");
       expect(confirmation_status).toContainText("Processing in Background",{timeout:10000});
      });


 });