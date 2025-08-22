import { Popover, Whisper, IconButton } from 'rsuite';
import InfoOutlineIcon from '@rsuite/icons/InfoOutline';

// Define the props for the component
interface VorabpauschaleExplanationProps {
  details: {
    basisertrag: number;
    vorabpauschaleAmount: number;
    steuerVorFreibetrag: number;
    basiszins: number;
  };
  startkapital: number;
  steuerlast: number; // e.g., 26.375
  teilfreistellungsquote: number; // e.g., 30
}

const VorabpauschaleExplanation = ({ details, startkapital, steuerlast, teilfreistellungsquote }: VorabpauschaleExplanationProps) => {
  const speaker = (
    <Popover title="Wie wird die Vorabpauschale berechnet?">
      <p>Die Vorabpauschale ist eine fiktive, vorweggenommene Besteuerung von Gewinnen. Hier ist die vereinfachte Berechnung:</p>
      <ol style={{ paddingLeft: '20px' }}>
        <li style={{ marginBottom: '10px' }}>
          <strong>1. Basisertrag berechnen:</strong>
          <br />
          <small>Depotwert Jahresanfang * Basiszins * 70%</small>
          <br />
          <code>
            {startkapital.toLocaleString('de-DE')} € * {(details.basiszins * 100).toFixed(2)}% * 70% = <strong>{details.basisertrag.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €</strong>
          </code>
        </li>
        <li style={{ marginBottom: '10px' }}>
          <strong>2. Vorabpauschale bestimmen:</strong>
          <br />
          <small>Der Basisertrag ist die Vorabpauschale (wird mit dem tatsächlichen Gewinn verglichen, hier vereinfacht).</small>
          <br />
          <code>
            Vorabpauschale = <strong>{details.vorabpauschaleAmount.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €</strong>
          </code>
        </li>
        <li style={{ marginBottom: '10px' }}>
          <strong>3. Steuer berechnen:</strong>
          <br />
          <small>Vorabpauschale * Steuerlast * (1 - Teilfreistellung)</small>
          <br />
          <code>
            {details.vorabpauschaleAmount.toLocaleString('de-DE', { minimumFractionDigits: 2 })} € * {steuerlast}% * (1 - {teilfreistellungsquote}%) = <strong>{details.steuerVorFreibetrag.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €</strong>
          </code>
        </li>
      </ol>
      <p><small>Dieser Betrag wird dann mit dem Sparerpauschbetrag verrechnet.</small></p>
    </Popover>
  );

  return (
    <Whisper placement="top" controlId="control-id-hover" trigger="hover" speaker={speaker}>
      <IconButton icon={<InfoOutlineIcon />} appearance="subtle" circle size="xs" style={{ marginLeft: '5px' }} />
    </Whisper>
  );
};

export default VorabpauschaleExplanation;
