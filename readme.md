# Run the app

_Require nodeJS 12 or later._

```bash
docker-compose -f docker-compose.yml up

# In another tab
npm install
npm run seed
npm run dev
```

Then you can visit http://localhost:4000/ and run a test query:

```graphql
{
  searchProducts(text: "Intel", limit: 2, sort: [], brands: [], categories: [], colors: []) {
    pageInfo {
      cursor
    }
    data {
      name
      id
      color
      brand
      category
    }
  }
}
```
