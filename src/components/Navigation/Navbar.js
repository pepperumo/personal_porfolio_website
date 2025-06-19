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
    { name: 'Skills', to: 'skills' },
    { name: 'Experience', to: 'experience' },
    { name: 'Education', to: 'education' },
    { name: 'Portfolio', to: 'portfolio' },
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
          <span>GR</span>
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
          <CVDownloadButton 
            href={`${process.env.PUBLIC_URL}/Giuseppe_Rumore_CV_english.pdf`}
            target="_blank"
            rel="noopener noreferrer"
            download="Giuseppe_Rumore_CV_english.pdf"
          >
            Download my CV
          </CVDownloadButton>
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
  background: ${({ $scrolled }) => ($scrolled ? 'rgba(10, 25, 47, 0.9)' : 'transparent')};
  backdrop-filter: ${({ $scrolled }) => ($scrolled ? 'blur(10px)' : 'none')};
  box-shadow: ${({ $scrolled }) => ($scrolled ? '0 10px 30px -10px rgba(2, 12, 27, 0.7)' : 'none')};
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
  font-family: var(--font-mono);
  font-size: 22px;
  font-weight: 700;
  color: var(--secondary-color);
  cursor: pointer;
  display: flex;
  align-items: center;
  
  span {
    display: block;
    padding: 10px;
  }
`;

const MenuButton = styled.button`
  display: none;
  background: transparent;
  border: none;
  color: var(--secondary-color);
  font-size: 28px;
  cursor: pointer;
  z-index: 11;
  
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
    padding: 100px 0;
    background-color: var(--background-light);
    flex-direction: column;
    justify-content: flex-start;
    transform: ${({ $menuOpen }) => ($menuOpen ? 'translateX(0)' : 'translateX(100%)')};
    transition: transform 0.3s ease-in-out;
    box-shadow: -10px 0px 30px -15px rgba(2, 12, 27, 0.7);
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
    margin: 10px 0;
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
    padding: 15px 0;
    font-size: 16px;
  }
`;

const CVDownloadButton = styled.a`
  display: inline-block;
  padding: 12px 24px;
  font-family: var(--font-mono);
  font-size: 14px;
  text-align: center;
  cursor: pointer;
  border-radius: 4px;
  text-decoration: none;
  transition: var(--transition);
  background-color: var(--secondary-color);
  color: var(--background-dark);
  border: 1px solid var(--secondary-color);
  margin-left: 20px;
  
  &:hover {
    background-color: var(--secondary-light);
    transform: translateY(-3px);
  }
  
  @media (max-width: 768px) {
    margin: 20px 0 0 0;
    width: 80%;
  }
`;

export default Navbar;
