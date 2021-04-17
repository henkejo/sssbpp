SELECT latest_snapshot.* FROM latest_snapshot INNER JOIN
    (SELECT min(available_until) as available_until FROM latest_snapshot) AS soonest_time
ON latest_snapshot.available_until = soonest_time.available_until