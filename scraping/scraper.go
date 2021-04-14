package main

import (
	"fmt"
	"net/http"

	"golang.org/x/net/html"
)

func main() {
	aptsListLink := "https://sssb.se/widgets/?callback=a&widgets%5B%5D=objektlista%40lagenheter"

	resp, err := http.Get(aptsListLink)
	if err != nil {
		return
	}
	defer resp.Body.Close()

	doc, err := html.Parse(resp.Body)
	if err != nil {
		return
	}
	// Recursively visit nodes in the parse tree
	var f func(*html.Node)
	f = func(n *html.Node) {
		if n.Type == html.ElementNode && n.Data == "a" {
			for _, a := range n.Attr {
				if a.Key == "href" {
					fmt.Println(a.Val)
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
