import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiMenu, FiX } from 'react-icons/fi';
import { Link as ScrollLink } from 'react-scroll';

// Create a wrapper for ScrollLink to handle props properly
const ScrollLinkWrapper = ({ className, children, smooth, ...props }) => (
  <ScrollLink 
    className={className} 
    smooth={smooth === true ? true : false}
    {...props}
  >
    {children}
  </ScrollLink>
);

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 70);
    };

    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);  const navLinks = [
    { name: 'About Me', to: 'about-me' },
    { name: 'My Projects', to: 'portfolio' },
    { name: 'Languages', to: 'languages' },
    { name: 'Skills', to: 'skills' },
    { name: 'Experience', to: 'experience' },
    { name: 'Education', to: 'education' },
    { name: 'Contact', to: 'contact' }
  ];

  return (
    <NavContainer $scrolled={scrolled}>
      <NavContent>
        <LogoLink 
          to="home" 
          spy={true}
          smooth={true}
          duration={500} 
          offset={0} 
          onClick={closeMenu}
        >
          <img src={process.env.PUBLIC_URL + '/images/gr-cyberpunk-logo.png'} alt="GR Logo" />
        </LogoLink>
        <MenuButton onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <FiX /> : <FiMenu />}
        </MenuButton>        <NavItems $menuOpen={menuOpen}>
          <NavList>
            {navLinks.map((link, index) => (
              <NavItem key={index}>
                <NavMenuLink
                  to={link.to}
                  spy={true}
                  smooth={true}
                  offset={-70}
                  duration={500}
                  onClick={closeMenu}
                  activeClass="active"
                >
                  {link.name}
                </NavMenuLink>
              </NavItem>
            ))}
          </NavList>
        </NavItems>
      </NavContent>
    </NavContainer>
  );
};

const NavContainer = styled.header`
  position: fixed;
  top: 0;
  width: 100%;
  height: 70px;
  z-index: 1000;
  background: ${({ $scrolled }) => ($scrolled ? 'rgba(10, 10, 10, 0.92)' : 'rgba(10, 10, 10, 0.85)')};
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  box-shadow: ${({ $scrolled }) => ($scrolled ? '0 8px 32px rgba(0, 0, 0, 0.4)' : '0 4px 16px rgba(0, 0, 0, 0.2)')};
  border-bottom: 1px solid rgba(0, 232, 162, 0.15);
  transition: var(--transition);
`;

const NavContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 100%;
  padding: 0 50px;
  
  @media (max-width: 768px) {
    padding: 0 25px;
  }
`;

const LogoLink = styled(ScrollLinkWrapper)`
  cursor: pointer;
  display: flex;
  align-items: center;

  img {
    height: 45px;
    width: auto;
    object-fit: contain;
  }
`;

const MenuButton = styled.button`
  display: none;
  background: transparent;
  border: none;
  box-shadow: none;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  color: var(--secondary-color);
  font-size: 28px;
  cursor: pointer;
  z-index: 11;
  border-radius: 0;

  &::before, &::after {
    display: none;
  }

  &:hover, &:focus {
    background: transparent;
    border: none;
    box-shadow: none;
    transform: none;
  }

  @media (max-width: 768px) {
    display: flex;
  }
`;

const NavItems = styled.div`
  display: flex;
  align-items: center;
  
  @media (max-width: 768px) {
    position: fixed;
    top: 0;
    right: 0;
    width: 80%;
    max-width: 300px;
    height: 100vh;
    padding: 80px 0 20px 0;
    background: rgba(10, 10, 10, 0.95);
    border-left: 1px solid rgba(0, 232, 162, 0.25);
    flex-direction: column;
    justify-content: flex-start;
    transform: ${({ $menuOpen }) => ($menuOpen ? 'translateX(0)' : 'translateX(100%)')};
    transition: transform 0.3s ease-in-out;
    box-shadow: -10px 0px 30px -15px rgba(0, 0, 0, 0.7);
    z-index: 10;
  }
`;

const NavList = styled.ul`
  display: flex;
  list-style: none;
  
  @media (max-width: 768px) {
    flex-direction: column;
    width: 100%;
    padding: 0;
  }
`;

const NavItem = styled.li`
  margin: 0 15px;
  
  @media (max-width: 768px) {
    margin: 5px 0;
    text-align: center;
    width: 100%;
  }
`;

const NavMenuLink = styled(ScrollLinkWrapper)`
  color: var(--text-secondary);
  font-family: var(--font-mono);
  font-size: 14px;
  padding: 10px;
  position: relative;
  transition: var(--transition);
  cursor: pointer;
  
  &:hover {
    color: var(--secondary-color);
  }
  
  &.active {
    color: var(--secondary-color);
  }
  
  @media (max-width: 768px) {
    display: block;
    padding: 10px 0;
    font-size: 16px;
  }
`;

export default Navbar;
