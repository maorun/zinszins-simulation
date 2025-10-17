from playwright.sync_api import Page

def test_screenshot(page: Page):
    """
    This test verifies that a screenshot can be taken.
    """
    # 1. Arrange: Go to the application's homepage.
    page.goto("http://localhost:5173")

    # 2. Screenshot: Capture the initial state.
    page.screenshot(path="jules-scratch/verification/verification.png")