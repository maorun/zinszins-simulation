from playwright.sync_api import sync_playwright, expect

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            page.goto("http://localhost:5174", timeout=30000)

            # Wait for the main title to be visible to ensure the page has loaded
            expect(page.get_by_role("heading", name="Zinseszins-Simulation")).to_be_visible(timeout=15000)

            # It might take a moment for the calculations to run and the page to be fully rendered
            # I will wait for the "Neu berechnen" button to be enabled as a sign that the initial calculation is done
            expect(page.get_by_role("button", name="🔄 Neu berechnen")).to_be_enabled(timeout=15000)

            # A small extra wait just in case of rendering lag
            page.wait_for_timeout(2000)

            page.screenshot(path="jules-scratch/verification/verification.png")
            print("Screenshot taken successfully.")
        except Exception as e:
            print(f"An error occurred: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    run()
