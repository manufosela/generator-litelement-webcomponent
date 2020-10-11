/* eslint-disable no-unused-expressions */
/* eslint-disable import/no-extraneous-dependencies */
import { html, fixture, expect } from "@open-wc/testing";
import "../wc-name";

describe("WcName", () => {
  it("should have the basic template", async () => {
    const el = await fixture(
      html`
        <wc-name></wc-name>
      `
    );
    const base = el.shadowRoot.querySelector(".wc-name");

    expect(base).not.to.be.null;
    expect(el).dom.to.equalSnapshot();
  });
});
