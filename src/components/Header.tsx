import React from 'react'
import { Container, Row, Col } from 'react-bootstrap';

interface headerProps {
    leftSymbol: string,
    rightSymbol: string
}

const header: React.FC<headerProps> = ({ leftSymbol, rightSymbol }) => {
    return (
        <div>
            <header>
                <Container>
                    <Row>
                        <Col xs="2"><h1 className="d-flex flex-row">{ leftSymbol }</h1></Col>
                        <Col xs="8"><h1 className="text-center">Currency Exchange</h1></Col>
                        <Col xs="2"><h1 className="d-flex flex-row-reverse">{ rightSymbol }</h1></Col>
                    </Row>
                </Container>
            </header>
        </div>
    );
}

export default header