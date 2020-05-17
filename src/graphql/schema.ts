import gql from "graphql-tag";

export const schema = gql`
  type Query {
    searchProducts(
      limit: Int!
      afterCursor: String

      text: String
      colors: [String!]!
      brands: [String!]!
      categories: [String!]!
      priceMin: Int
      priceMax: Int

      sort: [SortInput!]!
    ): ProductListResponse
  }

  type ProductListResponse {
    data: [Product!]!
    pageInfo: PageInfo
  }

  type PageInfo {
    cursor: String!
  }

  type Product {
    name: String!
    color: String!
    category: String!
    price: Int!
    id: ID!
    brand: String!
  }

  enum SortField { PRICE }

  input SortInput {
    field: SortField
    asc: Boolean
  }
`;