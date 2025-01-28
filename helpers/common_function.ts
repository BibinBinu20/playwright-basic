import { expect, type Locator, type Page } from '@playwright/test';
import { setTimeout } from "timers/promises";
import { wait_for_ajax } from './hydration_wait';


export async function load(page:Page,page_to_load:string,timeout?:number){         // defaults to 
    if (typeof timeout !== 'undefined')
    {
        await page.goto(page_to_load,{timeout:timeout})
    }
    else{
   await page.goto(page_to_load,{timeout:10000})
    }

   await wait_for_ajax(page);
}