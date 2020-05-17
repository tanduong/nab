import faker from 'faker';
import * as fs from 'fs';
import * as path from 'path';
import * as shortid from 'shortid';

const PRODUCT_PER_CATEGORY = 30;

const brands = [1, 2, 3, 4, 5, 6, 7, 8].map(() => ({
  id: shortid.generate(),
  name: faker.company.companyName()
}));

const categories = [
  {
    id: 'food',
    name: 'Food'
  },
  {
    id: 'fashion',
    name: 'Fashion',
  },
  {
    id: 'sport',
    name: 'Sport'
  },
  {
    id: 'home-and-lifestyle',
    name: 'Home And Lifestyle'
  }
];

function generateProducts(category, count) {
  console.log('category', category);
  const products = []
  for (let i = 0; i < count; i++) {
    products.push({
      id: shortid.generate(),
      brand: faker.random.arrayElement(brands).id,
      category: category.id,
      name: faker.commerce.productName(),
      color: faker.commerce.color(),
      image: `https://i.picsum.photos/id/${Math.round(Math.random() * 1000)}/200/300.jpg`,
      price: 100 * parseFloat(faker.commerce.price(3, 100))
    })
  }
  console.log('products', products);
  return products;
}

function main() {
  let products = []
  for (const cat of categories) {
    products = [...products, ...generateProducts(cat, PRODUCT_PER_CATEGORY)];
  }

  fs.writeFile(path.resolve(__dirname, '../data/brand.json'), JSON.stringify(brands, null, 2), 'utf8', function (err) {
    if (err) {
      console.log(err);
    }
  });

  fs.writeFile(path.resolve(__dirname, '../data/categories.json'), JSON.stringify(categories, null, 2), 'utf8', function (err) {
    if (err) {
      console.log(err);
    }
  });

  fs.writeFile(path.resolve(__dirname, '../data/products.json'), JSON.stringify(products, null, 2), 'utf8', function (err) {
    if (err) {
      console.log(err);
    }
  });
}

main();
