import { ApolloClient } from 'apollo-client'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { HttpLink } from 'apollo-link-http'
import gql from 'graphql-tag'

const typeDefs = gql`
  extend type User {
    age: Int
  },
  extend type Pet {
    isVaccinated: Boolean
  }
`
const resolvers = {
  User: {
    //we need to add a resolver here because our backend doesn't have this field
    //when we write our gql query we will point tell it to get age from @client
    age() {
      return 35
    }
  },
  Pet: {
    //we need to add a resolver here because our backend doesn't have this field
    //when we write our gql query we will point tell it to get isVaccinated from @client
    isVaccinated() {
      return true
    }
  }
}
const link = new HttpLink({uri: `http://localhost:4000/`})
const cache = new InMemoryCache()
const client = new ApolloClient({
  link,
  cache,
  resolvers,
  typeDefs
})

export default client
