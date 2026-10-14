from pathlib import Path
import json
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parent.parent
html=(root/'play.html').read_text()
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
    errors=[]
    desktop=browser.new_page(viewport={'width':1440,'height':1000},device_scale_factor=1)
    desktop.on('pageerror',lambda error: errors.append(str(error)))
    desktop.set_content(html,wait_until="load")
    desktop.wait_for_selector('#world')
    initial=desktop.locator('#level-title').inner_text()
    assert initial.startswith('14'),initial
    assert desktop.locator('#win-overlay').is_hidden()
    desktop.screenshot(path=str(root/'preview_advanced.png'),full_page=True)
    # Play advanced #14 through the real UI keyboard handler, not a mocked state injection.
    seq=json.loads((root/'replays'/'puzzle-14.json').read_text())['inputs']
    lookup={'up':'ArrowUp','down':'ArrowDown','left':'ArrowLeft','right':'ArrowRight'}
    for key in seq: desktop.keyboard.press(lookup[key])
    assert desktop.locator('#status').inner_text()=='已通关'
    assert desktop.locator('#win-overlay').is_visible()
    assert desktop.locator('#next-level').inner_text().startswith('下一关')
    desktop.screenshot(path=str(root/'preview_victory.png'),full_page=True)
    desktop.locator('#next-level').click()
    assert desktop.locator('#level-title').inner_text().startswith('15')
    assert desktop.locator('#win-overlay').is_hidden()
    # Return to level 14, win, undo and redo to ensure victory panel syncs with history.
    desktop.evaluate('window.WCW_DEBUG.choose(13)')
    for key in seq: desktop.keyboard.press(lookup[key])
    desktop.keyboard.press('z')
    assert desktop.locator('#win-overlay').is_hidden()
    desktop.keyboard.press('y')
    assert desktop.locator('#win-overlay').is_visible()
    desktop.keyboard.press('Enter')
    assert desktop.locator('#level-title').inner_text().startswith('15')
    mobile=browser.new_page(viewport={'width':390,'height':844},device_scale_factor=1,is_mobile=True,has_touch=True)
    mobile.on('pageerror',lambda error: errors.append(str(error)))
    mobile.set_content(html,wait_until="load")
    assert mobile.locator('#win-overlay').is_hidden()
    width=mobile.evaluate('({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth})')
    assert width['scroll']<=width['client']+1,width
    mobile.screenshot(path=str(root/'preview_mobile.png'),full_page=True)
    # The last challenge has a meaningful end-of-list action, and its dialog fits mobile.
    last=json.loads((root/'replays'/'puzzle-15.json').read_text())['inputs']
    mobile.evaluate('window.WCW_DEBUG.choose(14)')
    for move in last:
        mobile.evaluate('(dir)=>window.WCW_DEBUG.apply(dir)',move)
    assert mobile.locator('#win-overlay').is_visible()
    assert mobile.locator('#next-level').inner_text()=='返回关卡列表'
    mobile.screenshot(path=str(root/'preview_mobile_victory.png'),full_page=True)
    mobile.locator('#next-level').click()
    assert mobile.locator('#win-overlay').is_hidden()
    assert not errors,errors
    print('PASS: desktop/mobile render, arrow keys, victory overlay, next button, undo/redo, Enter and no browser errors')
    browser.close()
