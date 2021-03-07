package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

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

	println("Server started!")
	http.ListenAndServe(":5000", router)
}

type apartment struct {
	ObjNr          string    `db:"obj_nr"`
	Hood           string    `db:"hood"`
	AptType        string    `db:"type"`
	Address        string    `db:"address"`
	AptNr          string    `db:"apt_nr"`
	AvailableUntil time.Time `db:"available_until"`
	BestPoints     int       `db:"best_points"`
	Bookers        int       `db:"bookers"`
	InfoLink       string    `db:"info_link"`
	FloorPlanLink  string    `db:"floor_plan_link"`
	PlanLink       string    `db:"plan_link"`
	MoveIn         time.Time `db:"move_in"`
	Rent           int       `db:"rent"`
	Sqm            int       `db:"sqm"`
	Special        string    `db:"special"`
}

func allCurrentApts(w http.ResponseWriter, r *http.Request) {
	apts := []apartment{}
	err := db.Select(&apts, `
		SELECT obj_nr, type, hood, address, apt_nr,
		available_until, best_points, bookers, info_link       
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
