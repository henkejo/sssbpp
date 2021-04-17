package main

import (
	"database/sql"
	"errors"
	"io"
	"log"
	"net/http"
	"os"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/buger/jsonparser"
	"github.com/go-co-op/gocron"
	"github.com/go-gorp/gorp"
	_ "github.com/lib/pq"
	"golang.org/x/net/html"
)

type snapshot struct {
	Id         int       `db:"id"`
	Timestamp  time.Time `db:"timestamp"`
	FullScrape bool      `db:"full_scrape"`
}

type apartment struct {
	Snapshot       int       `db:"snapshot"`
	ObjNr          string    `db:"obj_nr"`
	RefID          string    `db:"ref_id"`
	Hood           string    `db:"hood"`
	AptType        string    `db:"type"`
	Address        string    `db:"address"`
	AptNr          string    `db:"apt_nr"`
	AvailableUntil time.Time `db:"available_until"`
	BestPoints     int       `db:"best_points"`
	Bookers        int       `db:"bookers"`
	InfoLink       string    `db:"info_link"`
	MoveIn         time.Time `db:"move_in"`
	Rent           int       `db:"rent"`
	Sqm            int       `db:"sqm"`
	Special        string    `db:"special"`
}

func fullScrape(dbmap *gorp.DbMap) {
	log.Println("Starting full scrape...")
	aptsListLink := "https://sssb.se/widgets/?callback=a&widgets%5B%5D=objektlista%40lagenheter"

	resp, err := http.Get(aptsListLink)
	if err != nil {
		log.Println("Could not get apts list: " + aptsListLink)
		return
	}
	defer resp.Body.Close()

	doc, err := html.Parse(resp.Body)
	if err != nil {
		log.Println("Could not parse HTML from apts list: " + aptsListLink)
		return
	}

	var aptRefIDs []string
	var f func(*html.Node)
	f = func(n *html.Node) {
		if n.Type == html.ElementNode && n.Data == "a" {
			for _, a := range n.Attr {
				if a.Key == "href" {
					re := regexp.MustCompile(`refid(.*)\\`)
					link := a.Val
					refID := re.FindString(link)
					aptRefIDs = append(aptRefIDs, refID[6:len(refID)-1])
					break
				}
			}
		}
		for c := n.FirstChild; c != nil; c = c.NextSibling {
			f(c)
		}
	}
	f(doc)

	snap := snapshot{Timestamp: time.Now(), FullScrape: true}
	if dbmap.Insert(&snap) != nil {
		log.Println("Could not insert snapshot into db.")
		return
	} else {
		for _, refID := range aptRefIDs {
			singleScrape(refID, dbmap, true, snap.Id)
		}
	}
	log.Println("Full scrape complete! 👍")
	log.Println("Next full scrape at approx: " + string(time.Now().Add(time.Hour*3).Format("01-02-2006 15:04:05")))
}

func singleScrape(refID string, dbmap *gorp.DbMap, partOfFullScrape bool, snapID int) {
	apt, err := getApt(refID)
	apt.RefID = refID
	if partOfFullScrape {
		apt.Snapshot = snapID
	} else {
		snap := snapshot{Timestamp: time.Now(), FullScrape: false}
		dbmap.Insert(&snap)
	}

	if err != nil {
		log.Println("Error while scraping apartment: " + err.Error())
	} else {
		isFinalScrape := (time.Until(apt.AvailableUntil)) < time.Second*30
		if partOfFullScrape || !partOfFullScrape && isFinalScrape {
			if dbmap.Insert(&apt) != nil {
				log.Println("Could not insert apartment with ref " + refID + " into db.")
			} else {
				log.Println("Inserted apartment with ref " + refID + " into database!")
			}
		}
	}
}

func getApt(refID string) (apartment, error) {
	aptLink := "https://sssb.se/widgets/?widgets%5B%5D=objektinformation%40lagenheter&widgets%5B%5D=objektdokument&widgets%5B%5D=objektintressestatus&widgets%5B%5D=objektintresse&callback=a&refid=" + refID
	log.Println("Scraping apartment with ref: " + refID)

	resp, err := http.Get(aptLink)
	if err != nil {
		log.Println("Could not get " + aptLink)
		return apartment{}, errors.New("get-error-" + refID)
	}
	respBody, err := io.ReadAll(resp.Body)
	resp.Body.Close()
	if err != nil {
		log.Println("Could not read " + aptLink)
		return apartment{}, errors.New("read-error-" + refID)
	}

	paths := [][]string{
		{"data", "objektinformation@lagenheter", "objektNr"},
		{"data", "objektinformation@lagenheter", "adress"},
		{"data", "objektinformation@lagenheter", "omrade"},
		{"data", "objektinformation@lagenheter", "hyra"},
		{"data", "objektinformation@lagenheter", "typ"},
		{"data", "objektinformation@lagenheter", "yta"},
		{"data", "objektinformation@lagenheter", "inflyttningDatum"},
		{"data", "objektinformation@lagenheter", "detaljUrl"},
		{"data", "objektinformation@lagenheter", "antalIntresse"},
		{"html", "objektintresse"},
	}
	var apt apartment
	jsonparser.EachKey(respBody, func(idx int, value []byte, vt jsonparser.ValueType, _ error) {
		switch idx {
		case 0: // objektNr
			apt.ObjNr = string(value)
		case 1: // adress
			regx, err := regexp.Compile(`(.*)( / )(.*)`)
			matches := regx.FindStringSubmatch(string(value))
			if err != nil {
				log.Println("No address info will be saved. Error: " + err.Error())
			} else {
				apt.Address = matches[1]
				apt.AptNr = matches[3]
			}
		case 2: // omrade
			apt.Hood = string(value)
		case 3: // hyra
			rentstring := strings.ReplaceAll(string(value), " ", "")
			apt.Rent, err = strconv.Atoi(rentstring)
			if err != nil {
				log.Println("No rent info will be saved. Error: " + err.Error())
			}
		case 4: // typ
			apt.AptType = string(value)
		case 5: // yta
			rent64, err := jsonparser.ParseInt(value)
			if err != nil {
				log.Println("No sqm info will be saved. Error: " + err.Error())
			} else {
				apt.Sqm = int(rent64)
			}
		case 6: // inflyttningDatum
			apt.MoveIn, _ = time.Parse("2006-01-02", string(value))
		case 7: // detaljUrl
			apt.AptType = string(value)
		case 8: // antalIntresse
			regx, err := regexp.Compile(`([0-9]+)( )\(([0-9]+)st`)
			if err != nil {
				log.Println("No interest info will be saved. Probably no bookers. Error: " + err.Error())
			} else {
				matches := regx.FindStringSubmatch(string(value))
				apt.BestPoints, _ = strconv.Atoi(matches[1])
				apt.Bookers, _ = strconv.Atoi(matches[3])
			}
		case 9: // objektintresse (listing ending)
			regx, err := regexp.Compile(`(till )([0-9]+-[0-9]+-[0-9]+)( klockan )([0-9]+:[0-9]+)(\. )`)
			if err != nil {
				log.Println("No listing ending info will be saved. Probably no bookers. Error: " + err.Error())
			} else {
				matches := regx.FindStringSubmatch(string(value))
				apt.AvailableUntil, _ = time.Parse("2006-01-2T15:04", matches[2]+"T"+matches[4])
			}
		}
	}, paths...)
	return apt, nil
}

func scheduleNextFinalScrape(dbmap *gorp.DbMap, scheduler *gocron.Scheduler) {
	var aptsToCheck []apartment
	_, err := dbmap.Select(&aptsToCheck, "SELECT * FROM closing_soon")
	if err != nil {
		log.Panicln("Couldn't find next final scrape. Quitting. " + err.Error())
	}
	nextFinalScrapeTime := aptsToCheck[0].AvailableUntil.Add(-time.Second * 2)
	scheduler.At(nextFinalScrapeTime).Do(finalScrapeAndSched, aptsToCheck, dbmap, scheduler)
	log.Println("Next final scrape at approx: " + nextFinalScrapeTime.Format("01-02-2006 15:04:05"))
}

func finalScrapeAndSched(aptsToCheck []apartment, dbmap *gorp.DbMap, scheduler *gocron.Scheduler) {
	for _, apt := range aptsToCheck {
		singleScrape(apt.RefID, dbmap, false, 0)
	}
	scheduleNextFinalScrape(dbmap, scheduler)
}

func main() {
	if len(os.Args) < 3 {
		log.Panicln("Please provide db password and host URL as command line arguments.")
	}
	dbPassword := os.Args[1]
	dbHost := os.Args[2]

	db, err := sql.Open("postgres", "host="+dbHost+" user=collector password="+dbPassword+" dbname=sssbpp sslmode=disable")
	if err != nil {
		log.Panicln("Could not connect to database: " + err.Error())
	}

	dbmap := &gorp.DbMap{Db: db, Dialect: gorp.PostgresDialect{}}
	apttblmap := dbmap.AddTableWithName(apartment{}, "apartment")
	apttblmap.SetKeys(false, "snapshot", "obj_nr")
	snptblmap := dbmap.AddTableWithName(snapshot{}, "snapshot")
	snptblmap.SetKeys(true, "id")

	if dbmap.CreateTablesIfNotExists() != nil {
		log.Panicln("Could not create table: " + err.Error())
	}

	defer dbmap.Db.Close()

	t, _ := time.LoadLocation("Europe/Stockholm")

	scheduler := gocron.NewScheduler(t)

	//fullScrape(dbmap)
	scheduler.Every(3).Hours().Do(func() {
		fullScrape(dbmap)
	})

	scheduleNextFinalScrape(dbmap, scheduler)

	select {} // Blocks and waits for scheduler events.
}
