import { describe, it, expect } from "vitest";
import { htmlTemplate } from "../v3/htmlTemplate";

describe("V3 HTML Template - viz export support", () => {
  it("should include logic to try Viz.viz before Viz.main", () => {
    const html = htmlTemplate({
      cdn: "",
      src: "",
      styles: "",
    });
    
    // Check that the HTML includes the logic to try Viz.viz first, then fallback to Viz.main
    expect(html).toContain("(Viz.viz || Viz.main)");
  });
  
  it("should still work with the existing main export pattern", () => {
    const html = htmlTemplate({
      cdn: "",
      src: "",
      styles: "",
    });
    
    // Ensure backward compatibility - should still reference Viz.main
    expect(html).toContain("Viz.main");
  });
  
  it("should prioritize Viz.viz over Viz.main when both exist", () => {
    const html = htmlTemplate({
      cdn: "",
      src: "",
      styles: "",
    });
    
    // The logic should be (Viz.viz || Viz.main) which means viz has priority
    expect(html).toContain("(Viz.viz || Viz.main)");
    expect(html).not.toContain("(Viz.main || Viz.viz)");
  });
});