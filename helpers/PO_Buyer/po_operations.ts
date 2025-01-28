import { expect, type Locator, type Page  } from '@playwright/test';
import { setTimeout } from "timers/promises";
import {
    wait_for_element,
    wait_for_ajax,
    wait_for_page_to_load,
    wait_for_load,
    wait_for_attribute_value
} from "../hydration_wait";

export async function po_create(page:Page){
    let cart_btn= await wait_for_element(page,'data-testid=cartPopupTrigger')
    await cart_btn.click();
    await wait_for_ajax(page)
    let review_cart_btn= await wait_for_element(page,".coupaCartPopover__reviewCartBtn")
    await review_cart_btn.click();
    await wait_for_ajax(page);
}

export async function po_delete_all_lines(page:Page){
    page.on('dialog', dialog => dialog.accept());
  const select_all=await wait_for_element(page,"id=select_all_checkbox");
  await select_all.click();
  const delete_all = await wait_for_element(page,"id=delete_all");
  await delete_all.click();
    await wait_for_ajax(page)
}

export async function po_add_address(page:Page){
      let address_btn=await wait_for_element(page,'.pick_address_link')
      await address_btn.click();
     await wait_for_element(page,'id=picker_address_table_section')
      let address_choose= await  wait_for_element(page,'tr > td > a[class="rollover button"]',0)
      await address_choose.click();
    await wait_for_ajax(page);
}

export async function po_submit_for_approval(page:Page)
{
    await wait_for_page_to_load(page);
    let submit_btn=await wait_for_element(page,"id=submit_for_approval_link")
    let po_id = parseInt(page.url().match(/\/(\d+)\//)![1]);
    expect(po_id).not.toBeNull()
    await submit_btn.click();
    await wait_for_ajax(page);
    // await requisiton_create()
    // await page.pause();
    await page.waitForURL("**/user/home")

    return po_id;
}
export async function bypass_approval(page:Page,po_id:number){
    await page.goto(`/requisition_headers/${po_id}`);
    await wait_for_page_to_load(page);
    const bypass_approval= await wait_for_element(page,'id=bypass_approvals_and_order')
    await bypass_approval.click();
    await wait_for_ajax(page);
}

export async function po_is_cart_empty(page:Page)
{
  return await page.getByText('Your cart is empty', { exact: true }).isVisible()
}

export async function po_clear_cart(page:Page){
    page.on('dialog', dialog => dialog.accept());
    const clear=await wait_for_element(page,"id=no-lines-clear_requisition_cart_link");
    await clear.click();
    await wait_for_ajax(page)
    await wait_for_attribute_value(page,"id=no-lines-clear_requisition_cart_link","data-disable-on-click","true",2000)
}

export async function po_submit_changes(page:Page){
    const accept=await wait_for_element(page,'.s-orderLevelConfirmBtn');
    await accept.click();
    await wait_for_ajax(page);
    await wait_for_page_to_load(page);
}

export async function view_confirmation(page:Page)
{
    const view_confirmation=await wait_for_element(page,"id=po_show_view_confirmation_btn")    
    await view_confirmation.click();
    await wait_for_ajax(page); 
}
