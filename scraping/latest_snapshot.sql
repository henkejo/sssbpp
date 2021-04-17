SELECT apartment.* FROM apartment INNER JOIN
    (SELECT id FROM snapshot INNER JOIN
                   (SELECT min(snapshot.timestamp) FROM snapshot) AS latest_time
    ON snapshot.timestamp = latest_time.min) AS latest_id
ON apartment.snapshot = latest_id.id