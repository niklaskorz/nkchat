import styled from 'react-emotion';

const Button = styled('button')`
  color: #000;
  background: #eee;
  border: 1px solid #333;
  border-radius: 5px;
  margin: 2px 4px;
  padding: 10px 15px;
  cursor: pointer;
  flex: 1;

  :hover,
  :focus {
    border-color: blue;
    outline: none;
  }

  :active {
    background: #333;
    color: #fff;
  }
`;

export default Button;
