package main

import (
	"encoding/json"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/jmoiron/sqlx"
	_ "github.com/mattn/go-sqlite3"
)

var db *sqlx.DB

func main() {
	router := mux.NewRouter()

	router.HandleFunc("/currentApts", allCurrentApts)

	d, err := sqlx.Connect("sqlite3", "../scraping/sssbpp.db")
	if err != nil {
		panic(err)
	}
	db = d

	http.ListenAndServe(":5000", router)
}

type apartment struct {
	ObjNr   string `db:"obj_nr"`
	Hood    string `db:"hood"`
	AptType string `db:"type"`
}

func allCurrentApts(w http.ResponseWriter, r *http.Request) {

	apts := []apartment{}
	err := db.Select(&apts, `
		SELECT obj_nr, hood, type
		FROM latest_snapshot
	`)

	b, errr := json.MarshalIndent(apts, "", "    ")
	if err != nil || errr != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	w.Write(b)
}
