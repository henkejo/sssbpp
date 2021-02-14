#!/usr/bin/env python
# -*- coding: utf-8 -*-
import json
import time
from pdf2image.generators import uuid_generator
from selenium import webdriver
from selenium.webdriver.firefox.options import Options

#import requests
#import pdf2image
#from imgurpython import ImgurClient
#from imgurcreds import client_id, client_secret
#imgur_client = ImgurClient(client_id, client_secret)

import firebase_admin
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
time.sleep(3)

from datetime import datetime
today = datetime.now()
time_stamp = today.strftime("%Y-%m-%d %H:%M:%S")

def extract_number(string):
    'Extracts numbers from strings'
    return int(''.join([str(x) for x in list(filter(str.isdigit, string))]))

def get_with_selector(web_elem, css_selector):
    'Gets inner HTML of a child of a web element using a given CSS selector'
    return web_elem.find_element_by_css_selector(css_selector).get_attribute("innerHTML")

snapshot = {}

apt_cards = driver.find_elements_by_class_name("BoxContent")
links = []
#apt_card = apt_cards[6]#                #<- for one apt
for apt_card in apt_cards:
    links.append(apt_card.find_element_by_css_selector(".ObjektTyp a").get_property("href"))

apts = []
for link in links:
    driver.get(link)
    time.sleep(4)

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
    book_string = get_with_selector(content, ".Objektintressestatus").split(" ")
    if len(book_string) < 10:
        apt['bookers'] = 0
        apt['best_points'] = 0
    else:
        apt['bookers'] = int(book_string[5])
        apt['best_points'] = int(book_string[15])
    apt['info-link'] = link
    apt['plan-link'] = content.find_element_by_css_selector(".TypOrit a").get_property("href")
    try:
        apt['floor-plan-link'] = content.find_element_by_css_selector(".TypVanrit a").get_property("href")
    except:
        print("(No floor plan.)")
    print("Saved " + apt['address'] + " lgh " + apt['apt_nr'] + ".")
    apts.append(apt)

# (PDF stuff for later)
# pdf = requests.get(apt_plan_link)
# pdf_id = uuid_generator()
# pdf2image.convert_from_bytes(pdf.raw.read(), output_file=pdf_id)
# imgur_client.upload_from_path(pdf_id, config=None, anon=True)

# print(json.dumps(apt))

snapshot['timestamp'] = time_stamp
snapshot['apts'] = apts
print(json.dumps(snapshot))
db.collection("snapshots").document(time_stamp).set(snapshot)

driver.quit()