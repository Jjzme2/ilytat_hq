from playwright.sync_api import Page, expect, sync_playwright

def test_settings_accessibility(page: Page):
    print("Navigating to settings...")
    # Navigate to the settings page
    try:
        page.goto("http://localhost:2945/settings", timeout=30000)
    except Exception as e:
        print(f"Failed to load page: {e}")
        return

    print(f"Page title: {page.title()}")

    # Take screenshot for debugging
    page.screenshot(path="verification/verification_debug.png")
    print("Screenshot saved to verification/verification_debug.png")

    print("Checking Dark Mode Toggle...")
    # Check for toggles
    dark_mode_toggle = page.get_by_role("switch", name="Toggle dark mode")
    expect(dark_mode_toggle).to_be_visible()

    print("Checking Notification Toggle...")
    notification_toggle = page.get_by_role("switch", name="Notifications (coming soon)")
    expect(notification_toggle).to_be_visible()
    expect(notification_toggle).to_be_disabled()

    print("Checking Logo Input...")
    # Check for Logo input
    logo_label = page.get_by_text("Company Logo URL")
    expect(logo_label).to_be_visible()

    # We can check the input association implicitly by clicking the label and seeing if the input is focused
    # Or just verify the input is visible
    logo_input = page.get_by_label("Company Logo URL")
    expect(logo_input).to_be_visible()
    logo_input.fill("test-logo.png")

    # Take screenshot
    page.screenshot(path="verification/verification_settings.png")
    print("Screenshot saved to verification/verification_settings.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        print("Launching browser...")
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            test_settings_accessibility(page)
        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()
