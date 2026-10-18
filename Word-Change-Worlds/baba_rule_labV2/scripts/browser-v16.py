"""Manual browser regression of a synthetic paradox fixture. DOES NOT access the original game."""
import json
from pathlib import Path
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
html=(root/'play.html').read_text()
fixture=[]
for y,line in enumerate(('ROCK IS GROUP','GROUP IS NOT GROUP')):
  for x,word in enumerate(line.split()):
    fixture.append({'kind':'TEXT','word':word,'x':x,'y':y})
fixture.append({'kind':'ROCK','x':8,'y':7})
old='let state = (0, core_1.clone)(levels_1.puzzles[level].state);'
replacement='let state = (0, core_1.create)(14,11,'+json.dumps(fixture)+');'
assert old in html
html=html.replace(old,replacement,1)
with sync_playwright() as p:
 b=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 for mobile in (False,True):
  page=b.new_page(viewport={'width':390 if mobile else 1440,'height':844 if mobile else 900})
  errors=[]
  page.on('pageerror',lambda e:errors.append(str(e)))
  page.set_content(html,wait_until='load')
  page.locator('[data-action="wait"]').click()
  assert page.locator('#status').inner_text()=='规则循环 · 可撤销'
  assert page.locator('#win-overlay').is_visible()
  assert not page.locator('#next-level').is_visible()
  assert 'INFINITE LOOP' in page.locator('#victory-title').inner_text()
  page.screenshot(path=str(root/('preview_loop_mobile.png' if mobile else 'preview_loop_desktop.png')),full_page=True)
  page.keyboard.press('z')
  assert page.locator('#status').inner_text()=='进行中'
  assert not page.locator('#win-overlay').is_visible()
  assert not errors,errors
  print('PASS', 'mobile' if mobile else 'desktop', 'GROUP loop panel / next hidden / undo / no JS error')
  page.close()
 b.close()
