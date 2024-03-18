import {
  AppSidebar,
  AppSidebarFooter,
  AppSidebarForm,
  AppSidebarHeader,
  AppSidebarMinimizer,
} from '@coreui/react';
import React from 'react';
import { matchPath, NavLink } from 'react-router-dom';
import { Nav } from 'reactstrap';
import logo from 'assets/FP_Logo_White.png';

const Sidebar = ({ routes, location }) => {
  const getParams = (pathname) => {
    const matchProfile =
      matchPath(pathname, { path: `/calendar/:propertyId` }) ||
      matchPath(pathname, { path: `/documents/statements/:propertyId` }) ||
      matchPath(pathname, { path: `/documents/maintenance/:propertyId` }) ||
      matchPath(pathname, { path: `/settings/list/:propertyId?` }) ||
      matchPath(pathname, { path: `/settings/personal-survey/:propertyId?` }) ||
      matchPath(pathname, { path: `/settings/property-survey/:propertyId?` }) ||
      matchPath(pathname, { path: `/settings/summary/:propertyId?` }) ||
      matchPath(pathname, { path: `/help/contact-support/:propertyId?` }) ||
      matchPath(pathname, { path: `/help/faq/:propertyId?` }) ||
      matchPath(pathname, { path: `/help/:propertyId?` });

    return (matchProfile && matchProfile.params) || {};
  };
  const { propertyId } = getParams(location.pathname);

  const onNavClick = (e, sameLocation) => {
    if (sameLocation) {
      e.preventDefault();
      window.location.reload();
    }
  };

  return (
    <AppSidebar fixed display="lg">
      <AppSidebarHeader />
      <AppSidebarForm />
      <Nav>
        <div className="logo-container">
          <img className="logo" src={logo} alt="Frank Porter logo" />
        </div>
        <hr className="nav-line" />
        {routes.map((prop, index) => {
          if (prop.redirect) return null;
          const toLocation = `${prop.path}/${propertyId || ''}`;
          const sameLocation = toLocation === location.pathname;

          return (prop.propertyIdRequired && propertyId) || !prop.propertyIdRequired ? (
            <div className="nav-link-container" key={prop.path}>
              {index === routes.length - 1 && <hr className="nav-line" />}
              <li>
                <NavLink
                  to={toLocation}
                  {...(prop.customPathMatcher
                    ? { isActive: () => location.pathname.startsWith(prop.customPathMatcher) }
                    : {})}
                  className="nav-link"
                  activeClassName="active"
                  onClick={(e) => onNavClick(e, sameLocation)}
                >
                  <i className={`ico ${prop.icon}`} />
                  {prop.name}
                </NavLink>
              </li>
            </div>
          ) : null;
        })}
      </Nav>
      <AppSidebarFooter />
      <AppSidebarMinimizer />
    </AppSidebar>
  );
};

export default Sidebar;
