# SSSB++ 
## What's this? 
A program used for harvesting data regarding queue times for the largest student accommodation service in Stockholm, *SSSB*. 🏢

Built as a hobby project and learning experience in Go and Google Cloud (PostgreSQL, BigQuery).

## Background
Finding an apartment in Stockholm on a student budget is challenging. Students who end up finding a non-sublet apartment usually do it through *SSSB*, after spending a year or two in their queueing system.

Precisely how long you stay in their queue is up to you, since you can apply for an apartment whenever you wish. More days in queue = more queue points = a better apartment.

*Except*, this isn't always the case. The apartment you can get for your queue points depends on a bunch of factors. For instance, some residential areas are more popular. Also, you usually need more points at the start of a semester.

This project was made to harvest data from the SSSB website in order to gain more insight into these factors.

## How it works
The program periodically (a few hours apart) downloads a list of all apartments for rent and their details regarding queue times. When a listing only has a couple of seconds until it closes, the program downloads the details for that listing once again, in order to see how many queue points were needed for that particular listing.

## Building and running
You'll need an accessible PostgreSQL server running with a database called "*sssbpp*", and a user called "*collector*". The database needs 2 tables and 2 views. The table structures can be seen at the top of the `scraper.go` program, and the views can be generated using the 2 `.sql`-files in the scraping directory.

You'll also need to have Go installed (go1.16.3) in order to build.

```bash
git clone git@github.com:jolerus/sssbpp.git
cd scraping
go get
go build
./sssbpp-scraper <collector-db-password> <db-hostname>
```

## Ideas on further development
- Building API endpoints for retrieving the data
- Presenting the data in an article after collecting enough data (probably a year's worth)
- Building a web app where students can browse the data to gain better insight into when to apply for an apartment *(hence the name SSSB++)*

