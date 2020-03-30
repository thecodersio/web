import React from 'react';
import { useFormikContext } from 'formik';
import {
  Brand,
  Button,
  Checkbox,
  FieldSet,
  Container,
  Input
} from '../../../../components';
import { FIELD_NAME } from '../../../../constants';
import Icon from '../../../../assets/img/icons/angle-right.svg';

import './Step1.scss';
import useModalContext from '../../../../hooks/useModalContext';
import PrivacyPolicyContent from '../../../PrivacyPolicyDetails/component/PrivacyPolicyContent/PrivacyPolicyContent';
import RegulationsContent from '../../../Regulations/component/RegulationsContent/RegulationsContent';

const Step1 = () => {
  const { handleChange, setFieldValue, values } = useFormikContext();
  const { openModal } = useModalContext();

  const handleClick = () => setFieldValue('step', 2);

  const disabled = !values.name || !values.term1 || !values.term2;

  return (
    <Container>
      <Brand />
      <div>
        <p className="small text-bold">Dlaczego warto?</p>
        <ul className="text-list">
          <li>
            <p className="small">
              Na bieżąco sprawdzaj w jakiej jesteś
              <br />
              grupie ryzyka (wytyczne WHO)
            </p>
          </li>
          <li>
            <p className="small">Uzupełniaj Dziennik Zdrowia</p>
          </li>
          <li>
            <p className="small">
              Wszystkie ważne informacje o COVID-19
              <br />w jednym miejscu
            </p>
          </li>
        </ul>
      </div>
      <FieldSet>
        <Input
          description="Jak masz na imię?"
          placeholder="imię"
          onChange={handleChange}
          name={FIELD_NAME}
          value={values[FIELD_NAME]}
        />
        <Checkbox
          checked={values.term1}
          description={
            <div>
              Oświadczam, że zapoznałem/am się z{' '}
              <span
                onClick={() => openModal(<RegulationsContent />)}
                role="button"
              >
                Regulaminem
              </span>{' '}
              SafeSafe oraz{' '}
              <span
                onClick={() => openModal(<PrivacyPolicyContent />)}
                role="button"
              >
                Polityką Prywatności
              </span>{' '}
              i akceptuję ich postanowienia.
            </div>
          }
          name="term1"
          onChange={() => setFieldValue('term1', !values.term1)}
          value="term1"
        />
        <Checkbox
          checked={values.term2}
          description={
            <div>
              Zdaję sobie sprawę, że umieszczenie w SafeSafe informacji
              dotyczących mojego stanu zdrowia oznacza wyrażenie zgody na
              przetwarzanie moich danych dotyczących zdrowia przez Tytani24 Sp.
              z o.o. w celu korzystania z niektórych funkcji SafeSafe, w
              szczególności analizy ryzyka zarażenia wirusem SARS-CoV-2.
              Szczegóły dotyczące przetwarzania moich danych mogę odnaleźć w{' '}
              <span
                onClick={() => openModal(<PrivacyPolicyContent />)}
                role="button"
              >
                Polityce Prywatności
              </span>
              .
            </div>
          }
          name="term2"
          onChange={() => setFieldValue('term2', !values.term2)}
          value="term2"
        />
      </FieldSet>
      <Button
        disabled={disabled}
        onClick={handleClick}
        icon={Icon}
        text="Przejdź dalej"
        type="outline"
      />
    </Container>
  );
};

export default Step1;
