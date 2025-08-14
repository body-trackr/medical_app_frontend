import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './styles/Breadcrumbs.css';

const Breadcrumbs = ({ testName }) => {
    const location = useLocation();
    const pathnames = location.pathname.split('/').filter((x) => x);

    return (
        <nav className="breadcrumbs">
            <ul>
                {pathnames.map((value, index) => {
                    const to = `/${pathnames.slice(0, index + 1).join('/')}`;
                    const isLast = index === pathnames.length - 1;

                    return (
                        <li key={to}>
                            {isLast ? (
                                <span>{testName || value}</span>
                            ) : (
                                <Link to={to}>{value}</Link>
                            )}
                            {!isLast && <span className="breadcrumb-separator"> / </span>}
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
};

export default Breadcrumbs;
