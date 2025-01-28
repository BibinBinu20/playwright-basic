import { expect, type Locator, type Page } from '@playwright/test';
import { setTimeout } from "timers/promises";
import {
    wait_for_element,
    wait_for_ajax,
    wait_for_page_to_load,
    wait_for_load,
    wait_for_attribute_value
} from "../hydration_wait";
import { error } from 'console';

// async function sleep(msec) {
//     return new Promise(resolve => setTimeout(resolve, msec));
// }
export async function line_add(page:Page,line_no:number,item_name:string,supplier:string,price_value:number,quantity_value:number,confirmation_level:string,need_by_date_value:string){
    let add_line= await wait_for_element(page,'id=add_requisition_line_link')
    await add_line.click();
    // await wait_for_ajax(page);
    // await page.waitForFunction( ()=>{
    //     return document.getElementById("add_requisition_line_link").getAttribute('data-disable-on-click') == "true"
    // }, {timeout:5000})
    // while(await add_line.getAttribute('data-disable-on-click') != "true" ) {
    //     await page.waitForTimeout(2000);
    // }
    // // await page.evaluate( node => node.getAttribute("disable-on-click") == "true" , add_line )

   await wait_for_attribute_value(page,"id=add_requisition_line_link","data-disable-on-click","true",2000)
    // await wait_for_load(page)
    await wait_for_ajax(page);
    let item_radio_btn= await wait_for_element(page,'id=requisition_line_is_service_false')
    await item_radio_btn.click();
    await wait_for_ajax(page)
    // await requisiton_create()
    let item_descr=await wait_for_element(page,'id=requisition_line_description')
    await item_descr.fill(item_name);
    await wait_for_ajax(page);
    let supplier_select =await wait_for_element(page,'.supplierSearch')
    await supplier_select.fill("");
   await supplier_select.type(supplier,{delay:100});
    await wait_for_ajax(page);
      let supplier_dropdown =await wait_for_element(page,'.ComboBox__resultItem',0)
      await supplier_dropdown.click();
    await wait_for_ajax(page);
    const partial_confirm=await wait_for_element(page,"id=requisition_line_allow_partial_confirmations")
    await expect(partial_confirm).toBeVisible({timeout:5000});
    let price=await wait_for_element(page,'id=requisition_line_unit_price_amount')
    await price.fill(price_value.toString());
    await wait_for_ajax(page);
    let quantity=await wait_for_element(page,'id=requisition_line_quantity')
    await quantity.fill(quantity_value.toString());
    let line_type_select=await wait_for_element(page,'id=requisition_line_order_confirmation_level')
    await line_type_select.selectOption(confirmation_level);
    await wait_for_ajax(page);
    let need_by_date= await wait_for_element(page,"id=requisition_line_need_by_date");
    await need_by_date.type(need_by_date_value);
    await page.keyboard.press('Enter');
    let save_line_btn=await wait_for_element(page,'.save')
    await save_line_btn.click();
    await wait_for_ajax(page);
    await wait_for_element(page, '.s-pageFlashMessage')
    // await line_add_billing(page,line_no);
    await wait_for_load(page);
}

export async function line_add_billing(page:Page,line_no:number){
    let billing= (line_no - 1 == 0) ? await wait_for_element(page,'.account_picker_popup_button') : await wait_for_element(page,'.account_picker_popup_button',line_no - 1 ) ;
    await billing.click();
    await wait_for_load(page)
    let account_selector= await wait_for_element(page,'a[aria-label="Choose Acct1"]')
    await account_selector.click();
    await wait_for_load(page);
    let row_wrapper= (line_no==1) ? await wait_for_element(page,".req-line-overlay-mask") : await wait_for_element(page,".req-line-overlay-mask",line_no - 1 )
    await expect(row_wrapper).toBeHidden({timeout:10000})
}
export async function line_delete(page:Page,line_no:number,item_name:string){

}

export async function line_edit(page:Page,line_no:number,item_name:string){

}

interface schedule_line_options {
    quantity?:number,
    promised_date?:string   // format mm/dd/yy
}

interface line_action_options {
    reject_reason?: string,
    reject_comment?:string,
    price_change?:number,
    quantity_change?:number,
    reason_change?:string,
    promised_date_change?:string    //format mm/dd/yy
    schedule_lines?:schedule_line_options[]
}

export async function line_action(page:Page,line_no:number,action:string,options?:line_action_options)
{
    expect(line_no).not.toBe(0)
    const line=await page.getByRole('row').nth(line_no);
    const line_badge=line.locator('.badgeCmpt');
    const line_checkbox= line.getByRole('checkbox');
    const line_badge_text= await line_badge.innerText();
    await line_checkbox.click();
    const action_line=line.getByRole('button',{name:action.toLowerCase()});
    await action_line.click();    
    await wait_for_ajax(page);

if(action.toUpperCase()=="EDIT")
{

}
else if(action.toUpperCase()=="REJECT")    
{ 
    const reject_reason=options?.reject_reason || "";
    expect(reject_reason).not.toBe("") 
    await wait_for_element(page,".s-reactModal");
   const reject_reason_select=await page.getByLabel('*Reason', { exact: true });
   await reject_reason_select.type(reject_reason,{delay:50});
   await page.keyboard.press('Enter');
    const reject_submit=await wait_for_element(page,".insightsSubmitButton");
    await reject_submit.click();
    await wait_for_ajax(page);
}


 await expect((await line.locator('.revertButton'))).toBeVisible({timeout:15000});
// let loading= await wait_for_element(page,".s-loadingResults") 
// await expect(loading).not.toBeAttached({timeout:10000});

// await expect(line.locator('.badgeCmpt')).not.toContainText(line_badge_text,{timeout:10000});

}
// {schedule_lines:[{quantity:10,promised_date:"12/12/25"},{}]}


// export async function add_schedule_lines(page:Page,line_no:number,options?:schedule_line_options)
// {



// }

