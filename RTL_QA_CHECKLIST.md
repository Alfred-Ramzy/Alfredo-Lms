# RTL QA Checklist

- Pass: dashboard shell uses logical spacing and mirrors sidebar/bottom nav acceptably in Arabic.
- Pass: landing, auth, dashboard, catalog, learning, quiz, assignment, and messages use `text-start`-friendly layouts by default.
- Pass: level, badge, notification, and certificate flows render Arabic labels without layout breakage.
- Pass: forms align labels and inputs consistently in both directions.
- Pass: public verification and lockdown screens remain readable in Arabic.
- Note: icons with directional meaning are limited; add explicit `rtl:scale-x-[-1]` if future arrow-heavy tables/charts are introduced.
