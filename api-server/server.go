package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/gorilla/mux"
	"github.com/jmoiron/sqlx"
	_ "github.com/mattn/go-sqlite3"
	"github.com/rs/cors"
)

var db *sqlx.DB

func main() {
	c := cors.New(cors.Options{
		AllowedOrigins: []string{"*"},   // All origins
		AllowedMethods: []string{"GET"}, // Allowing only get, just an example
	})

	router := mux.NewRouter()

	router.HandleFunc("/apts", allCurrentApts)

	d, err := sqlx.Connect("sqlite3", "../scraping/sssbpp.db")
	if err != nil {
		panic(err)
	}
	db = d

	println("Server started!")
	http.ListenAndServe(":5000", c.Handler(router))
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
	FloorPlanLink  string         `db:"floor_plan_link"`
	PlanLink       string         `db:"plan_link"`
	MoveIn         time.Time      `db:"move_in"`
	Rent           int            `db:"rent"`
	Sqm            int            `db:"sqm"`
	Special        sql.NullString `db:"special"`
}

func allCurrentApts(w http.ResponseWriter, r *http.Request) {
	apts := []apartment{}
	err := db.Select(&apts, `
		SELECT obj_nr, type, hood, address, apt_nr,
		available_until, best_points, bookers, info_link,       
		floor_plan_link, plan_link, move_in, rent, sqm, special
		FROM latest_snapshot
	`)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		fmt.Println(err)
		return
	}

	b, _ := json.MarshalIndent(apts, "", "    ")

	w.Write(b)
}
