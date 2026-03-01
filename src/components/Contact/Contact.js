import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaEnvelope, FaLinkedin, FaGithub } from 'react-icons/fa';

const CONTACTS = [
  {
    icon: <FaEnvelope />,
    label: 'Email',
    value: 'pepperumo@gmail.com',
    href: 'mailto:pepperumo@gmail.com',
    external: false,
  },
  {
    icon: <FaLinkedin />,
    label: 'LinkedIn',
    value: 'Giuseppe Rumore',
    href: 'https://www.linkedin.com/in/giuseppe-rumore-b2599961',
    external: true,
  },
  {
    icon: <FaGithub />,
    label: 'GitHub',
    value: 'pepperumo',
    href: 'https://github.com/pepperumo',
    external: true,
  },
];

const Contact = () => {
  return (
    <ContactSection id="contact">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <SectionTitle>Contact Me</SectionTitle>

        <TerminalCard>
          <TerminalHeader>
            <TerminalDot $color="#ff5f57" />
            <TerminalDot $color="#febc2e" />
            <TerminalDot $color="#28c840" />
            <TerminalTitle>let's connect</TerminalTitle>
          </TerminalHeader>
          <TerminalBody>
            <Greeting>
              I'm currently open to new opportunities and collaborations.
              Feel free to reach out!
            </Greeting>

            <ContactCards>
              {CONTACTS.map((contact, index) => (
                <ContactCard
                  key={index}
                  as={motion.a}
                  href={contact.href}
                  target={contact.external ? '_blank' : undefined}
                  rel={contact.external ? 'noopener noreferrer' : undefined}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <ContactIcon>{contact.icon}</ContactIcon>
                  <ContactInfo>
                    <ContactLabel>{contact.label}</ContactLabel>
                    <ContactValue>{contact.value}</ContactValue>
                  </ContactInfo>
                  <ArrowIcon>&rarr;</ArrowIcon>
                </ContactCard>
              ))}
            </ContactCards>
          </TerminalBody>
        </TerminalCard>
      </motion.div>
    </ContactSection>
  );
};

const ContactSection = styled.section`
  max-width: 900px;
  margin: 0 auto;
  padding: 100px 0;

  @media (max-width: 768px) {
    padding: 80px 0;
  }
`;

const SectionTitle = styled.h2`
  margin: 0 0 40px 0;
  font-size: clamp(42px, 6vw, 50px);
  font-weight: 600;
  color: var(--text-primary);
  text-align: center;
`;

const TerminalCard = styled.div`
  background: rgba(10, 10, 10, 0.85);
  border: 1px solid rgba(0, 232, 162, 0.2);
  border-radius: 6px;
  overflow: hidden;
  max-width: 550px;
  margin: 0 auto;
  box-shadow: none;
`;

const TerminalHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  gap: 8px;
`;

const TerminalDot = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
`;

const TerminalTitle = styled.span`
  color: var(--text-secondary);
  font-family: var(--font-mono);
  font-size: 12px;
  margin-left: 8px;
`;

const TerminalBody = styled.div`
  padding: 28px 24px;
`;

const Greeting = styled.p`
  color: var(--text-secondary);
  font-size: 15px;
  line-height: 1.6;
  text-align: center;
  margin: 0 0 28px;
`;

const ContactCards = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ContactCard = styled.a`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  border-radius: 4px;
  background: rgba(0, 232, 162, 0.03);
  border: 1px solid rgba(0, 232, 162, 0.15);
  text-decoration: none;
  transition: all 0.25s ease;
  cursor: pointer;

  &:hover {
    background: rgba(0, 232, 162, 0.08);
    border-color: rgba(0, 232, 162, 0.25);
    transform: translateX(4px);
  }
`;

const ContactIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border-radius: 4px;
  background: rgba(0, 232, 162, 0.1);
  color: var(--secondary-color);
  font-size: 18px;
  flex-shrink: 0;
`;

const ContactInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const ContactLabel = styled.div`
  color: var(--text-secondary);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 2px;
`;

const ContactValue = styled.div`
  color: var(--text-primary);
  font-size: 15px;
  font-weight: 500;
`;

const ArrowIcon = styled.span`
  color: var(--secondary-color);
  font-size: 18px;
  opacity: 0.5;
  transition: opacity 0.25s ease, transform 0.25s ease;

  ${ContactCard}:hover & {
    opacity: 1;
    transform: translateX(4px);
  }
`;

export default Contact;
