
import { Link } from 'react-router';
import useAuth from '../Auth/useAuth';
import useUserRole from '../Auth/useUserRole';

const Navbar = () => {
  const { user } = useAuth()
  const { role } = useUserRole()
  return (
    <div className=" shadow-md sticky top-0 z-50 flex  justify-between py-5 px-2">
      <div className="text-left px-4 sm:px-6 lg:px-8" >
        <div className="">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="text-2xl font-bold text-blue-600 tracking-tight">
              Scholar<span className="text-black">Hub</span>
            </Link>
          </div>
        </div>
      </div >
      {/* desktop menu  */}
      <div>
        <div className='flex gap-5'>
          <div>
            <Link
              to="/"
              className="block text-black hover:text-blue-600 font-medium"
              onClick={() => setMenuOpen(false)}
            >
              Home
            </Link>
          </div>
          <div>
            <Link
              to="/allScholarship"
              className="block text-black hover:text-blue-600 font-medium"
              onClick={() => setMenuOpen(false)}
            >
              All Scholarship
            </Link>
          </div>
          {
            user && role === "user" &&
            <div>
              <Link
                to="/userDashboard"
                className="block text-black hover:text-blue-600 font-medium"
                onClick={() => setMenuOpen(false)}
              >
                User Dashboard
              </Link>
            </div>
          }
          {
            user && role === "admin" &&
            <div>
              <Link
                to="/admindashboard"
                className="block text-black hover:text-blue-600 font-medium"
                onClick={() => setMenuOpen(false)}
              >
                Admin Dashboard
              </Link>
            </div>
          }
          {
            user && role === "moderator" &&
            <div>
              <Link
                to="/moderatorDashboard"
                className="block text-black hover:text-blue-600 font-medium"
                onClick={() => setMenuOpen(false)}
              >
                Moderator Dashboard
              </Link>
            </div>
          }

          {
            !user &&
            <div>
              <Link to={`/signin`}>
                Login
              </Link>
            </div>
          }

        </div>
      </div>

    </div >
  );
};

export default Navbar;
