#!/usr/bin/env python
# -*- coding: utf-8 -*-
from datetime import datetime, timedelta
import sched
import uuid
import time as time_module
from random import randrange
from pdf2image.generators import uuid_generator
from selenium import webdriver
from selenium.webdriver.firefox.options import Options
import sqlite3

AUTO_SCHEDULE_INTERVAL_MINUTES = 120
scrapes_counter = 0

options = Options()
options.headless = True
options.add_argument("--window-size=1920,1200")

DRIVER_PATH = '/usr/local/bin/geckodriver'
driver = webdriver.Firefox(options=options, executable_path=DRIVER_PATH)

scheduler = sched.scheduler(time_module.time, time_module.sleep)

def scrape(scrape_link):
    db_connection = sqlite3.connect('sssbpp.db')
    dbc = db_connection.cursor()
    print(str(datetime.now().strftime("%Y-%m-%d %H:%M:%S")) + " Searching for apartments...")

    driver.get("https://sssb.se/soka-bostad/sok-ledigt/lediga-bostader/?paginationantal=200")

    time_module.sleep(5+randrange(3))

    def extract_number(string):
        'Extracts numbers from strings'
        return int(''.join([str(x) for x in list(filter(str.isdigit, string))]))

    def get_with_selector(web_elem, css_selector):
        'Gets inner HTML of a child of a web element using a given CSS selector'
        try:
            return web_elem.find_element_by_css_selector(css_selector).get_attribute("innerHTML")
        except:
            print("Cannot find any element using selector: " + css_selector)
            return ""
    
    is_single_scrape = scrape_link != None

    if is_single_scrape:   
        links = [scrape_link]
    else:
        apt_cards = driver.find_elements_by_class_name("BoxContent")
        links = []
        for apt_card in apt_cards:
            links.append(apt_card.find_element_by_css_selector(".ObjektTyp a").get_property("href"))

        print("Found " + str(len(links)) + " apartments.")

    time_stamp = datetime.now()
    snapshot_id = uuid.uuid4().hex

    apts = []
    for link in links:
        print("Checking apartment link: " + link)
        try: 
            driver.get(link)
        except:
            print("- An error occurred while loading this link.")
            break
        time_module.sleep(4+randrange(4))
        try: 
            content = driver.find_element_by_id("SubNavigationContentContainer")
        except:
            print("- Could not find the div containing the info needed. (Didn't have time to load?)")
            break
        apt = {}
        apt['obj-nr'] = get_with_selector(content, "h5 em")
        apt['hood'] = get_with_selector(content, ".ObjektOmrade a")
        address_elem = get_with_selector(content, "dd.ObjektAdress").split(" / ")
        apt['address'] = address_elem[0]
        apt['apt_nr'] = address_elem[1]
        print("Found " + apt['address'] + " lgh " + apt['apt_nr'] + ".")
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
        try:
            apt['plan-link'] = content.find_element_by_css_selector(".TypOrit a").get_property("href")
        except:
            apt['floor-plan-link'] = ""
            print("- (No floor plan)")
        try:
            apt['floor-plan-link'] = content.find_element_by_css_selector(".TypVanrit a").get_property("href")
        except:
            apt['floor-plan-link'] = ""
            print("- (No floor plan)")
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
        print(str(datetime.now().strftime("%Y-%m-%d %H:%M:%S")) + " Done.")

    dbc.execute('''INSERT INTO snapshot
            (id,
            timestamp,
            fullscrape)
            VALUES
            (?, ?, ?);''',
            (snapshot_id, time_stamp, not(is_single_scrape)))

    db_connection.commit()
    db_connection.close()

    if not(is_single_scrape):
        print("Checking for next automatic scrape...")

        db_connection = sqlite3.connect('sssbpp.db')
        dbc = db_connection.cursor()
        dbc.execute('''SELECT info_link, available_until FROM latest_snapshot ORDER BY available_until''')
        rows = dbc.fetchall()
        dbc.close()

        list(map(scheduler.cancel, scheduler.queue)) # Clearing schedule

        counter = 1
        prev_time = datetime.strptime(rows[0][1], '%Y-%m-%d %H:%M:%S') - timedelta(seconds=15)
        for row in rows:
            apt_link = row[0]
            scrape_time = datetime.strptime(row[1], '%Y-%m-%d %H:%M:%S') - timedelta(seconds=(15*counter))
            if scrape_time != prev_time: # Only schedule scrapes for apts with the soonest closing time
                break
            prev_time = scrape_time

            scheduler.enterabs(time=scrape_time.timestamp(), priority=counter, action=scrape, argument=apt_link)
            counter += 1

        next_full_scrape = datetime.now() + timedelta(minutes=(AUTO_SCHEDULE_INTERVAL_MINUTES + randrange(15)), seconds=randrange(30))
        scheduler.enterabs(time=next_full_scrape.timestamp(), priority=counter, action=scrape, argument=None)
        print("Done!")

    print("Scheduled scrapes:")
    for event in scheduler.queue:
        print(str(datetime.fromtimestamp(event.time).strftime("%Y-%m-%d %H:%M:%S")) + " - Link: " + str(event.argument))
    scheduler.run()

scrape(None)



