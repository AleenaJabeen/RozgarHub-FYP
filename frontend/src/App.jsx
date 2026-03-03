import { ToastContainer } from "react-toastify";
import { Routes,Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import CheckAuth from "./components/ProtectedRoute";
import Home from "./pages/Home";
import {useDispatch, useSelector} from 'react-redux'

function App() {
  // check if user isauthenticated or not
  const { user, isAuthenticated, isLoading } = useSelector(
    (state) => state.auth
  );
  // const dispatch=useDispatch();
  // useEffect(() => {
  //   dispatch(checkAuth());
  // }, [dispatch]);
  return (
    <>
      <ToastContainer />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route
            index
            element={
              <CheckAuth isAuthenticated={isAuthenticated} user={user}>
                <Home/>
              </CheckAuth>
            }
          />
        </Route>
      </Routes>
    </>
  );
}

export default App;
