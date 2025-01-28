import { expect, type Locator, type Page } from '@playwright/test';
import { setTimeout } from "timers/promises";
import{wait_for_ajax, wait_for_element, wait_for_load, wait_for_page_to_load} from "./hydration_wait";

export async function login(page:Page,user:string,password:string){
    await page.goto('/session/new');
       await wait_for_ajax(page);
    const username = await wait_for_element(page,"id=user_login");
    const pass = await wait_for_element(page,"id=user_password");
    const button = await wait_for_element(page,"id=login_button");
  await username.fill(user);
  await pass.fill(password);
  await button.click();
}


export async function supplier_login(page:Page,user:string,password:string){
  const username = await wait_for_element(page,"id=email");
  const continue_btn= await wait_for_element(page,".s-login");
  await username.fill(user);
  await continue_btn.click();
  await wait_for_load(page);
   await page.pause();
  const iframe=await wait_for_element(page,"id=identityLoginIframe");
  await iframe.isVisible({timeout:40000});
  const frame = await iframe.contentFrame();
  const pass = await wait_for_element(frame,"id=password");
  await pass.isVisible();
  const btn= await wait_for_element(frame,"id=login-submit");
  await btn.isVisible({timeout:10000});
await pass.fill(password);
await btn.click();
await wait_for_ajax(page);

// expect(await page.url()).not.toContain("/sessions/new")

await page.waitForFunction(()=>{
  if( window.location.href.endsWith("/home") || window.location.href.endsWith("/sessions/max_concurrent"))
    return true;
},{timeout:10000})

await wait_for_ajax(page);

const url = await page.url();
// console.log(url);
// var regex = "/\/sessions\/max_conccurent$/gmsD";
// const found = url.match(regex);
// await page.pause();
if(url.endsWith("/sessions/max_concurrent"))
{
let btn=await wait_for_element(page,"id=login_button");
await btn.click();
await wait_for_ajax(page);
}

await page.waitForURL('**/home',{timeout:20000});
}

export async function supplier_logout(page:Page){
  await page.goto("https://supplier-master.coupadev.com/");
  await wait_for_ajax(page);
  const logout=await page.locator(".s-menu-link",{hasText:"Log Out"});
  await logout.dispatchEvent("click");
  await wait_for_load(page);
}