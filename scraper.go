package main

import (
	"io/ioutil"
	"net/http"
)

func main() {
	resp, err := http.Get("https://sssb.se/widgets/?callback=jQuery17206581158882629974_1615556659893&widgets%5B%5D=objektlista%40lagenheter")
	if err != nil {
		return
	}
	defer resp.Body.Close()
	body, err := ioutil.ReadAll(resp.Body)
	print(string(body))
}
