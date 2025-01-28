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

test('PO_Supplier Creation FLow E2E @bibin', async () => {
let req_id : number=0;
let po_id : number=6435;
    let browser = await chromium.launch({ headless: false})
    let context = await browser.newContext();
    let page = await context.newPage();

    await test.step("User does the Login ", async ()=>{
      await page.goto("http://127.0.0.1:65063/supplier_order_headers/1")
    });

await page.pause();


 });