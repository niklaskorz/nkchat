import styled from 'react-emotion';

const Button = styled('button')`
  appearance: none;
  color: #000;
  background: #fff;
  border: 1px solid #333;
  border-radius: 5px;
  margin: 2px 4px;
  padding: 10px 15px;
  cursor: pointer;
  flex: 1;

  :active {
    background: #333;
    color: #fff;
  }
`;

export default Button;
