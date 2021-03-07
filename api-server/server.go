package main

import (
	"fmt"
	"net/http"
	"strings"

	"github.com/gorilla/mux"
	"github.com/jmoiron/sqlx"
	_ "github.com/mattn/go-sqlite3"
)

func main() {
	router := mux.NewRouter()

	router.HandleFunc("/currentApts", allCurrentApts)

	http.ListenAndServe(":5000", router)
}

type apartment struct {
	ObjNr   string `db:"obj_nr"`
	Hood    string `db:"hood"`
	AptType string `db:"type"`
}

func allCurrentApts(w http.ResponseWriter, r *http.Request) {
	db := dbConn()

	apts := []apartment{}
	err := db.Select(&apts, `
		SELECT obj_nr, hood, type
		FROM latest_snapshot
	`)
	if err != nil {
		fmt.Println(err)
		return
	}

	var sb strings.Builder
	sb.Grow(32)
	for _, apt := range apts {
		sb.Write([]byte(fmt.Sprintf("%s, %s, %s\n", apt.ObjNr, apt.Hood, apt.AptType)))
	}
	w.Write([]byte(sb.String()))
}

func dbConn() *sqlx.DB {
	db, err := sqlx.Connect("sqlite3", "../scraping/sssbpp.db")
	checkErr(err)
	return db
}

func checkErr(err error) {
	if err != nil {
		panic(err)
	}
}
