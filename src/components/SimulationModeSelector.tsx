import { Tabs } from 'rsuite';
import SavingsPlan from './SavingsPlan';
import WithdrawalPlan from './WithdrawalPlan';

const SimulationModeSelector = () => {
  return (
    <Tabs defaultActiveKey="1" appearance="subtle">
      <Tabs.Tab eventKey="1" title="Ansparen">
        <SavingsPlan />
      </Tabs.Tab>
      <Tabs.Tab eventKey="2" title="Entnehmen">
        <WithdrawalPlan />
      </Tabs.Tab>
    </Tabs>
  );
};

export default SimulationModeSelector;
