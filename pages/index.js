import {
  Center,
  Box,
  Text,
  Input,
  Button,
  List,
  ListItem,
  ListIcon,
} from "@chakra-ui/react";
import { CheckCircleIcon } from "@chakra-ui/icons";
import { API, graphqlOperation } from "aws-amplify";
import { listTodos } from "../src/graphql/queries";
import { createTodo } from "../src/graphql/mutations";
import { onCreateTodo } from "../src/graphql/subscriptions";
import { useState, useEffect } from "react";
import { v4 as uuid } from "uuid";

const CLIENT_ID = uuid();

export default function Home() {
  const [todos, setTodos] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    getData();
    
    const subscription = API.graphql(graphqlOperation(onCreateTodo))
    .subscribe({
      next: ({value}) => {
        const todo = value.data.onCreateTodo;
        console.log(todo);
        if(CLIENT_ID === todo.clientId) return false;
        getData();
      }
    })
    return () => {subscription.unsubscribe()}
  }, []);

  const getData = async () => {
    try {
      const result = await API.graphql(graphqlOperation(listTodos));
      setTodos(result.data.listTodos.items);
    } catch (ex) {
      console.log(ex);
    }
  };

  const handleChange = (e) => {
    e.currentTarget.name === "subject" ? setName(e.currentTarget.value) : null;
    e.currentTarget.name === "description" ? setDescription(e.currentTarget.value) : null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await API.graphql(graphqlOperation(createTodo, {
        input: {
          name,
          description,
          clientId: CLIENT_ID
        }
      }));
      setTodos([...todos, result.data.createTodo])
      
      setName("");
      setDescription("");
      
    } catch (ex) {
      console.log(ex);
    }
  }

  return (
    <Center>
      <Box>
        <Center>
          <Text color="teal" fontWeight="bold" fontSize="2xl">
            Amplify GraphQL TodoList 만들기
          </Text>
        </Center>
        <form>
          <Box mt={2}>
            <Input
              name="subject"
              placeholder="제목"
              onChange={handleChange}
              value={name}
            />
            <Input
              name="description"
              placeholder="내용"
              onChange={handleChange}
              value={description}
            />
          </Box>
          <Center>
            <Box mt={2}>
              <Button colorScheme="teal" type="submit" onClick={handleSubmit}>
                등록
              </Button>
            </Box>
          </Center>
        </form>

        <List spacing={3}>
          {todos.map((todo, index) => {
            return (
              <ListItem key={index}>
                <Box fontWeight="semibold">
                  <ListIcon as={CheckCircleIcon} color="teal.500" />
                  {todo.name}
                </Box>
                <Box color="gray.500">{todo.description}</Box>
              </ListItem>
            );
          })}
        </List>
      </Box>
    </Center>
  );
}
