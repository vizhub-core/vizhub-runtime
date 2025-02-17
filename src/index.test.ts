import { describe, it, expect } from 'vitest';
import { generateSrcdoc } from './index';
import puppeteer from 'puppeteer';

describe("VizHub Runtime", () => {
  it("should generate srcdoc HTML", () => {
    const srcdoc = generateSrcdoc();
    expect(srcdoc).toContain('<!DOCTYPE html>');
    expect(srcdoc).toContain('<title>My HTML Document</title>');
    expect(srcdoc).toContain('Hello, World!');
  });

  it("should execute JavaScript in the page", async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    // Capture console.log output
    const logs: string[] = [];
    page.on('console', message => logs.push(message.text()));
    
    // Load the HTML
    await page.setContent(generateSrcdoc());
    
    // Wait a bit for scripts to execute
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Check console output
    expect(logs).toContain('Hello, World!');
    
    await browser.close();
  });
});
