from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch()
    page = browser.new_page()

    # 1. Navigate to the app
    page.goto("http://localhost:5173/")

    # 2. Find and expand the "Entnahme" panel
    # The panel header is a button
    entnahme_panel_header = page.get_by_role("button", name="💸 Entnahme")
    entnahme_panel_header.click()

    # 3. Select the "Dynamische Entnahme" strategy
    dynamic_strategy_radio = page.get_by_role("radio", name="Dynamische Entnahme")
    dynamic_strategy_radio.click()

    # 4. Wait for the new conditional panel to be visible
    # The panel contains text "Regeln für dynamische Anpassung:"
    dynamic_panel_text = page.get_by_text("Regeln für dynamische Anpassung:")
    expect(dynamic_panel_text).to_be_visible()

    # 5. Take a screenshot of the entire "Entnahme" panel
    entnahme_panel = entnahme_panel_header.locator("..") # Get the parent element
    entnahme_panel.screenshot(path="jules-scratch/verification/dynamic_withdrawal_ui.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
