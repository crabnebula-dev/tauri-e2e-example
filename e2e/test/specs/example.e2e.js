describe("Empty test", () => {
  it("should pass", async () => {
    console.info("Starting empty test");
    expect(true).toBe(true);
    browser.saveScreenshot("./empty-test.png");
  });
});

describe("Minimal test", () => {
  it("should pass", async () => {
    console.info("Starting minimal test");
    const welcomeText = await $("[data-testid='welcome']").getText();
    expect(welcomeText).toBeDefined();
    expect(welcomeText).toContain("Welcome to Tauri + Solid!");
    console.info("Minimal test passed");
    await browser.saveScreenshot("./minimal-test.png");
  });
});

describe("Hello Tauri", () => {
  it("should be excited", async () => {
    console.info("Starting test: should be excited");
    await $("[data-testid='welcome']").waitForExist();
    const header = await $("[data-testid='welcome']");
    const text = await header.getText();
    expect(text).toMatch(/!$/);
    console.info(`Found text: ${text}`);
  });

  describe("Hello Tauri using a Promise", () => {
   it("should be excited", async () => {
    console.info("Starting test: Hello Tauri using a Promise");
    const welcome = $("[data-testid='welcome']");

    const foundElement = await Promise.race([
      welcome.waitForExist({timeout: 30000}).then(() => ({type: 'welcome', element: welcome}))
    ])
    console.info(`Found ${foundElement.type} element`);
    await browser.saveScreenshot(`./${foundElement.type}-element-found.png`);
    const text = await foundElement.element.getText();
    expect(text).toMatch(/!$/);
    console.info(`Found text: ${text}`);
   });
 });
});


