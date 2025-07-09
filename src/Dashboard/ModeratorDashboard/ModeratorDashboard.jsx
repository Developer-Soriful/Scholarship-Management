import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router';

const menuItems = [
    { name: 'Home', path: '/' },
    { name: 'My Profile', path: 'moderatorprofile' },
    { name: 'Manage Scholarship', path: 'manageScholarship' },
    { name: 'Add Scholarship', path: 'addScholarship' },
];

const ModeratorDashboard = () => {
    const [open, setOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <header className="flex items-center justify-between px-6 py-4 bg-white shadow-md">
                <h1 className="text-2xl font-bold text-purple-700">Moderator Dashboard</h1>
                <button
                    className="text-3xl text-purple-700 focus:outline-none"
                    onClick={() => setOpen(true)}
                    aria-label="Open menu"
                >
                    <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
                </button>
            </header>

            {/* Main Content */}
            <main className="flex-1">
                <Outlet />
            </main>

            {/* Right-side Drawer */}
            <div
                className={`fixed inset-0 z-40 transition-all duration-300 ${open ? 'visible' : 'invisible'}`}
                aria-hidden={!open}
            >
                {/* Overlay */}
                <div
                    className={`absolute inset-0 bg-black bg-opacity-30 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`}
                    onClick={() => setOpen(false)}
                />
                {/* Drawer */}
                <nav
                    className={`absolute right-0 top-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 flex flex-col pt-8 ${open ? 'translate-x-0' : 'translate-x-full'}`}
                >
                    <button
                        className="absolute top-4 right-4 text-2xl text-gray-500 hover:text-purple-700 focus:outline-none"
                        onClick={() => setOpen(false)}
                        aria-label="Close menu"
                    >
                        &times;
                    </button>
                    <ul className="mt-8 space-y-4 px-8">
                        {menuItems.map((item) => (
                            <li key={item.name}>
                                <NavLink
                                    to={item.path}
                                    className={({ isActive }) =>
                                        item.name === 'Home'
                                            ? 'block py-2 px-4 rounded-lg text-lg font-bold bg-purple-600 text-white shadow hover:bg-purple-700 transition-colors duration-200'
                                            : `block py-2 px-4 rounded-lg text-lg font-medium transition-colors duration-200 ${isActive && item.path === '/' ? 'bg-purple-100 text-purple-700' : isActive ? 'bg-purple-100 text-purple-700' : 'text-gray-700 hover:bg-purple-50'
                                            }`
                                    }
                                    onClick={() => setOpen(false)}
                                >
                                    {item.name}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>
        </div>
    );
};

export default ModeratorDashboard; 