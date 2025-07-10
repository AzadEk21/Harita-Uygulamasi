import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getPoints } from "./features/points/pointSlice";
import MapContainer from "./components/MapContainer";
import Controls from "./components/Controls";
import ZoomControls from "./components/ZoomControls";
import { loadPoints } from "./openlayers/loadPoints";
import { setupMapInteractions } from "./openlayers/map";
import Login from "./components/Login";
import Register from "./components/Register";
import PrivateRoute from "./components/PrivateRoute";
import { setUserFromStorage } from "./features/auth/authSlice";

import EmailVerify from "./pages/EmailVerify";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import "./App.css";
import "./openlayers/tooltip";

const App = () => {
  const dispatch = useDispatch();
  const points = useSelector((state) => state.point.items);
  const status = useSelector((state) => state.point.status);
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      dispatch(setUserFromStorage(JSON.parse(savedUser)));
    }
  }, [dispatch]);

  useEffect(() => {
    dispatch(getPoints());
  }, [dispatch]);

  useEffect(() => {
    if (status === "succeeded") {
      loadPoints(points.value);
    }
  }, [points, status]);

  useEffect(() => {
    if (status === "succeeded" && user) {
      loadPoints(points.value);
      setupMapInteractions(user);
    }
  }, [user, status, points.value]);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<EmailVerify />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route
          path="/"
          element={
            <PrivateRoute>
              <div>
                <Controls />
                <MapContainer />
                <ZoomControls />
              </div>
            </PrivateRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;
