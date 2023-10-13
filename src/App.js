import { useState, useReducer, useEffect } from "react";
import "./App.css";

// components imports
import ExpenseForm from "./components/ExpenseForm/ExpenseForm";
import ExpenseInfo from "./components/ExpenseInfo/ExpenseInfo";
import ExpenseList from "./components/ExpenseList/ExpenseList";

// react toasts
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// firebase imports
import { doc, collection, addDoc, updateDoc, onSnapshot, deleteDoc } from "firebase/firestore";
import { db } from "./firebaseInit";

const reducer = (state, action) => {
  const { payload } = action;
  switch (action.type) {
    case "GET_EXPENSES": {
      return {
        expenses: payload.expenses,
      };
    }
    case "ADD_EXPENSE": {
      return {
        expenses: [payload.expense, ...state.expenses],
      };
    }
    case "REMOVE_EXPENSE": {
      return {
        expenses: state.expenses.filter((expense) => expense.id !== payload.id),
      };
    }
    case "UPDATE_EXPENSE": {
      const expensesDuplicate = state.expenses;
      expensesDuplicate[payload.expensePos] = payload.expense;
      return {
        expenses: expensesDuplicate,
      };
    }
    default:
      return state;
  }
};

function App() {
  const [state, dispatch] = useReducer(reducer, { expenses: [] });
  const [expenseToUpdate, setExpenseToUpdate] = useState(null);

  useEffect(() => {
    // Use onSnapshot to get real-time updates
    const unsubscribe = onSnapshot(collection(db, "Expense Tracker"), (snapshot) => {
      const expenses = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      dispatch({ type: "GET_EXPENSES", payload: { expenses } });
    });

    // Clean up the subscription when the component unmounts
    return () => {
      unsubscribe();
    };
  }, []);
  

  const addExpense = async (expense) => {
    try {
      const expenseRef = collection(db, "Expense Tracker");
      const docRef = await addDoc(expenseRef, expense);
  
      // Unsubscribe from onSnapshot to avoid duplicate updates
      const unsubscribe = onSnapshot(collection(db, "Expense Tracker"), (snapshot) => {
        const expenses = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        dispatch({ type: "GET_EXPENSES", payload: { expenses } });
      });
  
      // Wait for the Firestore update and then re-subscribe
      await unsubscribe();
      toast.success("Expense added successfully.");
    } catch (error) {
      console.error("Error adding expense: ", error);
      toast.error("Failed to add the expense.");
    }
  };
  

  const deleteExpense = async (id) => {
    try {
      const expenseRef = doc(db, "Expense Tracker", id);
      await deleteDoc(expenseRef);
  
      dispatch({ type: "REMOVE_EXPENSE", payload: { id } });
      toast.error("Expense deleted successfully.");
    } catch (error) {
      console.error("Error deleting expense: ", error);
      toast.error("Failed to delete the expense.");
    }
  };

  const resetExpenseToUpdate = () => {
    setExpenseToUpdate(null);
  };

  const updateExpense = async (expense) => {
    const expensePos = state.expenses
      .map(function (exp) {
        return exp.id;
      })
      .indexOf(expense.id);

    if (expensePos === -1) {
      return false;
    }

    const expenseRef = doc(db, "Expense Tracker", expense.id);
    await updateDoc(expenseRef, expense);

    dispatch({ type: "UPDATE_EXPENSE", payload: { expensePos, expense } });
    toast.success("Expense updated successfully.");
  };

  return (
    <>
      <ToastContainer />
      <h2 className="mainHeading">Expense Tracker</h2>
      <div className="App">
        <ExpenseForm
          addExpense={addExpense}
          expenseToUpdate={expenseToUpdate}
          updateExpense={updateExpense}
          resetExpenseToUpdate={resetExpenseToUpdate}
        />
        <div className="expenseContainer">
          <ExpenseInfo expenses={state.expenses} />
          <ExpenseList
            expenses={state.expenses}
            deleteExpense={deleteExpense}
            changeExpenseToUpdate={setExpenseToUpdate}
          />
        </div>
      </div>
    </>
  );
}

export default App;
