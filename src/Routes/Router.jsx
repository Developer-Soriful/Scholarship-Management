import { createBrowserRouter } from "react-router";
import HomeLayout from "../Layouts/HomeLayout";
import Home from "../Layouts/Home";
import SignIn from "../Pages/SignIn";
import SignUp from "../Pages/SignUp";
import UserDashboard from "../Dashboard/UserDashboard/UserDashboard";
import MyApplication from "../Dashboard/UserDashboard/MyApplication";
import MyProfile from "../Dashboard/UserDashboard/MyProfile";
import MyReview from "../Dashboard/UserDashboard/MyReview";
import ModeratorDashboard from "../Dashboard/ModeratorDashboard/ModeratorDashboard";
import AllAppliedScholarship from "../Dashboard/ModeratorDashboard/AllAppliedApplications";
import AddScholarship from "../Dashboard/ModeratorDashboard/AddScholarship";
import ManageScholarship from "../Dashboard/ModeratorDashboard/ManageScholarship";
import ModeratorProfile from "../Dashboard/ModeratorDashboard/ModeratorProfile";
import AdminDashboard from "../Dashboard/AdminDashboard/AdminDashboard";
import ManageScholarshipAdmin from "../Dashboard/AdminDashboard/ManageScholarshipAdmin";
import ManageAppliedApplication from "../Dashboard/AdminDashboard/ManageAppliedApplication";
import AddScholarshipAdmin from "../Dashboard/AdminDashboard/AddScholarshipAdmin";
import AdminProfile from "../Dashboard/AdminDashboard/AdminProfile";
import ManageUser from "../Dashboard/AdminDashboard/ManageUser";
import ManageReview from "../Dashboard/AdminDashboard/ManageReview";
import PrivateRoute from "./PrivateRoute";
import Forbidden from "../Pages/Forbidden";
import AdminProtector from "./AdminProtector";
import ModeratorProtector from "./ModeratorProtector";
import AllScholarship from "../Pages/AllScholarship";
import ScholarshipDetails from "../Pages/ScholarshipDetails";
import Payment from "../Pages/Payment";
import AllReviews from "../Dashboard/ModeratorDashboard/AllReviews";
import AllAppliedApplications from "../Dashboard/ModeratorDashboard/AllAppliedApplications";
import ErrorPage from "../Pages/ErrorPage";
import Analytics from "../Dashboard/AdminDashboard/Analytics";

export const router = createBrowserRouter([
    {
        path: '/',
        element: <HomeLayout />,
        errorElement: <ErrorPage />
        ,
        children: [
            { index: true, element: <Home /> },
            { path: 'signin', element: <SignIn /> },
            { path: 'signUp', element: <SignUp /> },
            { path: 'allScholarship', element: <AllScholarship /> },
            { path: 'scholarshipdetails/:id', element: <PrivateRoute><ScholarshipDetails /></PrivateRoute> },
            { path: 'payment/:id', element: <PrivateRoute><Payment /></PrivateRoute> },
            { path: '/forbidden', Component: Forbidden }
        ]
    },
    {
        path: '/userDashboard',
        element: <PrivateRoute><UserDashboard /></PrivateRoute>, // Protect all dashboard routes
        children: [
            { index: true, element: <PrivateRoute><MyApplication /> </PrivateRoute> },
            { path: '', element: <PrivateRoute><MyApplication /> </PrivateRoute> },
            { path: 'myProfile', element: <PrivateRoute><MyProfile /> </PrivateRoute> },
            { path: 'myReview', element: <PrivateRoute> <MyReview /></PrivateRoute> }
        ]
    },
    {
        path: '/moderatorDashboard',
        element: <ModeratorProtector><ModeratorDashboard /></ModeratorProtector>,  // Protect all dashboard routes
        children: [
            { index: true, element: <AllAppliedApplications /> },
            { path: 'appliedapplications', element: <AllAppliedApplications /> },
            { path: 'addscholarship', element: <AddScholarship /> },
            { path: 'allReviews', element: <AllReviews /> },
            { path: 'managescholarship', element: <ManageScholarship /> },
            { path: 'moderatorprofile', element: <ModeratorProfile /> },
        ]
    },
    {
        path: '/admindashboard',
        element: <AdminProtector><AdminDashboard /></AdminProtector>, // Protect all dashboard routes
        children: [
            { index: true, element: <Analytics /> },
            { path: 'analytics', element: <Analytics /> },
            { path: 'manageapplied', element: <ManageAppliedApplication /> },
            { path: 'managescholarshipadmin', element: <ManageScholarshipAdmin /> },
            { path: 'addscholarshipadmin', element: <AddScholarshipAdmin /> },
            { path: 'adminprofile', element: <AdminProfile /> },
            { path: 'manageuser', element: <ManageUser /> },
            { path: 'managereview', element: <ManageReview /> },
        ]
    }
]);