import { describe, it, expect } from 'vitest';
import { generateSrcdoc } from './index';

describe("VizHub Runtome", () => {
  it("should generate srcdoc HTML", () => {
    const srcdoc = generateSrcdoc();
    expect(srcdoc).toContain('<!DOCTYPE html>');
    expect(srcdoc).toContain('<title>My HTML Document</title>');
    expect(srcdoc).toContain('Hello, World!');
  });
});
