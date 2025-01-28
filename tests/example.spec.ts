// import {test, expect, chromium} from '@playwright/test';
// import {wait_for_ajax, wait_for_load,wait_for_element, wait_for_page_to_load} from "../helpers/hydration_wait"
// import {login} from "../helpers/login_helper";
// import {
//   po_create,
//   po_submit_for_approval,
//   po_add_address,
//   po_delete_all_lines,
//   po_is_cart_empty,
//   po_clear_cart
// } from "../helpers/PO_Supplier/po_operations";
// import {line_add,line_add_billing} from "../helpers/PO_Supplier/line_operations";
// import {bypass_approval} from "../helpers/PO_Supplier/bypass_approval";

// test('PO_Supplier Creation FLow E2E @bibin', async () => {
//   let po_id : number=0;
//   let browser = await chromium.launch({ headless: false})
//   let page = await browser.newPage();
//   await page.goto('/session/new');
//   await wait_for_ajax(page);
//   await test.step("User does the Login ", async ()=>{
//     await login(page,"id=user_login","id=user_password","id=login_button");
//     await wait_for_page_to_load(page);
//     // let banner_close=await wait_for_element(page,".reactModal__headerClose s-closeModal");
//     // await banner_close.click();
//     // await wait_for_ajax(page);
//   });

//   await test.step("Create the PO_Supplier ", async ()=>{
//     await po_create(page);
//     if(! await po_is_cart_empty(page)) {
//       await po_clear_cart(page);
//       const flash_message = await wait_for_element(page, '.s-pageFlashMessage')
//     }
//     await wait_for_ajax(page);
//   });

//   await test.step("Adding line 1 ", async ()=>{
//     await line_add(page,1,"items001","BB_01_Supplier",10,3,"line","12/20/24");
//     //  let add_line= await wait_for_element(page,'id=add_requisition_line_link')
//     //  await add_line.click();
//     //  await wait_for_page_to_load(page)
//     //  let item_radio_btn= await wait_for_element(page,'id=requisition_line_is_service_false')
//     //  await item_radio_btn.click();
//     //  await wait_for_ajax(page)
//     //  // await requisiton_create()
//     //  let item_descr=await wait_for_element(page,'id=requisition_line_description')
//     //  await item_descr.fill("item001");
//     // await wait_for_ajax(page);
//     //  let supplier_select =await wait_for_element(page,'.supplierSearch')
//     //  await supplier_select.type("BB_01_Supplier",{delay:100});
//     //  await wait_for_ajax(page);
//     //  let supplier_dropdown =await wait_for_element(page,'.ComboBox__resultItem',0)
//     //  await supplier_dropdown.click();
//     //  await wait_for_ajax(page);
//     //  let price=await wait_for_element(page,'id=requisition_line_unit_price_amount')
//     //  await price.fill('10');
//     //  await wait_for_ajax(page);
//     //  let quantity=await wait_for_element(page,'id=requisition_line_quantity')
//     //  await quantity.fill('3');
//     //  let save_line_btn=await wait_for_element(page,'.save')
//     //  await save_line_btn.click();
//     //  await page.waitForLoadState("load");
//     //  let billing=await wait_for_element(page,'.account_picker_popup_button')
//     //  await billing.click();
//     //  let account_selector= await wait_for_element(page,'a[aria-label="Choose Acct1"]')
//     //  await account_selector.click();
//     await wait_for_load(page)
//     await line_add_billing(page,1)
//   });


//   await test.step("Adding line 2 ", async ()=>{
//     await line_add(page,2,"items002","BB_01_Supplier",7,5,"line","12/25/24");
//     await wait_for_load(page)
//     await line_add_billing(page,2)
//     //  await page.waitForLoadState("load");
//     //  let add_line= await wait_for_element(page,'id=add_requisition_line_link')
//     //  await add_line.click();
//     //  await wait_for_load(page)
//     //  let item_radio_btn= await wait_for_element(page,'id=requisition_line_is_service_false')
//     //  await item_radio_btn.click();
//     //  await wait_for_ajax(page)
//     //  // await requisiton_create()
//     //  let item_descr=await wait_for_element(page,'id=requisition_line_description')
//     //  await item_descr.fill("item002");
//     // await wait_for_ajax(page);
//     //  let supplier_select =await wait_for_element(page,'.supplierSearch')
//     //  await supplier_select.fill("BB_01_Supplier");
//     // await wait_for_ajax(page);
//     //  let price=await wait_for_element(page,'id=requisition_line_unit_price_amount')
//     //  await price.fill('20');
//     //  await wait_for_ajax(page);
//     //  let quantity=await wait_for_element(page,'id=requisition_line_quantity')
//     //  await quantity.fill("4");
//     //  let line_type_select=await wait_for_element(page,'id=requisition_line_order_confirmation_level')
//     //  await line_type_select.selectOption('line');
//     //  let need_by_date= await wait_for_element(page,"id=requisition_line_need_by_date");
//     // await need_by_date.type("12/20/24",{delay:50});
//     //  await page.keyboard.press('Enter');
//     //  let save_line_btn=await wait_for_element(page,'.save')
//     //  await save_line_btn.click();
//     //  await wait_for_load(page);
//     //  let billing=await wait_for_element(page,'.account_picker_popup_button',1)
//     //  await billing.click();
//     //  await wait_for_page_to_load(page)
//     //  let account_selector= await wait_for_element(page,'a[aria-label="Choose Acct1"]')
//     //  await account_selector.click();
//     //  await wait_for_page_to_load(page);
//   });



//   await test.step("select address", async ()=>{
//     await po_add_address(page)
//     //   let address_btn=await wait_for_element(page,'.pick_address_link')
//     //   await address_btn.click();
//     //  await wait_for_element(page,'id=picker_address_table_section')
//     //   let address_choose= await  wait_for_element(page,'tr > td > a[class="rollover button"]',0)
//     //   await address_choose.click();
//     // await wait_for_ajax(page);
//     // await requisiton_create()
//   });


//   await test.step("submit for approval", async ()=>{
//     po_id=await po_submit_for_approval(page);
//     //  await wait_for_page_to_load(page);
//     // let submit_btn=await wait_for_element(page,"id=submit_for_approval_link")
//     //    po_id = parseInt(page.url().match(/\/(\d+)\//)[1]);
//     //  await submit_btn.click();
//     //  await wait_for_ajax(page);
//     //  // await requisiton_create()
//     //  // await page.pause();
//     //  await page.waitForURL("**/user/home")

//   });

//   await test.step("Bypass Approvals", async ()=>{
//     await bypass_approval(page,po_id);
//   });


//   await test.step("Check if PO_Supplier is Ordered", async ()=>{
//     const flash_message= await wait_for_element(page,'.s-pageFlashMessage')
//     await expect(flash_message).toContainText("Requisition ordered.")
//   });
//   // await test.step("Click Button ", async ()=>{
//   //     let input = await wait_for_element(page,"id=submit")
//   //     await input.click();
//   // });
//   // await page.pause();
//   // console.log("1")
//   // console.log("2")
//   // await expect(page).toHaveURL('https://practicetestautomation.com/logged-in-successfully/');

// });


