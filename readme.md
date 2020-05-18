# Run the app

```bash
docker-compose -f docker-compose.withapp.yml build
docker-compose -f docker-compose.withapp.yml up
```

Or you can run the app service and nodejs on local for better tooling

```bash
docker-compose -f docker-compose.yml up

# In another tab
npm install
npm run seed
npm run dev
```
