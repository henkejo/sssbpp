package main

import (
	"database/sql"
	"errors"
	"io"
	"net/http"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/buger/jsonparser"
	"golang.org/x/net/html"
)

type apartment struct {
	ObjNr          string         `db:"obj_nr"`
	Hood           string         `db:"hood"`
	AptType        string         `db:"type"`
	Address        string         `db:"address"`
	AptNr          string         `db:"apt_nr"`
	AvailableUntil time.Time      `db:"available_until"`
	BestPoints     int            `db:"best_points"`
	Bookers        int            `db:"bookers"`
	InfoLink       string         `db:"info_link"`
	MoveIn         time.Time      `db:"move_in"`
	Rent           int            `db:"rent"`
	Sqm            int            `db:"sqm"`
	Special        sql.NullString `db:"special"`
}

func fullScrape() {
	aptsListLink := "https://sssb.se/widgets/?callback=a&widgets%5B%5D=objektlista%40lagenheter"

	resp, err := http.Get(aptsListLink)
	if err != nil {
		println("Could not get: " + aptsListLink)
		return
	}
	defer resp.Body.Close()

	doc, err := html.Parse(resp.Body)
	if err != nil {
		println("Could not parse HTML from: " + aptsListLink)
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

}

func singleScrape(refID string) (apartment, error) {
	_, err := getApt(refID)
	if err != nil {
		println(err.Error())
	}

}

func getApt(refID string) (apartment, error) {
	aptLink := "https://sssb.se/widgets/?widgets%5B%5D=objektinformation%40lagenheter&widgets%5B%5D=objektdokument&widgets%5B%5D=objektintressestatus&widgets%5B%5D=objektintresse&callback=a&refid=" + refID

	resp, err := http.Get(aptLink)
	if err != nil {
		println("Could not get " + aptLink)
		return apartment{}, errors.New("get-error-" + refID)
	}
	respBody, err := io.ReadAll(resp.Body)
	resp.Body.Close()
	if err != nil {
		println("Could not read " + aptLink)
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
	jsonparser.EachKey(respBody, func(idx int, value []byte, vt jsonparser.ValueType, err error) {
		switch idx {
		case 0: // objektNr
			apt.ObjNr = string(value)
		case 1: // adress
			regx, err := regexp.Compile(`(.*)( / )(.*)`)
			matches := regx.FindStringSubmatch(string(value))
			if err != nil {
				println("No address info will be saved. Error: " + err.Error())
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
				println("No rent info will be saved. Error: " + err.Error())
			}
		case 4: // typ
			apt.AptType = string(value)
		case 5: // yta
			rent64, err := jsonparser.ParseInt(value)
			if err != nil {
				println("No sqm info will be saved. Error: " + err.Error())
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
				println("No interest info will be saved. Probably no bookers. Error: " + err.Error())
			} else {
				matches := regx.FindStringSubmatch(string(value))
				apt.BestPoints, _ = strconv.Atoi(matches[1])
				apt.Bookers, _ = strconv.Atoi(matches[3])
			}
		case 9: // objektintresse (listing ending)
			regx, err := regexp.Compile(`(till )([0-9]+-[0-9]+-[0-9]+)( klockan )([0-9]+:[0-9]+)(\. )`)
			if err != nil {
				println("No listing ending info will be saved. Probably no bookers. Error: " + err.Error())
			} else {
				matches := regx.FindStringSubmatch(string(value))
				apt.AvailableUntil, _ = time.Parse("2006-01-2T15:04", matches[2]+"T"+matches[4])
			}
		}
	}, paths...)
	return apt, nil
}

func main() {
	singleScrape("6650597833474661663569595062696941686b63473446473730334e742b6445")
}
