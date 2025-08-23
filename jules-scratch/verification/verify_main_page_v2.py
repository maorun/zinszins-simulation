from playwright.sync_api import sync_playwright, expect

def run():
    ports_to_try = [5173, 5174, 5175, 5176, 5177]
    for port in ports_to_try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            try:
                print(f"Trying to connect to port {port}...")
                page.goto(f"http://localhost:{port}", timeout=10000)

                expect(page.get_by_role("heading", name="Zinseszins-Simulation")).to_be_visible(timeout=10000)

                expect(page.get_by_role("button", name="🔄 Neu berechnen")).to_be_enabled(timeout=10000)

                page.wait_for_timeout(2000)

                page.screenshot(path="jules-scratch/verification/verification.png")
                print(f"Screenshot taken successfully on port {port}.")
                browser.close()
                return
            except Exception as e:
                print(f"Could not connect to port {port}: {e}")
            finally:
                browser.close()

    print("Failed to connect to any of the ports.")

if __name__ == "__main__":
    run()
