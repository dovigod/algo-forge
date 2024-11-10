import styled from '@internal/styled-components';

export default function StyledSampleComponent() {
  return (
    <Button>
      this is styled button<D>purple</D>
    </Button>
  );
}

const Button = styled.button`
  background-color: green;
  transition: all 0.3s ease;
  padding: 100px;
  &:hover {
    background-color: red;
  }
`;

const D = styled.span`
  color: blue;
`;
