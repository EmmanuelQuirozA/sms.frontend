import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';

//Publics
import Login from './components/auth/Login';
import ProtectedRoute from './routes/ProtectedRoute';

//Routers
import DashboardRouter from './components/DashboardRouter';
import SchoolsRouter from './components/SchoolsRouter';
import UsersRouter from './components/UsersRouter';
import SettingsRouter from './components/SettingsRouter';


//School Admin
import SchoolAdminTeachers from './components/schoolAdmin/Teachers';
import SchoolAdminStudents from './components/schoolAdmin/Students';
import SchoolAdminCoffee from './components/schoolAdmin/Coffee';
import SchoolAdminPaymentReports from './components/schoolAdmin/PaymentReports';
import SchoolAdminClasses from './components/schoolAdmin/Classes';


//Others, helpers and commons
import Footer from './components/common/Footer';

import NotFoundPage from './components/NotFoundPage';
import Unauthorized from './components/Unauthorized';



function App() {
  const { user } = useContext(AuthContext);
  
  const getHomeRoute = (user) => {
    if (!user) return '/login';
    if (user.roleName === 'ADMIN') return '/admin/dashboard';
    if (user.roleName === 'SCHOOL_ADMIN') return '/schooladmin/dashboard';
    if (user.roleName === 'STUDENT') return '/student/dashboard';
    return '/';
  };
  
  return (
    <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={!user ? <Login /> : <Navigate to={getHomeRoute(user)} />} />
        
          {/* 
          Dashboard     --| School Admin | Teachers | Students | Finance | Admin |           
          Settings      --| School Admin | Teachers | Students | Finance | Admin |

          Finance       --| School Admin |          |          | Finance |       |  

          Schools       --| School Admin |          |          |         | Admin |           
          Users         --| School Admin |          |          |         | Admin |    

          Teachers      --| School Admin |          |          |         |       | 

          Students      --| School Admin | Teachers |          | Finance |       |  

          Parents       --| School Admin | Teachers |          |         |       |   

          Subjects      --| School Admin | Teachers | Students |         |       |      
          Classes       --| School Admin | Teachers | Students |         |       |      
          Lessons       --| School Admin | Teachers | Students |         |       |      
          Examns        --| School Admin | Teachers | Students |         |       |      
          Assignments   --| School Admin | Teachers | Students |         |       |      
          Results       --| School Admin | Teachers | Students |         |       |      
          Attendance    --| School Admin | Teachers | Students |         |       |      
          Events        --| School Admin | Teachers | Students |         |       |      
          Messages      --| School Admin | Teachers | Students |         |       |      
          Announcements --| School Admin | Teachers | Students |         |       |      

          Kitchen       --| School Admin |          |          |         | Admin | Kitchen
          */}

          <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'SCHOOL_ADMIN', 'STUDENT', 'TEACHERS', 'STUDENTS', 'FINANCE']} />}>
            <Route path="/dashboard" element={<DashboardRouter />} />
            <Route path="/settings" element={<SettingsRouter />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'SCHOOL_ADMIN', 'FINANCE']} />}>
            <Route path="/finance" element={<DashboardRouter />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'SCHOOL_ADMIN']} />}>
            <Route path="/schools" element={<SchoolsRouter />} />
            <Route path="/users" element={<UsersRouter />} />
          </Route>
          
          <Route element={<ProtectedRoute allowedRoles={['SCHOOL_ADMIN']} />}>
            <Route path="/teachers" element={<SchoolAdminTeachers />} />
            <Route path="/paymentreports" element={<SchoolAdminPaymentReports />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['SCHOOL_ADMIN', 'TEACHERS', 'FINANCE']} />}>
            <Route path="/students" element={<SchoolAdminStudents />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['SCHOOL_ADMIN', 'TEACHERS']} />}>
            {/* <Route path="/parents" element={<ParentsRouter />} /> */}
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['SCHOOL_ADMIN', 'TEACHERS', 'STUDENTS']} />}>
            <Route path="/classes" element={<SchoolAdminClasses />} />
            {/* 
            <Route path="/subjects" element={<SubjectsRouter />} />
            <Route path="/classes" element={<ClassesRouter />} />
            <Route path="/lessons" element={<LessonsRouter />} />
            <Route path="/examns" element={<ExamnsRouter />} />
            <Route path="/assignments" element={<AssignmentsRouter />} />
            <Route path="/results" element={<ResultsRouter />} />
            <Route path="/attendance" element={<AttendanceRouter />} />
            <Route path="/events" element={<EventsRouter />} />
            <Route path="/messages" element={<MessagesRouter />} />
            <Route path="/announcements" element={<AnnouncementsRouter />} /> 
            */}
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'SCHOOL_ADMIN', 'KITCHEN']} />}>
            <Route path="/coffee" element={<SchoolAdminCoffee />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['SCHOOL_ADMIN', 'FINANCE']} />}>
          </Route>

          {/* Fallback for unauthorized access */}
          <Route path="/unauthorized" element={<Unauthorized />} />
          {/* Error handling */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      
      <Footer /> {/* Custom footer across all pages */}
    </Router>
  );
}

export default App;
