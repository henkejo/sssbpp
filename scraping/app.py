import tkinter as tk
import sys
import subprocess
import threading
import sqlite3
from datetime import datetime, timedelta
from tkinter import *
import sched

root = tk.Tk()

scraper_out_label = tk.Label(root, text="Scraper output:")
scraper_out_label.grid(row=0, column=0)

scheduled_label = tk.Label(root, text="Upcoming automatic scrapes:")
scheduled_label.grid(row=0, column=1)

text = tk.Text(root)
text.grid(row=1, column=0)

scheduled = tk.Text(root, width=50)
scheduled.grid(row=1, column=1)

AUTO_SCHEDULE_INTERVAL_MINUTES = 120

scrapes_counter = 0

def redrawSchedule():
    text.delete(INSERT, END)
    text.insert(END, sched.scheduler.queue)

def runFullScrape():
    threading.Thread(target=fullScrape).start()

def fullScrape():
    print("Starting...")
    p = subprocess.Popen("python3 scraper.py".split(), stdout=subprocess.PIPE, bufsize=1, text=True)
    while p.poll() is None:
        msg = p.stdout.readline().strip() # read a line from the process output
        if msg:
            print(msg)
    print("Finished!")

    print("Checking for next automatic scrape...")

    db_connection = sqlite3.connect('sssbpp.db')
    dbc = db_connection.cursor()
    dbc.execute('''SELECT info_link, available_until FROM latest_snapshot ORDER BY available_until''')
    rows = dbc.fetchall()
    dbc.close()

    prev_time = datetime.strptime(rows[0][1], '%Y-%m-%d %H:%M:%S') - timedelta(seconds=15)
    counter = 1
    for row in rows:
        apt_link = row[0]
        time = datetime.strptime(row[1], '%Y-%m-%d %H:%M:%S') - timedelta(seconds=(15*counter))
        if time != prev_time: # Only schedule scrapes for apts with the soonest closing time
            break
        prev_time = time

        sched.scheduler.enterabs(time, counter, action=runSingleScrape, argument=apt_link)
        counter += 1
    
    next_full_scrape = datetime.now + timedelta(minutes=AUTO_SCHEDULE_INTERVAL_MINUTES)
    sched.scheduler.enterabs(next_full_scrape, counter, action=runSingleScrape, argument=apt_link)
    redrawSchedule()

    print("Done!")

def runSingleScrape(link):
    threading.Thread(target=fullScrape, args=link).start()

def singleScrape(link):
    print(datetime.now + " Starting...")
    p = subprocess.Popen(str("python3 scraper.py " + link).split(), stdout=subprocess.PIPE, bufsize=1, text=True)
    while p.poll() is None:
        msg = p.stdout.readline().strip() # read a line from the process output
        if msg:
            print(msg)
    print(datetime.now + " Finished!")
    
    redrawSchedule()


class Redirect():
    def __init__(self, widget):
        self.widget = widget
    def write(self, text):
        self.widget.insert('end', text)

button = tk.Button(root, text='Scrape now!', command=runFullScrape)
button.grid(row=2, column=1)

# Shoutout to user "furas" on stackoverflow
old_stdout = sys.stdout    
sys.stdout = Redirect(text)

root.mainloop()

sys.stdout = old_stdout