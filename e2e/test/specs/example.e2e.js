describe("Hello Tauri", () => {
  it("should be excited", async () => {
    await $("[data-testid='welcome']").waitForExist();
    const header = await $("[data-testid='welcome']");
    const text = await header.getText();
    expect(text).toMatch(/!$/);
  });
});
