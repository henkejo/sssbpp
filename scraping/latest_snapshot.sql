SELECT apartment.* FROM apartment INNER JOIN
    (SELECT id FROM snapshot INNER JOIN
                   (SELECT max(snapshot.timestamp as max) FROM snapshot) AS latest_time
    ON snapshot.timestamp = latest_time.max) AS latest_id
ON apartment.snapshot = latest_id.id