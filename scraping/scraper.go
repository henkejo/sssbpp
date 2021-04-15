package main

import (
	"database/sql"
	"net/http"
	"regexp"
	"strconv"
	"time"

	"golang.org/x/net/html"
)

type node struct {
	nodeType string
	data     string
}

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

func handleAptProps(c chan node) {
	var apt apartment
	for node := range c {
		nodeType := node.nodeType[2 : len(node.nodeType)-2]
		switch nodeType {
		case "ObjektNummer":
			apt.ObjNr = node.data
		case "ObjektOmrade":
			apt.Hood = node.data
		case "ObjektAdress":
			matches := regexp.MustCompile(`(.*)( / )(.*)`).FindStringSubmatch(node.data)
			apt.Address = matches[1]
			apt.AptNr = matches[3]
		case "ObjektTyp":
			apt.AptType = node.data
		case "ObjektYta":
			apt.Sqm, _ = strconv.Atoi(regexp.MustCompile(`(.*) m`).FindString(node.data))
		case "ObjektHyra":
			apt.Rent, _ = strconv.Atoi(regexp.MustCompile(`(.*) kr`).FindString(node.data))
		case "ObjektInflytt":
			apt.MoveIn, _ = time.Parse("2006-01-02", node.data)
		case "IntresseMeddelande":
			//matches := regexp.MustCompile(`(till )(.*)( klockan )(.*)(\. )`).FindStringSubmatch(node.data)
			print("test")
		}
	}
}

func singleScrape(refID string) {
	aptLink := "https://sssb.se/widgets/?widgets%5B%5D=objektinformation%40lagenheter&widgets%5B%5D=objektdokument&widgets%5B%5D=objektintressestatus&widgets%5B%5D=objektintresse&callback=a&refid=" + refID

	resp, err := http.Get(aptLink)
	if err != nil {
		println("Could not get " + aptLink)
		return
	}
	defer resp.Body.Close()

	doc, err := html.Parse(resp.Body)
	if err != nil {
		println("Could not parse HTML from: " + aptLink)
		return
	}

	aptc := make(chan node)
	go handleAptProps(aptc)
	var f func(*html.Node)
	f = func(n *html.Node) {
		isKeyNodeType := (n.Data == "dd" || n.Data == "div")
		if n.Type == html.ElementNode && isKeyNodeType {
			for _, a := range n.Attr {
				if a.Key == "class" {
					innerText := n.FirstChild.Data
					if a.Val == "\\\"ObjektOmrade\\\"" {
						innerText = n.FirstChild.NextSibling.FirstChild.Data
					}
					prop := node{a.Val, innerText}
					aptc <- prop
					break
				}
			}
		}
		for c := n.FirstChild; c != nil; c = c.NextSibling {
			f(c)
		}
	}
	f(doc)
	close(aptc)
}

func main() {
	singleScrape("6650597833474661663569595062696941686b63473446473730334e742b6445")
}
