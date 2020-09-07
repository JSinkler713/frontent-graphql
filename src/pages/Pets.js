import React, {useState} from 'react'
import gql from 'graphql-tag'
import { useQuery, useMutation } from '@apollo/react-hooks'
import PetsList from '../components/PetsList'
import NewPetModal from '../components/NewPetModal'
import Loader from '../components/Loader'

//make a reusable fragment for multiple spots
//in this case for a Pet type
const PETS_FIELDS = gql`
  fragment PetsFields on Pet {
      #not resolved by backend so we point it to @client
      isVaccinated @client
      id
      name
      type
      img
      owner {
        id
        #not resolved by backend so we point it to @client
        age @client
      }
  }
`
const ALL_PETS = gql`
  query{
    allPets {
      ...PetsFields
    }
  }
  ${PETS_FIELDS}
`

const CREATE_PET = gql`
  mutation CreateAPet($newInput:NewPetInput!) {
    newPet(input: $newInput) {
      ...PetsFields
    }
  }
  ${PETS_FIELDS} 
`
export default function Pets () {
  const [modal, setModal] = useState(false)
  const {data, loading, error} = useQuery(ALL_PETS)
  // when you use a mutation, you query the cache of anything that will be updated
  // in this case our ALL_PETS
  // Then we grab that data and append, or prepend
  // whatever it was we just created
  // this stops us fom having to make a new query to the
  // serve and database, and handles it locally
  const [createPet, {createData, createLoading, createError}] = useMutation(CREATE_PET, {
    update(cache, {data: {newPet}}) {
      //get the current allPets cache
      const allPets = cache.readQuery({query: ALL_PETS})
      //add our newly created Pet
      // this is to the cache, 'update' happens after mutations comes back
      // so no extra new query of ALL_PETS
      cache.writeQuery({
        query: ALL_PETS,
        data: {allPets: [newPet, ...data.allPets]}
      })
    }
  })
  if (loading || createLoading) {
    return <Loader />
  }

  if (error || createError) {
    return <p>error</p>
    console.log(error)
  }

  console.log('this is all the pet data', data.allPets)

  const onSubmit = input => {
    setModal(false)
    console.log(input)

    //createPet({variables: {newInput:{"name": input.name, "type": input.type}}})
    createPet({variables: {newInput:input}})

  }
  
  if (modal) {
    return <NewPetModal onSubmit={onSubmit} onCancel={() => setModal(false)} />
  }
  if (error) return error

  return (
    <div className="page pets-page">
      <section>
        <div className="row betwee-xs middle-xs">
          <div className="col-xs-10">
            <h1>Pets</h1>
          </div>

          <div className="col-xs-2">
            <button onClick={() => setModal(true)}>new pet</button>
          </div>
        </div>
      </section>
      <section>
        <PetsList pets={data.allPets}/>
      </section>
    </div>
  )
}

