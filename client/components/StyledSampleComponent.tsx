import styled from 'styled-components';

export default function StyledSampleComponent() {
  return <Button>this is styled button</Button>;
}

const Button = styled.button`
  background-color: green;
  transition: all 0.3s ease;
  padding: 100px;
  &:hover {
    background-color: red;
  }
`;
