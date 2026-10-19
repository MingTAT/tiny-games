from pathlib import Path
from playwright.sync_api import sync_playwright
html=Path(__file__).resolve().parents[1].joinpath('play.html').read_text(encoding='utf-8')
route19='D L L U R R U U R U R R L D L L L U L D R R D D L U U R R R U R R R R R R R R R'.split()
route20='R U R U U L U L L L L L U'.split()
keys={'R':'ArrowRight','L':'ArrowLeft','U':'ArrowUp','D':'ArrowDown'}
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 page=browser.new_page(viewport={'width':1360,'height':980},device_scale_factor=1)
 errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.set_content(html,wait_until='domcontentloaded');page.wait_for_timeout(300)
 assert '19' in page.locator('#level-title').inner_text()
 page.screenshot(path=str(Path(__file__).resolve().parents[1]/'preview_v18_desktop.png'),full_page=True)
 # This is a keyboard walkthrough through the real UI, not direct state mutation.
 for k in route19:page.keyboard.press(keys[k]);
 assert page.locator('#win-overlay').is_visible()
 assert page.locator('#next-level').inner_text().strip().startswith('下一关')
 page.screenshot(path=str(Path(__file__).resolve().parents[1]/'preview_v18_win.png'),full_page=True)
 page.locator('#next-level').click();assert '20' in page.locator('#level-title').inner_text()
 assert not page.locator('#win-overlay').is_visible()
 page.screenshot(path=str(Path(__file__).resolve().parents[1]/'preview_v18_level20.png'),full_page=True)
 for k in route20:page.keyboard.press(keys[k]);
 assert page.locator('#win-overlay').is_visible()
 page.locator('#replay-level').click();assert not page.locator('#win-overlay').is_visible()
 page.locator('#menu-toggle').click();assert page.locator('#menu-overlay').is_visible()
 page.locator('#menu-close').click();assert not page.locator('#menu-overlay').is_visible()
 page.keyboard.press('ArrowRight');page.keyboard.press('z');assert page.locator('#turn').inner_text()=='0'
 print('desktop: level19 win > Next > level20 win > restart > menu > undo ✓')
 mobile=browser.new_page(viewport={'width':390,'height':844},device_scale_factor=1)
 mobile.on('pageerror',lambda e:errors.append(str(e)))
 mobile.set_content(html,wait_until='domcontentloaded');mobile.wait_for_timeout(300)
 assert mobile.locator('.touch-controls').is_visible()
 assert mobile.evaluate('document.documentElement.scrollWidth <= innerWidth')
 mobile.screenshot(path=str(Path(__file__).resolve().parents[1]/'preview_v18_mobile.png'),full_page=True)
 mobile.locator('[data-action="up"]').last.click();assert mobile.locator('#turn').inner_text()=='1'
 mobile.locator('[data-action="undo"]').last.click();assert mobile.locator('#turn').inner_text()=='0'
 print('mobile: no horizontal overflow; controls and undo ✓')
 assert not errors,errors
 print('No JS page errors ✓')
 browser.close()
