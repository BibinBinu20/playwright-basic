import { expect, type Locator, type Page } from '@playwright/test';
import { setTimeout } from "timers/promises";
import {wait_for_element,wait_for_ajax,wait_for_page_to_load,wait_for_load} from "../hydration_wait";

export async function bypass_approval(page:Page,po_id:number){
    await page.goto(`/requisition_headers/${po_id}`);
    await wait_for_page_to_load(page);
    const bypass_approval= await wait_for_element(page,'id=bypass_approvals_and_order')
    await bypass_approval.click();
    await wait_for_ajax(page);
}
