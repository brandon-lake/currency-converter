import React, { useState } from 'react';
import { Container, Col, Row } from 'react-bootstrap';
import Select from 'react-select';
import Currency from '../interfaces/Currency';
import CurrencyFlag from 'react-currency-flags';

interface CurrencyBlockProps {
    activeCurrency: Currency | null | undefined,
    currencies: Currency[],
    panelSide: string,
    value: string,
    updateSelectedCurrency: (selected?: Currency | null) => void,
    updateValue: (event: React.ChangeEvent<HTMLInputElement>) => void,
    readOnly: boolean
}

const CurrencyBlock: React.FC<CurrencyBlockProps> = ({activeCurrency, currencies, panelSide, value, updateSelectedCurrency, updateValue, readOnly}) => {
    const [panel, setPanel] = useState<string>(panelSide);

    return (
        <div className="currencyBlock">
            <Select 
                options={currencies}
                getOptionLabel={(option) => option.name + (option.symbol === null ? "" : ` (${option.code})`)}
                getOptionValue={(option) => option.code}
                value={activeCurrency}
                onChange={updateSelectedCurrency}
            />

            <Container fluid style={{ paddingLeft: 0, paddingRight: 0 }}>
                <Row style={{ marginLeft: 0, marginRight: 0 }}>
                    { panel === "left" && 
                        <Col xs="4" sm="4" md="3" lg="2" className="d-flex justify-content-center" style={{ paddingLeft: 0, paddingRight: 0, paddingTop: 2 }}>
                            {/* Venezuelan currency code not consistent between 2 APIs, this solves that problem */}
                            <CurrencyFlag currency={(activeCurrency?.code === "VES" ? "VEF" : activeCurrency?.code) || ""} width={54} />
                        </Col> 
                    }
                    <Col xs="8" sm="8" md="9" lg="10" style={{ paddingLeft: 0, paddingRight: 0 }}>
                        <input className="form-control text-center" type="number" placeholder="" value={value} onChange={updateValue} readOnly={readOnly} />
                    </Col>
                    { panel === "right" && 
                        <Col xs="4" sm="4" md="3" lg="2" className="d-flex justify-content-center" style={{ paddingLeft: 0, paddingRight: 0, paddingTop: 2 }}>
                            {/* Venezuelan currency code not consistent between 2 APIs, this solves that problem */}
                            <CurrencyFlag currency={(activeCurrency?.code === "VES" ? "VEF" : activeCurrency?.code) || ""} width={54} />
                        </Col> 
                    }
                </Row>
            </Container>
        </div>
    );
}

export default CurrencyBlock