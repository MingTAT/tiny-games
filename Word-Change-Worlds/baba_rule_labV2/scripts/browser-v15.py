import json
from pathlib import Path
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from threading import Thread
from functools import partial
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
plans={n:json.loads((root/'replays'/f'puzzle-{n}.json').read_text())['inputs'] for n in (16,17,18)}
server=ThreadingHTTPServer(('127.0.0.1',0),partial(SimpleHTTPRequestHandler,directory=str(root)))
thread=Thread(target=server.serve_forever,daemon=True);thread.start()
with sync_playwright() as p:
    b=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
    for mobile in (False,True):
      page=b.new_page(viewport={'width':390 if mobile else 1440,'height':844 if mobile else 900},device_scale_factor=1)
      errors=[]
      page.on('pageerror',lambda e:errors.append(str(e)))
      page.set_content((root/'play.html').read_text(),wait_until='load')
      assert page.locator('#level-title').inner_text().startswith('16'),page.locator('#level-title').inner_text()
      assert page.locator('.debug-pane').first.get_attribute('open') is None
      page.screenshot(path=str(root/('preview_mobile_initial.png' if mobile else 'preview_initial.png')),full_page=True)
      for n in (16,17,18):
        page.evaluate('(n)=>window.WCW_DEBUG.choose(n-1)',n)
        for m in plans[n]:page.evaluate('(m)=>window.WCW_DEBUG.apply(m)',m)
        assert page.locator('#status').inner_text()=='已通关',f'{n} not won'
        assert page.locator('#win-overlay').is_visible(),n
        if n==16:
          page.screenshot(path=str(root/'preview_challenge16.png'),full_page=True)
          page.locator('[data-action="undo"]').click()
          assert not page.locator('#win-overlay').is_visible()
          page.locator('[data-action="redo"]').click()
          assert page.locator('#win-overlay').is_visible()
        if n==17:
          page.screenshot(path=str(root/'preview_challenge17.png'),full_page=True)
        if n==18:
          page.screenshot(path=str(root/('preview_mobile_win.png' if mobile else 'preview_win.png')),full_page=True)
        if n<18:
          page.locator('#next-level').click()
          assert page.locator('#level-title').inner_text().startswith(str(n+1)),('next incorrect',n)
      width=page.evaluate('document.documentElement.scrollWidth')
      assert width <= (390 if mobile else 1440)+1,f'horizontal overflow {mobile}: {width}'
      assert not errors,errors
      print('PASS','mobile' if mobile else 'desktop', '16-18 victory / next / undo redo / no errors', 'scrollWidth=',width)
      page.close()
    b.close()
server.shutdown()
