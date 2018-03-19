import * as React from 'react';
import styled from 'react-emotion';
import * as colors from 'colors';

const Section = styled('section')`
  background: ${colors.darkPrimary};
  color: #fff;

  flex: 0 0 250px;

  display: flex;
  flex-direction: column;
`;

const Header = styled('header')`
  padding: 15px;
  flex-shrink: 0;
  border-top: 2px solid transparent;
  border-bottom: 2px solid ${colors.darkSecondary};
`;

const HeaderTitle = styled('h2')`
  font-size: 1em;
  margin: 0;
  font-weight: normal;
`;

interface Props {
  title: string;
}

const SideBar: React.SFC<Props> = ({ title, children }) => (
  <Section>
    <Header>
      <HeaderTitle>{title}</HeaderTitle>
    </Header>
    {children}
  </Section>
);

export default SideBar;
