import { expect, type Locator, type Page } from '@playwright/test';
import { setTimeout } from "timers/promises";
import {wait_for_element,wait_for_ajax,wait_for_page_to_load,wait_for_load} from "../hydration_wait";

export async function select_instance(page:Page,instance:string){
   const select = await wait_for_element(page,"id=select2-selected_customer-container");
   await select.click();
   await wait_for_page_to_load(page);
   const search_box = await wait_for_element(page,".select2-search__field");
   await search_box.type("SCC-Master-Partials",{delay:50});
   await wait_for_page_to_load(page);
   // const li=await page.locator(".select2-results__option",{hasText:instance});
   await page.keyboard.press('Enter');
   await wait_for_ajax(page);
//   await page.pause(); 
}

export async function get_iframe_url(page:Page) :Promise<string> {
    const iframe = await wait_for_element(page,"id=enterprise_frame");
 let url : string = await iframe.getAttribute('src');
 return url;
 }