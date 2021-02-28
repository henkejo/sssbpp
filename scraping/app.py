import tkinter as tk
import sys
import subprocess
import threading
import sqlite3
from datetime import datetime, timedelta
import sched

scheduled_scrapes = []

# Shoutout to user "furas" on stackoverflow

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

    print("Checking for next automatic scrape:")

    db_connection = sqlite3.connect('sssbpp.db')
    dbc = db_connection.cursor()
    dbc.execute('''SELECT info_link, available_until FROM latest_snapshot ORDER BY available_until''')
    rows = dbc.fetchall()
    dbc.close()

    for row in rows:
        time = datetime.strptime(rows[0][1], '%Y-%m-%d %H:%M:%S') - timedelta(seconds=15)
        apt_link = rows[0][0]
        scheduled_scrape = {'time':time, 'link':apt_link, 'type':'closing'}

    scheduled_scrapes.add()
    
    print(next_time)

class Redirect():
    def __init__(self, widget):
        self.widget = widget
    def write(self, text):
        self.widget.insert('end', text)

root = tk.Tk()

scraper_out_label = tk.Label(root, text="Scraper output:")
scraper_out_label.grid(row=0, column=0)

scheduled_label = tk.Label(root, text="Upcoming automatic scrapes:")
scheduled_label.grid(row=0, column=1)

text = tk.Text(root)
text.grid(row=1, column=0)

scheduled = tk.Text(root, width=50)
scheduled.grid(row=1, column=1)

button = tk.Button(root, text='Scrape now!', command=runFullScrape)
button.grid(row=2, column=1)

old_stdout = sys.stdout    
sys.stdout = Redirect(text)

root.mainloop()

sys.stdout = old_stdout