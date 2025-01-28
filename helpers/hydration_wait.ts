import { expect, type Locator, type Page } from '@playwright/test';
import { setTimeout } from "timers/promises";

interface wait_for_element_options {
    regex?: string;
}

export async function wait_for_element(page:Page,locator_reference:string,index?:number,options?:wait_for_element_options){
    var input;

        if (typeof index !== 'undefined') {
            input =  await page.locator(locator_reference).nth(index);
        } else
            input = await page.locator(locator_reference);
        await input.waitFor({state:"attached",timeout:20000});

    return input;
}
// export async function wait_for_elements(page:Page,locator_reference:string,index:number){
//     const input = page.locator(locator_reference)[index];
//     await input.waitFor({ state: 'attached'});
//     return input;
// }
export async function wait_for_ajax(page:Page , timeout ? : number){
    if(typeof timeout!== 'undefined')
    await page.waitForLoadState('networkidle',{timeout:timeout})
  else
   await page.waitForLoadState('networkidle',{timeout:60000})
}

export async function wait_for_page_to_load(page:Page){
    await page.waitForLoadState('load')
 }

export async function wait_for_load(page:Page){
    await page.waitForLoadState('networkidle',{timeout:60000});
    await page.waitForLoadState("domcontentloaded");
    await page.waitForLoadState("load");
}

export async function wait_for_attribute_value(page:Page,locator_reference:string,attribute_name:string,attribute_value:any,timeout?:number,index?:number){
   let element;
    if (typeof index !== 'undefined') {
         element = await wait_for_element(page, locator_reference, index);
    }
    else {
         element = await wait_for_element(page, locator_reference);
    }
    while(await element.getAttribute(attribute_name) != attribute_value ) {
        if (typeof timeout !== 'undefined') {
            await page.waitForTimeout(timeout);
        }
        else
            await page.waitForTimeout(1000);

    }
}

// const wait_for_element = (page:Page,locator_reference:string) =>
//     new Promise(resolve => {
//         const input =  page.locator(locator_reference);
//         input.waitFor({ state: 'attached'})
//     });
