import {test, expect, chromium} from '@playwright/test';
import {wait_for_element} from "../helpers/hydration_wait"
import { setTimeout } from "timers/promises";



test('has title', async () => {

    const browser = await chromium.launch({ headless: false});
    const page = await browser.newPage();
    await page.goto('https://practicetestautomation.com/practice-test-login/');
    await expect(page).toHaveTitle('Test Login | Practice Test Automation');

    await test.step("Enter the Username ", async ()=>{
        const input = await wait_for_element(page,"id=username")
       await input.fill("student");
    });
    //
    await test.step("Enter the Password ", async ()=>{
        // const input = page.locator('id=password');
        // console.log(input)
        // await input.fill("Password123");
        const input = await wait_for_element(page,"id=password")
        await input.fill("Password123");
    });

    await test.step("Click Button ", async ()=>{
        const input = await wait_for_element(page,"id=submit")
        await input.click();
    });
await page.pause();
console.log("1")
    console.log("2")
    await expect(page).toHaveURL('https://practicetestautomation.com/logged-in-successfully/');

});


// const input = await page.locator('inputSelector'); await input.waitFor({ state: 'attached'});
// // Optional: await input.waitFor({ state: 'visible'}); await input.fill('yourInputValue');
//  const input =  page.locator('id=username');
// await input.fill("student");


// const input = page.locator('id=submit');
// await setTimeout(1000);
// console.log(input)
// await input.click();

//  const input =  page.locator('id=username');
// await input.fill("student");