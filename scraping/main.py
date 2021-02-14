import firebase_admin
import json
from selenium import webdriver
from selenium.webdriver.firefox.options import Options

from firebase_admin import credentials
from firebase_admin import firestore

cred = credentials.ApplicationDefault()
cred = credentials.Certificate('key.json')
firebase_admin.initialize_app(cred)

db = firestore.client()

options = Options()
options.headless = True
options.add_argument("--window-size=1920,1200")

DRIVER_PATH = '/usr/local/bin/geckodriver'
driver = webdriver.Firefox(options=options, executable_path=DRIVER_PATH)
driver.get("https://sssb.se/soka-bostad/sok-ledigt/lediga-bostader/?paginationantal=200")
driver.implicitly_wait(3)

def extract_number(string):
    'Extracts numbers from strings'
    return int(''.join([str(x) for x in list(filter(str.isdigit, string))]))

def get_with_selector(web_elem, css_selector):
    'Gets inner HTML of a child of a web element using a given CSS selector'
    return web_elem.find_element_by_css_selector(css_selector).get_attribute("innerHTML")

apt_cards = driver.find_elements_by_class_name("BoxContent")
apts = []

# for apt_card in apt_cards:            <- for all apts
apt_card = apt_cards[1]#                <- for one apt

link = apt_card.find_element_by_css_selector(".ObjektTyp a").get_property("href")
driver.get(link)
driver.implicitly_wait(1)

content = driver.find_element_by_id("SubNavigationContentContainer")
apt = {}
apt['obj-nr'] = get_with_selector(content, "h5 em")
apt['hood'] = get_with_selector(content, ".ObjektOmrade a")
address_elem = get_with_selector(content, "dd.ObjektAdress").split(" / ")
apt['address'] = address_elem[0]
apt['apt_nr'] = address_elem[1]
apt['type'] = get_with_selector(content, "dd.ObjektTyp")
apt['sqm'] = int(get_with_selector(content, "dd.ObjektYta").split(" ")[0])
apt['rent'] = extract_number(get_with_selector(content, "dd.ObjektHyra"))
apt['move_in_date'] = get_with_selector(content, "dd.ObjektInflytt")
avail_string = get_with_selector(content, ".IntresseMeddelande").split(" ")
apt['avail_date'] = avail_string[3]
apt['avail_time'] = avail_string[5][:5]
apt['info-link'] = link

print(json.dumps(apt))

driver.quit()