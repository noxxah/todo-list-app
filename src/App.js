import './App.css';
import { useEffect, useState } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, collection, addDoc, setDoc, doc, deleteDoc, getDocs } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyClyeaAH3620ny_1MkXjAFA0tR-PV9QXr4",
  authDomain: "todo-list-app-4c263.firebaseapp.com",
  projectId: "todo-list-app-4c263",
  storageBucket: "todo-list-app-4c263.appspot.com",
  messagingSenderId: "1382747907",
  appId: "1:1382747907:web:90f28032093a9975cce336",
  measurementId: "G-SSJTTLJYSP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

const TodoItemInputField = (props) => {
  const [input, setInput] = useState("");

  const onSubmit = () => {
    props.onSubmit(input);
    setInput("");
  };
     
  return (<div>
    <TextField
      id="todo-item-input"
      label="Todo Item"
      variant="outlined"
      onChange={(e) => setInput(e.target.value)} value={input}
    />
    <Button variant="outlined" onClick={onSubmit}>Submit</Button>
  </div>);
};

const TodoItem = (props) => {
  const style = props.todoItem.isFinished ? { textDecoration: 'line-through' } : {};
  return (<li>
    <span style={style} onClick={() => props.onTodoItemClick(props.todoItem)}>{props.todoItem.todoItemContent}</span>
    <Button variant="outlined" onClick={() => props.onRemoveClick(props.todoItem)}>Remove</Button>
  </li>);
};
  
const TodoItemList = (props) => {
  const todoList = props.todoItemList.map((todoItem, index) => {
    return <TodoItem
      key={index}
      todoItem={todoItem}
      onTodoItemClick={props.onTodoItemClick}
      onRemoveClick={props.onRemoveClick}
    />;
  });    
  return (<div>
    <ul>{todoList}</ul>
  </div>);
  };
  
function App() {
  const [todoItemList, setTodoItemList] = useState([]);

  const syncTodoItemListStateWithFirestore = () => {
    getDocs(collection(db, "todoItem")).then((querySnapshot) => {
      const firestoreTodoItemList = [];
      querySnapshot.forEach((doc) => {
        firestoreTodoItemList.push({
          id: doc.id,
          todoItemContent: doc.data().todoItemContent,
          isFinished: doc.data().isFinished,
        });
      });
      setTodoItemList(firestoreTodoItemList);
    });
  };

  useEffect(() => {
    syncTodoItemListStateWithFirestore();    
  }, []);   
  const onSubmit = async (newTodoItem) => {
    await addDoc(collection(db, "todoItem"), {
      todoItemContent: newTodoItem,
      isFinished: false,
    });
    syncTodoItemListStateWithFirestore();
  };
    
  const onTodoItemClick = async (clickedTodoItem) => {
    const todoItemRef = doc(db, "todoItem", clickedTodoItem.id);
    await setDoc(todoItemRef, { isFinished: !clickedTodoItem.isFinished }, { merge: true });
    syncTodoItemListStateWithFirestore();
  };
   
  const onRemoveClick = async (removedTodoItem) => {
    const todoItemRef = doc(db, "todoItem", removedTodoItem.id);
    await deleteDoc(todoItemRef);
    syncTodoItemListStateWithFirestore();
  };
    
  return (
    <div className="App">
      <TodoItemInputField onSubmit={onSubmit} />
      <TodoItemList
        todoItemList={todoItemList}
        onTodoItemClick={onTodoItemClick}
        onRemoveClick={onRemoveClick}
      />
    </div>
  );
}

export default App;
