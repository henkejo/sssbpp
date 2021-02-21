#!/usr/bin/env python
# -*- coding: utf-8 -*-
import json
from datetime import datetime
import time
import uuid
from pdf2image.generators import uuid_generator
from selenium import webdriver
from selenium.webdriver.firefox.options import Options

import sqlite3
db_connection = sqlite3.connect('sssbpp.db')
dbc = db_connection.cursor()

#import requests
#import pdf2image
#from imgurpython import ImgurClient
#from imgurcreds import client_id, client_secret
#imgur_client = ImgurClient(client_id, client_secret)

options = Options()
options.headless = True
options.add_argument("--window-size=1920,1200")

DRIVER_PATH = '/usr/local/bin/geckodriver'
driver = webdriver.Firefox(options=options, executable_path=DRIVER_PATH)
driver.get("https://sssb.se/soka-bostad/sok-ledigt/lediga-bostader/?paginationantal=200")
time.sleep(5)

def extract_number(string):
    'Extracts numbers from strings'
    return int(''.join([str(x) for x in list(filter(str.isdigit, string))]))

def get_with_selector(web_elem, css_selector):
    'Gets inner HTML of a child of a web element using a given CSS selector'
    return web_elem.find_element_by_css_selector(css_selector).get_attribute("innerHTML")

apt_cards = driver.find_elements_by_class_name("BoxContent")
links = []
# apt_card = apt_cards[6]#                         #<- for one apt
for apt_card in apt_cards:
    links.append(apt_card.find_element_by_css_selector(".ObjektTyp a").get_property("href"))

time_stamp = datetime.now()
snapshot_id = uuid.uuid4().hex

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
    apt['move-in'] = datetime.strptime(get_with_selector(content, "dd.ObjektInflytt"), '%Y-%m-%d')
    avail_string = get_with_selector(content, ".IntresseMeddelande").split(" ")
    apt['avail'] = datetime.strptime(avail_string[3] + " " + avail_string[5][:5], '%Y-%m-%d %H:%M')
    book_string = get_with_selector(content, ".Objektintressestatus").split(" ")
    if len(book_string) < 10:
        apt['bookers'] = 0
        apt['best-points'] = 0
    else:
        apt['bookers'] = int(book_string[5])
        apt['best-points'] = int(book_string[15])
    apt['info-link'] = link
    apt['plan-link'] = content.find_element_by_css_selector(".TypOrit a").get_property("href")
    try:
        apt['floor-plan-link'] = content.find_element_by_css_selector(".TypVanrit a").get_property("href")
    except:
        apt['floor-plan-link'] = ""
        print("(No floor plan.)")
    print("Saved " + apt['address'] + " lgh " + apt['apt_nr'] + ".")
    apts.append(apt)

    dbc.execute('''INSERT INTO apartment
            (snapshot,
            obj_nr,
            type,
            hood,
            address,
            apt_nr,
            available_until,best_points,
            bookers,
            info_link,
            floor_plan_link,
            plan_link, move_in,
            rent,
            sqm)
            VALUES
            (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);''',
            (snapshot_id, apt['obj-nr'], apt['type'], apt["hood"], apt["address"], apt["apt_nr"],
            apt["avail"], apt["best-points"], apt["bookers"], apt["info-link"],
            apt["floor-plan-link"], apt["plan-link"], apt["move-in"], apt["rent"], apt["sqm"]))


# (PDF stuff for later)
# pdf = requests.get(apt_plan_link)
# pdf_id = uuid_generator()
# pdf2image.convert_from_bytes(pdf.raw.read(), output_file=pdf_id)
# imgur_client.upload_from_path(pdf_id, config=None, anon=True)

# print(json.dumps(apt))

dbc.execute('''INSERT INTO snapshot
        (id,
        timestamp)
        VALUES
        (?, ?);''',
        (snapshot_id, time_stamp))

db_connection.commit()
db_connection.close()
