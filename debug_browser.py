from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.on("console", lambda msg: print(f"Browser console [{msg.type}]: {msg.text}"))
        page.on("pageerror", lambda err: print(f"Browser error: {err}"))
        print("Navigating to http://localhost:8000 ...")
        page.goto("http://localhost:8000", wait_until="networkidle")
        print("Done.")
        browser.close()

if __name__ == "__main__":
    run()
